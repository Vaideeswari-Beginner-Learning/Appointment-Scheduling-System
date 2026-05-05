require('dotenv').config({ path: 'server/.env' });
const mongoose = require('mongoose');
const Sector = require('./models/Sector');

const sectors = [
    { 
        name: 'Hospital / Healthcare', 
        category: 'Healthcare', 
        icon: 'Hospital',
        subCategories: ['Doctor appointment', 'Lab tests', 'Surgery Dept', 'Consultation']
    },
    { 
        name: 'Automobile Service', 
        category: 'Automotive', 
        icon: 'Car',
        subCategories: ['Car service', 'Bike repair', 'Detailing', 'Oil Change']
    },
    { 
        name: 'Home Services', 
        category: 'Services', 
        icon: 'Home',
        subCategories: ['Electrician', 'Plumber', 'Cleaning', 'Pest Control']
    },
    { 
        name: 'IT & Technical Support', 
        category: 'Technology', 
        icon: 'Laptop',
        subCategories: ['Laptop repair', 'Software help', 'Network Setup', 'Cybersecurity']
    },
    { 
        name: 'Beauty & Salon', 
        category: 'Beauty', 
        icon: 'Scissors',
        subCategories: ['Haircut', 'Facial', 'Spa', 'Manicure']
    },
    { 
        name: 'Education & Training', 
        category: 'Education', 
        icon: 'GraduationCap',
        subCategories: ['Tuition', 'Training classes', 'Coaching', 'Language Lab']
    },
    { 
        name: 'Fitness & Wellness', 
        category: 'Wellness', 
        icon: 'Dumbbell',
        subCategories: ['Gym trainer', 'Yoga sessions', 'Nutritionist', 'Personal Training']
    },
    { 
        name: 'Repair & Maintenance', 
        category: 'Services', 
        icon: 'Wrench',
        subCategories: ['Appliance repair', 'AC service', 'Roofing', 'Painting']
    },
    { 
        name: 'Legal & Consulting', 
        category: 'Legal', 
        icon: 'Scale',
        subCategories: ['Legal Advice', 'Tax Consulting', 'Business Strategy', 'Audit']
    },
    { 
        name: 'Events & Photography', 
        category: 'Events', 
        icon: 'Calendar',
        subCategories: ['Wedding photography', 'Event planning', 'Video Production', 'Studio Session']
    }
];

const seedSectors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB...');

        // Clear existing sectors to ensure clean re-seeding with subcategories
        await Sector.deleteMany({});
        console.log('🗑️ Cleared old sectors.');

        for (const sectorData of sectors) {
            await Sector.create(sectorData);
            console.log(`✅ Added sector: ${sectorData.name} with ${sectorData.subCategories.length} subcategories.`);
        }
        
        console.log('🎉 All sectors and subcategories seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding sectors:', err);
        process.exit(1);
    }
};

seedSectors();
