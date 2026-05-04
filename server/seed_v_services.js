const mongoose = require('mongoose');
const Service = require('./models/Service');
require('dotenv').config();

async function seedService() {
  await mongoose.connect('mongodb://127.0.0.1:27017/appointment-system');

  const clientId = '69eb12fa88a7a2a386928b6e'; // vaidee

  await Service.create({
    clientId,
    name: 'General Consultation',
    description: 'A standard professional consultation session.',
    duration: 30,
    price: 500,
    category: 'general',
    customFields: []
  });

  await Service.create({
    clientId,
    name: 'Specialized Assessment',
    description: 'Detailed analysis and assessment tailored to your needs.',
    duration: 60,
    price: 1200,
    category: 'general',
    customFields: []
  });

  console.log('Services seeded successfully for client vaidee!');
  process.exit();
}

seedService();
