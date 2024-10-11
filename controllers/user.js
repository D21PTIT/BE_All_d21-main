import { User } from "../model/User.js";
import bcrypt from "bcryptjs";  // Sử dụng bcryptjs thay vì bcrypt
const saltRounds = 10;
import jwt from 'jsonwebtoken';

// Tạo người dùng mới
export const createUser = async (req, res) => {
  try {
    console.log(req.body);
    const { username, password, role } = req.body;

    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Tạo mật khẩu băm (hash)
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const user = new User({ username, password: hashPassword, role });
    await user.save();
    
    return res.status(200).json({ message: 'User created successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};

// Xử lý đăng nhập
export const handleLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Tên người dùng và mật khẩu là bắt buộc' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Tên người dùng hoặc mật khẩu không chính xác' });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Tên người dùng hoặc mật khẩu không chính xác' });
    }

    // Tạo JWT token
    const payload = {
      username: user.username,
      role: user.role
    };
    
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXP }  // Ví dụ: '1h' hoặc '7d'
    );

    // Nếu đăng nhập thành công
    return res.status(200).json({ message: 'Đăng nhập thành công', code: accessToken, user: payload });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể đăng nhập', error: error.message });
  }
};
