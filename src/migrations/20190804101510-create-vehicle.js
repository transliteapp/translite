'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('vehicles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      vuuid: {
        type: Sequelize.STRING
      },
      model: {
        type: Sequelize.STRING
      },
      make: {
        type: Sequelize.STRING
      },
      year: {
        type: Sequelize.INTEGER
      },
      vehicleType: {
        type: Sequelize.STRING
      },
      transmission: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.INTEGER
      },
      carAvailability: {
        type: Sequelize.JSON
      },
      location:{
        type: Sequelize.GEOMETRY,
      },
      carDetails: {
        type: Sequelize.TEXT
      },
      carPhotos: {
        type: Sequelize.STRING
      },
      millage: {
        type: Sequelize.INTEGER
      },
      numberPlate: {
        type: Sequelize.STRING
      },
      isbooked: {
        type: Sequelize.BOOLEAN
      },
      userId: {
        type: Sequelize.INTEGER
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
    return queryInterface.dropTable('vehicles');
  }
};