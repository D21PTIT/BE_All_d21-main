import express from 'express';
import { createSong, deleteSong, editSong, getAllSong } from '../controllers/songs.js';
import { CreateSong, createArtist, getAllArtis } from '../controllers/artist.js';
import { createUser, handleLogin } from '../controllers/user.js';
import { auth, authorize } from '../middleware/auth.js';
import { createDevice, get10, getAllDevice, getDeviceBySearch, table1 } from '../controllers/Device.js';
import { createData, get10Data, getAllData, table2, table3} from '../controllers/rtData.js';
import { addTest, getAllTest, saveMessage, sendMqtt } from '../controllers/TestMQTTApi.js';
import { getAllUsers, getUserbyID } from '../controllers/MySQLTest.js';


const router = express.Router();


//route cho bai hat

router.get('/song',auth,getAllSong)
router.delete('/song/:id',deleteSong)
router.put('/song/:id',editSong)
router.post('/song', createSong)


//Route cho ca si

router.get('/artist',auth,getAllArtis)
router.post('/artist/createsong',CreateSong);
router.post('/artist',createArtist);



//Route cho nguoi dung
router.post('/user/create', createUser);
router.post('/user/login',handleLogin);


//route cho du an IOT
router.post('/iot/createDevice', createDevice);
router.get('/iot/getAllDevice',getAllDevice);
router.get('/iot/get10Device', get10);
router.get('/iot/getDeviceBySearch',getDeviceBySearch )

//route cho data
router.post('/iot/createData', createData);
router.get('/iot/getAllData', getAllData);
router.get('/iot/get10Data', get10Data);



//test
router.post('/test', addTest);
router.get('/test/getall', getAllTest);

//mySQL test

router.get('/sql1', getAllUsers);
router.get('/sql2', getUserbyID);




//office  (HERE, HERE)
router.get('/kien/iot1', table1);
router.get('/kien/iot2', table2);
router.get('/kien/iot3', table3);
router.post('/test/send', sendMqtt);


//(SEE UPPPP)

router.post('/camon',saveMessage)



export default router;



