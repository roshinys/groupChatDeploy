const express = require("express");

const router = express.Router();
const authController = require("../controllers/authControllers");

router.post("/new-user", authController.newUser);
router.post("/get-user", authController.getUser);

module.exports = router;
