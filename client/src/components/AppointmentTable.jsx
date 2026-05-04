import React from 'react';
import { Check, X, Eye } from 'lucide-react';

const AppointmentTable = ({ appointments, onApprove, onReject }) => {
    return (
        <div className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="table table-zebra w-full text-sm">
                    <thead className="bg-base-200/50">
                        <tr>
                            <th>Name</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-8 opacity-50 italic">No appointments found.</td></tr>
                        ) : appointments.map((appt) => (
                            <tr key={appt._id} className="hover:bg-base-200/30 transition-colors">
                                <td className="font-bold">{appt.userId?.name || appt.name || "N/A"}</td>
                                <td>{appt.slotId?.date}</td>
                                <td>{appt.slotId?.startTime}</td>
                                <td>
                                    <div className={`badge badge-sm uppercase font-bold ${
                                        appt.status === 'approved' ? 'badge-success' : 
                                        appt.status === 'pending' ? 'badge-warning' : 'badge-error'
                                    }`}>
                                        {appt.status}
                                    </div>
                                </td>
                                <td className="text-right flex justify-end gap-2">
                                    {appt.status === 'pending' && (
                                        <>
                                            <button onClick={() => onApprove(appt._id)} className="btn btn-ghost btn-xs text-success bg-success/10 hover:bg-success/20">
                                                <Check size={14} />
                                            </button>
                                            <button onClick={() => onReject(appt._id)} className="btn btn-ghost btn-xs text-error bg-error/10 hover:bg-error/20">
                                                <X size={14} />
                                            </button>
                                        </>
                                    )}
                                    <button className="btn btn-ghost btn-xs text-primary bg-primary/10 hover:bg-primary/20">
                                        <Eye size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppointmentTable;
