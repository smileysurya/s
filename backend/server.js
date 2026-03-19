const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const FALLBACK_DATA_DIR = path.join(__dirname, 'data');

const rendersDir = path.join(__dirname, 'public', 'renders');
if (!fs.existsSync(rendersDir)) fs.mkdirSync(rendersDir, { recursive: true });

let isMongoConnected = false;
let dataMode = 'startup';
let mongoStatus = {
  configured: false,
  connected: false,
  source: 'none',
  reason: 'Server startup in progress.',
  fallbackDir: FALLBACK_DATA_DIR,
};

function maskMongoUri(uri) {
  if (!uri) return null;
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
}

function buildMongoConfig() {
  const directUri = process.env.MONGODB_URI?.trim();
  const username = process.env.MONGODB_USERNAME?.trim();
  const password = process.env.MONGODB_PASSWORD?.trim();
  const cluster = process.env.MONGODB_CLUSTER?.trim();
  const dbName = process.env.MONGODB_DB_NAME?.trim() || 'unimart';

  if (process.env.FORCE_LOCAL_FALLBACK === 'true') {
    return {
      configured: false,
      reason: 'FORCE_LOCAL_FALLBACK=true',
      source: 'forced-fallback',
      uri: null,
    };
  }

  if (directUri) {
    if (directUri.includes('<db_password>') || directUri.includes('<password>')) {
      return {
        configured: false,
        reason: 'MONGODB_URI still contains a placeholder password. Replace it with a real Atlas password.',
        source: 'env:MONGODB_URI',
        uri: null,
      };
    }

    return {
      configured: true,
      reason: 'Using MONGODB_URI from environment.',
      source: 'env:MONGODB_URI',
      uri: directUri,
    };
  }

  const missingParts = [];
  if (!username) missingParts.push('MONGODB_USERNAME');
  if (!password) missingParts.push('MONGODB_PASSWORD');
  if (!cluster) missingParts.push('MONGODB_CLUSTER');

  if (username && password && cluster) {
    const encodedUser = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password);
    const uri = `mongodb+srv://${encodedUser}:${encodedPassword}@${cluster}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

    return {
      configured: true,
      reason: 'Built Atlas URI from MONGODB_USERNAME, MONGODB_PASSWORD, and MONGODB_CLUSTER.',
      source: 'env:parts',
      uri,
    };
  }

  return {
    configured: false,
    reason: `Missing ${missingParts.join(', ')}. Set MONGODB_URI or complete the MONGODB_USERNAME/MONGODB_PASSWORD/MONGODB_CLUSTER trio.`,
    source: 'none',
    uri: null,
  };
}

app.use(cors());
app.use(express.json());
app.use('/renders', express.static(path.join(__dirname, 'public', 'renders')));

app.use((req, res, next) => {
  req.isMongoConnected = isMongoConnected;
  req.dataMode = dataMode;
  req.mongoStatus = mongoStatus;
  res.setHeader('X-Data-Mode', dataMode);
  next();
});

const connectDB = async () => {
  const mongoConfig = buildMongoConfig();
  mongoStatus = {
    ...mongoStatus,
    configured: mongoConfig.configured,
    connected: false,
    source: mongoConfig.source,
    reason: mongoConfig.reason,
    uriPreview: maskMongoUri(mongoConfig.uri),
  };

  if (!mongoConfig.configured || !mongoConfig.uri) {
    isMongoConnected = false;
    dataMode = 'local-fallback';
    if (mongoConfig.source === 'forced-fallback') {
      console.log('Local test mode enabled. Using fallback JSON data instead of MongoDB.');
    } else {
      console.log(`MongoDB unavailable. Running in local fallback mode. Reason: ${mongoConfig.reason}`);
    }
    return;
  }

  try {
    await mongoose.connect(mongoConfig.uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    dataMode = 'database';
    mongoStatus = {
      ...mongoStatus,
      configured: true,
      connected: true,
      reason: 'Connected successfully.',
    };
    console.log(`Connected to MongoDB gracefully via ${mongoConfig.source}.`);
  } catch (err) {
    isMongoConnected = false;
    dataMode = 'local-fallback';
    mongoStatus = {
      ...mongoStatus,
      configured: true,
      connected: false,
      reason: err.message,
    };
    console.error('Failed to connect to MongoDB:', err.message);
    console.log('Server running without database access. Routes will use local fallback data where supported.');
  }
};

connectDB();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/b2b', require('./routes/b2b'));
app.use('/api/civil', require('./routes/civil'));
app.use('/api/generic', require('./routes/generic'));

app.get('/', (req, res) => {
  res.send('Backend API is running...');
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: dataMode,
    mongo: isMongoConnected,
    mongoStatus,
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
