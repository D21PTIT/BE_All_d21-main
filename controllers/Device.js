import { Device } from "../model/device.js";

export const createDevice = async (req, res) => {
    try {
        const { tag, name, status } = req.body;
        const newDevice = new Device({ tag, name, status });
        await newDevice.save();
        return res.status(200).json({ message: 'Device created successfully', device: newDevice });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create device', error: error.message });
    }
};

export const getAllDevice = async (req, res) => {
    try {
        let devices = await Device.find().sort({ createdAt: -1 });
        
        // Duyệt qua và thay đổi tên thiết bị trực tiếp trong cơ sở dữ liệu
        await Promise.all(devices.map(async (device) => {
            if (device.status === 'on') {
                device.status = 'Bật';
            } else if (device.status === 'off') {
                device.status = 'Tắt';
            } 
            await device.save(); // Lưu lại thay đổi vào cơ sở dữ liệu
        }));
        
        // Lấy lại danh sách đã cập nhật từ cơ sở dữ liệu
        devices = await Device.find().sort({ createdAt: -1 });
        
        return res.status(200).json({ message: 'Successful', device: devices });
    } catch (error) {
        return res.status(500).json({ message: 'Fail to get all devices', error: error.message });
    }
};



export const get10 = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;  // Trang hiện tại
        //tinh so ban ghi can bo qua
        const skip = (page - 1) * 10;
        //tinh tong so ban ghi hien tai
        const total = await Device.countDocuments();
        const device = await Device.find()
                                .skip(skip)
                                .limit(10);

        return res.status(200).json({
            totalPages: Math.ceil(total / 10),  // Tổng số trang
            currentPage: page,  // Trang hiện tại
            device  // Dữ liệu người dùng
        });
    } catch (error) {
        return res.status(500).json({ message: 'Fail to get all device', error: error.message });
    }
};


export const getDeviceBySearch = async (req, res) => {
    try {
        // Lấy giá trị tmp từ query string
        const { tmp } = req.query;
        console.log(tmp);
        // Sử dụng tmp để tìm kiếm trong cơ sở dữ liệu
        const ans = await Device.find({ tag: tmp }).sort({ createdAt: -1 });

        return res.status(200).json({ message: 'Succesfull', device: ans });
    } catch (error) {
        return res.status(500).json({ message: 'Fail to get device by search', error: error.message });
    }
};


//API lay du lieu tu bang 1
export const table1 = async (req, res) => {
    try {
        const { page, type, quanty, timesort, exactTime } = req.query;
        const sortByCreatedAt = timesort === 'true' ? -1 : 1;

        const filter = type !== 'all' ? { tag: type } : {};

        // Xử lý exactTime nếu có giá trị
        if (exactTime) {
            const dateTimeParts = exactTime.split(' ');
            const dateParts = dateTimeParts[0].split('/');

            let startDate, endDate;

            if (dateParts.length === 1) {
                // Chỉ có năm (ví dụ: 2024)
                const year = parseInt(dateParts[0], 10);
                startDate = new Date(`${year}-01-01T00:00:00.000Z`);
                endDate = new Date(`${year}-12-31T23:59:59.999Z`);
            } else if (dateParts.length === 2) {
                // Có cả năm và tháng (ví dụ: 2024/12)
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                startDate = new Date(year, month, 1, 0, 0, 0, 0);
                endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
            } else if (dateParts.length === 3) {
                // Có cả năm, tháng và ngày (ví dụ: 2024/12/09)
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                const day = parseInt(dateParts[2], 10);
                startDate = new Date(year, month, day, 0, 0, 0, 0);
                endDate = new Date(year, month, day, 23, 59, 59, 999);

                // Thêm giờ nếu có
                if (dateTimeParts.length === 2) {
                    const timeParts = dateTimeParts[1].split(':');
                    const hour = parseInt(timeParts[0], 10);
                    startDate.setHours(hour, 0, 0, 0);
                    endDate.setHours(hour, 59, 59, 999);

                    // Thêm phút nếu có
                    if (timeParts.length >= 2) {
                        const minute = parseInt(timeParts[1], 10);
                        startDate.setMinutes(minute, 0, 0);
                        endDate.setMinutes(minute, 59, 999);

                        // Thêm giây nếu có
                        if (timeParts.length === 3) {
                            const second = parseInt(timeParts[2], 10);
                            startDate.setSeconds(second, 0);
                            endDate.setSeconds(second, 999);
                        }
                    }
                }
            }

            // Thêm điều kiện lọc theo khoảng thời gian
            filter.createdAt = { $gte: startDate, $lte: endDate };
        }

        const skip = (page - 1) * quanty;
        const devices = await Device.find(filter)
                                    .sort({ createdAt: sortByCreatedAt })
                                    .skip(skip)
                                    .limit(parseInt(quanty));
        const totalRecords = await Device.countDocuments(filter);

        return res.status(200).json({
            message: 'Successful',
            totalRecords,
            totalPages: Math.ceil(totalRecords / quanty),
            currentPage: parseInt(page),
            devices
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to get devices by search', error: error.message });
    }
};














