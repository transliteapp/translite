// const { RedisPubSub } = require('graphql-redis-subscriptions');
const { withFilter, PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

module.exports= {
  pubsub,
  withFilter
}