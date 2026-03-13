require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Event = require('./src/models/Event');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 5002;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB (Event Service)'))
    .catch(err => console.error('MongoDB connection error:', err));

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Event Service API',
            version: '1.0.0',
            description: 'API for Event management (Creation, Discovery, Updates)',
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

// Auth & RBAC Middlewares
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

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: Unauthorized role' });
        }
        next();
    };
};

/**
 * @openapi
 * /events:
 *   post:
 *     summary: Create a new event
 *     responses:
 *       201:
 *         description: Event created
 */
app.post('/events', authenticate, authorize(['organizer', 'admin']), async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            organizerId: req.user.userId,
            availableSeats: req.body.capacity
        };
        const event = new Event(eventData);
        await event.save();
        res.status(201).json(event);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @openapi
 * /events:
 *   get:
 *     summary: Get all events (with optional category filter)
 *     responses:
 *       200:
 *         description: List of events
 */
app.get('/events', async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};
        const events = await Event.find(filter).sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @openapi
 * /events/{id}:
 *   get:
 *     summary: Get event details by ID
 *     responses:
 *       200:
 *         description: Event details
 */
app.get('/events/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @openapi
 * /events/{id}:
 *   put:
 *     summary: Update an event
 *     responses:
 *       200:
 *         description: Event updated
 */
app.put('/events/:id', authenticate, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // If trying to update anything OTHER than availableSeats, check ownership
        const fields = Object.keys(req.body);
        const isOnlySeats = fields.length === 1 && fields[0] === 'availableSeats';

        if (!isOnlySeats) {
            if (event.organizerId.toString() !== req.user.userId && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Unauthorized to edit this event' });
            }
        }

        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedEvent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @openapi
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     responses:
 *       200:
 *         description: Event deleted
 */
app.delete('/events/:id', authenticate, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.organizerId.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to delete this event' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Event Service running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});
