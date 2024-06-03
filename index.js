const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { slowDown } = require("express-slow-down");

const port = 3000;

// initialize an Express server
const app = express();

// define the rate limiting middleware
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 10, // each IP can make up to 10 requests per `windowMs` (5 minutes)
  standardHeaders: true, // add the `RateLimit-*` headers to the response
  legacyHeaders: false, // remove the `X-RateLimit-*` headers from the response
  handler: (req, res, next) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).send("Too many requests, please try again later.");
  },
});

const apiLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 1, // Allow only one request to go at full-speed.
  delayMs: (hits) => hits * hits * 1000, // 2nd request has a 4 second delay, 3rd is 9 seconds, 4th is 16, etc.
});

// apply the rate limiting middleware to all endpoints
app.use(limiter); // time out after 10 requests in 5min
app.use(apiLimiter); // Slow down the request after the 5th request

// define a sample endpoint
app.get("/hello-world", (req, res) => {
  console.log(`Request received from IP: ${req.ip}`);
  res.send("Hello, World!");
});

// start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
