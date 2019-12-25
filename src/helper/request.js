const axios = require('axios');
const KEY = `JfmAIjH2DGTqOJGGxuwoHbzALmuINPI8`;
const SECRET = `SOWF6M23zIDOHtQ7`;
const BASE_URL =  'https://sandbox.safaricom.co.ke';

module.exports = async function () {
  const auth = Buffer.from(KEY + ':' + SECRET).toString('base64');
  const tokenData = await axios.get(BASE_URL + '/oauth/v1/generate?grant_type=client_credentials', {
    headers: {
      'Authorization': 'Basic ' + auth,
      'content-type': 'application/json'
    }
  });
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
    headers: {
      'Authorization': 'Bearer ' + tokenData.data['access_token'],
      'Content-Type': 'application/json'
    }
  })
  return instance
}


