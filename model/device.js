import mongoose from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';
const connection = mongoose.createConnection('mongodb+srv://coinskus001:Dodaihoc9@cluster0.6clbaom.mongodb.net/Kien_Hoc_MERN?retryWrites=true&w=majority&appName=Cluster0');
const AutoIncrement = AutoIncrementFactory(connection);

const deviceShema = new mongoose.Schema({
  tag: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    default: "off"
  },
  stt: {
    type: Number,
    required: true,
  }
}, { timestamps: true , collection: 'Device'});//chèn các collection vào bảng user1
// createdAt, updatedAt sẽ được tự động thêm vào bởi tùy chọn timestamps

export const Device = mongoose.model('Device', deviceShema);