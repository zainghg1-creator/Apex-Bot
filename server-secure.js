// Security bootstrap for Vercel/Node.
// server.js registers the security middleware after session setup and before routes.
require('dotenv').config();
const { validateEnvironment } = require('./security-middleware');

validateEnvironment();
module.exports = require('./server.js');
