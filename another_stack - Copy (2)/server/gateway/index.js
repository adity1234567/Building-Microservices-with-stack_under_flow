const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Proxy middleware
app.use('/api/auth', proxy('http://localhost:3001', {
  proxyReqPathResolver: (req) => req.url,
  proxyErrorHandler: (err, res, next) => {
    console.error('Auth Proxy Error:', err);
    res.status(502).send('Error connecting to auth server');
  },
}));

app.use('/api/posts', proxy('http://localhost:3002', {
  proxyReqPathResolver: (req) => req.url,
  proxyErrorHandler: (err, res, next) => {
    console.error('Posts Proxy Error:', err);
    res.status(502).send('Error connecting to posts server');
  },
}));

app.use('/api/notifications', proxy('http://localhost:5003', {
  proxyReqPathResolver: (req) => req.url,
  proxyErrorHandler: (err, res, next) => {
    console.error('Notifications Proxy Error:', err);
    res.status(502).send('Error connecting to notifications server');
  },
}));

// Start the gateway server
app.listen(8000, () => {
  console.log('Gateway server is running on port 8000');
});
