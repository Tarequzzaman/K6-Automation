import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { config } from './configurations.js';

// Base API URL from env
const BASE_URL = __ENV.BASE_URL;


// Define performance metrics
let responseTime = new Trend('response_time');
let failureRate = new Rate('failed_requests');
let requestCount = new Counter('request_count');
let p90 = new Trend('p90_latency');
let p95 = new Trend('p95_latency');
let p99 = new Trend('p99_latency');
let throughput = new Trend('throughput');


export let options = config


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
