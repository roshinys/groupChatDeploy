const User = require("../model/User");
const Group = require("../model/Group");
const UserGroup = require("../model/UserGroup");
const Message = require("../model/Messages");

const { Op } = require("sequelize");

exports.removeUser = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.query.userId;
    const loggedUserId = await req.user.id;
    const isAdmin = await UserGroup.findAll({
      where: {
        [Op.and]: [{ userId: loggedUserId, groupId: groupId }],
      },
    });
    let result = isAdmin[0].admin;
    let message = "removed user";
    if (userId == loggedUserId) {
      result = true;
      message = "you exited from group";
    }
    if (!result) {
      res.json({ success: true, msg: "aint admin user" });
      return;
    }
    const delUser = await UserGroup.destroy({
      where: {
        [Op.and]: [{ userId: userId, groupId: groupId }],
      },
    });
    res.json({ success: true, msg: message, delUser });
  } catch (err) {
    console.log(err);
    res.status(404).json({ success: false, msg: "smtg went wrong" });
  }
};

exports.makeUserAdmin = async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const userId = parseInt(req.body.userId);
    const adm = await UserGroup.update(
      { admin: true },
      {
        where: {
          [Op.and]: [{ userId: userId }, { groupId: groupId }],
        },
      }
    );
    res.json({ success: true, msg: "added new admin", userId, groupId, adm });
  } catch (err) {
    console.log(err);
    res.status(404).json({ success: false, msg: "smtg went wrong" });
  }
};

exports.getAllMembers = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    var attr = ["id", "username"];
    let group = await Group.findAll({
      where: {
        id: groupId,
      },
      include: [{ model: User, attributes: attr }],
    });
    group = group[0];
    const allmembers = group.users;
    res.status(200).json({ allmembers, success: true, msg: "got all members" });
  } catch (err) {
    console.log(err);
    res.status(404).json({ success: false, msg: "smtg went wrong" });
  }
};

exports.newGroupMember = async (req, res) => {
  try {
    const loggedUserId = req.user.id;
    const groupId = req.body.groupId;
    const newUserId = req.body.userId;
    let superUser = await UserGroup.findAll({
      Where: {
        [Op.and]: [{ userId: loggedUserId }, { groupId: groupId }],
      },
    });
    superUser = superUser[0];
    if (!superUser.admin) {
      res.json({ success: false, msg: "your not admin user" });
      return;
    }
    let alreadyIn = await UserGroup.findAll({ where: { userId: newUserId } });
    alreadyIn = alreadyIn[0];
    if (alreadyIn) {
      res.json({ success: false, msg: "user already exists" });
      return;
    }
    const newguser = await UserGroup.create({
      userId: newUserId,
      groupId: groupId,
    });
    res.json({ success: true, msg: "succesfully added user", newguser });
  } catch (err) {
    console.log(err);
    res.status(404).json({ success: false, msg: "smtg went wrong" });
  }
};

exports.newChat = async (req, res) => {
  const groupId = req.body.id;
  const content = req.body.content;
  const user = req.user;
  const result = await user.createMessage({
    content: content,
    groupId: groupId,
  });
  res.json({ success: true, msg: "message sent", result });
};

exports.getGroup = async (req, res) => {
  try {
    const lastmsg = parseInt(req.query.lastmsg) || 0;
    const loggedUserId = req.user.id;
    const groudId = req.params.groudId;
    const groups = await Group.findAll({
      where: {
        id: groudId,
      },
    });
    const group = groups[0];
    const groupMessages = await group.getMessages({
      include: User,
      offset: lastmsg,
    });
    res.json({ groudId, group, groupMessages, loggedUserId });
  } catch (err) {
    console.log(err);
    res.status(404).json({ success: false, msg: "smtg went wrong" });
  }
};

exports.allGroup = async (req, res) => {
  try {
    const user = req.user;
    const groups = await user.getGroups();
    res.status(200).json({ success: true, msg: "got all groups", groups });
  } catch (err) {
    res.status(404).json({ success: false, msg: "smtg went wrong" });
  }
};

exports.newGroup = async (req, res) => {
  try {
    const groupName = req.body.groupName;
    const user = req.user;
    const newGroup = await Group.create({
      name: groupName,
      admin: true,
    });
    const group = await user.addGroup(newGroup, {
      through: { superadmin: true, admin: true },
    });
    const groupId = newGroup.id;
    res
      .status(201)
      .json({ success: true, msg: "created group", group, groupName, groupId });
  } catch (err) {
    res.status(404).json({ success: false, msg: "smtg went wrong" });
  }
};
