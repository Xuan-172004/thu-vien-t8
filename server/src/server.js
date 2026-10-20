const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const { connectDB } = require('./config/connectDB');
const seedData = require('./config/seed');
const routes = require('./routes/index.routes');

const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

// Connect MySQL Database
connectDB().then(() => {
    seedData();
    const { startOverdueJob } = require('./jobs/overdue.job');
    startOverdueJob();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(
    cors({
        origin: [process.env.URL_CLIENT || 'http://localhost:5173', 'http://localhost:5174'],
        credentials: true,
    }),
);

app.use(express.static(path.join(__dirname, '../src')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Register API Routes
routes(app);

const http = require('http');
const { initSocket } = require('./socket');

// Create HTTP Server & initialize Socket.IO
const server = http.createServer(app);
initSocket(server);

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi hệ thống máy chủ',
    });
});

server.listen(port, () => {
    console.log(`🚀 BookRent MySQL Backend API & Socket.IO listening on port ${port}`);
});
