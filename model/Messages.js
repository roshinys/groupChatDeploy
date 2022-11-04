const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Message = sequelize.define("message", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  receiverId: {
    type: Sequelize.INTEGER,
  },
  content: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Message;
