const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Sector = require('./models/Sector');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const sectors = [
    { name: 'Healthcare / Hospital', category: 'Health', description: 'Clinics, Hospitals, and Wellness centers', icon: 'Heart' },
    { name: 'Beauty & Salon', category: 'Lifestyle', description: 'Hair salons, Spas, and Nail studios', icon: 'Sparkles' },
    { name: 'Home Services', category: 'Personal', description: 'Cleaning, Plumbing, and Electrical services', icon: 'Home' },
    { name: 'Automobile Services', category: 'Automotive', description: 'Car repairs, detailing, and rentals', icon: 'Car' },
    { name: 'Fitness & Wellness', category: 'Health', description: 'Gyms, Yoga studios, and Personal training', icon: 'Dumbbell' },
    { name: 'Education & Coaching', category: 'Education', description: 'Tutoring, Schools, and Skill development', icon: 'GraduationCap' },
    { name: 'Repair & Maintenance', category: 'Technical', description: 'Appliance repair and system maintenance', icon: 'Wrench' },
    { name: 'Legal & Consulting', category: 'Professional', description: 'Law firms, business consultancy, and tax advice', icon: 'Gavel' },
    { name: 'Events & Photography', category: 'Media', description: 'Wedding planning, studios, and event management', icon: 'Music' }
];

const seedSectors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing sectors to avoid duplicates (Optional)
        // await Sector.deleteMany({});

        for (const sectorData of sectors) {
            const exists = await Sector.findOne({ name: sectorData.name });
            if (!exists) {
                await Sector.create(sectorData);
                console.log(`✅ Added Sector: ${sectorData.name}`);
            } else {
                console.log(`ℹ️ Sector already exists: ${sectorData.name}`);
            }
        }

        console.log('--- SEEDING COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ SEEDING FAILED:', err.message);
        process.exit(1);
    }
};

seedSectors();
