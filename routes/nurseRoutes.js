const express = require('express');
const router = express.Router();
const nurseController = require('../controllers/nurseController');
const auth = require('../auth/Middleware');

router.get('/getAll', auth(["Admin", "Doctor"]), nurseController.getAll);
router.get('/info', auth(["Nurse"]), nurseController.getInformation);
router.put('/update/:id', auth(["Nurse"]), nurseController.update);
router.post('/create', auth(["Doctor"]), nurseController.create);
router.delete('/delete/:id', auth(["Doctor"]), nurseController.delete);
router.get('/getOne/:id', auth(["Admin", "Nurse"]), nurseController.getOne);

module.exports = router;
