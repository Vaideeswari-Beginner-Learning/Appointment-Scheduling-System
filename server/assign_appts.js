const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/appointment-system');
  const db = mongoose.connection.db;

  const sham = await db.collection('users').findOne({ name: 'Sham' });

  // Update all appointments for the Hospitol client to belong to Sham so he can see them
  // This will give a good user experience since he's testing it out
  await db.collection('appointments').updateMany(
    { clientId: new mongoose.Types.ObjectId('69cf7f9996df06bc3d7461d3') },
    { $set: { hrId: sham._id, adminId: sham._id } }
  );

  console.log("Updated appointments to be assigned to Sham");
  process.exit();
}

main().catch(console.error);
