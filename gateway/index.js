require('dotenv').config();
const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 4000;

// 1. Basic Middlewares
app.use(cors());
app.use(express.json());

// 2. Rate Limiting (DDoS Protection)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// 3. Authentication Middleware
const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Failed to authenticate token' });
    }
};

// 4. Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'Gateway is running', timestamp: new Date() });
});

// 5. Proxy Routes (Inter-service communication entry points)

// Public Routes (No Auth needed)
app.use('/api/users/auth', proxy(process.env.USER_SERVICE_URL + '/auth'));
app.use('/api/events/public', proxy(process.env.EVENT_SERVICE_URL + '/public'));

// Protected Routes (Require JWT)
app.use('/api/users/profile', authenticate, proxy(process.env.USER_SERVICE_URL + '/profile'));
app.use('/api/events/manage', authenticate, proxy(process.env.EVENT_SERVICE_URL + '/manage'));
app.use('/api/tickets', authenticate, proxy(process.env.TICKET_SERVICE_URL));

// Error handling for proxy
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong at the Gateway' });
});

app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
    console.log(`Routing requests to:`);
    console.log(`- User Service: ${process.env.USER_SERVICE_URL}`);
    console.log(`- Event Service: ${process.env.EVENT_SERVICE_URL}`);
    console.log(`- Ticket Service: ${process.env.TICKET_SERVICE_URL}`);
});
