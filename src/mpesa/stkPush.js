const { request } = require('../helper');
module.exports = async (senderMsisdn, amount) => {
    const timeStamp = (new Date()).toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const accountRef = Math.random().toString(35).substr(2, 7);
    const _shortCode= process.env.SHORT_CODE;
    const _passKey = `${process.env.PASS_KEY}`;
    const password =  Buffer.from(`${_shortCode}${_passKey}${timeStamp}`).toString('base64');
    const req =  await request();
    const callBackUrl = 'https://transliteapp.herokuapp.com/stk-responce';
    return req.post('/mpesa/stkpush/v1/processrequest', {
      'BusinessShortCode': _shortCode,
      'Password': password,
      'Timestamp': timeStamp,
      'TransactionType': 'CustomerPayBillOnline',
      'Amount': amount,
      'PartyA': senderMsisdn,
      'PartyB': _shortCode,
      'PhoneNumber': senderMsisdn,
      'CallBackURL': callBackUrl,
      'AccountReference': accountRef,
      'TransactionDesc': 'Lipa na mpesa'
    });
  };
  
