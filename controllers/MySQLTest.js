import { connection } from '../index.js';

export const getAllUsers = (req, res) => {
    const sql = 'SELECT * FROM cus';
    connection.query(sql, (error, results) => {
      if (error) {
        console.error('Lỗi khi truy vấn:', error);
        return res.status(500).json({ message: 'Cut_Me_May_Di'});
      }
      return res.status(200).json({ message: 'Device created successfully', acc: results });
      console.log(results);
    });
  };

export const getUserbyID=(req, res)=>{
  const {id} = req.query;
  const sql ='SELECT * from user WHERE id =?';
  connection.query(sql, [id], (error, results)=>{
    if(error){
      console.log(error);
      return res.status(500).json('OKNT')
    }
    return res.status(200).json({message: results});
  })
}