const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: false }));

//db
const sequelize = require("./util/database");

//routes
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const groupchatRoutes = require("./routes/groupChatRoutes");

//model
const User = require("./model/User");
const Message = require("./model/Messages");
const Group = require("./model/Group");
const UserGroup = require("./model/UserGroup");

//define relations here
User.hasMany(Message);
Message.belongsTo(User);

Group.hasMany(Message);
Message.belongsTo(Group);

User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });

app.use("/user", authRoutes);
app.use("/chat", chatRoutes);
app.use("/group-chat", groupchatRoutes);

app.use((req, res) => {
  // console.log(req.url);
  res.sendFile(path.join(__dirname, `/public/${req.url}`));
});

sequelize
  .sync()
  // .sync({ force: true })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("server started at port 3k");
    });
  })
  .catch((err) => {
    console.log(err);
  });
