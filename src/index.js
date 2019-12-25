require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ApolloServer, AuthenticationError } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const jwt = require('jsonwebtoken');
const messagebird = require('messagebird')(process.env.MESSAGEBIRD_API_KEY);

const typeDefs = require('./typeDef/types.def');
const resolvers = require('./resolvers/resolver');
const models = require('./models');
const {createPayment} = require('./helper');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.post('/stk-responce', (req, res) => {
  const{stkCallback} = req.body.Body;
  if ( stkCallback.ResultCode === 0 ) {
    const paymentData= {
      paymentType: 'mPesa',
      mpesaReceiptNumber: stkCallback.CallbackMetadata.Item[1].Value,
      amount: stkCallback.CallbackMetadata.Item[0].Value,
      phoneNumber: stkCallback.CallbackMetadata.Item[4].Value,
      transactionDate: stkCallback.CallbackMetadata.Item[3].Value,
      merchantRequestID: stkCallback.MerchantRequestID,
      checkoutRequestID: stkCallback.CheckoutRequestID,
      status: false
    }
    createPayment(models, paymentData);
    const message = {
      "ResultCode": "0",
      "ResultDesc": "success"
    };
    // respond to safaricom server with a success message
    res.json(message);
  }
  const message = {
    "ResultCode": "0",
    "ResultDesc": "success"
  };
  // respond to safaricom server with a success message
  res.json(message);
});

app.post('/send-otp',(req, res)=>{
  const number = req.body.phone;
  messagebird.verify.create(number, {
      originator : 'Translite',
      template : 'Your verification code is %token.'
  }, (err, response) =>{
    err ? res.send({ 
      errorMsg: err.errors[0].description,
      code: err.errors[0].code,
    }) : res.send({id:  response.id});
  });
});

app.post('/verify-token', (req, res) => {
  console.log(req.body)
  const key = req.body.id;
  const token = req.body.token;
  messagebird.verify.verify(key, token,(err, resp) => {
    err ? res.send({error: err.errors[0].description, id: id,}) : res.send({isVerified: resp});
  });
})

app.post('/upload', (req, res)=>{
  console.log(req.body);
  res.json({
    status: 200,
    message: "success"
  })
});

const _validateToken = (token) => {
  const decoded = jwt.verify(
    token.replace('Bearer ', ''),
    process.env.JWT_SECRET_KEY
  );
  return decoded;
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const server = new ApolloServer({
  schema,
  context: ({req, connection}) => {
    if (connection){
      return{
        models,
      };
    }
    if (req) {
      return{
        models,
        headers: req.headers,
      };
    }
  },
  subscriptions:{
    onConnect: (connectionParams, webSocket, __)=>{
    if (connectionParams.Authorization, webSocket) {
      const {data} = _validateToken(connectionParams.Authorization);
      console.log(data)
      return{
        ...data
      }
    }
    throw new Error('Missing auth token!');
    },
  formatError: error => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');
      return {
        ...error,
        message,
      };
    },
  },
  introspection: true,
  playground: true
});

server.applyMiddleware({
  app,
  path: `/graphql`,
});

const httpServer = http.createServer(app);

server.installSubscriptionHandlers(httpServer);

models.sequelize.authenticate().then(() => {
  httpServer.listen({ port: process.env.PORT || 7500 }, () => { 
    console.log(`🚀 Server ready at`);
      console.log(`🚀 Subscriptions ready at ws://localhost:7500${server.subscriptionsPath}`);
    });
  }).catch(err =>{
  console.log('an error occured!'.err);
});

// models.sequelize.sync({force: true}).then(() => {
//   httpServer.listen({ port: process.env.PORT || 7800 }, () => { 
//     console.log(`🚀 Server ready at`);
//     console.log(`🚀 Subscriptions ready at ws://localhost:7000${server.subscriptionsPath}`);
//   });
// }).catch(error =>{
//   console.log(error)
// });