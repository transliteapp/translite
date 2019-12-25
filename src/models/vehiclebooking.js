'use strict';
module.exports = (sequelize, DataTypes) => {
  const Vehiclebooking = sequelize.define('Vehiclebooking', {
    tripStart: DataTypes.STRING,
    tripEnd: DataTypes.STRING,
    mPesaNumber: DataTypes.STRING,
    days: DataTypes.INTEGER,
    // vehicleId: DataTypes.INTEGER,
    ownerId: DataTypes.INTEGER,
    picRetLo: DataTypes.JSON,
    vehicleData: DataTypes.JSON,
    pending: DataTypes.BOOLEAN,
    isActive: DataTypes.BOOLEAN,
    bookingId: DataTypes.STRING,
    mpesaReceiptNumber: DataTypes.STRING
  }, {});
  Vehiclebooking.associate = function(models) {
    Vehiclebooking.belongsTo(models.User,{
      onDelete: 'CASCADE',
        foreignKey: {
          name: 'userId',
          field: 'userId',
          allowNull: false,
          constraints: false,
        }
    });
    Vehiclebooking.belongsTo(models.Vehicle,{
      onDelete: 'CASCADE',
        foreignKey: 'vehicleId'
    });
  }
  return Vehiclebooking;
};