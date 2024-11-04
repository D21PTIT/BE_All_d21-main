import mqttClient from "../config/mqttConfig.js";
import { Device } from "../model/device.js";
import { Message } from "../model/TestIOT.js";

export const addTest = async (req, res) => {
  try {
    const { topic, message } = req.body;
    const newTest = new Message({ topic, message });
    await newTest.save();
    return res.status(200).json({ message: 'Device created successfully', test: newTest });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create device', error: error.message });
  }
};

export const getAllTest = async (req, res) => {
  try {
    const ans2 = await Device.countDocuments({
      createdAt: { $regex: "2024-08-17" }
    })
    res.json({
      status: 'success',
      data: ans2
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const saveMessage = async (topic, message) => {
  try {
    const newMessage = new Message({
      topic,
      message,
    });
    await newMessage.save();
    console.log('Message saved to MongoDB');
  } catch (error) {
    console.error('Error saving message:', error);
  }

  mqttClient.on('message', (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);
    saveMessage(topic, message.toString());  // Hàm saveMessage cần được định nghĩa
  });
};



//Ham xu ly button ban đầu
export const sendMqtt = async (req, res) => {
  console.log(req.body);
  const { topic, message } = req.body;
  if (!topic || !message) {
    return res.status(400).json({ message: 'Topic and message are required' });
  }

  const ans = message.toString()[0];
  let name = "";
  if (ans == 1) {
    name = "Quạt";
  } else if (ans == 2) {
    name = "Điều hòa";
  }else if(ans ==3){
    name = "Bóng đèn";
  }
  else {
    name = "Cảnh báo gió";
  }
  
  let status = message.toString()[2];
  status = status == 0 ? "Tắt" : "Bật";
  const count = await Device.countDocuments();
  const tag = ans.toString();
  const dev = new Device({ tag, name, status,stt: count + 1 });
  await dev.save();

  try {
    // Đợi phản hồi từ MQTT sau khi publish
    const mqttResponse = await new Promise((resolve, reject) => {
      // Publish tin nhắn tới topic
      mqttClient.publish(topic, message.toString(), (err) => {
        if (err) {
          return reject({ message: 'Failed to publish message', error: err });
        }
        // Sử dụng `once` để chỉ lắng nghe phản hồi một lần
        mqttClient.once('message', (recvTopic, recvMessage) => {
          // Kiểm tra xem topic phản hồi có khớp không
          if (recvTopic === 'home/led/status') {  // Thay bằng topic thực tế bạn đang lắng nghe
            resolve(recvMessage.toString());
          } else {
            reject({ message: 'Unexpected topic' });
          }
        });
      });
    });
    // Trả về phản hồi nếu thành công
    res.status(200).json({ message: `Message sent to topic ${topic} and response received`, response: mqttResponse });
  } catch (error) {
    res.status(500).json({ message: 'Failed to handle MQTT communication', error });
  }
};







