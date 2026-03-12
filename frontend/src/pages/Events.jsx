import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, MapPin, Loader2, Sparkles, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { user } = useAuth();

    const categories = ['All', 'Music', 'Tech', 'Food', 'Business', 'Sports', 'Art'];

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get('/api/events');
                setEvents(res.data);
            } catch (err) {
                console.error('Error fetching events:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            {/* Header / Hero Section */}
            <div className="bg-white border-b border-gray-100 pt-10 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight"
                            >
                                Discover <span className="text-primary-600">Events</span>
                            </motion.h1>
                            <p className="text-gray-500 mt-2 text-lg">Find and book the most exciting experiences near you.</p>
                        </div>

                        {(user?.role === 'organizer' || user?.role === 'admin') && (
                            <Link to="/events/create" className="btn-primary flex items-center gap-2 h-fit text-sm py-3 px-8 shadow-lg shadow-primary-200">
                                <Plus className="w-5 h-5" />
                                Create Event
                            </Link>
                        )}
                    </div>

                    {/* Search & Filter Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100 flex flex-col lg:flex-row gap-4"
                    >
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                className="input-field pl-12 h-14 bg-gray-50 border-none bg-opacity-50"
                                placeholder="Search events by title or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2 rounded-2xl font-medium transition-all whitespace-nowrap ${selectedCategory === cat
                                            ? 'bg-primary-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Event Grid */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Loading amazing events...</p>
                    </div>
                ) : (
                    <>
                        {filteredEvents.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                <AnimatePresence mode='popLayout'>
                                    {filteredEvents.map(event => (
                                        <EventCard key={event._id} event={event} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-900">No events found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your search or category filters.</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default Events;
