export const sectorConfig = {
    health: {
        label: 'Healthcare',
        brandLabel: 'Hospital / Clinic',
        subCategories: ['Clinic', 'Hospital', 'Physiotherapy', 'Doctor Visit'],
        dashboard: {
            employeeRole: 'Doctor',
            userRole: 'Patient',
            serviceLabel: 'Treatments',
            slotLabel: 'Availability Slots',
            bookingLabel: 'Appointments'
        },
        dummyStaff: [
            'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1594824432258-2eb7163c46b5?auto=format&fit=crop&w=400&q=80'
        ],
        userSide: {
            button: 'Book Appointment',
            fields: [
                { label: 'Patient Name', fieldKey: 'name', type: 'text', placeholder: 'Enter full name...', required: true },
                { label: 'Age', fieldKey: 'age', type: 'number', placeholder: 'Patient age', required: true },
                { label: 'Symptoms', fieldKey: 'symptoms', type: 'textarea', placeholder: 'Describe symptoms...', required: true }
            ],
            image: '/healthcare.png',
            secondaryImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            logo: '/logo.png'
        },
        websiteContent: {
            heroTitle: 'World-Class Healthcare & Patient Care',
            heroSub: 'Schedule your visit with our specialized medical professionals using our smart booking system.',
            aboutTitle: 'About Our Medical Center',
            aboutText: 'Dedicated to providing exceptional healthcare with cutting-edge technology and compassionate care. Our team of specialists is committed to your well-being around the clock.',
            staffSub: 'Meet our board-certified doctors and medical staff.',
            bookingSub: 'Book your medical consultation easily with instant confirmation.',
            trustBadge: 'Trusted by 10k+ local patients'
        }
    },
    education: {
        label: 'Education',
        brandLabel: 'School / College',
        subCategories: ['School', 'College', 'University', 'Professional Courses'],
        dashboard: {
            employeeRole: 'Faculty',
            userRole: 'Student',
            serviceLabel: 'Courses',
            slotLabel: 'Timetables',
            bookingLabel: 'Admissions'
        },
        dummyStaff: [
            'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=400&q=80'
        ],
        userSide: {
            button: 'Apply Now',
            fields: [
                { label: 'Student Name', fieldKey: 'name', type: 'text', placeholder: 'Enter student name...', required: true },
                { label: 'Course', fieldKey: 'course', type: 'text', placeholder: 'Desired course', required: true },
                { label: 'Marks', fieldKey: 'marks', type: 'number', placeholder: 'Previous marks (%)', required: true }
            ],
            image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            secondaryImage: 'https://images.unsplash.com/photo-1546410531-bb4caa1b4249?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            logo: 'https://images.unsplash.com/photo-1546410531-bb4caa1b4249?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
        },
        websiteContent: {
            heroTitle: 'Empowering Minds Through Excellence',
            heroSub: 'Join our academic programs and book your sessions with top faculty members today.',
            aboutTitle: 'About Our Educational Institution',
            aboutText: 'Fostering a rich learning environment where students excel. We offer modern academic facilities and a curriculum designed for 21st-century success.',
            staffSub: 'Meet our distinguished faculty and mentors.',
            bookingSub: 'Secure your academic admission or session in just a few clicks.',
            trustBadge: 'Trusted by 10k+ students'
        }
    },
    salon: {
        label: 'Salon & Beauty',
        brandLabel: 'Salon / Studio',
        subCategories: ['Haircut', 'Spa & Massage', 'Bridal Makeup', 'Skin Care'],
        dashboard: {
            employeeRole: 'Stylist',
            userRole: 'Customer',
            serviceLabel: 'Services',
            slotLabel: 'Availability Slots',
            bookingLabel: 'Bookings'
        },
        dummyStaff: [
            'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1521590832167-7bfc17484d20?auto=format&fit=crop&w=400&q=80'
        ],
        userSide: {
            button: 'Book Service',
            fields: [
                { label: 'Customer Name', fieldKey: 'name', type: 'text', placeholder: 'Your name', required: true },
                { label: 'Service', fieldKey: 'service', type: 'text', placeholder: 'Haircut, Spa, etc.', required: true },
                { label: 'Time', fieldKey: 'time', type: 'time', placeholder: 'Select time', required: true }
            ],
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            secondaryImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
        },
        websiteContent: {
            heroTitle: 'Enhance Your Beauty & Confidence',
            heroSub: 'Book top-rated beauty professionals and salons.',
            aboutTitle: 'About Our Salon',
            aboutText: 'Book top-rated beauty professionals and salons.',
            staffSub: 'Meet our expert beauty professionals and stylists.',
            bookingSub: 'Schedule your beauty session easily.'
        }
    },
    hotel: {
        label: 'Hospitality',
        brandLabel: 'Hotel / Resort',
        subCategories: ['Standard Room', 'Luxury Suite', 'Resort Stay', 'Business Hotel'],
        dashboard: {
            employeeRole: 'Staff',
            userRole: 'Guest',
            serviceLabel: 'Rooms',
            slotLabel: 'Availability',
            bookingLabel: 'Reservations'
        },
        dummyStaff: [
            'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1542385012-68c4ee29d4d5?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1580392359526-724bc44951ce?auto=format&fit=crop&w=400&q=80'
        ],
        userSide: {
            button: 'Reserve Room',
            fields: [
                { label: 'Guest Name', fieldKey: 'name', type: 'text', placeholder: 'Primary guest name', required: true },
                { label: 'Check-in', fieldKey: 'check_in', type: 'date', placeholder: '', required: true },
                { label: 'Check-out', fieldKey: 'check_out', type: 'date', placeholder: '', required: true }
            ],
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            secondaryImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4df85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
        },
        websiteContent: {
            heroTitle: 'Comfortable Stays & Premium Services',
            heroSub: 'Discover hotels and hospitality services easily.',
            aboutTitle: 'About Our Hotel',
            aboutText: 'Discover hotels and hospitality services easily, providing comfort and memorable experiences.',
            staffSub: 'Meet our courteous hospitality staff.',
            bookingSub: 'Schedule your stay easily.'
        }
    },
    corporate: {
        label: 'Corporate',
        brandLabel: 'Company',
        subCategories: ['IT Job', 'Marketing', 'HR Services', 'Consulting'],
        dashboard: {
            employeeRole: 'Interviewer',
            userRole: 'Candidate',
            serviceLabel: 'Job Postings',
            slotLabel: 'Interview Slots',
            bookingLabel: 'Interviews'
        },
        dummyStaff: [
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
        ],
        userSide: {
            button: 'Apply / Schedule Interview',
            fields: [
                { label: 'Candidate Name', fieldKey: 'name', type: 'text', placeholder: 'Full Name', required: true },
                { label: 'Role Applied', fieldKey: 'role', type: 'text', placeholder: 'e.g. Developer', required: true }
            ],
            image: '/corporate.png',
            secondaryImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
        },
        websiteContent: {
            heroTitle: 'Grow Your Business with Experts',
            heroSub: 'Professional corporate services to support and scale your business.',
            aboutTitle: 'About Our Company',
            aboutText: 'Professional corporate services to support and scale your business.',
            staffSub: 'Connect with corporate professionals.',
            bookingSub: 'Schedule your corporate session easily.'
        }
    },
    automobile: {
        label: 'Automobile',
        brandLabel: 'Garage / Showroom',
        subCategories: ['General Service', 'Denting & Painting', 'Insurance Work', 'Accessories'],
        dashboard: {
            employeeRole: 'Mechanic',
            userRole: 'Customer',
            serviceLabel: 'Services',
            slotLabel: 'Garage Slots',
            bookingLabel: 'Bookings'
        },
        dummyStaff: [
            'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1504222490345-c075b6008014?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1620864387802-959c8fa7270e?auto=format&fit=crop&w=400&q=80'
        ],
        userSide: {
            button: 'Book Service',
            fields: [
                { label: 'Customer Name', fieldKey: 'name', type: 'text', placeholder: 'Your name', required: true },
                { label: 'Vehicle', fieldKey: 'vehicle', type: 'text', placeholder: 'Car/Bike Model', required: true },
                { label: 'Issue', fieldKey: 'issue', type: 'textarea', placeholder: 'Describe problem', required: true }
            ],
            image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            secondaryImage: 'https://images.unsplash.com/photo-1530046339160-ce3e5b0c7a2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
        },
        websiteContent: {
            heroTitle: 'Reliable Automobile Services at Your Convenience',
            heroSub: 'Get trusted vehicle services from verified professionals.',
            aboutTitle: 'About Our Garage',
            aboutText: 'Get trusted vehicle services from verified professionals.',
            staffSub: 'Meet our trusted mechanics and experts.',
            bookingSub: 'Schedule your vehicle service easily.'
        }
    },
    fitness: {
        label: 'Fitness',
        brandLabel: 'Gym / Fitness Center',
        subCategories: ['Gym Membership', 'Yoga Classes', 'Personal Training', 'Zumba'],
        dashboard: {
            employeeRole: 'Trainer',
            userRole: 'Member',
            serviceLabel: 'Fitness Plans',
            slotLabel: 'Timings',
            bookingLabel: 'Memberships'
        },
        dummyStaff: [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=400&q=80'
        ],
        userSide: {
            button: 'Join Now',
            fields: [
                { label: 'Member Name', fieldKey: 'name', type: 'text', placeholder: 'Your name', required: true },
                { label: 'Plan', fieldKey: 'plan', type: 'text', placeholder: 'Monthly, Yearly...', required: true },
                { label: 'Timing', fieldKey: 'timing', type: 'text', placeholder: 'Morning/Evening', required: true }
            ],
            image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            secondaryImage: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
        },
        websiteContent: {
            heroTitle: 'Stay Fit, Stay Healthy',
            heroSub: 'Connect with trainers and fitness centers.',
            aboutTitle: 'About Our Fitness Center',
            aboutText: 'Connect with trainers and fitness centers to achieve your goals.',
            staffSub: 'Meet our professional fitness trainers.',
            bookingSub: 'Schedule your fitness session easily.'
        }
    },
    legal: {
        label: 'Legal',
        brandLabel: 'Law Firm',
        subCategories: ['Corporate Law', 'Family Law', 'Real Estate Law', 'Civil Litigation'],
        dashboard: {
            employeeRole: 'Lawyer',
            userRole: 'Client',
            serviceLabel: 'Consultations',
            slotLabel: 'Availability',
            bookingLabel: 'Appointments'
        },
        dummyStaff: [
            'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=400&q=80'
        ],
        userSide: {
            button: 'Book Consultation',
            fields: [
                { label: 'Client Name', fieldKey: 'name', type: 'text', placeholder: 'Your name', required: true },
                { label: 'Case Type', fieldKey: 'case_type', type: 'text', placeholder: 'Civil, Criminal...', required: true }
            ],
            image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            secondaryImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
        },
        websiteContent: {
            heroTitle: 'Trusted Legal & Financial Solutions',
            heroSub: 'Professional legal and financial services at your fingertips.',
            aboutTitle: 'About Our Firm',
            aboutText: 'Professional legal and financial services at your fingertips.',
            staffSub: 'Meet our trusted legal and finance professionals.',
            bookingSub: 'Schedule your consultation session easily.'
        }
    },
    property: {
        label: 'Property',
        brandLabel: 'Agency / Developer',
        subCategories: ['Apartments', 'Commercial Space', 'Independent Villas', 'Land Plots'],
        dashboard: {
            employeeRole: 'Agent',
            userRole: 'Buyer/Tenant',
            serviceLabel: 'Properties',
            slotLabel: 'Visit Slots',
            bookingLabel: 'Visits'
        },
        dummyStaff: [
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=400&q=80'
        ],
        userSide: {
            button: 'Book Visit',
            fields: [
                { label: 'Visitor Name', fieldKey: 'name', type: 'text', placeholder: 'Your name', required: true },
                { label: 'Property Type', fieldKey: 'property_type', type: 'text', placeholder: 'Flat, Villa, Land...', required: true }
            ],
            image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            secondaryImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
        },
        websiteContent: {
            heroTitle: 'Find and Manage Your Dream Home',
            heroSub: 'Property and home services made easy.',
            aboutTitle: 'About Our Property Services',
            aboutText: 'Property and home services made easy.',
            staffSub: 'Connect with our expert property agents.',
            bookingSub: 'Schedule your property visit easily.'
        }
    },
    repair: {
        label: 'Repair Services',
        brandLabel: 'Service Center',
        subCategories: ['Electronics', 'Plumbing', 'HVAC/AC Repair', 'Carpentry'],
        dashboard: {
            employeeRole: 'Technician',
            userRole: 'Customer',
            serviceLabel: 'Services',
            slotLabel: 'Availability',
            bookingLabel: 'Requests'
        },
        dummyStaff: [
            'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1590483736622-39854bcbc8c3?auto=format&fit=crop&w=400&q=80'
        ],
        userSide: {
            button: 'Request Service',
            fields: [
                { label: 'Customer Name', fieldKey: 'name', type: 'text', placeholder: 'Your Name', required: true },
                { label: 'Issue Description', fieldKey: 'issue', type: 'textarea', placeholder: 'What needs repair?', required: true }
            ],
            image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            secondaryImage: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            logo: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
        },
        websiteContent: {
            heroTitle: 'Expert Repair & Maintenance Solutions',
            heroSub: 'Professional technical support for all your electronics, plumbing, and home maintenance needs.',
            aboutTitle: 'About Our Technical Service Center',
            aboutText: 'Providing fast, reliable, and expert repair services. Our certified technicians ensure your systems are back in peak condition with guaranteed results.',
            staffSub: 'Meet our certified technical experts.',
            bookingSub: 'Request a repair service and track your technician in real-time.',
            trustBadge: '10k+ Successful Repairs Completed'
        }
    },
    events: {
        label: 'Events',
        brandLabel: 'Event Agency',
        subCategories: ['Wedding Planning', 'Corporate Events', 'Social Gatherings', 'Music Concerts'],
        dashboard: {
            employeeRole: 'Coordinator',
            userRole: 'Attendee',
            serviceLabel: 'Event Types',
            slotLabel: 'Dates',
            bookingLabel: 'Bookings'
        },
        dummyStaff: [
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80'
        ],
        userSide: {
            button: 'Book Event',
            fields: [
                { label: 'Attendee Name', fieldKey: 'name', type: 'text', placeholder: 'Your Name', required: true },
                { label: 'Event Type', fieldKey: 'event_type', type: 'text', placeholder: 'Wedding, Seminar...', required: true }
            ],
            image: '/sector_venues_real.png',
            secondaryImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
        },
        websiteContent: {
            heroTitle: 'Make Your Events Memorable',
            heroSub: 'Book photographers, event planners, and media experts.',
            aboutTitle: 'About Our Event Agency',
            aboutText: 'Book photographers, event planners, and media experts to make your events truly memorable.',
            staffSub: 'Connect with our talented event planners and crew.',
            bookingSub: 'Schedule your event planning session with our experts today.',
            trustBadge: '500+ Events Successfully Organized'
        }
    },
    retail: {
        label: 'Retail',
        brandLabel: 'Store / Shop',
        subCategories: ['Fashion & Apparel', 'Electronics Store', 'Grocery & Mart', 'Home Decor'],
        dashboard: {
            employeeRole: 'Staff',
            userRole: 'Customer',
            serviceLabel: 'Products',
            slotLabel: 'Pickup Slots',
            bookingLabel: 'Orders'
        },
        dummyStaff: [
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
        ],
        userSide: {
            button: 'Order / Pickup',
            fields: [
                { label: 'Customer Name', fieldKey: 'name', type: 'text', placeholder: 'Your name', required: true },
                { label: 'Product', fieldKey: 'product', type: 'text', placeholder: 'Product Name/SKU', required: true }
            ],
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            secondaryImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
        },
        websiteContent: {
            heroTitle: 'Shop Smart, Shop Easy',
            heroSub: 'Explore nearby shops and retail services.',
            aboutTitle: 'About Our Store',
            aboutText: 'Explore nearby shops and retail services, ensuring you get the best products fast and easy.',
            staffSub: 'Meet our dedicated store staff.',
            bookingSub: 'Schedule your store visit or pickup effortlessly.',
            trustBadge: 'Guaranteed Quality & Freshness'
        }
    },
    consultancy: {
        label: 'Consultancy',
        brandLabel: 'Consultancy Firm',
        subCategories: ['Business Strategy', 'Financial Advise', 'Technology Consulting', 'Career Guidance'],
        dashboard: {
            employeeRole: 'Consultant',
            userRole: 'Client',
            serviceLabel: 'Topics',
            slotLabel: 'Availability',
            bookingLabel: 'Sessions'
        },
        dummyStaff: [
            'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80'
        ],
        userSide: {
            button: 'Book Session',
            fields: [
                { label: 'Client Name', fieldKey: 'name', type: 'text', placeholder: 'Your Name', required: true },
                { label: 'Topic', fieldKey: 'topic', type: 'text', placeholder: 'Consultancy topic', required: true }
            ],
            image: '/sector_freelancer_real.png',
            secondaryImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
        },
        websiteContent: {
            heroTitle: 'Expert Advice for Better Decisions',
            heroSub: 'Get professional consultation across various domains.',
            aboutTitle: 'About Our Consultancy',
            aboutText: 'Get professional consultation across various domains.',
            staffSub: 'Connect with our seasoned consultants.',
            bookingSub: 'Schedule your consultation session with our experts today.',
            trustBadge: 'Certified Subject Matter Experts'
        }
    },
    general: {
        label: 'General Service',
        subCategories: ['Consultation', 'General Service', 'Maintenance', 'Support'],
        dashboard: {
            employeeRole: 'Staff',
            userRole: 'Customer',
            serviceLabel: 'Services',
            slotLabel: 'Availability Slots',
            bookingLabel: 'Bookings'
        },
        dummyStaff: [
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
        ],
        userSide: {
            button: 'Book Service',
            fields: [
                { label: 'Your Name', fieldKey: 'name', type: 'text', placeholder: 'Full Name', required: true }
            ],
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            secondaryImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
        },
        websiteContent: {
            heroTitle: 'Premium Services for You',
            heroSub: 'Book an appointment securely.',
            aboutTitle: 'About Us',
            aboutText: 'We provide excellent services to cater to your needs.',
            staffSub: 'Meet our dedicated team members.',
            bookingSub: 'Schedule your appointment instantly.'
        }
    }
};

export const getSectorConfig = (sectorKey) => {
    let key = sectorKey?.toLowerCase() || 'general';
    
    // Robust normalization using keyword matching
    if (key.includes('health') || key.includes('hospital')) key = 'health';
    else if (key.includes('beauty') || key.includes('salon')) key = 'salon';
    else if (key.includes('hotel') || key.includes('restaurant') || key.includes('hospitality')) key = 'hotel';
    else if (key.includes('school') || key.includes('college') || key.includes('education')) key = 'education';
    else if (key.includes('company') || key.includes('corporate')) key = 'corporate';
    else if (key.includes('gym') || key.includes('fitness')) key = 'fitness';
    else if (key.includes('legal') || key.includes('consult')) key = 'legal';
    else if (key.includes('garage') || key.includes('auto')) key = 'automobile';
    else if (key.includes('repair') || key.includes('service center')) key = 'repair';
    else if (key.includes('event') || key.includes('media')) key = 'events';

    if (!key || !sectorConfig[key]) {
        return sectorConfig['general'];
    }
    return sectorConfig[key];
};
