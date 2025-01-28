const http = require('http');
const app = require('./app');
const { Server } = require("socket.io"); // Corrected import statement

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Replace with your frontend origin
    credentials: true, // Allow credentials
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3002, () => {
  console.log("post server is running on port 3002");
});