import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import song from './routers/song.js';
import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import mysql from 'mysql2';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json({ limit: '30mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }));
app.use(cors());

// Router
app.use('/', song);

// Kết nối tới MongoDB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Cannot connect to MongoDB', err);
  });

//ecommerce
  export const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'ecommerce'
  });
  connection.connect((err) => {
    if (err) {
      console.error('Kết nối thất bại:', err.stack);
      return;
    }
    console.log('Đã kết nối với MySQL');
  });
// Tạo HTTP server và Socket.IO server
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Địa chỉ FE của bạn
    methods: ["GET", "POST"]
  }
});

export const io1 = io.of('/1');
export const io2 = io.of('/2');
export const io3 = io.of('/3');

// Socket.IO kết nối và lắng nghe sự kiện
io2.on('connection', (socket) => {
  console.log('New client connected');
  // Khi client ngắt kết nối
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

io1.on('connection', (socket) => {
  console.log('New client connected ok ok');
  // Khi client ngắt kết nối
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
io3.on('connection', (socket) => {
  console.log('New client connected Haixxxx');
  //Khi client ngắt kết nối
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});





// Sử dụng `server.listen` để khởi động cả HTTP server và Socket.IO server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
