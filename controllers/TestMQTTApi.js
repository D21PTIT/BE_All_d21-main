import mqttClient from "../config/mqttConfig.js";
import { Device } from "../model/device.js";
import { Message } from "../model/TestIOT.js";

export const addTest = async (req, res) => {
    try {
        const { topic, message } = req.body;
        const newTest = new Message({ topic, message});
        await newTest.save();
        return res.status(200).json({ message: 'Device created successfully', test: newTest });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create device', error: error.message });
    }
};

export const getAllTest = async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: -1 });
        res.json({
          status: 'success',
          data: messages
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




  export const sendMqtt = async (req, res) => {
    console.log(req.body);
    const { topic, message } = req.body;
    if (!topic || !message) {
        return res.status(400).json({ message: 'Topic and message are required' });
    }
    const ans= message.toString()[0] ;
    let name="";
    if(ans ==1){
      name ="fan";
    }else if(ans ==2){
      name = "airc";
    }
    else{
      name = "lightb";
    }
    let status= message.toString()[2] ;
    if(status ==0){
      status = "off";
    }
    else{
      status = 'on';
    }
    const tag = ans.toString();
    const dev = new Device({tag, name, status });
    await dev.save();
    // Publish tin nhắn tới topic
    mqttClient.publish(topic, message.toString(), (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to publish message', error: err });
        }
        
        res.status(200).json({ message: `Message sent to topic ${topic}` });
    });
  };

