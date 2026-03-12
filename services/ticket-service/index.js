require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const QRCode = require('qrcode');
const Ticket = require('./src/models/Ticket');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 5003;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB (Ticket Service)'))
    .catch(err => console.error('MongoDB connection error:', err));

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ticket Service API',
            version: '1.0.0',
            description: 'API for Ticket booking and management (QR Code generation)',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: ['./index.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Auth Middleware
const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

/**
 * @openapi
 * /book:
 *   post:
 *     summary: Book a ticket for an event
 *     responses:
 *       201:
 *         description: Ticket booked successfully
 */
app.post('/book', authenticate, async (req, res) => {
    const { eventId } = req.body;
    const { userId, name, email } = req.user; // Extracted from JWT

    try {
        // 1. Validate Event & Check Availability (REST call to Event Service)
        const eventResponse = await axios.get(`${process.env.EVENT_SERVICE_URL}/events/${eventId}`);
        const event = eventResponse.data;

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'Event is sold out' });
        }

        // 2. Lock Seat (Decrement availableSeats in Event Service)
        await axios.put(`${process.env.EVENT_SERVICE_URL}/events/${eventId}`, {
            availableSeats: event.availableSeats - 1
        }, {
            headers: { Authorization: req.headers['authorization'] }
        });

        // 3. Generate QR Code
        const qrContent = JSON.stringify({
            ticketId: new mongoose.Types.ObjectId(),
            userId,
            eventId,
            eventTitle: event.title,
            timestamp: new Date().toISOString()
        });
        const qrCodeBase64 = await QRCode.toDataURL(qrContent);

        // 4. Save Ticket
        const ticket = new Ticket({
            userId,
            eventId,
            eventTitle: event.title,
            userName: name,
            userEmail: email,
            qrCode: qrCodeBase64,
            pricePaid: event.price || 0
        });

        await ticket.save();

        // 5. Success
        res.status(201).json({
            message: 'Ticket booked successfully',
            ticket
        });

        // TODO: Publish TICKET_BOOKED event to RabbitMQ for Notification Service

    } catch (err) {
        console.error('Booking error:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            message: 'Booking failed',
            error: err.response?.data?.message || err.message
        });
    }
});

/**
 * @openapi
 * /my-tickets:
 *   get:
 *     summary: Get all tickets for the authenticated user
 *     responses:
 *       200:
 *         description: List of user tickets
 */
app.get('/my-tickets', authenticate, async (req, res) => {
    try {
        const tickets = await Ticket.find({ userId: req.user.userId }).sort({ bookingDate: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @openapi
 * /tickets/{id}:
 *   get:
 *     summary: Get ticket details by ID
 *     responses:
 *       200:
 *         description: Ticket details
 */
app.get('/tickets/:id', authenticate, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // Ensure user can only see their own ticket (unless admin)
        if (ticket.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Ticket Service running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});
