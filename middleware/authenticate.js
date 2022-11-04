const jwt = require("jsonwebtoken");
const User = require("../model/User");

const authenticate = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    const userid = jwt.verify(token, process.env.PRIVATEKEY);
    User.findByPk(userid)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ success: false });
  }
};

module.exports = {
  authenticate,
};
