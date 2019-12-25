'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bookingUuid: {
        type: Sequelize.STRING
      },
      vehicleId: {
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      bookingId: {
        type: Sequelize.INTEGER
      },
      tripStart: {
        type: Sequelize.STRING
      },
      tripEnd: {
        type: Sequelize.STRING
      },
      amntPerday: {
        type: Sequelize.INTEGER
      },
      totalAmnt: {
        type: Sequelize.INTEGER
      },
      pickUpDropOffLocation: {
        type: Sequelize.STRING
      },
      cancellation: {
        type: Sequelize.STRING
      },
      isCanceled: {
        type: Sequelize.BOOLEAN
      },
      isActive: {
        type: Sequelize.BOOLEAN
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
    return queryInterface.dropTable('bookings');
  }
};