import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Calendar, MapPin, Loader2, QrCode, ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await axios.get('/api/tickets/my-tickets');
                setTickets(res.data);
            } catch (err) {
                console.error('Error fetching tickets:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 py-10">
                <div className="max-w-7xl mx-auto px-6">
                    <Link to="/" className="flex items-center text-gray-500 hover:text-primary-600 mb-6 transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        My <span className="text-primary-600">Tickets</span>
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Manage your bookings and access your QR codes for entry.</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium tracking-wide">Retrieving your passes...</p>
                    </div>
                ) : (
                    <>
                        {tickets.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <AnimatePresence mode='popLayout'>
                                    {tickets.map(ticket => (
                                        <motion.div
                                            key={ticket._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden group hover:shadow-2xl transition-all"
                                        >
                                            <div className="p-8">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="bg-primary-50 p-3 rounded-2xl">
                                                        <Ticket className="w-8 h-8 text-primary-600" />
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${ticket.status === 'valid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {ticket.status}
                                                        </span>
                                                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">#{ticket._id.slice(-8)}</p>
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold text-gray-900 mb-4 truncate group-hover:text-primary-600 transition-colors">
                                                    {ticket.eventTitle}
                                                </h3>

                                                <div className="space-y-3 mb-8">
                                                    <div className="flex items-center text-gray-500 text-sm">
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        {new Date(ticket.bookingDate).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center text-gray-500 text-sm">
                                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                                        Price: ${ticket.pricePaid}
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 p-6 rounded-2xl flex flex-col items-center border border-dashed border-gray-200 group-hover:bg-white transition-colors group-hover:border-primary-200">
                                                    <img
                                                        src={ticket.qrCode}
                                                        alt="QR Code"
                                                        className="w-32 h-32 mb-4 group-hover:scale-105 transition-transform"
                                                    />
                                                    <button
                                                        onClick={() => setSelectedTicket(ticket)}
                                                        className="text-primary-600 text-sm font-bold flex items-center hover:underline"
                                                    >
                                                        Tap to Enlarge <ExternalLink className="w-3 h-3 ml-1" />
                                                    </button>
                                                </div>
                                            </div>

                                            <Link
                                                to={`/events/${ticket.eventId}`}
                                                className="block w-full text-center py-4 bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all"
                                            >
                                                View Event Details
                                            </Link>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                                <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-gray-900">No tickets found</h3>
                                <p className="text-gray-500 mt-2 max-w-xs mx-auto">You haven't booked any tickets yet. Explore events and join the fun!</p>
                                <Link to="/events" className="btn-primary mt-8 inline-block px-10">Browse Events</Link>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Modal for QR Code Enlargement */}
            <AnimatePresence>
                {selectedTicket && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedTicket(null)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white p-10 rounded-[40px] max-w-md w-full text-center shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <Ticket className="w-12 h-12 text-primary-600 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedTicket.eventTitle}</h3>
                            <p className="text-gray-500 mb-8">Scan this code at the venue entrance</p>

                            <img src={selectedTicket.qrCode} alt="Large QR" className="w-64 h-64 mx-auto rounded-3xl border-4 border-gray-50 p-2 mb-8" />

                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="w-full btn-primary h-14"
                            >
                                Close Pass
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyTickets;
