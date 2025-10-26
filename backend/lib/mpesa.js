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
  try {
    const url = endpoints().oauth;
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    
    console.log('Getting M-PESA token from:', url);
    
    const res = await axios.get(url, {
      headers: { Authorization: `Basic ${auth}` },
      timeout: 30000
    });
    
    if (!res.data.access_token) {
      throw new Error('No access token received from M-PESA');
    }
    
    console.log('✅ M-PESA token obtained successfully');
    return res.data.access_token;
  } catch (error) {
    console.error('❌ M-PESA token error:', error.response?.data || error.message);
    throw new Error(`Failed to get M-PESA token: ${error.response?.data?.errorMessage || error.message}`);
  }
}

function buildPassword() {
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14); // YYYYMMDDhhmmss
  const raw = `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`;
  return { password: Buffer.from(raw).toString('base64'), timestamp };
}

async function initiateStkPush({ amount, phoneNumber, accountReference = 'Investment' }) {
  try {
    // Validate inputs
    if (!MPESA_SHORTCODE || !MPESA_PASSKEY || !MPESA_CALLBACK_URL) {
      throw new Error('M-PESA configuration incomplete');
    }
    
    const token = await getToken();
    const { password, timestamp } = buildPassword();
    const url = endpoints().stk;

    const body = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: phoneNumber,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: 'Fortune Investment Payment'
    };

    console.log('Sending STK Push to:', url);
    console.log('STK Push payload:', { ...body, Password: '[HIDDEN]' });

    const res = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ STK Push response:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ STK Push error:', error.response?.data || error.message);
    throw new Error(`STK Push failed: ${error.response?.data?.errorMessage || error.message}`);
  }
}

module.exports = { initiateStkPush, getToken };
