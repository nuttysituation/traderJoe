#!/usr/bin/env node

// NOTE: No secrets are present in this script. API key must be provided via environment variable.
const https = require('https');

// Get Alpha Vantage API key from environment variable
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const SYMBOL = 'AAPL';

// Check if API key is provided
if (!API_KEY) {
    console.log('❌ ERROR: ALPHA_VANTAGE_API_KEY environment variable not set');
    console.log('   Please set your Alpha Vantage API key:');
    console.log('   export ALPHA_VANTAGE_API_KEY="<your-key>"');
    console.log('   Get a free API key at: https://www.alphavantage.co/support/#api-key');
    process.exit(1);
}

const MASKED_KEY = API_KEY.substring(0, 2) + '****' + API_KEY.slice(-2);

console.log('🧪 Testing Alpha Vantage API...');
console.log(`📊 Testing stock symbol: ${SYMBOL}`);
console.log(`🔑 Using API key: ${MASKED_KEY}`);
console.log('');

// Make API request
const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${SYMBOL}&apikey=${API_KEY}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      console.log('📡 API Response:');
      console.log(JSON.stringify(result, null, 2));
      console.log('');

      if (result['Global Quote']) {
        const quote = result['Global Quote'];
        console.log('✅ SUCCESS! Stock data received:');
        console.log(`   Symbol: ${quote['01. symbol']}`);
        console.log(`   Price: $${quote['05. price']}`);
        console.log(`   Change: ${quote['09. change']}`);
        console.log(`   Change %: ${quote['10. change percent']}`);
        console.log(`   Volume: ${parseInt(quote['06. volume']).toLocaleString()}`);
        console.log('');
        console.log('🎉 Your Alpha Vantage API key is working perfectly!');
        console.log('');
        console.log('📋 Next steps:');
        console.log('   1. Install Node.js from https://nodejs.org/');
        console.log('   2. Install Docker from https://www.docker.com/');
        console.log('   3. Run: npm run install-all');
        console.log('   4. Run: docker-compose up -d');
        console.log('   5. Visit: http://localhost:3000/test');
      } else if (result['Error Message']) {
        console.log('❌ ERROR: ' + result['Error Message']);
        console.log('');
        console.log('🔧 Possible issues:');
        console.log('   - API key might be invalid');
        console.log('   - Rate limit exceeded (5 calls/minute for free tier)');
        console.log('   - Network connectivity issue');
      } else if (result['Note']) {
        console.log('⚠️  WARNING: ' + result['Note']);
        console.log('');
        console.log('📊 This usually means you hit the rate limit.');
        console.log('   Free tier allows 5 API calls per minute.');
        console.log('   Wait a minute and try again.');
      } else {
        console.log('❓ Unexpected response format');
        console.log('   Response:', result);
      }
    } catch (error) {
      console.log('❌ Error parsing response:', error.message);
    }
  });
}).on('error', (err) => {
  console.log('❌ Network error:', err.message);
  console.log('');
  console.log('🔧 Check your internet connection and try again.');
});

console.log('⏳ Making API request...');
console.log(''); 