const axios = require('axios');

async function testInvalidSlotQuery() {
    try {
        console.log('Testing /api/slots/available with professionalId=undefined...');
        const res = await axios.get('http://localhost:5002/api/slots/available?professionalId=undefined');
        console.log('Response Status:', res.status);
        console.log('Response Data:', res.data);
        if (res.status === 200) {
            console.log('✅ PASS: Backend returned 200 instead of 500');
        }
    } catch (error) {
        console.error('❌ FAIL: Backend still returned error:', error.response?.status, error.response?.data);
    }
}

testInvalidSlotQuery();
