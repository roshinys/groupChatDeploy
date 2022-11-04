const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const UserGroup = sequelize.define("usergroup", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  superadmin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  admin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = UserGroup;
