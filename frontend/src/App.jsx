import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import MyTickets from './pages/MyTickets';
import Notifications from './pages/Notifications';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';

function App() {
    const { user, loading } = useAuth();

    if (loading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {user && <Navbar />}
            <div className={user ? "pt-0" : ""}>
                <Routes>
                    <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
                    <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                    <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                    <Route path="/events" element={user ? <Events /> : <Navigate to="/login" />} />
                    <Route path="/events/create" element={user ? <CreateEvent /> : <Navigate to="/login" />} />
                    <Route path="/events/:id" element={user ? <EventDetails /> : <Navigate to="/login" />} />
                    <Route path="/my-tickets" element={user ? <MyTickets /> : <Navigate to="/login" />} />
                    <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />

                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
