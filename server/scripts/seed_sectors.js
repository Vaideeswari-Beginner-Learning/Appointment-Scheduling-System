const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Sector = require('../models/Sector');

// Load env vars
dotenv.config();

// Connect to Database
mongoose.connect('mongodb://127.0.0.1:27017/appointment-system')
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

const sectorData = [
    // Health & Care
    { category: 'Health & Care', icon: '🏥', name: 'Healthcare (Hospital / Clinic)' },
    { category: 'Health & Care', icon: '🏥', name: 'Dental Clinic' },
    { category: 'Health & Care', icon: '🏥', name: 'Physiotherapy' },
    { category: 'Health & Care', icon: '🏥', name: 'Diagnostic Center' },
    
    // Education
    { category: 'Education', icon: '🎓', name: 'School' },
    { category: 'Education', icon: '🎓', name: 'College' },
    { category: 'Education', icon: '🎓', name: 'Coaching Center' },
    { category: 'Education', icon: '🎓', name: 'Training Institute' },
    
    // Business / Corporate
    { category: 'Business / Corporate', icon: '🏢', name: 'Corporate / IT Company' },
    { category: 'Business / Corporate', icon: '🏢', name: 'Startup' },
    { category: 'Business / Corporate', icon: '🏢', name: 'BPO / Call Center' },
    
    // Beauty & Personal Care
    { category: 'Beauty & Personal Care', icon: '💇', name: 'Salon & Beauty' },
    { category: 'Beauty & Personal Care', icon: '💇', name: 'Spa & Wellness' },
    { category: 'Beauty & Personal Care', icon: '💇', name: 'Tattoo Studio' },
    
    // Automobile
    { category: 'Automobile', icon: '🚗', name: 'Car Service' },
    { category: 'Automobile', icon: '🚗', name: 'Bike Service' },
    { category: 'Automobile', icon: '🚗', name: 'Driving School' },
    
    // Fitness
    { category: 'Fitness', icon: '🏋️', name: 'Gym' },
    { category: 'Fitness', icon: '🏋️', name: 'Yoga Center' },
    { category: 'Fitness', icon: '🏋️', name: 'Fitness Training' },
    
    // Legal & Finance
    { category: 'Legal & Finance', icon: '⚖️', name: 'Legal Services' },
    { category: 'Legal & Finance', icon: '⚖️', name: 'CA / Accounting' },
    { category: 'Legal & Finance', icon: '⚖️', name: 'Banking & Finance' },
    { category: 'Legal & Finance', icon: '⚖️', name: 'Insurance Services' },
    
    // Property & Home
    { category: 'Property & Home', icon: '🏠', name: 'Real Estate' },
    { category: 'Property & Home', icon: '🏠', name: 'Interior Design' },
    { category: 'Property & Home', icon: '🏠', name: 'Home Services' },
    
    // Repair & Services
    { category: 'Repair & Services', icon: '🔧', name: 'Electronics Repair' },
    { category: 'Repair & Services', icon: '🔧', name: 'Appliance Service' },
    { category: 'Repair & Services', icon: '🔧', name: 'Maintenance Services' },
    
    // Events & Media
    { category: 'Events & Media', icon: '🎉', name: 'Event Management' },
    { category: 'Events & Media', icon: '🎉', name: 'Photography' },
    { category: 'Events & Media', icon: '🎉', name: 'Videography' },
    
    // Hospitality
    { category: 'Hospitality', icon: '🏨', name: 'Hotel & Hospitality' },
    { category: 'Hospitality', icon: '🏨', name: 'Resort' },
    { category: 'Hospitality', icon: '🏨', name: 'Restaurant' },
    
    // Retail & Shops
    { category: 'Retail & Shops', icon: '🛍️', name: 'Retail Store' },
    { category: 'Retail & Shops', icon: '🛍️', name: 'Supermarket' },
    { category: 'Retail & Shops', icon: '🛍️', name: 'E-commerce Pickup' },
    
    // Consultancy
    { category: 'Consultancy', icon: '🧠', name: 'Business Consultancy' },
    { category: 'Consultancy', icon: '🧠', name: 'Career Guidance' },
    { category: 'Consultancy', icon: '🧠', name: 'HR Consultancy' }
];

const seedDB = async () => {
    try {
        console.log('Clearing existing sectors...');
        await Sector.deleteMany({});
        
        console.log('Seeding new hierarchical sectors...');
        await Sector.insertMany(sectorData);
        
        console.log('✅ Sector seeding successful!');
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding sectors: ', error);
        process.exit(1);
    }
};

seedDB();
