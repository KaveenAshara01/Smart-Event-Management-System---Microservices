import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get('/api/events');
                // Just take the first 6 events for the showcase
                setEvents(res.data.slice(0, 6));
            } catch (err) {
                console.error('Error fetching featured events:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="min-h-screen bg-white font-inter">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary-900 to-primary-700 py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary-400 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="px-4 py-1.5 bg-primary-500/30 text-primary-100 text-xs font-bold rounded-full uppercase tracking-widest mb-6 inline-block border border-white/10 backdrop-blur-sm">
                            Experience More
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
                            Smart Event <span className="text-secondary-400 font-outfit italic">Management</span>
                        </h1>
                        <p className="text-xl text-primary-100 max-w-2xl mx-auto leading-relaxed mb-10 opacity-90">
                            Explore, plan, and book the most exclusive events in one seamless platform. Professional tools for organizers and effortless discovery for attendees.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/events" className="btn-primary h-14 px-10 text-lg shadow-2xl shadow-primary-900/50 flex items-center gap-2 group">
                                Explore All Events
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/register" className="h-14 px-10 flex items-center text-white font-semibold hover:text-secondary-400 transition-colors">
                                Host Your Own Event →
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Featured Showcase */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-secondary-500" />
                            Featured Showcase
                        </h2>
                        <p className="text-gray-500 mt-2">The most anticipated events currently on our platform.</p>
                    </div>
                    <Link to="/events" className="hidden md:flex items-center text-primary-600 font-bold hover:underline">
                        View All Events <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                        <p className="text-gray-500">Curating the best events for you...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.length > 0 ? (
                            events.map(event => (
                                <EventCard key={event._id} event={event} />
                            ))
                        ) : (
                            <div className="col-span-full py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200 text-center">
                                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900">No events currently scheduled</h3>
                                <p className="text-gray-500">Check back later for new experiences!</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-16 text-center md:hidden">
                    <Link to="/events" className="inline-flex items-center text-primary-600 font-bold hover:underline">
                        View All Events <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Simple Features Section */}
            <div className="bg-gray-50 py-24 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto text-primary-600 font-bold text-2xl">01</div>
                            <h3 className="text-xl font-bold text-gray-900">Smart Discovery</h3>
                            <p className="text-gray-500">AI-powered recommendations based on your interests and past bookings.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto text-primary-600 font-bold text-2xl">02</div>
                            <h3 className="text-xl font-bold text-gray-900">Seamless Payments</h3>
                            <p className="text-gray-500">Secure and instant ticket booking with digital QR verification.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto text-primary-600 font-bold text-2xl">03</div>
                            <h3 className="text-xl font-bold text-gray-900">Event Analytics</h3>
                            <p className="text-gray-500">Real-time attendance tracking and engagement metrics for organizers.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
