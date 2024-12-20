import mongoose from 'mongoose';

const rtDataShema = new mongoose.Schema({
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
  stt: {
    type: Number,
    required: true,
  }

}, { timestamps: true , collection: 'dataRealTime'});//chèn các collection vào bảng user1
// createdAt, updatedAt sẽ được tự động thêm vào bởi tùy chọn timestamps

export const Data = mongoose.model('rtDataShema', rtDataShema);