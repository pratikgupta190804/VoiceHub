#!/usr/bin/env node

/**
 * Simple Twitter API Test Runner
 * Usage: node run-twitter-test.js
 */

const path = require('path');
require('dotenv').config();

console.log('🚀 Starting Twitter API Test...');
console.log('='.repeat(50));

// Import and run the test
const { TwitterAPITester } = require('./test-twitter-post');

async function runTest() {
  const tester = new TwitterAPITester();
  
  console.log('📋 Configuration Check:');
  console.log('- TWITTER_API_KEY:', process.env.TWITTER_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('- TWITTER_API_SECRET:', process.env.TWITTER_API_SECRET ? '✅ Set' : '❌ Missing');
  console.log('- TWITTER_ACCESS_TOKEN:', process.env.TWITTER_ACCESS_TOKEN ? '✅ Set' : '❌ Missing');
  console.log('- TWITTER_ACCESS_TOKEN_SECRET:', process.env.TWITTER_ACCESS_TOKEN_SECRET ? '✅ Set' : '❌ Missing');
  console.log('- TWITTER_BEARER_TOKEN:', process.env.TWITTER_BEARER_TOKEN ? '✅ Set' : '❌ Missing');
  console.log('');

  try {
    const result = await tester.runFullTest();
    
    console.log('🎉 SUCCESS! Tweet posted:', result.tweetUrl);
    console.log('📝 Log file created at: logs/twitter-test-*.log');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.log('📝 Check logs/twitter-test-*.log for detailed error information');
    
    console.log('\n💡 Common Issues & Solutions:');
    console.log('1. Missing API Keys: Add all Twitter API credentials to .env file');
    console.log('2. Invalid Permissions: Ensure your Twitter App has "Read and Write" permissions');
    console.log('3. URL Encoded Bearer Token: Check if token contains %2B and needs decoding');
    console.log('4. Rate Limits: Wait 15 minutes if you hit rate limits');
    console.log('5. App Not Approved: Some Twitter Developer accounts need approval');
    
    process.exit(1);
  }
}

// Also test the service class
async function testService() {
  console.log('\n🔧 Testing Twitter Service Class...');
  
  try {
    const twitterService = require('./services/twitterService');
    const status = twitterService.getStatus();
    
    console.log('Service Status:', status);
    
    if (status.hasCredentials) {
      const result = await twitterService.testConnection();
      console.log('Service Test Result:', result);
    } else {
      console.log('❌ Service missing credentials');
    }
    
  } catch (error) {
    console.error('Service test failed:', error.message);
  }
}

// Main execution
runTest()
  .then(() => testService())
  .then(() => {
    console.log('\n✅ All tests completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });