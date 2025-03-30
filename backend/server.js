require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const winston = require('winston');
const mongoSanitize = require('express-mongo-sanitize');
const crypto = require('crypto');

// Initialize Express
const app = express();

// ======================
// SECURITY CONFIGURATION
// ======================

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      level: 'info'
    }),
    new winston.transports.File({ 
      filename: 'logs/errors.log', 
      level: 'error' 
    })
  ]
});

// Enhanced CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://notebookforu.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  /\.vercel\.app$/
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowedOrigin => 
      origin.startsWith(allowedOrigin)
    )) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-ID']
}));

// Security Middleware
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.ip;
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests, please try again later',
      retryAfter: '15 minutes'
    });
  }
});
app.use('/api', limiter);

// ======================
// DATABASE CONFIGURATION
// ======================

// Database Connection with Retry
const connectDB = async () => {
  const maxRetries = 3;
  let retryCount = 0;

  const connectWithRetry = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000
      });
      logger.info('MongoDB connected successfully');
    } catch (err) {
      retryCount++;
      if (retryCount < maxRetries) {
        logger.warn(`MongoDB connection failed (attempt ${retryCount}), retrying in 5 seconds...`);
        setTimeout(connectWithRetry, 5000);
      } else {
        logger.error('MongoDB connection error:', err);
        process.exit(1);
      }
    }
  };

  await connectWithRetry();
};

connectDB();

// ======================
// EMAIL CONFIGURATION
// ======================

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  pool: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  },
  connectionTimeout: 10000,
  socketTimeout: 20000
});

// Verify email connection
transporter.verify((error) => {
  if (error) {
    logger.error('Email transporter error:', error);
  } else {
    logger.info('Email transporter ready');
  }
});

// ======================
// MONGOOSE MODELS
// ======================

const contactSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true, 
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    index: true,
    validate: {
      validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: props => `${props.value} is not a valid email!`
    }
  },
  message: { 
    type: String, 
    required: [true, 'Message is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: { expires: '365d' }
  }
});

const Contact = mongoose.model('Contact', contactSchema);

const subscriberSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    index: true,
    validate: {
      validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: props => `${props.value} is not a valid email!`
    }
  },
  subscribedAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  unsubscribed: {
    type: Boolean,
    default: false
  },
  unsubscribedAt: Date,
  unsubscribeToken: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(32).toString('hex')
  }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// ======================
// HELPER FUNCTIONS
// ======================

async function sendThankYouEmail(email, isResubscribe) {
  const subscriber = await Subscriber.findOne({ email });
  const unsubscribeLink = `${process.env.FRONTEND_URL}/unsubscribe?token=${subscriber.unsubscribeToken}`;

  const mailOptions = {
    from: `"NotebookForU" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to NotebookForU!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Welcome to NotebookForU!</h2>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Thank you for subscribing to our newsletter.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          You'll be the first to know about:
        </p>

        <ul style="font-size: 16px; line-height: 1.6; padding-left: 20px;">
          <li>New notebook designs</li>
          <li>Exclusive offers</li>
          <li>Special promotions</li>
        </ul>

        <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 20px;">
          <a href="${unsubscribeLink}" style="color: #4f46e5;">Unsubscribe</a> anytime by clicking this link.
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} NotebookForU. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `Welcome to NotebookForU!\n\nThank you for subscribing to our newsletter.\n\nYou'll be the first to know about:\n- New notebook designs\n- Exclusive offers\n- Special promotions\n\nUnsubscribe: ${unsubscribeLink}\n\n© ${new Date().getFullYear()} NotebookForU. All rights reserved.`
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${email}`);
  } catch (emailError) {
    logger.error('Failed to send welcome email:', emailError);
    throw new Error('Failed to send confirmation email');
  }
}

// ======================
// API ROUTES
// ======================

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Contact Form
app.post('/api/contact', 
  [
    body('name').trim().notEmpty().withMessage('Name is required').escape(),
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('message').trim().notEmpty().withMessage('Message is required').escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    try {
      const { name, email, message } = req.body;
      const newContact = await Contact.create({ name, email, message });

      transporter.sendMail({
        from: `"NotebookForU" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `New Contact: ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2 style="color: #4f46e5;">New Contact Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Message:</strong></p>
            <div style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p style="margin-top: 1rem;"><small>Received at: ${newContact.createdAt.toLocaleString()}</small></p>
          </div>
        `
      }).catch(emailError => {
        logger.error('Email sending failed:', emailError);
      });

      res.status(201).json({ 
        success: true,
        message: 'Thank you for contacting us!'
      });

    } catch (err) {
      logger.error('Contact submission error:', err);
      res.status(500).json({ 
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { 
          details: err.message,
          stack: err.stack 
        })
      });
    }
  }
);

// Newsletter Subscription
app.post('/api/subscribe', 
  [
    body('email').isEmail().withMessage('Invalid email').normalizeEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    try {
      const { email } = req.body;

      // Check if already subscribed
      const existingSubscriber = await Subscriber.findOne({ email });
      if (existingSubscriber) {
        if (existingSubscriber.unsubscribed) {
          // Resubscribe if previously unsubscribed
          existingSubscriber.unsubscribed = false;
          existingSubscriber.unsubscribedAt = undefined;
          await existingSubscriber.save();
          
          await sendThankYouEmail(email, true);
          
          return res.status(200).json({ 
            success: true,
            message: 'Welcome back! You have been resubscribed.'
          });
        }
        return res.status(200).json({ 
          success: true,
          message: 'You are already subscribed!'
        });
      }

      // Create new subscriber
      await Subscriber.create({ email });

      // Send welcome email
      await sendThankYouEmail(email, false);

      res.status(201).json({ 
        success: true,
        message: 'Thank you for subscribing! Please check your email.'
      });

    } catch (err) {
      if (err.code === 11000) {
        return res.status(200).json({ 
          success: true,
          message: 'You are already subscribed!'
        });
      }
      
      logger.error('Subscription error:', err);
      res.status(500).json({ 
        error: 'Subscription failed',
        ...(process.env.NODE_ENV === 'development' && { 
          details: err.message
        })
      });
    }
  }
);

// Unsubscribe (Token-based)
app.post('/api/unsubscribe', 
  [
    body('token').optional().isString().trim(),
    body('email').optional().isEmail().normalizeEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    try {
      const { token, email } = req.body;
      let query;

      if (token) {
        query = { unsubscribeToken: token };
      } else if (email) {
        query = { email };
      } else {
        return res.status(400).json({
          error: 'Either token or email is required'
        });
      }

      const result = await Subscriber.findOneAndUpdate(
        { ...query, unsubscribed: false },
        { 
          $set: { 
            unsubscribed: true,
            unsubscribedAt: new Date()
          } 
        },
        { new: true }
      );

      if (!result) {
        return res.status(404).json({ 
          error: 'No active subscription found'
        });
      }

      // Send confirmation email
      await transporter.sendMail({
        from: `"NotebookForU" <${process.env.EMAIL_USER}>`,
        to: result.email,
        subject: 'You have been unsubscribed',
        html: `
          <p>You have successfully unsubscribed from NotebookForU emails.</p>
          <p><a href="${process.env.FRONTEND_URL}/resubscribe">Click here</a> to resubscribe.</p>
        `,
        text: `You have been unsubscribed. Visit ${process.env.FRONTEND_URL}/resubscribe to resubscribe.`
      });

      res.status(200).json({ 
        success: true,
        message: 'Unsubscribed successfully'
      });

    } catch (err) {
      logger.error('Unsubscribe error:', err);
      res.status(500).json({ 
        error: 'Unsubscribe failed',
        ...(process.env.NODE_ENV === 'development' && { 
          details: err.message
        })
      });
    }
  }
);

// ======================
// ERROR HANDLING
// ======================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details
    }),
    requestId: req.id
  });
});

// ======================
// SERVER INITIALIZATION
// ======================

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});

// Graceful Shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    mongoose.connection.close(false).then(() => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  shutdown('uncaughtException');
});