const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login...');
        const res = await axios.post('http://localhost:5002/api/auth/login', {
            email: 'info@forgeindia.com',
            password: 'admin123'
        });
        console.log('Success:', res.data);
    } catch (err) {
        console.error('Error Status:', err.response?.status);
        console.error('Error Data:', err.response?.data);
    }
}

testLogin();
