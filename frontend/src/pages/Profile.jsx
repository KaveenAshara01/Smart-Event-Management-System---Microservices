import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Camera, ArrowLeft, Save, Loader2, CheckCircle } from 'lucide-react';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        try {
            await updateProfile(name, profilePicture);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-inter">
            <div className="max-w-2xl mx-auto">
                <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-primary-600 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
                >
                    <div className="p-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h2>
                        <p className="text-gray-500 mb-10">Manage your personal information and profile picture</p>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Profile Picture Upload Placeholder */}
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative group">
                                    <img
                                        src={profilePicture}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-primary-100 shadow-lg"
                                    />
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="text-white w-8 h-8" />
                                    </div>
                                </div>
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="https://example.com/photo.jpg"
                                        value={profilePicture}
                                        onChange={(e) => setProfilePicture(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-400 mt-1 italic">* For this prototype, please provide a direct image URL.</p>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        className="input-field pl-11"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Read Only)</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        disabled
                                        className="input-field pl-11 bg-gray-50 cursor-not-allowed opacity-60"
                                        value={user?.email}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center text-green-600 font-medium"
                                    >
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Profile updated!
                                    </motion.div>
                                )}
                                <div className="flex-1"></div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary flex items-center space-x-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
