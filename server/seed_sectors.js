require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Sector = require('./models/Sector');

const sectors = [
    { 
        name: 'Hospital / Healthcare', 
        category: 'Healthcare', 
        icon: '🏥',
        subCategories: ['Doctor appointment', 'Lab tests']
    },
    { 
        name: 'Automobile Service', 
        category: 'Automotive', 
        icon: '🚗',
        subCategories: ['Car service', 'Bike repair']
    },
    { 
        name: 'Home Services', 
        category: 'Services', 
        icon: '🏠',
        subCategories: ['Electrician', 'Plumber', 'Cleaning']
    },
    { 
        name: 'IT & Technical Support', 
        category: 'Technology', 
        icon: '💻',
        subCategories: ['Laptop repair', 'Software help']
    },
    { 
        name: 'Beauty & Salon', 
        category: 'Beauty', 
        icon: '✂️',
        subCategories: ['Haircut', 'Facial', 'Spa']
    },
    { 
        name: 'Education & Training', 
        category: 'Education', 
        icon: '📚',
        subCategories: ['Tuition', 'Training classes']
    },
    { 
        name: 'Fitness & Wellness', 
        category: 'Wellness', 
        icon: '💪',
        subCategories: ['Gym trainer', 'Yoga sessions']
    },
    { 
        name: 'Repair & Maintenance', 
        category: 'Services', 
        icon: '🔧',
        subCategories: ['Appliance repair', 'AC service']
    },
    { 
        name: 'Events & Photography', 
        category: 'Events', 
        icon: '📷',
        subCategories: ['Wedding photography', 'Event planning']
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
