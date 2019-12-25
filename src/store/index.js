 const getAllVehicles = (models, lat, lng) => {
  // let lat = parseFloat(-1.267556);
  // let lng = parseFloat(36.6021866);
    const haversine = [[models.sequelize.literal("6371 * acos(cos(radians("+lat+")) * cos(radians(lat)) * cos(radians("+lng+") - radians(lng)) + sin(radians("+lat+")) * sin(radians(lat)))"), 'distance']];
    return models.Vehicle.findAll({
        attributes: {include: haversine},
        include: [{
          all: true, 
          nested: true,
          require: true,
          }],
          order: models.sequelize.col('distance'),
          limit: 50,
    });
  }

  const getAllVehilesByLocation = (models) => {
    const lat = parseFloat(-1.2833);
    const lng = parseFloat(30.8167);

  return models.Vehicle.findAll({
    attributes: [[models.sequelize.literal("6371 * acos(cos(radians("+lat+")) * cos(radians(lat)) * cos(radians("+lng+") - radians(lng)) + sin(radians("+lat+")) * sin(radians(lat)))"), 'distance']],
    order: models.sequelize.col('distance'),
    limit: 100
  });
  }

  module.exports= { getAllVehicles, getAllVehilesByLocation };