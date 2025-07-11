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
const bcrypt = require('bcrypt');

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
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'https://notebookforu-production-4e70.up.railway.app',
  'https://backend.notebookforu.in',
  /\.vercel\.app$/
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowedOrigin => 
      typeof allowedOrigin === 'string' 
        ? origin.startsWith(allowedOrigin)
        : allowedOrigin.test(origin)
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
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  keyGenerator: (req) => {
    return req.headers['x-real-ip'] || 
           req.headers['x-forwarded-for']?.split(',')[0] || 
           req.ip;
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
      const delay = Math.min(5000 * Math.pow(2, retryCount), 30000);
      if (retryCount < maxRetries) {
        logger.warn(`MongoDB connection failed (attempt ${retryCount}), retrying in ${delay/1000} seconds...`);
        setTimeout(connectWithRetry, delay);
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
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  },
  connectionTimeout: 10000,
  socketTimeout: 20000,
   name: 'notebookforu.in',
  sender: process.env.EMAIL_FROM

});


// Verify email connection
transporter.verify((error) => {
  if (error) {
    logger.error('Email transporter error:', error);
    if (process.env.NODE_ENV === 'production') process.exit(1);
  } else {
    logger.info('Email transporter ready');
  }
});

// ======================
// MONGOOSE MODELS
// ======================

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: {
      validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: props => `${props.value} is not a valid email!`
    },
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
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

const subscriberSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    validate: {
      validator: v => /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(v),
      message: props => `${props.value} is not a valid email!`
    },
    lowercase: true,
    trim: true
  },
  subscribedAt: { 
    type: Date, 
    default: Date.now,
    immutable: true
  },
  unsubscribed: {
    type: Boolean,
    default: false
  },
  unsubscribedAt: Date,
  unsubscribeToken: {
    type: String,
    unique: true,
    sparse: true,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  unsubscribeTokenExpires: {
    type: Date,
    index: { expires: '30d' }
  },
  resubscribeToken: {
    type: String,
    unique: true,
    sparse: true,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  resubscribeExpires: {
    type: Date,
    index: { expires: '30d' }
  },
  lastActionAt: {
    type: Date,
    default: Date.now
  },
 lastResubscribeEmailSent: {
  type: Date,
  default: null
},
  source: {
    type: String,
    enum: ['website', 'landing-page', 'api', 'manual'],
    default: 'website'
  }
}, {
  timestamps: true
});

// Optimized indexes
subscriberSchema.index({ unsubscribed: 1, email: 1 }); // For querying active subscribers



const User = mongoose.model('User', userSchema);
const Contact = mongoose.model('Contact', contactSchema);
const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// ======================
// HELPER FUNCTIONS
// ======================

async function sendThankYouEmail(email, isResubscribe) {
  const subscriber = await Subscriber.findOne({ email });
  const unsubscribeLink = `${process.env.FRONTEND_URL}/unsubscribe?token=${subscriber.unsubscribeToken}`;

 const mailOptions = {
  from: `"NotebookForU" <${process.env.EMAIL_FROM}>`,
  to: email,
  subject: 'Welcome to NotebookForU!',
  replyTo: 'support@notebookforu.in', // optional but recommended
  envelope: {
    from: `"NotebookForU" <${process.env.EMAIL_FROM}>`,
    to: email
  },
   headers: {
    'List-Unsubscribe': `<${unsubscribeLink}>`
  },
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #4f46e5; text-align: center;">Welcome to NotebookForU!</h2>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Thank you for ${isResubscribe ? 're' : ''}subscribing to our newsletter.
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
  text: `Welcome to NotebookForU!

Thank you for ${isResubscribe ? 're' : ''}subscribing to our newsletter.

You'll be the first to know about:
- New notebook designs
- Exclusive offers
- Special promotions

Unsubscribe: ${unsubscribeLink}

© ${new Date().getFullYear()} NotebookForU. All rights reserved.`
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

// User Signup
app.post('/api/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required').escape(),
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
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
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          error: 'Email already exists'
        });
      }

      // Create new user
      const newUser = new User({ name, email, password });
      await newUser.save();

      // In a real application, you would typically generate a JWT token here
      // and send it back for client-side authentication.
      // For this example, we just send a success message.

      res.status(201).json({
        success: true,
        message: 'User registered successfully'
      });

    } catch (err) {
      logger.error('Signup error:', err);
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

  // Check if ADMIN_EMAIL is set, otherwise use a default
      const adminEmail = process.env.ADMIN_EMAIL || 'contact@notebookforu.in';

   await transporter.sendMail({
  from: `"NotebookForU" <${process.env.EMAIL_FROM}>`,
  to: process.env.ADMIN_EMAIL,
  replyTo: email, // Let admin reply directly to sender
  envelope: {
    from: `"NotebookForU" <${process.env.EMAIL_FROM}>`,
    to: process.env.ADMIN_EMAIL
  },
  subject: `📩 New Contact Submission: ${name}`,
  headers: {
    'X-Priority': '3',
    'X-Mailer': 'NotebookForU-Mailer',
    'List-ID': 'Contact Form <contact.notebookforu.in>'
  },
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <h2 style="color: #4f46e5; text-align: center;">📨 New Contact Form Submission</h2>
      
      <p style="font-size: 16px;"><strong>Name:</strong> ${name}</p>
      <p style="font-size: 16px;"><strong>Email:</strong> 
        <a href="mailto:${email}" style="color: #4f46e5;">${email}</a>
      </p>
      
      <p style="font-size: 16px;"><strong>Message:</strong></p>
      <div style="background-color: #f3f4f6; padding: 1rem; border-radius: 8px; font-size: 15px;">
        ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}
      </div>

      <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
        <strong>Submitted on:</strong> ${newContact.createdAt.toLocaleString()}
      </p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">
        This message was sent from the NotebookForU website contact form.
      </p>
    </div>
  `,
  text: `
New Contact Form Submission

Name: ${name}
Email: ${email}

Message:
${message}

Submitted on: ${newContact.createdAt.toLocaleString()}

—
NotebookForU
https://notebookforu.in
  `
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

// ======================
// NEWSLETTER SUBSCRIPTION
// ======================

/**
 * @api {post} /api/subscribe Subscribe to newsletter
 * @apiDescription Handles new subscriptions and resubscriptions
 */
app.post('/api/subscribe', 
  [
    body('email')
      .isEmail().withMessage('Please provide a valid email address')
      .normalizeEmail()
  ],
  async (req, res) => {
    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    try {
      const { email } = req.body;
      const now = new Date();

      // Check for existing subscriber
      const existingSubscriber = await Subscriber.findOne({ email });
      
      if (existingSubscriber) {
        // Case 1: Already actively subscribed
        if (!existingSubscriber.unsubscribed) {
          return res.status(200).json({ 
            success: true,
            message: 'You are already subscribed to our newsletter!'
          });
        }
        
        // Case 2: Resubscribe flow with rate limiting
        const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
        
        // Check if resubscribe email was sent recently
        if (existingSubscriber.lastResubscribeEmailSent > twoMinutesAgo) {
          return res.status(429).json({
            success: false,
            error: 'Please wait 2 minutes before requesting another resubscribe email.'
          });
        }

        // Generate new token and update timestamps
        const resubscribeToken = crypto.randomBytes(16).toString('hex');
        
        await Subscriber.findByIdAndUpdate(existingSubscriber._id, {
          resubscribeToken,
          resubscribeExpires: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 2 days
          lastResubscribeEmailSent: now,
          lastActionAt: now
        });

        // Send confirmation email
        const confirmLink = `${process.env.FRONTEND_URL}/resubscribe-confirm?token=${resubscribeToken}`;
        await transporter.sendMail({
          from: `"NotebookForU" <${process.env.EMAIL_FROM}>`,
          to: email,
          subject: 'Confirm your resubscription',
          html: buildResubscribeEmailTemplate(confirmLink)
        });

        return res.status(202).json({
          success: true,
          message: 'Welcome back! Please check your email to confirm resubscription.',
          isResubscribe: true
        });
      }

      // Case 3: New subscription
      const newSubscriber = await Subscriber.create({
        email,
        unsubscribeToken: crypto.randomBytes(16).toString('hex'),
        source: 'website'
      });

      // Send welcome email
      await sendThankYouEmail(email, false);

      return res.status(201).json({
        success: true,
        message: 'Thank you for subscribing! Please check your email for confirmation.'
      });

    } catch (err) {
      logger.error('Subscription error:', err);
      
      // Handle duplicate key error
      if (err.code === 11000) {
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed!'
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Subscription failed',
        ...(process.env.NODE_ENV === 'development' && { 
          details: err.message
        })
      });
    }
  }
);

/**
 * @api {post} /api/unsubscribe Unsubscribe from newsletter
 * @apiDescription Handles unsubscriptions via token or email
 */
app.post('/api/unsubscribe', 
  [
    body('token').optional().isString().trim().escape(),
    body('email').optional().isEmail().normalizeEmail()
  ],
  async (req, res) => {
    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    try {
      const { token, email } = req.body;
      
      // Build query based on provided identifier
      const query = token 
        ? { unsubscribeToken: token } 
        : { email: email.toLowerCase().trim(), unsubscribed: false };

      // Find active subscriber
      const subscriber = await Subscriber.findOne(query);
      
      if (!subscriber) {
        return res.status(404).json({
          success: false,
          error: 'Subscription not found',
          message: token 
            ? 'Invalid or expired unsubscribe link' 
            : 'Email not found or already unsubscribed'
        });
      }

      // Generate new tokens for security
      const newUnsubscribeToken = crypto.randomBytes(16).toString('hex');
      const resubscribeToken = crypto.randomBytes(16).toString('hex');

      // Update subscriber status
      const updatedSubscriber = await Subscriber.findByIdAndUpdate(
        subscriber._id,
        {
          unsubscribed: true,
          unsubscribedAt: new Date(),
          unsubscribeToken: newUnsubscribeToken,
          resubscribeToken,
          resubscribeExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          lastActionAt: new Date()
        },
        { new: true }
      );

      // Send unsubscribe confirmation (fire and forget)
      sendUnsubscribeConfirmation(
        updatedSubscriber.email,
        `${process.env.FRONTEND_URL}/resubscribe-confirm?token=${resubscribeToken}`
      ).catch(err => logger.error('Unsubscribe email failed:', err));

      return res.status(200).json({
        success: true,
        message: 'Unsubscribed successfully',
        email: updatedSubscriber.email,
        resubscribeLink: `${process.env.FRONTEND_URL}/resubscribe-confirm?token=${resubscribeToken}`
      });

    } catch (err) {
      logger.error('Unsubscribe error:', err);
      return res.status(500).json({
        success: false,
        error: 'Unsubscribe failed',
        ...(process.env.NODE_ENV === 'development' && { 
          details: err.message
        })
      });
    }
  }
);

/**
 * @api {post} /api/resubscribe-confirm Confirm resubscription
 * @apiDescription Finalizes the resubscription process
 */
app.post('/api/resubscribe-confirm', 
  [
    body('token').notEmpty().withMessage('Token is required').trim().escape()
  ],
  async (req, res) => {
    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid request', 
        details: errors.array() 
      });
    }

    try {
      const { token } = req.body;

      // Find subscriber with valid resubscribe token
      const subscriber = await Subscriber.findOne({
        resubscribeToken: token,
        resubscribeExpires: { $gt: new Date() },
        unsubscribed: true
      });

      if (!subscriber) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired token',
          message: 'This resubscription link is no longer valid.'
        });
      }

      // Update subscriber status
      subscriber.unsubscribed = false;
      subscriber.unsubscribedAt = undefined;
      subscriber.resubscribeToken = undefined;
      subscriber.resubscribeExpires = undefined;
      subscriber.lastActionAt = new Date();
      await subscriber.save();

      // Send welcome back email
      await sendThankYouEmail(subscriber.email, true);

      return res.status(200).json({
        success: true,
        message: 'Resubscription confirmed! Welcome back to our newsletter.',
        email: subscriber.email
      });

    } catch (err) {
      logger.error('Resubscribe confirmation error:', err);
      return res.status(500).json({
        success: false,
        error: 'Resubscription failed',
        ...(process.env.NODE_ENV === 'development' && { 
          details: err.message
        })
      });
    }
  }
);

function buildResubscribeEmailTemplate(confirmLink) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Welcome Back to NotebookForU!</h2>
      <p>We received a request to resubscribe you to our newsletter.</p>
      <p style="margin: 25px 0;">
        <a href="${confirmLink}" 
           style="background: #4f46e5; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Confirm Resubscription
        </a>
      </p>
      <p><small>This link expires in 48 hours.</small></p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;
}
// Email sending helper function
async function sendUnsubscribeConfirmation(email, resubscribeLink) {
  const mailOptions = {
    from: `"NotebookForU" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'You have been unsubscribed',
    replyTo: 'support@notebookforu.in',
    envelope: {
      from: `"NotebookForU" <${process.env.EMAIL_FROM}>`,
      to: email
    },
    headers: {
      'List-Unsubscribe': `<${resubscribeLink}>`
    },
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">You're Unsubscribed</h2>
        <p style="font-size: 16px;">We've removed <strong>${email}</strong> from our mailing list.</p>
        <p style="margin: 20px 0;">
          Want to come back? Click below to resubscribe:
        </p>
        <p>
          <a href="${resubscribeLink}" 
             style="background: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
            Resubscribe
          </a>
        </p>
        <p style="color: #6b7280; font-size: 0.9em; margin-top: 20px;">
          This link will expire in 30 days.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          Sent by NotebookForU, Gorakhpur, Uttar Pradesh, India.<br>
          © ${new Date().getFullYear()} NotebookForU. All rights reserved.
        </p>
      </div>
    `,
    text: `You've been unsubscribed (${email}).

Want to come back? Resubscribe using the link below:
${resubscribeLink}

This link will expire in 30 days.

Sent by NotebookForU, Gorakhpur, Uttar Pradesh, India.
© ${new Date().getFullYear()} NotebookForU. All rights reserved.`
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Unsubscribe confirmation sent to ${email}`);
  } catch (error) {
    logger.error('Error sending unsubscribe confirmation:', error);
    throw new Error('Email sending failed');
  }
}


// ======================
// ENHANCED ERROR HANDLING
// ======================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Determine error type and message
  let errorType = 'server_error';
  let errorMessage = 'Internal server error';
  
  if (err.code === 11000) {
    errorType = 'duplicate_key';
    errorMessage = 'Please try again - temporary system issue';
  } else if (err.name === 'ValidationError') {
    errorType = 'validation_error';
    errorMessage = err.message;
  } else if (!isProduction) {
    errorMessage = err.message;
  }

  // Log error details
  logger.error({
    message: err.message,
    type: errorType,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Prepare response
  const response = {
    error: errorMessage,
    status: statusCode,
    timestamp: new Date().toISOString()
  };

  // Add debug info in non-production
  if (!isProduction) {
    response.debug = {
      type: errorType,
      ...(err.stack && { stack: err.stack.split('\n') })
    };
  }

  // Include request ID if available
  if (req.id) {
    response.requestId = req.id;
  }

  res.status(statusCode).json(response);
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
