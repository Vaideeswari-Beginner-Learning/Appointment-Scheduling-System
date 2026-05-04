import React from 'react';
import { 
    CalendarCheck, 
    Clock, 
    XCircle, 
    TrendingUp,
    Zap
} from 'lucide-react';

const StatsCards = ({ stats }) => {
    const cards = [
        { 
            label: 'Total Bookings', 
            value: stats?.totalBookings || 0, 
            icon: <CalendarCheck size={20} />, 
            color: 'bg-blue-600', 
            light: 'bg-blue-50',
            trend: '+12% from last week'
        },
        { 
            label: "Today's", 
            value: stats?.todayCount || 0, 
            icon: <Zap size={20} />, 
            color: 'bg-green-500', 
            light: 'bg-green-50',
            trend: '5 new requests'
        },
        { 
            label: 'Cancelled', 
            value: stats?.cancelledCount || 0, 
            icon: <XCircle size={20} />, 
            color: 'bg-red-500', 
            light: 'bg-red-50',
            trend: '-2% reduction'
        },
        { 
            label: 'Upcoming', 
            value: stats?.pendingCount || 0, 
            icon: <Clock size={20} />, 
            color: 'bg-amber-500', 
            light: 'bg-amber-50',
            trend: 'Next in 2 hours'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {cards.map((card, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-2xl ${card.light} flex items-center justify-center text-${card.color.split('-')[1]}-600 group-hover:scale-110 transition-transform`}>
                            {React.cloneElement(card.icon, { className: card.color.replace('bg-', 'text-') })}
                        </div>
                        <div className="px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-tight">Live</div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                        <h3 className="text-3xl font-extrabold text-gray-800">{card.value}</h3>
                        <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-gray-400">
                            <TrendingUp size={12} className="text-green-500" />
                            <span>{card.trend}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;
