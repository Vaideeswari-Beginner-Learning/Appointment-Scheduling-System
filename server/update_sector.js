const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/appointment-system');
  const db = mongoose.connection.db;

  // Update Hospitol to hospital sector
  await db.collection('users').updateOne(
    { name: 'Hospitol' },
    { $set: { sector: 'hospital' } }
  );

  // Update Sham user to also have sector 'hospital' to test
  await db.collection('users').updateMany(
    { clientId: new mongoose.Types.ObjectId('69cf7f9996df06bc3d7461d3') },
    { $set: { sector: 'hospital' } }
  );

  console.log("Updated sector for Hospitol and its employees to 'hospital'");
  process.exit();
}

main().catch(console.error);
