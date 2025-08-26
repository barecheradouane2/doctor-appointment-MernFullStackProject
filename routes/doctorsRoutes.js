const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

const auth = require('../auth/Middleware');

router.get('/getAll', doctorController.getAll);
router.get('/info', auth(["Doctor"]), doctorController.getInformation);
router.put('/update/:id', auth(["Doctor"]), doctorController.update);
router.post('/create', auth(["Admin"]), doctorController.create);
router.delete('/delete/:id', auth(["Admin"]), doctorController.delete);
router.get('/getOne/:id',auth(["Admin","Doctor"]), doctorController.getOne);


module.exports = router;
