#!/usr/bin/env node

/**
 * Test script for AI detection service
 * Tests the AI detection functionality with sample images
 */

const AIDetectionService = require('./services/ai-detection-service');
const AIDetectionIntegration = require('./services/ai-detection-integration');
require('dotenv').config();

async function runTests() {
  console.log(`🧪 AI Detection Service Test Suite`);
  console.log(`${'='.repeat(50)}`);

  // Sample test URLs (you can replace these with actual test images)
  const testImages = [
    {
      url: 'https://picsum.photos/800/600?random=1',
      description: 'Real photo from Picsum',
      expectedAI: false
    },
    {
      url: 'https://picsum.photos/800/600?random=2', 
      description: 'Real photo from Picsum',
      expectedAI: false
    }
  ];

  // Test 1: Service initialization
  console.log(`\n📋 Test 1: Service Initialization`);
  console.log(`${'='.repeat(30)}`);
  
  const detector = new AIDetectionService();
  const integration = new AIDetectionIntegration();
  
  console.log(`✅ AIDetectionService initialized`);
  console.log(`✅ AIDetectionIntegration initialized`);
  console.log(`🔧 AI Detection configured: ${integration.isConfigured()}`);

  // Test 2: Configuration check
  console.log(`\n📋 Test 2: Configuration Check`);
  console.log(`${'='.repeat(30)}`);
  
  const apiKeys = {
    'AI or Not': !!process.env.AI_OR_NOT_API_KEY,
    'Hive AI': !!process.env.HIVE_AI_API_KEY,
    'Sensity AI': !!process.env.SENSITY_AI_API_KEY
  };

  Object.entries(apiKeys).forEach(([service, configured]) => {
    console.log(`${configured ? '✅' : '❌'} ${service}: ${configured ? 'Configured' : 'Not configured'}`);
  });

  // Test 3: Single image detection (if APIs are configured)
  if (integration.isConfigured()) {
    console.log(`\n📋 Test 3: Single Image Detection`);
    console.log(`${'='.repeat(30)}`);

    try {
      const testImage = testImages[0];
      console.log(`🔍 Testing: ${testImage.description}`);
      console.log(`📷 URL: ${testImage.url}`);
      
      const result = await detector.detectAIContent(testImage.url, 'image', ['aiornot']);
      
      console.log(`📊 Results:`);
      console.log(`   AI Generated: ${result.isAIGenerated ? '⚠️  YES' : '✅ NO'}`);
      console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   Success: ${result.success}`);
      console.log(`   Providers: ${result.successful_detections}/${result.providers_tested}`);

    } catch (error) {
      console.log(`❌ Single detection test failed: ${error.message}`);
    }

    // Test 4: Batch detection
    console.log(`\n📋 Test 4: Batch Detection`);
    console.log(`${'='.repeat(30)}`);

    try {
      console.log(`🔍 Testing batch detection with ${testImages.length} images`);
      
      const testUrls = testImages.map(img => img.url);
      const batchResults = await detector.detectMultipleMedia(testUrls, 'image', ['aiornot']);
      
      console.log(`📊 Batch Results:`);
      batchResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.isAIGenerated ? '⚠️  AI' : '✅ Human'} (${(result.confidence * 100).toFixed(1)}%)`);
      });

    } catch (error) {
      console.log(`❌ Batch detection test failed: ${error.message}`);
    }

    // Test 5: Integration workflow
    console.log(`\n📋 Test 5: Integration Workflow`);
    console.log(`${'='.repeat(30)}`);

    try {
      const testComplaintId = `test_complaint_${Date.now()}`;
      const testMediaUrls = [testImages[0].url];
      
      console.log(`🔍 Testing complaint processing workflow`);
      console.log(`📝 Complaint ID: ${testComplaintId}`);
      console.log(`📁 Media files: ${testMediaUrls.length}`);
      
      const processingResult = await integration.processComplaintMedia(testMediaUrls, testComplaintId);
      
      console.log(`📊 Processing Results:`);
      console.log(`   Success: ${processingResult.success}`);
      console.log(`   Action: ${processingResult.action}`);
      console.log(`   Flagged: ${processingResult.flagged}`);
      console.log(`   Blocked: ${processingResult.blocked}`);
      console.log(`   Message: ${processingResult.message}`);

    } catch (error) {
      console.log(`❌ Integration workflow test failed: ${error.message}`);
    }

  } else {
    console.log(`\n⚠️  Skipping API tests - No API keys configured`);
    console.log(`   Configure API keys in .env file to run full tests`);
    console.log(`   See .env.ai-detection.example for configuration template`);
  }

  // Test 6: URL validation
  console.log(`\n📋 Test 6: URL Validation`);
  console.log(`${'='.repeat(30)}`);

  const testUrls = [
    { url: 'https://example.com/image.jpg', valid: true },
    { url: 'not-a-url', valid: false },
    { url: 'ftp://example.com/image.jpg', valid: true },
    { url: '', valid: false }
  ];

  testUrls.forEach(test => {
    try {
      new URL(test.url);
      const isValid = true;
      console.log(`${isValid === test.valid ? '✅' : '❌'} "${test.url}" - ${isValid ? 'Valid' : 'Invalid'}`);
    } catch {
      const isValid = false;
      console.log(`${isValid === test.valid ? '✅' : '❌'} "${test.url}" - ${isValid ? 'Valid' : 'Invalid'}`);
    }
  });

  console.log(`\n🎉 Test Suite Complete!`);
  console.log(`${'='.repeat(50)}`);
  
  // Usage examples
  console.log(`\n📚 Usage Examples:`);
  console.log(`   Standalone script:`);
  console.log(`     node ai-detection-script.js "https://example.com/image.jpg"`);
  console.log(`     node ai-detection-script.js "https://example.com/video.mp4" "video" "aiornot,hiveai"`);
  console.log(``);
  console.log(`   In your application:`);
  console.log(`     const integration = new AIDetectionIntegration();`);
  console.log(`     const result = await integration.processComplaintMedia(mediaUrls, complaintId);`);
}

// Run tests
if (require.main === module) {
  runTests().catch(error => {
    console.error(`❌ Test suite failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests };