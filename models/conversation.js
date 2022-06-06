'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class conversation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  conversation.init({
    senderId: DataTypes.UUID,
    recieverId: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'conversation',
  });
  return conversation;
};