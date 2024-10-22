import mqtt from 'mqtt';
import { saveLEDStatus, saveSensorData, saveSensorData2, Warning } from '../controllers/rtData.js';

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
  // Đăng ký lắng nghe từ các sự kiện bật tắt đèn
  mqttClient.subscribe('home/led/status', (err) => {
    if (!err) {
      console.log('Subscribed to topic: home/led/status');
    } else {
      console.error('Error subscribing to topic:', err);
    }
  });
  mqttClient.subscribe('home/wind/status', (err) => {
    if (!err) {
      console.log('Subscribed to topic: home/wind/status');
    } else {
      console.error('Error subscribing to topic:', err);
    }
  });


});

// Lắng nghe và xử lý tin nhắn từ MQTT
mqttClient.on('message', (topic, message) => {
  if (topic === 'home/sensor') {
    saveSensorData(topic, message); 
    saveSensorData2(topic, message); 
  }
});

mqttClient.on('message', (topic, message) => {
  if (topic === 'home/led/status') {
    saveLEDStatus(topic, message); 
  }
});

mqttClient.on('message', (topic, message) => {
  if (topic === 'home/wind/status') {
    Warning(topic, message); 
  }
});



export default mqttClient;
