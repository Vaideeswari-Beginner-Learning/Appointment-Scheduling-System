const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/appointment-system');

  const db = mongoose.connection.db;

  const sham = await db.collection('users').findOne({ name: 'Sham' });
  console.log("Sham User:", sham);

  const client = await db.collection('users').findOne({ _id: sham.clientId });
  console.log("Sham's Client:", client);

  process.exit();
}

main().catch(console.error);
