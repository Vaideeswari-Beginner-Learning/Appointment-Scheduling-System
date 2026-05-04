const mongoose = require('mongoose');
const User = require('./server/models/User');

async function testModel() {
    try {
        const u = new User({
            name: "Test",
            email: "test@test.com",
            password: "pass",
            role: "doctor"
        });
        const err = u.validateSync();
        if (err) {
            console.log("VALIDATION ERROR:", err.errors.role.message);
        } else {
            console.log("VALIDATION SUCCESS");
        }
    } catch (e) {
        console.error(e);
    }
}

testModel();
