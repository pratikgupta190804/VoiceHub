// Test script for the frontend AI detection endpoint
require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testFrontendAIEndpoint() {
  console.log('🧪 Testing Frontend AI Detection Endpoint');
  console.log('=======================================\n');

  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    
    // Create form data
    const formData = new FormData();
    formData.append('media', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });

    console.log('📤 Sending test request to AI detection endpoint...');
    
    const response = await axios.post('http://localhost:5001/api/complaints/detect-ai', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer test-token' // Mock token for testing
      },
      timeout: 60000
    });

    console.log('✅ Response received successfully!');
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📄 Response status:', error.response.status);
      console.error('📄 Response data:', error.response.data);
    }
  }
}

testFrontendAIEndpoint();