const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

// Core middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routing
app.use('/api', routes);

// Catch 404 routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
