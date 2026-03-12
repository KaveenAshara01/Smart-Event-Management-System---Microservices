import { motion } from 'framer-motion';
import { Calendar, MapPin, Tag, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden group transition-all hover:shadow-2xl"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                    <span className="text-sm font-bold text-primary-600">${event.price || 'Free'}</span>
                </div>
                <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                        {event.category}
                    </span>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-primary-600 transition-colors">
                    {event.title}
                </h3>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                        {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                        <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                        <Users className="w-4 h-4 mr-2 text-primary-500" />
                        <span>{event.availableSeats} seats left</span>
                    </div>
                </div>

                <Link
                    to={`/events/${event._id}`}
                    className="w-full btn-primary flex items-center justify-center group/btn"
                >
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                </Link>
            </div>
        </motion.div>
    );
};

export default EventCard;
