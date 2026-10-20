const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.IO Server
 */
const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: [
                process.env.URL_CLIENT || 'http://localhost:5173',
                'http://localhost:5174',
                'http://127.0.0.1:5173',
                'http://127.0.0.1:5174',
            ],
            methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });

    io.on('connection', (socket) => {
        const { userId, role } = socket.handshake.query;

        if (userId) {
            const userRoom = `user_${userId}`;
            socket.join(userRoom);
            console.log(`🔌 [Socket.IO] User connected: ${userId} -> Room: ${userRoom}`);
        }

        if (role === 'admin' || role === 'superadmin') {
            socket.join('admin_room');
            console.log(`🛡️ [Socket.IO] Admin connected -> Room: admin_room`);
        }

        // Custom room join listener
        socket.on('join_user_room', (uid) => {
            if (uid) {
                socket.join(`user_${uid}`);
                console.log(`🔌 [Socket.IO] Explicitly joined user_${uid}`);
            }
        });

        socket.on('join_admin_room', () => {
            socket.join('admin_room');
            console.log(`🛡️ [Socket.IO] Explicitly joined admin_room`);
        });

        socket.on('disconnect', (reason) => {
            console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id} (${reason})`);
        });
    });

    console.log('✅ Socket.IO Server initialized successfully');
    return io;
};

/**
 * Get the current Socket.IO instance
 */
const getIO = () => {
    if (!io) {
        console.warn('⚠️ [Socket.IO] Warning: io instance requested before initialization!');
    }
    return io;
};

/**
 * Send real-time notification to a specific user
 */
const sendNotificationToUser = (userId, notificationData) => {
    if (!io) return false;
    try {
        const room = `user_${userId}`;
        io.to(room).emit('notification', notificationData);
        console.log(`📢 [Socket.IO] Sent notification to ${room}:`, notificationData.title);
        return true;
    } catch (err) {
        console.error(`❌ [Socket.IO] Failed to send notification to user ${userId}:`, err);
        return false;
    }
};

/**
 * Broadcast real-time notification to all connected admins/librarians
 */
const broadcastNotificationToAdmins = (notificationData) => {
    if (!io) return false;
    try {
        io.to('admin_room').emit('admin_notification', notificationData);
        console.log(`🛡️ [Socket.IO] Broadcast to admin_room:`, notificationData.title);
        return true;
    } catch (err) {
        console.error(`❌ [Socket.IO] Failed to broadcast to admin_room:`, err);
        return false;
    }
};

module.exports = {
    initSocket,
    getIO,
    sendNotificationToUser,
    broadcastNotificationToAdmins,
};
