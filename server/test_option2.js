const axios = require('axios');

async function testGuestBooking() {
    const API_BASE_URL = 'http://localhost:5002/api';
    const guestPhone = '9988776655';
    const guestName = 'Test Guest User';
    
    // We need a valid serviceId and clientId.
    // I'll try to find one first.
    try {
        // 1. Get any user with role 'client' to get a clientId
        // Since we are running on the server, we might need a token or check the DB.
        // Actually, let's just try to find a valid clientId from the User collection if possible,
        // or just hardcode one if we know it. But let's try a logic:
        const authRes = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'info@forgeindia.com', // Found in DB
            password: 'password123'      
        });
        const token = authRes.data.token;
        
        const clientsRes = await axios.get(`${API_BASE_URL}/users`, {
            headers: { 'x-auth-token': token }
        });
        
        const client = clientsRes.data.find(u => u.role === 'client');
        if (!client) {
            console.log('No client found in system.');
            return;
        }
        
        const clientId = client._id;
        
        // 2. Get public services for this client
        const servicesRes = await axios.get(`${API_BASE_URL}/services/public/${clientId}`);
        if (servicesRes.data.length === 0) {
            console.log(`No public services found for client: ${client.name}`);
            return;
        }
        
        const service = servicesRes.data[0];
        
        console.log(`Booking for service: ${service.name} (Client: ${client.name} / ${clientId})`);
        
        const bookingData = {
            patientName: guestName,
            patientPhone: guestPhone,
            patientEmail: 'guest@example.com',
            serviceId: service._id,
            clientId: clientId,
            manualDate: '2026-05-01',
            manualTime: '10:00 AM'
        };
        
        const res = await axios.post(`${API_BASE_URL}/appointments/book`, bookingData);
        console.log('Booking Response:', res.status, res.data.message || 'Success');
        
        // 3. Check if user was created using the tracker
        const trackerRes = await axios.get(`${API_BASE_URL}/appointments/by-phone/${guestPhone}`);
        console.log('Tracker result:', trackerRes.data.length, 'appointments found');
        
    } catch (err) {
        console.error('Test Failed:', err.response?.data || err.message);
    }
}

testGuestBooking();
