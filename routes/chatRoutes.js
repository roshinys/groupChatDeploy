const express = require("express");

const router = express.Router();
const middleware = require("../middleware/authenticate");
const chatController = require("../controllers/chatControllers");

router.get("/all-chats", middleware.authenticate, chatController.getChats);
router.get(
  "/user/:userId",
  middleware.authenticate,
  chatController.sendChatUser
);

router.post("/new-chat", middleware.authenticate, chatController.newChat);

module.exports = router;
