const express = require("express");

const router = express.Router();
const middleware = require("../middleware/authenticate");
const groupchatController = require("../controllers/groupchatControllers");

router.post(
  "/new-group",
  middleware.authenticate,
  groupchatController.newGroup
);

router.post("/new-chat", middleware.authenticate, groupchatController.newChat);

router.get(
  "/all-groups",
  middleware.authenticate,
  groupchatController.allGroup
);

router.get(
  "/get-chat/:groudId",
  middleware.authenticate,
  groupchatController.getGroup
);

router.post(
  "/add-user/",
  middleware.authenticate,
  groupchatController.newGroupMember
);

router.get(
  "/get-all-users/:groupId",
  middleware.authenticate,
  groupchatController.getAllMembers
);

router.post(
  "/make-user-admin/:groupId",
  middleware.authenticate,
  groupchatController.makeUserAdmin
);

router.delete(
  "/remove-user/:groupId",
  middleware.authenticate,
  groupchatController.removeUser
);

module.exports = router;
