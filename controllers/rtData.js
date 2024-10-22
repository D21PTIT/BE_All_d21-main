import { io, io1, io2 } from "../index.js";
import { Device } from "../model/device.js";
import { Data } from "../model/rtData.js";
import { Test } from "../model/SupperTest.js";
export const createData = async (req, res) => {
    try {
        const { humidity, light, temperature } = req.body;
        const newData = new Data({ humidity, light, temperature });
        await newData.save();
        return res.status(200).json({ message: 'Device created successfully', device: newData });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create device', error: error.message });
    }
};
export const getAllData = async (req, res) => {
    try {
        const ans = await Test.find(); // Lấy tất cả bản ghi
        // Gán stt cho mỗi bản ghi và cập nhật lại csdl
        await Promise.all(
            ans.map(async (item, index) => {
                item.stt = index + 1; // Cập nhật stt
                await item.save();    // Lưu lại bản ghi với stt mới
            })
        );
        // Lấy lại các bản ghi sau khi đã cập nhật stt
        const updatedData = await Test.find();
        return res.status(200).json({ message: 'Get all data and update stt successfully', data: updatedData });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to get and update all data', error: error.message });
    }
};


export const get10Data = async (req, res) => {
    try {
        const ans = await Data.find().sort({ createdAt: -1 }).limit(10);
        return res.status(200).json({ message: 'Get 10 data successfully', data: ans });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to get data', error: error.message });
    }
};

//Lay du lieu tu bang 2
export const table2 = async (req, res) => {
    try {
        const { page, quanty, timesort, tempsort, humsort, brisort, exactTime ,type, exactValue} = req.query;

        // Chuyển đổi page và quanty thành số nếu cần
        const limit = parseInt(quanty, 10);
        const skip = (parseInt(page, 10) - 1) * limit;

        // Tạo query trống
        let query = {};

        // Nếu có exactTime, chuyển đổi nó sang dạng ISO và tìm kiếm chính xác
        if (exactTime) {
            const dateTimeParts = exactTime.split(' '); // Tách phần ngày và phần giờ (nếu có)
            const dateParts = dateTimeParts[0].split('/'); // Tách chuỗi theo dấu '/'

            let startDate, endDate;

            if (dateParts.length === 1) {
                // Trường hợp chỉ có năm (ví dụ: 2024)
                const year = parseInt(dateParts[0], 10);
                startDate = new Date(`${year}-01-01T00:00:00.000Z`);
                endDate = new Date(`${year}-12-31T23:59:59.999Z`);
            } else if (dateParts.length === 2) {
                // Trường hợp có cả năm và tháng (ví dụ: 2024/12)
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1; // Tháng trong JS bắt đầu từ 0
                startDate = new Date(year, month, 1, 0, 0, 0, 0);
                endDate = new Date(year, month + 1, 0, 23, 59, 59, 999); // Lấy ngày cuối cùng của tháng
            } else if (dateParts.length === 3) {
                // Trường hợp có cả năm, tháng và ngày (ví dụ: 2024/12/09)
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                const day = parseInt(dateParts[2], 10);
                startDate = new Date(year, month, day, 0, 0, 0, 0);
                endDate = new Date(year, month, day, 23, 59, 59, 999);

                // Nếu có thêm phần thời gian (giờ phút giây)
                if (dateTimeParts.length === 2) {
                    const timeParts = dateTimeParts[1].split(':');

                    if (timeParts.length === 1) {
                        // Chỉ có giờ (ví dụ: 4)
                        const hour = parseInt(timeParts[0], 10);
                        startDate.setHours(hour, 0, 0, 0);
                        endDate.setHours(hour, 59, 59, 999);
                    } else if (timeParts.length === 2) {
                        // Có cả giờ và phút (ví dụ: 4:23)
                        const hour = parseInt(timeParts[0], 10);
                        const minute = parseInt(timeParts[1], 10);
                        startDate.setHours(hour, minute, 0, 0);
                        endDate.setHours(hour, minute, 59, 999);
                    } else if (timeParts.length === 3) {
                        // Có cả giờ, phút và giây (ví dụ: 4:23:07)
                        const hour = parseInt(timeParts[0], 10);
                        const minute = parseInt(timeParts[1], 10);
                        const second = parseInt(timeParts[2], 10);
                        startDate.setHours(hour, minute, second, 0);
                        endDate.setHours(hour, minute, second, 999);
                    }
                }
            }

            // Thêm vào query với khoảng thời gian xác định
            query.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }
        if (type && exactValue) {
            const ok = parseFloat(exactValue);

            if (type === 'Humidity') {
                query.humidity = ok;
            } else if (type === 'Light') {
                query.light = ok;
            } else if (type === 'Temperature') {
                query.temperature = ok;
            }
        }

        // Sắp xếp theo thứ tự dựa trên timesort và một trong ba trường tempsort, humsort, brisort
        let sort = {};
        if (timesort && (timesort === '-1' || timesort === '1')) {
            sort.createdAt = parseInt(timesort); // Sắp xếp theo thời gian (createdAt)
        }
        if (tempsort && tempsort !== '0') {
            sort.temperature = parseInt(tempsort); // tempsort có giá trị -1 hoặc 1
        } else if (humsort && humsort !== '0') {
            sort.humidity = parseInt(humsort); // humsort có giá trị -1 hoặc 1
        } else if (brisort && brisort !== '0') {
            sort.light = parseInt(brisort); // brisort có giá trị -1 hoặc 1
        }

        // Lấy tổng số bản ghi (count)
        const totalRecords = await Data.countDocuments(query);

        // Truy vấn cơ sở dữ liệu với sắp xếp và phân trang
        const data = await Data.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            message: `Get ${quanty} data successfully`,
            totalRecords, // Tổng số bản ghi
            data
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to get data', error: error.message });
    }
};






//Ham Quan trong
export const saveSensorData = async (topic, message) => {
    const data = message.toString(); // Chuyển buffer thành chuỗi
    console.log(`Received message on topic ${topic}: ${data}`);

    // Sử dụng Regular Expression để trích xuất dữ liệu cảm biến
    const regex = /Temperature:\s([\d.]+)°C,\sHumidity:\s([\d.]+)%,\sBrightness:\s(\d+)/;
    const match = data.match(regex);

    if (match) {
        const temperature = parseFloat(match[1]);
        const humidity = parseFloat(match[2]);
        const light = parseInt(match[3]);

        console.log(`Extracted Data - Temperature: ${temperature}°C, Humidity: ${humidity}%, Brightness: ${light}`);
        const count = await Data.countDocuments();
        // Lưu dữ liệu vào MongoDB
        try {
            const newSensorData = new Data({
                humidity,
                light,
                temperature,
                stt: count + 1
            });
            await newSensorData.save();
            console.log('Sensor data saved to MongoDB');
            io1.emit('sensorData', {
                temperature,
                humidity,
                light
            });
        } catch (error) {
            console.error('Error saving sensor data:', error);
        }
    } else {
        console.error('Error parsing sensor data');
    }
};



export const saveSensorData2 = async (topic, message) => {
    const data = message.toString(); // Chuyển buffer thành chuỗi
    console.log(`Received message on topic ${topic}: ${data}`);

    // Sử dụng Regular Expression để trích xuất dữ liệu cảm biến
    const regex = /Temperature:\s([\d.]+)°C,\sHumidity:\s([\d.]+)%,\sBrightness:\s(\d+),\sWindSpeed:\s(\d+)km\/h/;
    const match = data.match(regex);

    if (match) {
        const temperature = parseFloat(match[1]);
        const humidity = parseFloat(match[2]);
        const light = parseInt(match[3]);
        const wind = parseInt(match[4]); // Thêm biến cho tốc độ gió
        console.log(`Extracted Data - Temperature: ${temperature}°C, Humidity: ${humidity}%, Brightness: ${light}, WindSpeed: ${wind}km/h`);

        // Lưu dữ liệu vào MongoDB
        const getNextStt = async () => {
            const lastRecord = await Test.findOne().sort({ stt: -1 }); // Tìm bản ghi có stt lớn nhất
            return lastRecord ? lastRecord.stt + 1 : 1; // Nếu có bản ghi, lấy stt lớn nhất +1, nếu không thì bắt đầu từ 1
        };
        const count = await getNextStt();
        try {
            const newSensorData = new Test({
                temperature,
                humidity,
                light,
                wind, // Thêm wind vào đối tượng lưu trữ
                stt: count
            });
            await newSensorData.save();
            console.log('Sensor data saved to MongoDB');
            io1.emit('sensorData', {
                temperature,
                humidity,
                light,
                wind // Phát dữ liệu bao gồm cả wind
            });
        } catch (error) {
            console.error('Error saving sensor data:', error);
        }
    } else {
        console.error('Error parsing sensor data');
    }
};


//API xư lý canh bao den
export const saveLEDStatus = async (topic, message) => {


};


//API xư lý canh bao den


export const Warning = async (topic, message) => {
    // Chuyển đổi message từ Buffer sang chuỗi và chuyển đổi sang số
    const messageValue = parseInt(message.toString(), 10);
    // Kiểm tra giá trị message
    if (messageValue === 1) {
        console.log(`Warning: Light level exceeded threshold for topic: ${topic}`);
        io2.emit('warning', {
            messageValue
        });

    } else if (messageValue === 0) {
        console.log(`Info: Light level returned to normal for topic: ${topic}`);
        io2.emit('warning', {
            messageValue
        });
    } else {
        console.log(`Unexpected message received: ${message}`);
    }
};



export const table3 = async (req, res) => {
    try {
        const { page, quanty, timesort, tempsort, humsort, brisort, windsort, exactTime, type, exactValue } = req.query;

        // Chuyển đổi page và quanty thành số nếu cần
        const limit = parseInt(quanty, 10);
        const skip = (parseInt(page, 10) - 1) * limit;

        // Tạo query trống
        let query = {};

        // Nếu có exactTime, chuyển đổi nó sang dạng ISO và tìm kiếm chính xác
        if (exactTime) {
            const dateTimeParts = exactTime.split(' '); // Tách phần ngày và phần giờ (nếu có)
            const dateParts = dateTimeParts[0].split('/'); // Tách chuỗi theo dấu '/'

            let startDate, endDate;

            if (dateParts.length === 1) {
                // Trường hợp chỉ có năm (ví dụ: 2024)
                const year = parseInt(dateParts[0], 10);
                startDate = new Date(`${year}-01-01T00:00:00.000Z`);
                endDate = new Date(`${year}-12-31T23:59:59.999Z`);
            } else if (dateParts.length === 2) {
                // Trường hợp có cả năm và tháng (ví dụ: 2024/12)
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1; // Tháng trong JS bắt đầu từ 0
                startDate = new Date(year, month, 1, 0, 0, 0, 0);
                endDate = new Date(year, month + 1, 0, 23, 59, 59, 999); // Lấy ngày cuối cùng của tháng
            } else if (dateParts.length === 3) {
                // Trường hợp có cả năm, tháng và ngày (ví dụ: 2024/12/09)
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                const day = parseInt(dateParts[2], 10);
                startDate = new Date(year, month, day, 0, 0, 0, 0);
                endDate = new Date(year, month, day, 23, 59, 59, 999);

                // Nếu có thêm phần thời gian (giờ phút giây)
                if (dateTimeParts.length === 2) {
                    const timeParts = dateTimeParts[1].split(':');

                    if (timeParts.length === 1) {
                        // Chỉ có giờ (ví dụ: 4)
                        const hour = parseInt(timeParts[0], 10);
                        startDate.setHours(hour, 0, 0, 0);
                        endDate.setHours(hour, 59, 59, 999);
                    } else if (timeParts.length === 2) {
                        // Có cả giờ và phút (ví dụ: 4:23)
                        const hour = parseInt(timeParts[0], 10);
                        const minute = parseInt(timeParts[1], 10);
                        startDate.setHours(hour, minute, 0, 0);
                        endDate.setHours(hour, minute, 59, 999);
                    } else if (timeParts.length === 3) {
                        // Có cả giờ, phút và giây (ví dụ: 4:23:07)
                        const hour = parseInt(timeParts[0], 10);
                        const minute = parseInt(timeParts[1], 10);
                        const second = parseInt(timeParts[2], 10);
                        startDate.setHours(hour, minute, second, 0);
                        endDate.setHours(hour, minute, second, 999);
                    }
                }
            }

            // Thêm vào query với khoảng thời gian xác định
            query.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }

        // Nếu có type và exactValue, tìm kiếm theo trường cụ thể
        if (type && exactValue) {
            const exact = parseFloat(exactValue);

            if (type === 'Humidity') {
                query.humidity = exact;
            } else if (type === 'Light') {
                query.light = exact;
            } else if (type === 'Temperature') {
                query.temperature = exact;
            } else if (type === 'Wind') {
                query.wind = exact; // Thêm logic tìm kiếm theo tốc độ gió
            }
        }

        // Sắp xếp theo thứ tự dựa trên timesort và một trong các trường khác
        let sort = {};
        if (timesort && (timesort === '-1' || timesort === '1')) {
            sort.createdAt = parseInt(timesort); // Sắp xếp theo thời gian (createdAt)
        }
        if (tempsort && tempsort !== '0') {
            sort.temperature = parseInt(tempsort); // tempsort có giá trị -1 hoặc 1
        } else if (humsort && humsort !== '0') {
            sort.humidity = parseInt(humsort); // humsort có giá trị -1 hoặc 1
        } else if (brisort && brisort !== '0') {
            sort.light = parseInt(brisort); // brisort có giá trị -1 hoặc 1
        } else if (windsort && windsort !== '0') {
            sort.wind = parseInt(windsort); // Thêm logic sắp xếp theo tốc độ gió
        }

        // Lấy tổng số bản ghi (count)
        const totalRecords = await Test.countDocuments(query);

        // Truy vấn cơ sở dữ liệu với sắp xếp và phân trang
        const data = await Test.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            message: `Get ${quanty} data successfully`,
            totalRecords, // Tổng số bản ghi
            data
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to get data', error: error.message });
    }
};