import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LogOut, User, Shield, Calendar, Ticket, Settings } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-primary-600 tracking-tight flex items-center gap-2 font-outfit">
                    <Calendar className="w-6 h-6" />
                    SmartEvents
                </h1>
                <div className="flex items-center gap-4 font-inter">
                    <Link to="/profile" className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full border border-gray-200 hover:bg-gray-200 transition-all">
                        <img
                            src={user?.profilePicture}
                            alt="Profile"
                            className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full uppercase font-bold">
                            {user?.role}
                        </span>
                    </Link>
                    <button
                        onClick={logout}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary-600 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden mb-10"
                >
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold mb-4">Welcome to your Dashboard, {user?.name}!</h2>
                        <p className="text-primary-100 text-lg max-w-2xl">
                            You are currently logged in as {user?.role === 'organizer' ? 'an Event Organizer' : 'an Attendee'}.
                            Explore upcoming events or manage your bookings with ease.
                        </p>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-500 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary-700 rounded-full opacity-30 blur-3xl"></div>
                </motion.div>

                {/* Stats / Action Cards (Placeholders) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <Calendar className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Upcoming Events</h3>
                        <p className="text-gray-500 text-sm">Discover and book new experiences.</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <Ticket className="text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">My Tickets</h3>
                        <p className="text-gray-500 text-sm">View and manage your active bookings.</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                            <Shield className="text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Security Settings</h3>
                        <p className="text-gray-500 text-sm">Update your profile and passwords.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
