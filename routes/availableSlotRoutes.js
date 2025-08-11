const express = require('express');
const router = express.Router();
const availableSlotController = require('../controllers/availableSlotController');


const auth = require('../auth/Middleware');



// Create slot
router.post('/create', auth(["Nurse", "Doctor"]), availableSlotController.create);
router.delete('/delete/:id', auth(["Nurse", "Doctor"]), availableSlotController.delete);
router.get('/getAll',auth(["Nurse", "Doctor"]), availableSlotController.getAll);
router.get('/getOne/:id', auth(["Nurse", "Doctor"]), availableSlotController.getOne);
router.put('/update/:id', auth(["Nurse", "Doctor"]), availableSlotController.update);




// // Get all slots
// router.get('/', availableSlotController);

// // Get slots for a doctor on a specific date
// router.get('/:doctorId/:date', availableSlotController.getSlotsByDoctorAndDate);

// // Delete slot
// router.delete('/:id', availableSlotController.deleteSlot);

module.exports = router;
