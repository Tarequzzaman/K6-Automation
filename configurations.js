import http from 'k6/http';

export let config = {
    scenarios: {
        smoke: {  // Smoke tests have a minimal load. Run them to verify that the system works well under minimal load and to gather baseline performance values.
            executor: 'constant-vus',
            vus: 3,
            duration: '1m',
        },

       baseline: {
            executor: 'constant-vus',
            vus: 20, // Simulating 10 virtual users
            duration: '10m', // Run for 10 minutes
           
        },

        load: {
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '5m', target: 200 },
                { duration: '20m', target:200 },
                { duration: '5m', target: 0 },
            ],
        },

        stress: { 
            executor: 'ramping-vus',
            startVUs: 50,
            stages: [
                { duration: '10m', target: 200 }, 
                { duration: '1d', target: 200 }, 
                { duration: '10m', target: 0 }, 
            ],
        },

        soak: {  
            executor: 'ramping-vus',
            stages: [
                { duration: '5m', target: 100 }, 
                { duration: '5h', target: 100 }, 
                { duration: '10m', target: 0 },   
            ],
        },

        endurance: {
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '10m', target: 100 },  // Ramp-up to 50 users
                { duration: '30m', target: 200 },   // Sustain for 5 hours
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
                { duration: '2m', target: 10000 },  // Ramp up to 10 RPS over 2 minutes
                { duration: '1m', target: 0 },   // Drop back down to 0 RPS
            ],
        },
    },
};
