const origin = 'https://appointmentscheduling-system.vercel.app';
const regex = /\.vercel\.app$/;
console.log('Regex match:', regex.test(origin));

const allowedOrigins = [
    'https://appointmentscheduling-system.vercel.app',
    'https://appointment-scheduling-system.vercel.app',
    'http://localhost:5173',
    'http://localhost:5002',
    /\.vercel\.app$/ 
];

const isAllowed = allowedOrigins.some(ao => {
    if (ao instanceof RegExp) return ao.test(origin);
    return ao.trim().replace(/\/$/, '') === origin.trim().replace(/\/$/, '');
});

console.log('Is Allowed:', isAllowed);
