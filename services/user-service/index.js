require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./src/models/User');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB (User Service)'))
    .catch(err => console.error('MongoDB connection error:', err));

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'User Service API',
            version: '1.0.0',
            description: 'API for User management and Authentication',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: ['./index.js'], // Files containing annotations
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middlewares for Auth & RBAC
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
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     responses:
 *       200:
 *         description: List of users
 */
app.get('/users', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 default: attendee
 *     responses:
 *       201:
 *         description: User created
 */
app.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = new User({ name, email, password, role });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @openapi
 * /search:
 *   get:
 *     summary: Search for users by name
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for user name
 *     responses:
 *       200:
 *         description: List of matching users
 */
app.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json([]);
        }

        const users = await User.find({
            name: { $regex: q, $options: 'i' }
        }).select('_id name email profilePicture').limit(10);

        // Convert to consistent object with id field
        const formattedUsers = users.map(user => {
            const obj = user.toObject();
            obj.id = obj._id;
            return obj;
        });

        res.json(formattedUsers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { userId: user._id, role: user.role, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @openapi
 * /profile:
 *   get:
 *     summary: Get user profile
 *     responses:
 *       200:
 *         description: User profile data
 */
app.get('/profile', async (req, res) => {
    // Note: Gateway handles JWT validation, but we can double check here or trust the header
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Return consistent user object with virtual id
        const userObj = user.toObject();
        userObj.id = userObj._id;
        res.json(userObj);
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

const { uploadImage } = require('./src/utils/cloudinary');

/**
 * @openapi
 * /profile:
 *   put:
 *     summary: Update user profile
 *     responses:
 *       200:
 *         description: Profile updated
 */
app.put('/profile', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let { name, profilePicture } = req.body;

        // If profilePicture is a Base64 string, upload to Cloudinary
        if (profilePicture && profilePicture.startsWith('data:image')) {
            console.log('[User Service] Uploading profile picture to Cloudinary...');
            profilePicture = await uploadImage(profilePicture, 'sems/profiles');
        }

        const user = await User.findByIdAndUpdate(
            decoded.userId,
            { name, profilePicture },
            { new: true }
        ).select('-password');

        // Return consistent user object with virtual id
        const userObj = user.toObject();
        userObj.id = userObj._id;
        res.json(userObj);
    } catch (err) {
        console.error('[User Service] Profile update error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
    console.log(`[User Service] JWT Secret Status: ${process.env.JWT_SECRET ? 'Loaded' : 'Missing'}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});
