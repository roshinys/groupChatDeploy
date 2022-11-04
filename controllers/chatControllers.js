const User = require("../model/User");
const Message = require("../model/Messages");
const { Op } = require("sequelize");

exports.newChat = async (req, res) => {
  try {
    const id = parseInt(req.body.id);
    const content = req.body.content;
    const user = req.user;
    const otherUser = await User.findByPk(id);
    const result = await req.user.createMessage({
      senderId: user.id,
      receiverId: id,
      content: content,
    });
    // console.log("result ==>", result);
    res.status(200).json({ result, success: true, msg: "message sent" });
  } catch (err) {
    console.log(err);
    res.status(404).json({ success: false, msg: "smtg went wrong" });
  }
};

exports.sendChatUser = async (req, res) => {
  try {
    // console.log(req.params);
    let lastmsg = req.query.lastmsg || 0;
    lastmsg = parseInt(lastmsg);
    console.log("last msg====>", lastmsg);
    const OtheruserId = req.params.userId;
    const userId = req.user.id;
    const Otheruser = await User.findByPk(OtheruserId);
    const allMessages = await Message.findAll({
      where: {
        [Op.or]: [
          { [Op.and]: [{ userId: userId }, { receiverId: Otheruser.id }] },
          {
            [Op.and]: [{ userId: Otheruser.id }, { receiverId: userId }],
          },
        ],
      },
      order: [["id"]],
      offset: lastmsg,
    });
    const otheruser = { id: Otheruser.id, username: Otheruser.username };
    res.json({
      userId,
      otheruser,
      allMessages,
      success: true,
      msg: "other user exist",
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({ success: false, msg: "smtg went wrong" });
  }
};

exports.getChats = async (req, res) => {
  try {
    const user = req.user;
    const allUser = await User.findAll({
      where: {
        id: {
          [Op.ne]: user.id,
        },
      },
    });
    res.status(200).json({ allUser, success: true, msg: "found all users" });
  } catch (err) {
    console.log(err);
    res.status(404).json({ success: false, msg: "smtg went wrong" });
  }
};
