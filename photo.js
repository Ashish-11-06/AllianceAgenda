const { DataTypes, Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'mysql',
  pool: require('./db'),
});

const Photo = sequelize.define('Photo', {
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  // Add additional fields as needed, such as userId, description, etc.
});

module.exports = Photo;
