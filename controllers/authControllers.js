const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 8;

function generateToken(id) {
  return jwt.sign(id, process.env.PRIVATEKEY);
}

exports.getUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.json({ success: false, msg: "Input required" });
      return;
    }
    const userExist = await User.findAll({ where: { email: email } });
    const user = userExist[0];
    if (!user) {
      res.status(404).json({ success: false, msg: "No Such Email Exist" });
      return;
    }
    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      res.status(401).json({ success: false, msg: "Incorrect Password" });
      return;
    }
    const token = generateToken(user.id);
    res.status(201).json({ token, user, success: true, msg: "User Logged In" });
  } catch (err) {
    console.log(err);
    res.status({ success: false, msg: "Smtg Went Wrong" });
  }
};

exports.newUser = async (req, res) => {
  try {
    const { username, email, phoneNumber, password } = req.body;
    if (!email || !username || !phoneNumber || !password) {
      res.json({ success: false, msg: "Input required" });
      return;
    }
    const userExist = await User.findAll({ where: { email: email } });
    if (userExist[0]) {
      res.json({ success: false, msg: "User Already Exist" });
      return;
    }
    const hashPass = await bcrypt.hash(password, saltRounds);
    const user = await User.create({
      username,
      email,
      phoneNumber,
      password: hashPass,
    });
    res
      .status(200)
      .json({ user, success: true, msg: "Successfully Created User" });
  } catch (err) {
    console.log(err);
    res.status(404).json({ success: false, msg: "Smtg Went Wrong" });
  }
};
