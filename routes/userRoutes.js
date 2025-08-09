const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

const upload = require("../middlewares/upload");



router.post("/register", upload.single('image'), userController.register);


router.post("/login", userController.login);

module.exports = router;
