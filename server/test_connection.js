const axios = require('axios');

async function testApi() {
    try {
        console.log('--- Pinging API Alive ---');
        const ping = await axios.get('http://localhost:5002/api/ping');
        console.log('Ping Response:', ping.data);

        console.log('\n--- Checking /api/slots ---');
        // This will likely fail with 401/403 due to auth middleware, but shouldn't be 404
        try {
            await axios.get('http://localhost:5002/api/slots');
        } catch (e) {
            console.log('Slots Response Status:', e.response?.status);
            console.log('Slots Response Data:', e.response?.data);
        }
    } catch (e) {
        console.error('Test Failed:', e.message);
    }
}

testApi();
