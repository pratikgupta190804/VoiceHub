#!/usr/bin/env node

/**
 * AI Detection Script
 * Standalone script to detect AI-generated images and videos
 * Usage: node ai-detection-script.js <media_url> [media_type] [providers]
 */

const AIDetectionService = require('./services/ai-detection-service');
require('dotenv').config();

class AIDetectionScript {
  constructor() {
    this.detector = new AIDetectionService();
  }

  /**
   * Parse command line arguments
   */
  parseArguments() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      this.showUsage();
      process.exit(1);
    }

    return {
      mediaUrl: args[0],
      mediaType: args[1] || 'image',
      providers: args[2] ? args[2].split(',') : ['aiornot']
    };
  }

  /**
   * Show usage information
   */
  showUsage() {
    console.log(`
🤖 AI Content Detection Script
===============================

Usage: node ai-detection-script.js <media_url> [media_type] [providers]

Arguments:
  media_url    Required. URL of the image or video to analyze
  media_type   Optional. 'image' or 'video' (default: 'image')
  providers    Optional. Comma-separated list of providers (default: 'aiornot')
               Available: aiornot, hiveai, sensityai

Examples:
  node ai-detection-script.js "https://example.com/image.jpg"
  node ai-detection-script.js "https://example.com/video.mp4" "video"
  node ai-detection-script.js "https://example.com/image.jpg" "image" "aiornot,hiveai"

Environment Variables Required:
  AI_OR_NOT_API_KEY     - API key for AI or Not service
  HIVE_AI_API_KEY       - API key for Hive AI service  
  SENSITY_AI_API_KEY    - API key for Sensity AI service

Get API Keys:
  AI or Not: https://aiornot.com/
  Hive AI: https://thehive.ai/
  Sensity AI: https://sensity.ai/
`);
  }

  /**
   * Validate URL format
   */
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Format and display results
   */
  displayResults(results) {
    console.log(`
🔍 AI DETECTION RESULTS
========================
    
📄 Media URL: ${results.mediaUrl}
📊 Media Type: ${results.mediaType}
🎯 AI Generated: ${results.isAIGenerated ? '⚠️  YES' : '✅ NO'}
📈 Confidence: ${(results.confidence * 100).toFixed(1)}%
🏆 Recommendation: ${results.recommendation}
🔬 Providers Tested: ${results.successful_detections}/${results.providers_tested}
📅 Timestamp: ${results.timestamp}
`);

    if (results.individual_results && results.individual_results.length > 0) {
      console.log(`📋 INDIVIDUAL PROVIDER RESULTS:`);
      console.log(`${'='.repeat(50)}`);
      
      results.individual_results.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        const aiStatus = result.isAIGenerated ? '⚠️  AI' : '✅ Human';
        const confidence = result.success ? `${(result.confidence * 100).toFixed(1)}%` : 'N/A';
        
        console.log(`
${index + 1}. ${result.provider.toUpperCase()} ${status}
   Result: ${aiStatus}
   Confidence: ${confidence}
   ${result.error ? `Error: ${result.error}` : 'Success'}`);
        
        if (result.details && result.success) {
          console.log(`   Details:`);
          Object.entries(result.details).forEach(([key, value]) => {
            if (typeof value === 'number') {
              console.log(`     ${key}: ${(value * 100).toFixed(1)}%`);
            } else {
              console.log(`     ${key}: ${value}`);
            }
          });
        }
      });
    }

    // Risk assessment
    console.log(`\n🚨 RISK ASSESSMENT:`);
    console.log(`${'='.repeat(30)}`);
    
    if (results.confidence > 0.8) {
      console.log(`🔴 HIGH RISK - Very likely AI-generated content`);
      console.log(`   Recommendation: Flag for manual review or reject`);
    } else if (results.confidence > 0.5) {
      console.log(`🟡 MEDIUM RISK - Possibly AI-generated content`);
      console.log(`   Recommendation: Additional verification needed`);
    } else if (results.confidence > 0.2) {
      console.log(`🟡 LOW RISK - Unlikely AI-generated content`);
      console.log(`   Recommendation: Likely authentic, proceed with caution`);
    } else {
      console.log(`🟢 MINIMAL RISK - Very unlikely AI-generated content`);
      console.log(`   Recommendation: Content appears authentic`);
    }
  }

  /**
   * Main execution function
   */
  async run() {
    console.log(`🚀 Starting AI Content Detection Script...`);
    
    try {
      // Parse arguments
      const { mediaUrl, mediaType, providers } = this.parseArguments();
      
      // Validate URL
      if (!this.isValidUrl(mediaUrl)) {
        console.error(`❌ Error: Invalid URL format: ${mediaUrl}`);
        process.exit(1);
      }

      // Validate media type
      if (!['image', 'video'].includes(mediaType.toLowerCase())) {
        console.error(`❌ Error: Invalid media type. Use 'image' or 'video'`);
        process.exit(1);
      }

      // Validate providers
      const validProviders = ['aiornot', 'hiveai', 'sensityai'];
      const invalidProviders = providers.filter(p => !validProviders.includes(p));
      if (invalidProviders.length > 0) {
        console.error(`❌ Error: Invalid providers: ${invalidProviders.join(', ')}`);
        console.error(`   Valid providers: ${validProviders.join(', ')}`);
        process.exit(1);
      }

      console.log(`📊 Configuration:`);
      console.log(`   URL: ${mediaUrl}`);
      console.log(`   Type: ${mediaType}`);
      console.log(`   Providers: ${providers.join(', ')}`);
      console.log(``);

      // Run detection
      const results = await this.detector.detectAIContent(mediaUrl, mediaType, providers);
      
      // Display results
      this.displayResults(results);

      // Exit with appropriate code
      if (!results.success) {
        console.log(`\n❌ Detection failed. Check your API keys and network connection.`);
        process.exit(1);
      }

      console.log(`\n✅ Detection completed successfully!`);
      process.exit(0);

    } catch (error) {
      console.error(`❌ Script error: ${error.message}`);
      console.error(`Stack trace: ${error.stack}`);
      process.exit(1);
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  const script = new AIDetectionScript();
  script.run();
}

module.exports = AIDetectionScript;