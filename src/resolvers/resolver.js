const jwt = require('jsonwebtoken');
const GraphQLJSON = require('graphql-type-json');
const models = require('../models');
const { checkAuthAndResolve } = require('./authchecker');
const { getAllVehicles } = require('../store');
const { stkPush } = require('../mpesa');
const {pubsub, withFilter} = require('./pubsub/pubsub');



const formatErrors = (e, models) => {
  if (e instanceof models.sequelize.ValidationError) {
    return e.errors.map(x => _.pick(x, ['path', 'message']));
  }
  return [{ path: 'name', message: 'something went wrong' }];
};
const EVENTS = {
  ON__NEW_USER: "onNewuser",
  ON__NEW_BOOKING: "onBooking"
};

const _publish = (component, data) => {
  pubsub.publish(component, { [component]: data });
};

const saveImage =  async (image, context) =>{
      try {
       const {dataValues} = await context.models.VehicleImages.create(image); 
       console.log(dataValues)   
      } catch (err) {
        console.log(err)
      }
}

const resolvers = {
  JSON: GraphQLJSON,
  //Queries
  Query: {
    getAllVehicles: async (__, { latitude, longitude }, context, info) => {
     return await getAllVehicles(context.models, latitude, longitude)
     .then( data => { 
        return data;
      }).catch(err => {
        console.log(err);
      });
    },
    vehicleById: async (__, {id}, context, info) => {
      let lat = parseFloat(-1.267556);
      let lng = parseFloat(36.6021866);
      return await getAllVehicles(context.models, lat, lng).then( data => {
        return data.find(dt => dt.id == id); 
       }).catch(err => {
         console.log(err);
       });
    },
    searchByLocation: async (__, args, context, info) => {
      try {
        return await getAllVehicles(context.models).then(data => {
          return data.filter(dt => dt.address.includes(args.l));
        });
      } catch (err) {
        console.log(err);
      }
    },

    me: async (__, args, context, info) => {
       const {data} = checkAuthAndResolve(context);
      try {
        return await context.models.User.findOne({
          where: {id: data.id,},
          include: [models.Bookmark],
        });
      } catch (err) {
        return{
          errors: formatErrors(err, context.models),
        }
      }
    },
    
    userVehicles: async (__, obj, context, _) =>{
      const {data} = checkAuthAndResolve(context);
      try {
        return await context.models.Vehicle.findAll({
          where: {userId: data.id,},
          include: [models.User, models.VehicleImages],
        }); 
      } catch (err) {
        return{
          errors: formatErrors(err, context.models),
        }
      }
    },

    checkPayments: async(__, {crID, mrID}, context, _)=>{
      try {
        return await context.models.Payment.findOne({
          where: {
            checkoutRequestID: crID,
            merchantRequestID: mrID,
          }
        });
      } catch (err) {
        return{
          errors: formatErrors(err, context.models)
        }
      }
    },

    bookingHistory: async(__, ___, context, _)=>{
      const {data} = checkAuthAndResolve(context);
      try {
        return await context.models.Vehiclebooking.findAll({
          where:{
            userId: data.id,
          }
        });
      } catch (err) {
        return{
          errors: formatErrors(err, context.models)
        }
      }
    },
    bookingHistoryById: async(__, {id}, context, _) => {
      const {data} = checkAuthAndResolve(context);

      try {
        const res = await context.models.Vehiclebooking.findOne({
          where:{
            id: id,
          }
        });
        return res;
      } catch (err) {
        return{
          errors: formatErrors(err, context.models)
        }
      }
    },

    vehicleTrips: async(__, {id}, context, _) =>{
      const {data} = checkAuthAndResolve(context);
      try {
        const res = await context.models.Vehiclebooking.findAll({
          where:{
            vehicleId: id,
          }
        });
        return res;
      } catch (err) {
        return{
          errors: formatErrors(err, context.models)
        }
      }
    }

  },


  // All Mutations
  Mutation: {
    createUser: async (__, { input }, context, info) => { 
      try { 
        const phone = input.phone;
        const newUserAdded = await context.models.User.findOrCreate({
          where: {phone},
          defaults: input
        });
        // generate token
        const isNewRecord = newUserAdded[0].isNewRecord;
        const token = jwt.sign({
          data: newUserAdded[0].dataValues
        }, process.env.JWT_SECRET_KEY, {
          expiresIn: '8760h'
        });
        const _userAdded = newUserAdded[0].dataValues;
        _publish(EVENTS.ON__NEW_USER, _userAdded);
        return {
          user: _userAdded,
          token: token,
        };
      } catch (err) {
        throw err;
      }
    },

    updateUser: async(__, { input }, context, info) =>{
      const {data} = checkAuthAndResolve(context);
      try {
        const result = await context.models.User.update(
          input,
          {returning: true, where: {id: data.id} }
          );
          return {
            success: true,
            message: "ok",
            status: 200
          };
      } catch (err) {
        return{errors: formatErrors(err, context.models),}
      }
    },

    listVehicle: async (__, {input}, context, info) => {
      const {data} = checkAuthAndResolve(context);
      try {
       const {dataValues} = await context.models.Vehicle.create(input);
       const imgData = {
        imgUrl: input.imgUrl,
        vehicleId: dataValues.id
       }
       await context.models.VehicleImages.create(imgData);
        return {
          vehicle: dataValues,
          success: true,
          status: 200
        };
      } catch (err) {
        throw err;
      }
    },

    handleBooking: async (__, {bookingData}, context, info) => {
      const {data} = checkAuthAndResolve(context);
      const dt = {
        tripStart: bookingData.tripStart,
        mPesaNumber: bookingData.mPesaNumber,
        tripEnd: bookingData.tripEnd,
        days: bookingData.days,
        vehicleId: bookingData.vehicleData.id,
        ownerId: bookingData.vehicleData.User.id,
        picRetLo: bookingData.picRetLo,
        vehicleData: bookingData.vehicleData,
        userId: data.id,
        mpesaReceiptNumber: bookingData.mpesaReceiptNumber,
        isActive: true,
      }      
      try {
        const resp = await context.models.Vehiclebooking.findOrCreate({
          where: { mpesaReceiptNumber: dt.mpesaReceiptNumber },
          defaults: dt
        });
        const newBooking = resp[0].dataValues;
        _publish(EVENTS.ON__NEW_BOOKING, newBooking); 
        return{
          success: true,
          status: 200,
          vehicleBooked: newBooking
        }
      } catch (err) {
        console.log('Unkown '.err);
      }
    },

    createReview: async (__, {review}, context, info) => {
      const { data } = checkAuthAndResolve(context);
      const rvwData = {
        review: review.review,
        userId: data.id,
        vehiclebookingId: review.vehiclebookingId,
        rate: review.rate,
        VehicleId: review.vehicleId,
      }
      try {
        const resp = await context.models.Reviews.findOrCreate({
          where:{vehiclebookingId: rvwData.vehiclebookingId},
          defaults: rvwData
        });
        return{
          success: true,
          message: 'reviewed__successfully.',
          status: 200,
          resp,
        }
      } catch (err) {
        console.log(err);
      }
    },
    
    uploadImage: async(__, {image}, context, info) => {
      const { data } = checkAuthAndResolve(context);
      console.log(image)
      try {
        await context.models.VehicleImages.create(image);
        return{
          success: true,
          status: 200
        }      
      } catch (err) {
        console.log(err)
      }
    },

    addBookmark: async (__, {vehicle}, context, info) =>{
      const { data } = checkAuthAndResolve(context);
      try {
        await context.models.Bookmark.create(vehicle);
        return{
          success: true,
          vehicle,
          status: 200
        }
      } catch (err) {
        console.log(err)
      }
      return {
        success: true,
        message: 'Bookmark added',
        obj
      }
    },
    setPrice: async (__, obj, context, info) =>{
      checkAuthAndResolve(context);
      try {
        const {price, vehicleId} = obj;
        const [numberOfAffectedRows, affectedRows] = await context.models.Vehicle.update({
          price: price,
        }, {
          where: {id: vehicleId}, 
          returning: true, 
          plain: true,
        });
        if (affectedRows){
          return{
            success: true,
            obj,
            status: 200
          }
        }
      } catch (err) {
        return{errors: formatErrors(err, context.models),}
      }
    },

    updateVehicleInfo: async(__, {vehicleId, updateData}, context, info) => {
      checkAuthAndResolve(context);
      try {
        const [numberOfAffectedRows, affectedRows] = await context.models.Vehicle.update(updateData, {
          where: {id: vehicleId},
          returning: true, // needed for affectedRows to be populated
          plain: true // makes sure that the returned instances are just plain objects
        });
        console.log(affectedRows);
        return{
          success: true,
          status: 200,
        }    
      } catch (err) {
        return{
          errors: formatErrors(err, context.models),
        }
      }
    },

    createVehicleAvailability: async (__, args, context, info) => {
      checkAuthAndResolve(context);
      try {
        const [numberOfAffectedRows, affectedRows] = await context.models.Vehicle.update({ 
          carAvailability: args.date,
        }, {
          where: {id: args.vehicleId},
          returning: true, // needed for affectedRows to be populated
          plain: true // makes sure that the returned instances are just plain objects
        });
        console.log(affectedRows) 

        return{
          success: true,
          args,
          status: 200
        }      
      } catch (err) {
        console.log(err)
      }
    },

    pickUpDropOffLocation: async (__, obj, context, _) =>{
      checkAuthAndResolve(context);
      try {
        const [numberOfAffectedRows, affectedRows] = await context.models.Vehicle.update({ 
          pickUpDropOffLocation: obj.locationData,
        }, {
          where: {id: obj.vehicleId},
          returning: true, // needed for affectedRows to be populated
          plain: true // makes sure that the returned instances are just plain objects
        });
        console.log(affectedRows);
        return{
          success: true,
          ok: affectedRows,
          obj,
          status: 200
        }
      } catch (err) {
        return{errors: formatErrors(err, context.models),}
      }
    },

    mPesa: async (__, {senderMsisdn, amount}, context, info) =>{
      let msisdn = parseInt(senderMsisdn);
      const {data, status} = await stkPush(msisdn, amount);
      // console.log(data)
      return{
        data,
        success: true,
        status: 200
      }
    },

     uploadSingleFile: async (root, { file }) => {
      const { stream, mimetype,createReadStream,filename } = await file;
      console.log(filename)
      return{
        success: true,
        message: 'Ok',
      }
      // Now use stream to either write file at local disk or CDN
     },
  },
  //Subscriptions
	Subscription: {
		onBooking: {
      subscribe: withFilter(() => pubsub.asyncIterator([EVENTS.ON__NEW_BOOKING]), 
      (payload, variables) => {
        return payload.onBooking.ownerId === variables.id;
      }),
    },
    onNewuser:{
      subscribe: () => pubsub.asyncIterator([EVENTS.ON__NEW_USER]),
    }
	},

};

module.exports = resolvers;
// '{"query":"mutation file($file: Upload!){\n  uploadSingleFile(file: $file){\n    success\n  }\n}"}'