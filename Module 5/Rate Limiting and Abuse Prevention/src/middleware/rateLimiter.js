'use strict';

// Rate-limit authentication attempts by client IP.
const rateLimit = require('express-rate-limit');

// In a multi-instance deployment, the default in-memory store gives each Node
// process its own counter. Behind a load balancer, requests can reach different
// instances, so a client could effectively get the limit once per instance.
// A shared Redis store from "rate-limit-redis" can replace the default store
// (via the rateLimit "store" option); all instances then use the same counters.

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP per window
  skipSuccessfulRequests: true, // successful requests do not count
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = authLimiter;
