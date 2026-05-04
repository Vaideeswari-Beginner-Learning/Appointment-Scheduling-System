const fs = require('fs');
(async () => {
    const results = {};
    try {
        const res = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'info@forgeindia.com', password: 'Forgeindia@09' })
        });
        const data = await res.json();
        const token = data.token;
        
        const headers = { 'x-auth-token': token, 'Content-Type': 'application/json' };

        const endpoints = [
            { id: 'my_appointments', method: 'GET', url: 'http://localhost:5001/api/appointments/my-appointments' },
            { id: 'slots_available', method: 'GET', url: 'http://localhost:5001/api/slots/available' }
        ];

        for (const ep of endpoints) {
            try {
                const reqOpts = { method: ep.method, headers };
                const epRes = await fetch(ep.url, reqOpts);
                const epData = await epRes.text();
                results[ep.id] = { status: epRes.status, ok: epRes.ok };
            } catch (err) {
                results[ep.id] = { error: err.message };
            }
        }
    } catch (e) {
        results.login = { error: e.message };
    }
    fs.writeFileSync('test_results2.json', JSON.stringify(results, null, 2));
})();
