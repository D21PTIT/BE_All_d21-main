import mqtt from 'mqtt';
import { saveSensorData } from '../controllers/rtData.js';

// Kết nối tới MQTT broker tại localhost với chứng thực username và password
const mqttClient = mqtt.connect({
  host: 'localhost',
  port: 2003,
  username: 'kien',
  password: '123456',
});

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  
  // Đăng ký lắng nghe topic từ cảm biến
  mqttClient.subscribe('home/sensor', (err) => {
    if (!err) {
      console.log('Subscribed to topic: home/sensor');
    } else {
      console.error('Error subscribing to topic:', err);
    }
  });
});

// Lắng nghe và xử lý tin nhắn từ MQTT
mqttClient.on('message', (topic, message) => {
  saveSensorData(topic, message); // Gọi hàm từ controller để xử lý dữ liệu
});

export default mqttClient;
