const axios = require('axios');

const testBooking = async () => {
    const API_BASE_URL = 'http://localhost:5002/api';
    
    const testCases = [
        {
            name: 'Valid Payload',
            clientId: '662897c864b6e5f8f533a31c',
            serviceId: '66289d0c64b6e5f8f533a364'
        },
        {
            name: 'Duplicate Email Case',
            clientId: '662897c864b6e5f8f533a31c',
            serviceId: '66289d0c64b6e5f8f533a364',
            patientEmail: 'viji@gmail.com',
            patientPhone: '9999999999' // Different phone, existing email
        },
        {
            name: 'Missing Client ID',
            clientId: '',
            serviceId: '66289d0c64b6e5f8f533a364'
        }
    ];

    for (const tc of testCases) {
        console.log(`\n--- Running Test Case: ${tc.name} ---`);
        const formData = new URLSearchParams(); // Using URLSearchParams for simpler node test if FormData issues persist, but FormData is better for multipart
        // Since backend uses multer, we should use form-data package in node or just simulated request
        // Let's use simple axios with JSON first to see if it triggers validation, 
        // but the route expects multipart. Let's stick to axios + simulated multipart if possible or just check the code logic.
        
        // Actually, just sending it as a plain object for non-file testing works if we don't have files
        try {
            const res = await axios.post(`${API_BASE_URL}/appointments/book`, {
                patientName: 'Test User',
                patientPhone: tc.patientPhone || '1234567890',
                patientEmail: tc.patientEmail || 'test@example.com',
                manualDate: '2026-04-25',
                manualTime: '10:00',
                serviceId: tc.serviceId,
                clientId: tc.clientId,
                type: 'general',
                purposeType: 'service'
            });
            console.log('✅ Success:', res.status, res.data._id);
        } catch (err) {
            console.log('❌ Failed:', err.response?.status, err.response?.data?.message || err.message);
        }
    }
};

testBooking();
