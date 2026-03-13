import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, Tag, Loader2, Bookmark, Share2, Ticket, Trash2, Search, Send, X, Check } from 'lucide-react';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [bookedTicket, setBookedTicket] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Share state
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [searching, setSearching] = useState(false);
    const [sharing, setSharing] = useState(null); // ID of user currently being shared with

    const isOwner = user && String(event?.organizerId) === String(user.id || user._id);

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

    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setSearching(true);
                try {
                    const res = await axios.get(`/api/users/search?q=${searchQuery}`);
                    // Filter out current user from search results
                    setUsers(res.data.filter(u => String(u.id || u._id) !== String(user?.id || user?._id)));
                } catch (err) {
                    console.error('Search failed:', err);
                } finally {
                    setSearching(false);
                }
            } else {
                setUsers([]);
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchQuery, user]);

    const handleShare = async (recipient) => {
        setSharing(recipient.id || recipient._id);
        try {
            await axios.post('/api/notifications/share', {
                recipientId: recipient.id || recipient._id,
                eventId: event._id,
                eventTitle: event.title,
                message: `shared the event "${event.title}" with you!`
            });
            // Show success briefly
            setTimeout(() => setSharing(null), 1500);
        } catch (err) {
            console.error('Sharing failed:', err);
            setSharing(null);
            alert('Failed to share event.');
        }
    };

    const handleBook = async () => {
        setBooking(true);
        try {
            const res = await axios.post('/api/tickets/book', { eventId: id });
            setBookedTicket(res.data.ticket);
            // Refresh event data to show updated seats
            const eventRes = await axios.get(`/api/events/${id}`);
            setEvent(eventRes.data);
        } catch (err) {
            console.error('Booking failed:', err);
            alert(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setBooking(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;

        setDeleting(true);
        try {
            await axios.delete(`/api/events/${id}`);
            navigate('/events');
        } catch (err) {
            console.error('Delete failed:', err);
            alert(err.response?.data?.message || 'Failed to delete event.');
        } finally {
            setDeleting(false);
        }
    };

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

                {isOwner && (
                    <div className="absolute top-8 right-8 flex gap-3">
                        <button
                            onClick={() => navigate(`/events/edit/${id}`)}
                            className="bg-white text-gray-900 border-none hover:bg-gray-100 flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-black/20"
                        >
                            Edit Event
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-500 text-white hover:bg-red-600 flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-red-500/30 disabled:opacity-50"
                        >
                            {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            Delete
                        </button>
                    </div>
                )}

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
                        {bookedTicket && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-50 border border-green-100 p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-8 shadow-sm"
                            >
                                <div className="bg-white p-4 rounded-3xl shadow-md">
                                    <img src={bookedTicket.qrCode} alt="Ticket QR" className="w-32 h-32" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-2xl font-bold text-green-800 mb-2 underline underline-offset-4 decoration-green-200">Booking Successful!</h3>
                                    <p className="text-green-700">Your ticket has been confirmed. You can find it in 'My Tickets'.</p>
                                    <Link to="/my-tickets" className="inline-block mt-4 text-green-800 font-bold hover:underline">View All Tickets →</Link>
                                </div>
                            </motion.div>
                        )}

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

                            {user?.role !== 'organizer' ? (
                                <button
                                    onClick={handleBook}
                                    disabled={event.availableSeats === 0 || booking}
                                    className="w-full btn-primary h-14 text-lg shadow-xl shadow-primary-200 flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:shadow-none"
                                >
                                    {booking ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Ticket className="w-6 h-6" />}
                                    {event.availableSeats > 0 ? (booking ? 'Processing...' : 'Book Ticket Now') : 'Sold Out'}
                                </button>
                            ) : (
                                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-center">
                                    <p className="text-sm text-orange-700 font-medium">Organizers cannot purchase tickets.</p>
                                </div>
                            )}

                            <p className="text-center text-xs text-gray-400 mt-6">
                                * Ticket verification will be handled via QR code after booking.
                            </p>

                            <div className="mt-8 pt-8 border-t border-gray-50 flex justify-center gap-4">
                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-primary-600 transition-colors"
                                >
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

            {/* Share Modal */}
            <AnimatePresence>
                {isShareModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                            onClick={() => setIsShareModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                        <Share2 className="w-6 h-6 text-primary-600" />
                                        Share Event
                                    </h2>
                                    <button
                                        onClick={() => setIsShareModalOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-400" />
                                    </button>
                                </div>

                                <div className="relative mb-6">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search users by name..."
                                        className="input-field pl-12"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {searching ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                                        </div>
                                    ) : users.length > 0 ? (
                                        users.map(u => (
                                            <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-primary-100 transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={u.profilePicture || `https://ui-avatars.com/api/?name=${u.name}&background=6366f1&color=fff`}
                                                        className="w-10 h-10 rounded-xl object-cover"
                                                        alt={u.name}
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{u.id.slice(-8)}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleShare(u)}
                                                    disabled={sharing === (u.id || u._id)}
                                                    className={`p-3 rounded-xl transition-all ${sharing === (u.id || u._id)
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-primary-600 text-white shadow-lg shadow-primary-200 hover:scale-105 active:scale-95'
                                                        }`}
                                                >
                                                    {sharing === (u.id || u._id) ? <Check className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        ))
                                    ) : searchQuery.length >= 2 ? (
                                        <div className="text-center py-8 text-gray-400">
                                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="text-sm font-medium">No users found matching "{searchQuery}"</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <p className="text-sm font-medium">Type at least 2 characters to search</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 px-8 py-6 text-center">
                                <p className="text-xs text-gray-400 leading-relaxed italic">
                                    "Sharing is caring! Shared events will appear in the recipient's notifications instantly."
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EventDetails;
