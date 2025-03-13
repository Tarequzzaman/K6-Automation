import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Define performance metrics
let responseTime = new Trend('response_time');
let failureRate = new Rate('failed_requests');
let requestCount = new Counter('request_count');
let p90 = new Trend('p90_latency');
let p95 = new Trend('p95_latency');
let p99 = new Trend('p99_latency');
let throughput = new Trend('throughput');


export let options = {
    scenarios: {
        smoke: {  // Smoke tests have a minimal load. Run them to verify that the system works well under minimal load and to gather baseline performance values.
            executor: 'constant-vus',
            vus: 3,
            duration: '1m',
        },

       baseline: {
            executor: 'constant-vus',
            vus: 2, // Simulating 10 virtual users
            duration: '10m', // Run for 10 minutes
           
        },

        load: {
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '5m', target: 4 },
                { duration: '20m', target: 3 },
                { duration: '5m', target: 0 },
            ],
        },

        stress: { 
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '10m', target: 4 }, 
                { duration: '20m', target: 4 }, 
                { duration: '10m', target: 0 }, 
            ],
        },

        soak: {  
            executor: 'ramping-vus',
            stages: [
                { duration: '5m', target: 1 }, 
                { duration: '30m', target: 1 }, 
                { duration: '1m', target: 0 },   
            ],
        },

        endurance: {
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '10m', target: 1 },  // Ramp-up to 50 users
                { duration: '30m', target: 2 },   // Sustain for 5 hours
                { duration: '10m', target: 0 },   // Ramp-down to 0 users
            ],
        },


        spike: {
            executor: 'ramping-arrival-rate',
            startRate: 10,  // Start with 10 requests per second
            timeUnit: '1s', // Requests per second
            preAllocatedVUs: 1, // Pre-allocate VUs (should be at least 2x startRate)
            maxVUs: 1, // Optional: Limit the maximum VUs to avoid excessive allocation
            stages: [
                { duration: '2m', target: 10 },  // Ramp up to 10 RPS over 2 minutes
                { duration: '1m', target: 0 },   // Drop back down to 0 RPS
            ],
        },
    },
};

// Base API URL
const BASE_URL = 'https://api.restful-api.dev/objects';

// Function to test API performance
function testAPI(apiName, method, url, params = {}, payload = null) {
    let response;
    if (method === 'GET') {
        response = http.get(url, params);
    } else if (method === 'POST') {
        response = http.post(url, JSON.stringify(payload), params);
    }


    // Capture Metrics
    responseTime.add(response.timings.duration);
    failureRate.add(response.status >= 400);
    requestCount.add(1);
    p90.add(response.timings.duration);
    p95.add(response.timings.duration);
    p99.add(response.timings.duration);
    throughput.add(1 / (response.timings.duration / 1000)); // RPS calculation
    

    console.log(JSON.stringify({
        eventType: "K6APITest",
        endpoint: url,
        request_data: params,
        response_data: response.body,
        status_code: response.status
    }));


    // Validate response
    check(response, {
        'Response status is 200': (r) => r.status === 200,
        'Response time is below 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
}

// k6 Test Execution
export default function () {
    let headers = { headers: { 'Content-Type': 'application/json' } };
    // GET: Fetch all objects
    testAPI('List Of All Objects', 'GET', `${BASE_URL}`, headers);

    // GET: Fetch objects by IDs
    testAPI('List Objects By ID', 'GET', `${BASE_URL}?id=3&id=5&id=10`, headers);

    // POST: Create an object
    let payload = {
        name: "Apple MacBook Pro 16",
        data: {
            year: 2019,
            price: 1849.99,
            "CPU model": "Intel Core i9",
            "Hard disk size": "1 TB"
        }
    };
    testAPI('Add Object', 'POST', `${BASE_URL}`, headers, payload);
    // GET: Fetch a single object
    testAPI('Get Single Object', 'GET', `${BASE_URL}/7`, headers);
}
