'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  users.init({
    fullName: DataTypes.STRING,
    otp: DataTypes.INTEGER,
    email: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
    isVerified: DataTypes.BOOLEAN,
    password: DataTypes.STRING,
    otpExpTime: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};