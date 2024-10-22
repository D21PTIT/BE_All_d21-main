import mongoose from 'mongoose';

const TestSchema = new mongoose.Schema({
    humidity: {
    type: Number,
    required: true,
    trim: true
  },
  light: {
    type: Number,
    required: true,
    trim: true
  },
  temperature: {
    type: Number,
    required: true,
    trim: true
  },
  wind: {
    type: Number,
    required: true,
    trim: true
  },
  stt: {
    type: Number,
    required: true,
  }
}, { timestamps: true , collection: 'TestSchema'});//chèn các collection vào bảng user1
// createdAt, updatedAt sẽ được tự động thêm vào bởi tùy chọn timestamps

export const Test = mongoose.model('rtDataShemaxxx', TestSchema);