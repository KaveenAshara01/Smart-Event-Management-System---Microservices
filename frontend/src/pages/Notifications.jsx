import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Ticket, User, Calendar, CheckCircle, Info, ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications = () => {
    // In a real app, these would be fetched from the Notification Service or via WebSockets
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'ticket',
            title: 'Booking Confirmed!',
            message: 'Your ticket for Coachella 2026 has been successfully generated.',
            time: '2 minutes ago',
            read: false,
            icon: Ticket,
            color: 'bg-blue-500'
        },
        {
            id: 2,
            type: 'profile',
            title: 'Profile Updated',
            message: 'Your profile picture and name have been updated successfully.',
            time: '1 hour ago',
            read: true,
            icon: User,
            color: 'bg-green-500'
        },
        {
            id: 3,
            type: 'event',
            title: 'New Event Nearby',
            message: 'A new Tech Summit has been announced in your area.',
            time: '5 hours ago',
            read: true,
            icon: Calendar,
            color: 'bg-purple-500'
        }
    ]);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-inter pt-28 pb-12">
            <div className="max-w-3xl mx-auto px-6">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                            Center <span className="text-primary-600">Notifications</span>
                        </h1>
                        <p className="text-gray-500 mt-2">Stay updated with your latest activities and events.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={markAllRead}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-colors text-sm font-bold flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Mark all read
                        </button>
                        <button
                            onClick={clearAll}
                            className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors text-sm font-bold flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode='popLayout'>
                        {notifications.length > 0 ? (
                            notifications.map((notif, index) => {
                                const Icon = notif.icon;
                                return (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`p-6 rounded-3xl border ${notif.read ? 'bg-white border-gray-100' : 'bg-white border-primary-100 shadow-lg shadow-primary-50'
                                            } transition-all hover:border-primary-200 relative group`}
                                    >
                                        {!notif.read && (
                                            <div className="absolute top-6 right-6 w-2 h-2 bg-primary-600 rounded-full"></div>
                                        )}

                                        <div className="flex gap-6">
                                            <div className={`${notif.color} p-4 rounded-2xl text-white shadow-lg`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className={`font-bold ${notif.read ? 'text-gray-900' : 'text-primary-900'}`}>
                                                        {notif.title}
                                                    </h3>
                                                    <span className="text-xs font-medium text-gray-400">{notif.time}</span>
                                                </div>
                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                    {notif.message}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200"
                            >
                                <Bell className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
                                <p className="text-gray-500 mt-2">No new notifications at the moment.</p>
                                <Link to="/dashboard" className="btn-primary mt-8 inline-block px-8">Back to Dashboard</Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-12 p-8 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            Email Notifications
                        </h3>
                        <p className="text-white/80 text-sm leading-relaxed max-w-md">
                            We also send real-time alerts to your registered email for critical updates like ticket bookings and security alerts.
                        </p>
                    </div>
                    <div className="absolute -bottom-10 -right-10 opacity-20 rotate-12">
                        <Bell className="w-40 h-40" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
