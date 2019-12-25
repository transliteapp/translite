'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Vehiclebooking', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tripStart: {
        type: Sequelize.STRING
      },
      tripEnd: {
        type: Sequelize.STRING
      },
      mPesaNumber: {
        type: Sequelize.STRING
      },
      days: {
        type: Sequelize.INTEGER
      },
      vehicleId: {
        type: Sequelize.INTEGER
      },
      ownerId: {
        type: Sequelize.INTEGER
      },
      picRetLo: {
        type: Sequelize.JSON
      },
      vehicleData: {
        type: Sequelize.JSON
      },
      pending: {
        type: Sequelize.BOOLEAN
      },
      isActive: {
        type: Sequelize.BOOLEAN
      },
      mpesaReceiptNumber: {
        type: Sequelize.STRING
      },
      bookingId: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Vehiclebooking');
  }
};