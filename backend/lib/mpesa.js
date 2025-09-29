// lib/mpesa.js
const axios = require('axios');
require('dotenv').config();

const {
  MPESA_ENV, MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL
} = process.env;

function endpoints() {
  if (MPESA_ENV === 'sandbox') {
    return {
      oauth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      stk: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    };
  }
  return {
    oauth: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stk: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
  };
}

async function getToken() {
  const url = endpoints().oauth;
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get(url, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.data.access_token;
}

function buildPassword() {
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14); // YYYYMMDDhhmmss
  const raw = `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`;
  return { password: Buffer.from(raw).toString('base64'), timestamp };
}

async function initiateStkPush({ amount, phoneNumber, accountReference = 'order' }) {
  const token = await getToken();
  const { password, timestamp } = buildPassword();
  const url = endpoints().stk;

  const body = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: MPESA_SHORTCODE,
    PhoneNumber: phoneNumber,
    CallBackURL: MPESA_CALLBACK_URL,
    AccountReference: accountReference,
    TransactionDesc: 'Payment'
  };

  const res = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return res.data;
}

module.exports = { initiateStkPush };
