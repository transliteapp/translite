const { gql } = require('apollo-server-express');

const typeDef = gql`
scalar Upload
scalar JSON
scalar JSONObject
scalar DateTime
    type User {
        id: ID!
        firstname: String 
        lastName: String
        email: String  
        uuid: String 
        phone: String
        address: String 
        lat: Float
        long: Float
        active: Boolean
        avatorUrl: String
        createdAt: DateTime
        Bookmarks: [Bookmark]
    }
    type Vehicle {
        id: ID!
        userId: Int
        vuuid: String
        lat: Float!
        lng: Float!
        model: String
        year: Int
        make: String
        features: JSON
        vehicleType: String
        carAvailability: JSONObject
        transmission: String
        VehicleImages: [VehicleImages!]!
        price: Int
        VehicleAvailabilties: [vehicleAvailabilty]
        carDetails: String
        millage: String
        numberPlate: String
        pickUpDropOffLocation: JSON
        User: User!
        Reviews: [Reviews]
        Bookings: [Bookings!]!
        distance: Float
        Vehiclebookings: [BookingHistory!]

    }

    input addVehicle {
        userId: String!
        features: JSON
        vuuid: String
        model: String!
        year: String!
        make: String!
        vehicleType: String!
        transmission: String!
        price: Int!
        lat: Float!
        lng: Float!
        carDetails: String!
        carPhotos:  String
        millage: String!
        numberPlate: String!
        imgUrl: String!
    }

    type Bookings {
        tripStart: String
        tripEnd: String
        amntPerday: Int
        pickUpDropOffLocation: JSON
        totalAmnt: Int
    }

    input bookings {
        vehicleId: Int!
        userId: Int!
        tripStart: String!
        tripEnd: String!
        amntPerday: Int!
        totalAmnt: Int!
    }

    input createReview {
        review: String!
        vehiclebookingId: Int!
        rate: Int!
        vehicleId: Int!
    }

    input Booking{
        tripStart: String!
        tripEnd: String!
        mPesaNumber: String!
        days: Int!
        vehicleId: Int!
        ownerId: Int!
        picRetLo: JSONObject
        vehicleData: JSONObject
        mpesaReceiptNumber: String!
        isActive: Boolean!
    }

    input uploadImage{
        imgUrl: String!
        vehicleId: Int!
    }

    type VehicleImages {
        vehicleId: Int
        imgUrl: String
    }

    type Reviews {
        createdAt: DateTime
        review: String
        rate: Int
        userId:Int
        User: User!
    }

    input CreateNewUser {
        firstname: String! 
        lastName: String!
        email: String! 
        pass: String 
        uuid: String 
        phone: String! 
        address: String! 
        lat: Float
        long: Float
        active: Boolean
        avatorUrl: String
    }

    input updateUser{
        firstname: String! 
        lastName: String!
        email: String! 
        phone: String! 
        address: String!
    }

    input updateVehicleInfo {
        make: String!
        model: String!
        year: String!
        transmission: String!
        millage: String!
        vehicleType: String!
     }

    type Response {
        success: Boolean!
        message: String
        status: Int
    }

    type MpesaResponse {
        success: Boolean!
        data: JSON
        status: Int
    }
    type ListVehicleResponse {
        success: Boolean!
        vehicle: Vehicle!
    }
    type CreateUserResponse{
        user: User!
        token: String!
    }
    type vehicleAvailabilty {
        date: DateTime   
    }

    type Bookmark{
        userId: String
        vehicleId: String
    }
    input addBookmark {
        userId: String!
        vehicleId: String!
    }

    type S3Payload {
        signedRequest: String!,
        url: String!,
    }

   type PaymentConfirmed{
     paymentType: String
     mpesaReceiptNumber: String!
     amount: Int
     phoneNumber: String!
     transactionDate: String
     status: Boolean
    }

    type BookingHistory{
        tripStart: String
        tripEnd: String
        days: Int!
        id: ID!
        mPesaNumber: String
        picRetLo: JSONObject
        vehicleData: JSONObject
        mpesaReceiptNumber: String!
        userId: Int
        isActive: Boolean
        pending: Boolean  
    }

    type Newbooking{
        id: ID!
        tripStart: String
        tripEnd: String
        mPesaNumber: String
        days: Int
        pending: Boolean
        isActive: Boolean
        bookingId: Int
        mpesaReceiptNumber: String
        userId: Int
        vehicleId: Int
        createdAt: String
        updatedAt: String
    }

    type bookingResponse{
        success: Boolean!
        message: String
        status: Int
        vehicleBooked: Newbooking!
    }

    type Query {
        vehicleById(id: ID!): Vehicle
        searchByLocation(l: String!): [Vehicle]
        users: [User!]!
        me: User!
        userVehicles: [Vehicle]
        getAllVehicles(latitude: Float!, longitude: Float!): [Vehicle!]!
        checkPayments(crID: String!, mrID: String!): PaymentConfirmed
        bookingHistory: [BookingHistory]!
        bookingHistoryById(id: ID!): BookingHistory!
        vehicleTrips(id: ID!): [BookingHistory!]!
    }
    type Mutation {
      mPesa(senderMsisdn: String!, amount: Int!): MpesaResponse!
      uploadSingleFile(file: Upload!): Response!
      pickUpDropOffLocation(locationData: JSON!, vehicleId: Int!): Response!
      signS3(filename: String!, filetype: String!): S3Payload!
      updateUser(input: updateUser!): Response!
      addBookmark(vehicle: addBookmark): Response
      setPrice(vehicleId: Int!, price: Int!): Response!
      updateVehicleInfo(updateData: updateVehicleInfo!, vehicleId: Int!): Response!
      createVehicleAvailability(date: JSONObject!, vehicleId: Int!): Response!
      uploadImage(image: uploadImage): Response!
      createReview(review: createReview!): Response!
      createUser(input: CreateNewUser): CreateUserResponse!
      listVehicle(input: addVehicle): ListVehicleResponse!
      bookings(bookingData: bookings): Response!
      handleBooking(bookingData: Booking!): bookingResponse!
    }
    type Subscription{
        onBooking(id: Int!): Newbooking!
        onNewuser: User!
    }
    schema {
      query: Query
      mutation: Mutation
      subscription: Subscription
    }

`;
module.exports= typeDef;