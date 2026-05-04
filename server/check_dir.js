const mongoose = require('mongoose');
const User = require('./models/User');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/appointment-system');
  const users = await User.find({ sector: { $ne: null } });
  for (let u of users) {
    console.log(`ID: ${u._id}, Name: ${u.name}, Role: ${u.role}, ClientId: ${u.clientId || 'N/A'}, Sector: ${u.sector}`);
  }
  process.exit();
}

check();
