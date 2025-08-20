const express = require('express');
const router = express.Router();

const appointmentController = require("../controllers/appointmentController");

const auth = require('../auth/Middleware');

router.post('/create',auth(["Patient","Nurse", "Doctor"]), appointmentController.create);
// get patient appointment

// get all doctor appointment
router.get('/getAll',auth(["Patient","Nurse", "Doctor"]), appointmentController.getAll);
router.get('/getOne/:id',auth(["Patient","Nurse", "Doctor"]), appointmentController.getOne);
// i should not allow patient to change his appontement of status
router.put('/confirm/:id', auth(["Doctor", "Nurse"]), appointmentController.confirmAppointment);
router.put('/update/:id',auth(["Patient","Nurse", "Doctor"]), appointmentController.update);
router.delete('/delete/:id',auth(["Patient","Nurse", "Doctor"]), appointmentController.delete);

module.exports = router;
