import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../client/dist');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  maxHttpBufferSize: 1e7 // 10MB limit for image attachments
});

const DEFAULT_ROOMS = [
  { id: 'general', name: 'General', description: 'General conversation & casual vibes', icon: '💬' },
  { id: 'tech-talk', name: 'Tech Talk', description: 'Code, frameworks, architecture & tech news', icon: '⚡' },
  { id: 'random', name: 'Random', description: 'Memes, music, off-topic fun and links', icon: '🎲' },
  { id: 'showcase', name: 'Showcase', description: 'Show off your projects, designs & ideas', icon: '✨' }
];

let rooms = [...DEFAULT_ROOMS];
// Map of roomId => Message[]
const roomMessages = new Map();
// Map of socketId => User
const users = new Map();

// Initialize message stores
rooms.forEach(r => roomMessages.set(r.id, []));

// Helper to push message and keep buffer reasonable
function addMessage(roomId, msg) {
  if (!roomMessages.has(roomId)) {
    roomMessages.set(roomId, []);
  }
  const list = roomMessages.get(roomId);
  list.push(msg);
  if (list.length > 150) {
    list.shift();
  }
}

function getRoomUsers(roomId) {
  const result = [];
  for (const user of users.values()) {
    if (user.room === roomId) {
      result.push(user);
    }
  }
  return result;
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    totalUsers: users.size,
    rooms: rooms.map(r => ({
      ...r,
      userCount: getRoomUsers(r.id).length
    }))
  });
});

app.get('/api/rooms', (req, res) => {
  const roomData = rooms.map(r => ({
    ...r,
    userCount: getRoomUsers(r.id).length
  }));
  res.json(roomData);
});

// Serve frontend build if present
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Send current rooms list immediately on connection
  socket.emit('rooms_update', rooms.map(r => ({
    ...r,
    userCount: getRoomUsers(r.id).length
  })));

  // Join Room
  socket.on('join_room', ({ username, avatar, room, statusText }) => {
    // If user was previously in another room, leave it
    const prevUser = users.get(socket.id);
    if (prevUser && prevUser.room) {
      socket.leave(prevUser.room);
      const prevRoom = prevUser.room;
      
      const leaveMsg = {
        id: `sys-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'system',
        text: `${prevUser.username} left the channel`,
        timestamp: new Date().toISOString(),
        room: prevRoom
      };
      addMessage(prevRoom, leaveMsg);
      io.to(prevRoom).emit('receive_message', leaveMsg);
      io.to(prevRoom).emit('users_update', getRoomUsers(prevRoom));
    }

    // Join new room
    const targetRoom = room || 'general';
    socket.join(targetRoom);

    const currentUser = {
      id: socket.id,
      username: username || 'Anonymous',
      avatar: avatar || '🐱',
      statusText: statusText || 'Online',
      room: targetRoom,
      joinedAt: new Date().toISOString()
    };
    users.set(socket.id, currentUser);

    console.log(`[User Joined] ${currentUser.username} (${socket.id}) -> #${targetRoom}`);

    // Send chat history of this room to the joining user
    const history = roomMessages.get(targetRoom) || [];
    socket.emit('room_history', history);

    // Notify room of new user
    const joinMsg = {
      id: `sys-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: 'system',
      text: `${currentUser.username} hopped into #${targetRoom} 👋`,
      timestamp: new Date().toISOString(),
      room: targetRoom
    };
    addMessage(targetRoom, joinMsg);
    io.to(targetRoom).emit('receive_message', joinMsg);

    // Broadcast updated users list for this room
    io.to(targetRoom).emit('users_update', getRoomUsers(targetRoom));

    // Update global room member counters
    io.emit('rooms_update', rooms.map(r => ({
      ...r,
      userCount: getRoomUsers(r.id).length
    })));
  });

  // User sends a message
  socket.on('send_message', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const roomId = data.room || user.room;
    if (!roomId) return;

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
      type: 'user',
      user: {
        id: socket.id,
        username: user.username,
        avatar: user.avatar
      },
      text: data.text ? data.text.trim() : '',
      image: data.image || null,
      replyTo: data.replyTo || null,
      timestamp: new Date().toISOString(),
      room: roomId,
      reactions: {} // emoji -> [usernames]
    };

    addMessage(roomId, newMsg);
    io.to(roomId).emit('receive_message', newMsg);
  });

  // User reacts to a message
  socket.on('react_message', ({ messageId, room, emoji }) => {
    const user = users.get(socket.id);
    if (!user) return;

    const list = roomMessages.get(room);
    if (!list) return;

    const msg = list.find(m => m.id === messageId);
    if (!msg) return;

    if (!msg.reactions) {
      msg.reactions = {};
    }

    if (!msg.reactions[emoji]) {
      msg.reactions[emoji] = [];
    }

    const userIndex = msg.reactions[emoji].indexOf(user.username);
    if (userIndex > -1) {
      // Toggle off
      msg.reactions[emoji].splice(userIndex, 1);
      if (msg.reactions[emoji].length === 0) {
        delete msg.reactions[emoji];
      }
    } else {
      // Toggle on
      msg.reactions[emoji].push(user.username);
    }

    io.to(room).emit('message_reaction_update', {
      messageId,
      reactions: msg.reactions
    });
  });

  // Typing indicators
  socket.on('typing', ({ room, isTyping }) => {
    const user = users.get(socket.id);
    if (!user) return;

    socket.to(room).emit('user_typing', {
      userId: socket.id,
      username: user.username,
      isTyping
    });
  });

  // Create new room
  socket.on('create_room', ({ name, description, icon }) => {
    const user = users.get(socket.id);
    if (!name || !name.trim()) return;

    const formattedId = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-');

    // Avoid duplicate IDs
    if (rooms.some(r => r.id === formattedId)) {
      socket.emit('error_notification', { message: 'A channel with this name already exists.' });
      return;
    }

    const newRoom = {
      id: formattedId,
      name: name.trim(),
      description: description ? description.trim() : 'User created channel',
      icon: icon || '💬',
      createdBy: user ? user.username : 'Unknown'
    };

    rooms.push(newRoom);
    roomMessages.set(formattedId, []);

    // Broadcast updated rooms
    io.emit('rooms_update', rooms.map(r => ({
      ...r,
      userCount: getRoomUsers(r.id).length
    })));

    socket.emit('room_created', newRoom);
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      const { room, username } = user;
      users.delete(socket.id);
      console.log(`[User Left] ${username} (${socket.id}) disconnected`);

      if (room) {
        const leaveMsg = {
          id: `sys-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'system',
          text: `${username} left the chat 👋`,
          timestamp: new Date().toISOString(),
          room
        };
        addMessage(room, leaveMsg);
        io.to(room).emit('receive_message', leaveMsg);
        io.to(room).emit('users_update', getRoomUsers(room));
      }

      // Update room counts
      io.emit('rooms_update', rooms.map(r => ({
        ...r,
        userCount: getRoomUsers(r.id).length
      })));
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Chat server running on http://localhost:${PORT}`);
});
