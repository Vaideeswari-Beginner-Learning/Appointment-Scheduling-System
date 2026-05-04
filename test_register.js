const axios = require('axios');

async function testRegister() {
    try {
        const res = await axios.post('http://localhost:5001/api/auth/register', {
            name: "Test Doctor",
            email: `doc_${Date.now()}@test.com`,
            password: "password123",
            role: "doctor"
        });
        console.log("SUCCESS:", res.data);
    } catch (err) {
        console.error("FAIL:", err.response ? err.response.data : err.message);
    }
}

testRegister();
