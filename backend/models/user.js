const { DataTypes } = require('sequelize');
const sequelize = require('./index').sequelize;

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' },
  rate: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
  companyName: { type: DataTypes.STRING, allowNull: true },
  invoiceNumber: { type: DataTypes.STRING, allowNull: true },
  invoiceToInfo: { type: DataTypes.STRING, allowNull: true },
  perHourRate: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
  perCallRate: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.0 },
});

module.exports = User; 