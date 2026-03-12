import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, Tag, Loader2, Bookmark, Share2, Ticket } from 'lucide-react';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await axios.get(`/api/events/${id}`);
                setEvent(res.data);
            } catch (err) {
                console.error('Error fetching event details:', err);
                navigate('/events');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            {/* Banner Section */}
            <div className="relative h-[400px] md:h-[500px]">
                <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>

                <div className="absolute top-8 left-8">
                    <Link to="/events" className="flex items-center text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Events
                    </Link>
                </div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-7xl px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="px-4 py-1 bg-primary-600 text-white text-xs font-bold rounded-full uppercase tracking-widest mb-4 inline-block">
                            {event.category}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
                            {event.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-white/90">
                            <div className="flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-primary-400" />
                                {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-primary-400" />
                                {event.location}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <main className="max-w-7xl mx-auto px-8 py-16 -mt-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Description */}
                    <div className="lg:col-span-2 space-y-12">
                        <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Bookmark className="w-6 h-6 text-primary-600" />
                                About This Event
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                                {event.description}
                            </p>
                        </section>

                        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="bg-primary-50 p-4 rounded-2xl">
                                    <Users className="w-8 h-8 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Available Seats</p>
                                    <p className="text-2xl font-bold text-gray-900">{event.availableSeats} / {event.capacity}</p>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="bg-secondary-50 p-4 rounded-2xl">
                                    <Tag className="w-8 h-8 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Price per Ticket</p>
                                    <p className="text-2xl font-bold text-gray-900">${event.price || 'Free'}</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Booking Sidebar */}
                    <aside className="space-y-6">
                        <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100 sticky top-32">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Reservation</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                    <span className="text-gray-500">Ticket Price</span>
                                    <span className="font-bold text-gray-900">${event.price || 0}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                    <span className="text-gray-500">Processing Fee</span>
                                    <span className="font-bold text-gray-900">$0.00</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-gray-900 font-bold text-lg">Total</span>
                                    <span className="font-extrabold text-primary-600 text-2xl">${event.price || 0}</span>
                                </div>
                            </div>

                            <button
                                disabled={event.availableSeats === 0}
                                className="w-full btn-primary h-14 text-lg shadow-xl shadow-primary-200 flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:shadow-none"
                            >
                                <Ticket className="w-6 h-6" />
                                {event.availableSeats > 0 ? 'Book Ticket Now' : 'Sold Out'}
                            </button>

                            <p className="text-center text-xs text-gray-400 mt-6">
                                * Ticket verification will be handled via QR code after booking.
                            </p>

                            <div className="mt-8 pt-8 border-t border-gray-50 flex justify-center gap-4">
                                <button className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-primary-600 transition-colors">
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <button className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-primary-600 transition-colors">
                                    <Bookmark className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default EventDetails;
