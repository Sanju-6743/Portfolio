const express = require('express');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const OWNER_EMAIL = process.env.OWNER_EMAIL || EMAIL_USER;
const isDev = process.env.NODE_ENV !== 'production';

if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('Warning: EMAIL_USER and EMAIL_PASS are required in .env for email sending.');
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }

    if (!EMAIL_USER || !EMAIL_PASS) {
        return res.status(500).json({
            success: false,
            error: 'Email settings are not configured. Rename .env.example to .env and add EMAIL_USER / EMAIL_PASS.'
        });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });

    const ownerMail = {
        from: EMAIL_USER,
        to: OWNER_EMAIL,
        subject: `New contact request from ${name}`,
        html: `
            <div style="background: #f3f4f6; padding: 30px; font-family: Arial, sans-serif; color: #0f172a;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);">
                    <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 24px; color: #ffffff; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 700;">New Contact Request</h1>
                        <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">From your portfolio contact form</p>
                    </div>
                    <div style="padding: 24px;">
                        <div style="margin-bottom: 20px; padding: 18px; background: #f8fafc; border-radius: 12px; border: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Name:</strong></p>
                            <p style="margin: 0; font-size: 16px; color: #111827;">${name}</p>
                        </div>
                        <div style="margin-bottom: 20px; padding: 18px; background: #f8fafc; border-radius: 12px; border: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Email:</strong></p>
                            <p style="margin: 0; font-size: 16px; color: #111827;">${email}</p>
                        </div>
                        <div style="margin-bottom: 20px; padding: 18px; background: #f8fafc; border-radius: 12px; border: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Message:</strong></p>
                            <p style="margin: 0; font-size: 16px; color: #111827; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
                        </div>
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">Open the portfolio dashboard to respond and follow up quickly.</p>
                    </div>
                    <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 13px; color: #6b7280;">
                        <p style="margin: 0;">M. Sanjay Reddy | Team Lead - Operations</p>
                    </div>
                </div>
            </div>
        `
    };

    const userMail = {
        from: EMAIL_USER,
        to: email,
        subject: 'We received your message — thank you!',
        html: `
            <div style="background: #f3f4f6; padding: 30px; font-family: Arial, sans-serif; color: #0f172a;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);">
                    <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 24px; color: #ffffff; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Message Received</h1>
                        <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Thanks for contacting us</p>
                    </div>
                    <div style="padding: 24px;">
                        <p style="margin: 0 0 16px; font-size: 16px; color: #111827;">Hi,</p>
                        <p style="margin: 0 0 16px; font-size: 15px; color: #4b5563; line-height: 1.7;">We have received your message and our team will review it shortly. We will respond to you as soon as possible.</p>
                        <div style="padding: 18px; background: #f8fafc; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
                            <p style="margin: 0; font-size: 15px; color: #111827;"><strong>Your message:</strong></p>
                            <p style="margin: 10px 0 0; font-size: 15px; color: #374151; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
                        </div>
                        <p style="margin: 0; font-size: 15px; color: #4b5563;">If you need immediate assistance, reply to this email and we will prioritize your request.</p>
                    </div>
                    <div style="background: #f3f4f6; padding: 18px; text-align: center; font-size: 13px; color: #6b7280;">
                        <p style="margin: 0;">Regards, <strong>M. Sanjay Reddy</strong></p>
                        <p style="margin: 4px 0 0;">Team Lead - Operations</p>
                    </div>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(ownerMail);
        await transporter.sendMail(userMail);
        return res.json({ success: true });
    } catch (error) {
        console.error('Email error:', error);
        const responseMessage = isDev ? error.message : 'Unable to send emails right now.';
        return res.status(500).json({ success: false, error: responseMessage });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
