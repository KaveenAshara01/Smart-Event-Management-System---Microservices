import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Ticket, User, Calendar, CheckCircle, Info, ArrowLeft, Trash2, Share2, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/notifications/my-notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAllRead = async () => {
        try {
            await axios.patch('/api/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const clearAll = () => {
        // Local clear for UI experience, though they remain in DB as read
        setNotifications([]);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
            </div>
        );
    }

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
                            notifications.map((notif, index) => (
                                <motion.div
                                    key={notif._id || notif.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-6 rounded-3xl border ${notif.read ? 'bg-white border-gray-100' : 'bg-white border-primary-100 shadow-lg shadow-primary-50'
                                        } transition-all hover:border-primary-200 relative group`}
                                >
                                    {!notif.read && (
                                        <div className="absolute top-6 right-6 w-2 h-2 bg-primary-600 rounded-full"></div>
                                    )}

                                    <div className="flex gap-6">
                                        <div className={`${notif.type === 'EVENT_SHARE' ? 'bg-primary-500' : 'bg-blue-500'} p-4 rounded-2xl text-white shadow-lg h-fit`}>
                                            {notif.type === 'EVENT_SHARE' ? <Share2 className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className={`font-bold ${notif.read ? 'text-gray-900' : 'text-primary-900'}`}>
                                                    {notif.senderName} shared an event
                                                </h3>
                                                <span className="text-xs font-medium text-gray-400">{formatTime(notif.createdAt)}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                                {notif.message}
                                            </p>

                                            {notif.eventId && (
                                                <Link
                                                    to={`/events/${notif.eventId}`}
                                                    className="inline-flex items-center gap-2 text-xs font-bold text-primary-600 px-4 py-2 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                                                >
                                                    View Event <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200"
                            >
                                <Bell className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
                                <p className="text-gray-500 mt-2">No new notifications at the moment.</p>
                                <Link to="/" className="btn-primary mt-8 inline-block px-8">Back to Home</Link>
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
