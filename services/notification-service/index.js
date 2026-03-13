require('dotenv').config();
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5004;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE = 'ticket_booked';

// --- MongoDB & Notification Model ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('[Notification Service] Connected to MongoDB Atlas'))
    .catch(err => console.error('[Notification Service] MongoDB Error:', err));

const NotificationSchema = new mongoose.Schema({
    recipientId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    type: { type: String, default: 'EVENT_SHARE' },
    eventId: { type: String },
    eventTitle: { type: String },
    message: { type: String },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', NotificationSchema);

// --- Auth Middleware ---
const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// --- REST Routes ---

// Share an event (internal notification)
app.post('/share', authenticate, async (req, res) => {
    try {
        const { recipientId, eventId, eventTitle, message } = req.body;
        if (!recipientId || !eventId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const notification = new Notification({
            recipientId,
            senderId: req.user.userId,
            senderName: req.user.name,
            eventId,
            eventTitle,
            message: message || `shared an event with you: ${eventTitle}`
        });

        await notification.save();
        res.status(201).json({ message: 'Event shared successfully', notification });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get my notifications
app.get('/my-notifications', authenticate, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipientId: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark all as read
app.patch('/read-all', authenticate, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipientId: req.user.userId, read: false },
            { read: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Email Logic ---
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendEmail(to, subject, html, attachments = []) {
    try {
        const info = await transporter.sendMail({
            from: `"SEMS Notifications" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            attachments,
        });
        console.log('[Notification Service] Email sent: %s', info.messageId);
    } catch (err) {
        console.error('[Notification Service] Email error:', err.message);
    }
}

// --- RabbitMQ Consumer ---
async function start() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE, { durable: true });
        channel.prefetch(1);

        console.log('[Notification Service] Listening for RabbitMQ messages in %s', QUEUE);

        channel.consume(QUEUE, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                console.log('[Notification Service] Received TICKET_BOOKED for:', content.eventTitle);

                const qrBase64 = content.qrCode.split('base64,')[1];

                const attendeeHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden;">
                        <div style="background-color: #2563eb; padding: 40px; text-align: center; color: white;">
                            <h1 style="margin: 0;">Your Ticket is Confirmed!</h1>
                            <p style="opacity: 0.9;">See you at ${content.eventTitle}</p>
                        </div>
                        <div style="padding: 40px; background-color: white;">
                            <h2 style="color: #1e293b;">Hello ${content.userName},</h2>
                            <p style="color: #475569; line-height: 1.6;">Your booking for <strong>${content.eventTitle}</strong> was successful. Please find your entrance QR code below.</p>
                            
                            <div style="text-align: center; margin: 40px 0;">
                                <img src="cid:qrcode" alt="Ticket QR Code" style="width: 200px; height: 200px; padding: 20px; border: 2px dashed #cbd5e1; border-radius: 20px;" />
                                <p style="font-size: 12px; color: #94a3b8; margin-top: 10px;">Ticket ID: ${content.ticketId}</p>
                            </div>

                            <p style="color: #475569;">Price Paid: <strong>$${content.pricePaid}</strong></p>
                            
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                            <p style="font-size: 14px; color: #64748b;">If you have any questions, please contact our support team.</p>
                        </div>
                        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                            &copy; 2026 Smart Event Management System - Microservices
                        </div>
                    </div>
                `;

                const attendeeAttachments = [
                    {
                        filename: 'qrcode.png',
                        content: qrBase64,
                        encoding: 'base64',
                        cid: 'qrcode'
                    }
                ];

                await sendEmail(content.userEmail, `Ticket Confirmation: ${content.eventTitle}`, attendeeHtml, attendeeAttachments);

                const adminHtml = `
                    <div style="font-family: sans-serif; color: #333;">
                        <h2>Admin Alert: New Ticket Booking</h2>
                        <p><strong>Event:</strong> ${content.eventTitle}</p>
                        <p><strong>Customer:</strong> ${content.userName} (${content.userEmail})</p>
                        <p><strong>Revenue:</strong> $${content.pricePaid}</p>
                        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                    </div>
                `;

                await sendEmail(process.env.ADMIN_EMAIL, `New Booking Alert: ${content.eventTitle}`, adminHtml);

                channel.ack(msg);
            }
        });
    } catch (err) {
        console.error('[Notification Service] RabbitMQ error:', err.message);
        setTimeout(start, 5000);
    }
}

app.listen(PORT, () => {
    console.log(`[Notification Service] REST API running on port ${PORT}`);
    start();
});
