import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Home,
    Calendar,
    Ticket,
    User,
    Bell,
    LogOut,
    PlusSquare,
    Zap
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const res = await axios.get('/api/notifications/my-notifications');
            const unread = res.data.filter(n => !n.read).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            // Polling for new notifications every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user, location.pathname]);

    if (!user) return null;

    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Events', path: '/events', icon: Calendar },
        { name: 'My Tickets', path: '/my-tickets', icon: Ticket, roles: ['attendee', 'admin'] },
        { name: 'Profile', path: '/profile', icon: User },
    ].filter(item => !item.roles || item.roles.includes(user.role));

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-primary-600 p-2 rounded-xl transition-transform group-hover:rotate-12">
                        <Zap className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-black text-gray-900 tracking-tighter">SEMS</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all font-semibold ${isActive
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/notifications"
                        className={`p-3 rounded-2xl transition-all relative ${location.pathname === '/notifications'
                            ? 'bg-primary-50 text-primary-600'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white shadow-sm ring-2 ring-transparent">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Link>

                    <div className="h-8 w-[1px] bg-gray-100 mx-2 hidden sm:block"></div>

                    <button
                        onClick={logout}
                        className="p-3 rounded-2xl bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-2"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden lg:block font-bold text-sm">Sign Out</span>
                    </button>

                    <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-100">
                        <img
                            src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                            alt="Profile"
                            className="w-10 h-10 rounded-xl object-cover border-2 border-primary-100"
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
