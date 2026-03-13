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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
        return res.status(403).json({ message: 'Failed to authenticate token (Gateway)' });
    }
};

// 4. Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'Gateway is running', timestamp: new Date() });
});

// 5. Proxy Routes (Inter-service communication entry points)

// User Service Auth
app.use('/api/users/auth', proxy(process.env.USER_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
        const path = '/auth' + req.url;
        console.log(`[Gateway] [Public] Proxying to User Service: ${path}`);
        return path;
    }
}));

// Event Service (Public)
app.use('/api/events', proxy(process.env.EVENT_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
        const path = '/events' + req.url;
        console.log(`[Gateway] [Public] Proxying to Event Service: ${path}`);
        return path;
    }
}));

// User Service Profile (Protected)
app.use('/api/users/profile', authenticate, proxy(process.env.USER_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
        const path = '/profile' + req.url;
        console.log(`[Gateway] [Protected] Proxying to User Profile: ${path}`);
        return path;
    }
}));

// User Service Search (Protected)
app.use('/api/users/search', authenticate, proxy(process.env.USER_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
        const path = '/search' + req.url;
        console.log(`[Gateway] [Protected] Proxying to User Search: ${path}`);
        return path;
    }
}));

// Notification Service (Protected)
app.use('/api/notifications', authenticate, proxy(process.env.NOTIFICATION_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
        console.log(`[Gateway] [Protected] Proxying to Notification Service: ${req.url}`);
        return req.url;
    }
}));

// Ticket Service (Protected)
app.use('/api/tickets', authenticate, proxy(process.env.TICKET_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
        console.log(`[Gateway] [Protected] Proxying to Ticket Service: ${req.url}`);
        return req.url;
    }
}));

// Error handling for proxy
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong at the Gateway' });
});

app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
    console.log(`[Gateway] JWT Secret Status: ${process.env.JWT_SECRET ? 'Loaded' : 'Missing'}`);
    console.log(`Routing requests to:`);
    console.log(`- User Service: ${process.env.USER_SERVICE_URL}`);
    console.log(`- Event Service: ${process.env.EVENT_SERVICE_URL}`);
    console.log(`- Ticket Service: ${process.env.TICKET_SERVICE_URL}`);
});
