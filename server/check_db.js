const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/appointment-system');
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;

  const users = await db.collection('users').find({}).toArray();
  console.log("Users:", users.map(u => ({ id: u._id, name: u.name, role: u.role, clientId: u.clientId })));

  const appointments = await db.collection('appointments').find({}).toArray();
  console.log("Appointments:", appointments.map(a => ({ id: a._id, userId: a.userId, hrId: a.hrId, adminId: a.adminId, status: a.status })));

  process.exit();
}

main().catch(console.error);
