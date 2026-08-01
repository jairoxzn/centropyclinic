require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const routes = require('./src/routes');
const errorHandler = require('./src/middlewares/errorHandler');
const config = require('./src/config');

const app = express();

// ─── Security ─────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Demasiadas solicitudes, intenta más tarde' },
});
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use('/api', limiter);

// ─── Parsers ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ──────────────────────────────────────────
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// ─── Static Files ─────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));

// ─── Routes ───────────────────────────────────────────
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'PsyClinic Pro API is running', timestamp: new Date() });
});

// ─── Error Handler ────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`\n🧠 PsyClinic Pro API running on port ${PORT}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Frontend URL: ${config.frontendUrl}\n`);
});

module.exports = app;
