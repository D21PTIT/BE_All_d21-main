import { Data } from "../model/rtData.js";

export const createData = async (req, res) => {
    try {
        const { humidity,light,temperature   } = req.body;
        const newData = new Data ({ humidity,light,temperature });
        await newData.save();
        return res.status(200).json({ message: 'Device created successfully', device: newData });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create device', error: error.message });
    }
};

export const getAllData = async (req, res) => {
    try {
        const ans = await Data.find();
        return res.status(200).json({ message: 'Get all data successfully', data: ans });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to get all data', error: error.message });
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

export const table2 = async (req, res) => {
    try {
        const { page , quanty , daysort, start, end, timesort, tempsort, humsort, brisort } = req.query;

        // Chuyển đổi page và quanty thành số nếu cần
        const limit = parseInt(quanty, 10);
        const skip = (parseInt(page, 10) - 1) * limit;

        // Tạo query lọc theo ngày tháng nếu daysort = true
        let query = {};
        if (daysort === 'true' && start && end) {
            query.createdAt = {
                $gte: new Date(start),
                $lte: new Date(end)
            };
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
