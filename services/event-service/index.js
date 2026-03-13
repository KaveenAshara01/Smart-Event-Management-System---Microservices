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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
        return res.status(403).json({ message: 'Invalid token (Event Service)' });
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

const { uploadImage } = require('./src/utils/cloudinary');

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
        let { imageUrl } = req.body;

        // If imageUrl is a Base64 string, upload to Cloudinary
        if (imageUrl && imageUrl.startsWith('data:image')) {
            console.log('[Event Service] Uploading event banner to Cloudinary...');
            imageUrl = await uploadImage(imageUrl, 'sems/events');
        }

        const eventData = {
            ...req.body,
            imageUrl,
            organizerId: req.user.userId,
            availableSeats: req.body.capacity
        };
        const event = new Event(eventData);
        await event.save();
        res.status(201).json(event);
    } catch (err) {
        console.error('[Event Service] Create error:', err);
        res.status(400).json({ error: err.message });
    }
});

// ... GET routes stay same ...

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

        let updateData = { ...req.body };
        // If imageUrl is a Base64 string, upload to Cloudinary
        if (updateData.imageUrl && updateData.imageUrl.startsWith('data:image')) {
            console.log('[Event Service] Updating event banner on Cloudinary...');
            updateData.imageUrl = await uploadImage(updateData.imageUrl, 'sems/events');
        }

        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedEvent);
    } catch (err) {
        console.error('[Event Service] Update error:', err);
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
    console.log(`[Event Service] JWT Secret Status: ${process.env.JWT_SECRET ? 'Loaded' : 'Missing'}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});
