require('dotenv').config();
const amqp = require('amqplib');
const nodemailer = require('nodemailer');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE = 'ticket_booked';

// SMTP Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendEmail(to, subject, html) {
    try {
        const info = await transporter.sendMail({
            from: `"SEMS Notifications" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log(' [x] Email sent: %s', info.messageId);
    } catch (err) {
        console.error(' [!] Error sending email:', err.message);
    }
}

async function start() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE, { durable: true });
        channel.prefetch(1);

        console.log(' [*] Notification Service waiting for messages in %s. To exit press CTRL+C', QUEUE);

        channel.consume(QUEUE, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                console.log(' [x] Received TICKET_BOOKED for:', content.eventTitle);

                // 1. Send Email to Attendee
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
                                <img src="${content.qrCode}" alt="Ticket QR Code" style="width: 200px; height: 200px; padding: 20px; border: 2px dashed #cbd5e1; border-radius: 20px;" />
                                <p style="font-size: 12px; color: #94a3b8; margin-top: 10px;">Ticket ID: ${content.ticketId}</p>
                            </div>

                            <p style="color: #475569;">Price Paid: <strong>$${content.pricePaid}</strong></p>
                            
                            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
                            <p style="font-size: 14px; color: #64748b;">If you have any questions, please contact our support team.</p>
                        </div>
                        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                            &copy; 2026 Smart Event Management System - Microservices
                        </div>
                    </div>
                `;

                await sendEmail(content.userEmail, `Ticket Confirmation: ${content.eventTitle}`, attendeeHtml);

                // 2. Send Alert Email to Admin
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
        console.error(' [!] Notification Service error:', err.message);
        setTimeout(start, 5000); // Retry connection
    }
}

start();
