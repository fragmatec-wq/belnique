const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const path = require('path');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/library', require('./routes/libraryRoutes'));
app.use('/api/networking', require('./routes/networkingRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/blog', require('./routes/blogRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/classrooms', require('./routes/classroomRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/conference', require('./routes/conferenceRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Placeholder routes for others (to be implemented fully)
// app.use('/api/events', require('./routes/eventRoutes'));
// app.use('/api/artworks', require('./routes/artworkRoutes'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// In-memory signaling state per conference (lessonId)
const rooms = new Map(); // lessonId -> { hostId: string | null, spectators: Set<string> }

io.on('connection', (socket) => {
  socket.on('join-room', ({ lessonId, role, name }) => {
    if (!lessonId) return;
    if (!rooms.has(lessonId)) {
      rooms.set(lessonId, { hostId: null, spectators: new Set() });
    }
    const room = rooms.get(lessonId);
    socket.join(lessonId);

    if (role === 'professor') {
      room.hostId = socket.id;
      io.to(lessonId).emit('host-ready', { hostId: socket.id });
    } else {
      room.spectators.add(socket.id);
      if (room.hostId) {
        io.to(room.hostId).emit('spectator-joined', { spectatorId: socket.id, name });
      }
    }

    socket.on('offer', ({ targetId, sdp, lessonId: lid }) => {
      if (targetId && sdp) {
        io.to(targetId).emit('offer', { sdp, hostId: socket.id });
      }
    });

    socket.on('answer', ({ targetId, sdp }) => {
      if (targetId && sdp) {
        io.to(targetId).emit('answer', { sdp, spectatorId: socket.id });
      }
    });

    socket.on('ice-candidate', ({ targetId, candidate }) => {
      if (targetId && candidate) {
        io.to(targetId).emit('ice-candidate', { candidate, from: socket.id });
      }
    });

    socket.on('disconnect', () => {
      rooms.forEach((room, lid) => {
        if (room.hostId === socket.id) {
          room.hostId = null;
          io.to(lid).emit('host-left');
        }
        if (room.spectators.has(socket.id)) {
          room.spectators.delete(socket.id);
          if (room.hostId) io.to(room.hostId).emit('spectator-left', { spectatorId: socket.id });
        }
        if (!room.hostId && room.spectators.size === 0) {
          rooms.delete(lid);
        }
      });
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running with Socket.io on port ${PORT}`);
});
