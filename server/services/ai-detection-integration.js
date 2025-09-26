const AIDetectionService = require('./ai-detection-service');

/**
 * AI Content Detection Integration for Complaint System
 * Integrates AI detection into the complaint submission workflow
 */
class AIDetectionIntegration {
  constructor() {
    this.detector = new AIDetectionService();
    this.config = {
      // Threshold for blocking content (0.0 - 1.0)
      blockingThreshold: 0.8,
      // Threshold for flagging content for review (0.0 - 1.0)
      flaggingThreshold: 0.5,
      // Default providers to use
      defaultProviders: ['aiornot'],
      // Enable/disable AI detection
      enabled: process.env.AI_DETECTION_ENABLED === 'true' || false,
      // Action when detection fails (continue, flag, block)
      onDetectionFailure: process.env.AI_DETECTION_FAILURE_ACTION || 'continue'
    };
  }

  /**
   * Check if AI detection is properly configured
   * @returns {boolean} True if configured
   */
  isConfigured() {
    const hasApiKeys = process.env.AI_OR_NOT_API_KEY || 
                       process.env.HIVE_AI_API_KEY || 
                       process.env.SENSITY_AI_API_KEY;
    return this.config.enabled && hasApiKeys;
  }

  /**
   * Process media files for AI detection during complaint submission
   * @param {Array} mediaUrls - Array of media URLs to check
   * @param {string} complaintId - ID of the complaint for logging
   * @returns {Object} Processing result
   */
  async processComplaintMedia(mediaUrls, complaintId) {
    console.log(`🔍 [AI DETECTION] Processing complaint ${complaintId} media`);
    console.log(`🔍 [AI DETECTION] Media files: ${mediaUrls.length}`);
    console.log(`🔍 [AI DETECTION] Detection enabled: ${this.config.enabled}`);

    // Skip if not configured
    if (!this.isConfigured()) {
      console.log(`⚠️ [AI DETECTION] AI detection not configured, skipping`);
      return {
        success: true,
        action: 'continue',
        message: 'AI detection not configured',
        detectionResults: [],
        flagged: false,
        blocked: false
      };
    }

    try {
      const detectionResults = [];
      let highestConfidence = 0;
      let totalAIDetections = 0;

      // Process each media file
      for (let i = 0; i < mediaUrls.length; i++) {
        const mediaUrl = mediaUrls[i];
        const mediaType = this.guessMediaType(mediaUrl);
        
        console.log(`🔍 [AI DETECTION] Processing file ${i + 1}/${mediaUrls.length}: ${mediaUrl}`);
        
        const result = await this.detector.detectAIContent(
          mediaUrl, 
          mediaType, 
          this.config.defaultProviders
        );

        detectionResults.push({
          mediaUrl,
          mediaType,
          ...result
        });

        if (result.success) {
          highestConfidence = Math.max(highestConfidence, result.confidence);
          if (result.isAIGenerated) {
            totalAIDetections++;
          }
        }

        // Add delay between detections
        if (i < mediaUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Determine action based on results
      const processingResult = this.determineAction(
        detectionResults, 
        highestConfidence, 
        totalAIDetections, 
        mediaUrls.length,
        complaintId
      );

      console.log(`🔍 [AI DETECTION] Processing complete for complaint ${complaintId}`);
      console.log(`🔍 [AI DETECTION] Action: ${processingResult.action}`);
      console.log(`🔍 [AI DETECTION] Highest confidence: ${(highestConfidence * 100).toFixed(1)}%`);
      console.log(`🔍 [AI DETECTION] AI detections: ${totalAIDetections}/${mediaUrls.length}`);

      return processingResult;

    } catch (error) {
      console.log(`❌ [AI DETECTION] Error processing complaint ${complaintId}: ${error.message}`);
      
      // Handle detection failure based on configuration
      const failureAction = this.config.onDetectionFailure;
      
      return {
        success: false,
        action: failureAction,
        message: `AI detection failed: ${error.message}`,
        error: error.message,
        detectionResults: [],
        flagged: failureAction === 'flag',
        blocked: failureAction === 'block'
      };
    }
  }

  /**
   * Determine what action to take based on detection results
   */
  determineAction(detectionResults, highestConfidence, totalAIDetections, totalFiles, complaintId) {
    const aiPercentage = totalFiles > 0 ? totalAIDetections / totalFiles : 0;
    
    // Block if confidence is above blocking threshold
    if (highestConfidence >= this.config.blockingThreshold) {
      console.log(`🚫 [AI DETECTION] Blocking complaint ${complaintId} - high AI confidence`);
      return {
        success: true,
        action: 'block',
        message: `Content blocked due to high AI detection confidence (${(highestConfidence * 100).toFixed(1)}%)`,
        detectionResults,
        flagged: false,
        blocked: true,
        aiConfidence: highestConfidence,
        aiDetectionPercentage: aiPercentage
      };
    }

    // Flag if confidence is above flagging threshold
    if (highestConfidence >= this.config.flaggingThreshold || aiPercentage >= 0.5) {
      console.log(`🏁 [AI DETECTION] Flagging complaint ${complaintId} for review`);
      return {
        success: true,
        action: 'flag',
        message: `Content flagged for review due to potential AI generation (${(highestConfidence * 100).toFixed(1)}% confidence)`,
        detectionResults,
        flagged: true,
        blocked: false,
        aiConfidence: highestConfidence,
        aiDetectionPercentage: aiPercentage
      };
    }

    // Continue normally
    console.log(`✅ [AI DETECTION] Allowing complaint ${complaintId} - no AI detected`);
    return {
      success: true,
      action: 'continue',
      message: 'Content appears to be authentic',
      detectionResults,
      flagged: false,
      blocked: false,
      aiConfidence: highestConfidence,
      aiDetectionPercentage: aiPercentage
    };
  }

  /**
   * Guess media type from URL
   */
  guessMediaType(url) {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.mp4') || lowerUrl.includes('.mov') || 
        lowerUrl.includes('.avi') || lowerUrl.includes('.webm')) {
      return 'video';
    }
    return 'image';
  }

  /**
   * Update complaint record with AI detection results
   */
  async updateComplaintWithAIResults(complaintId, aiDetectionResults) {
    console.log(`💾 [AI DETECTION] Updating complaint ${complaintId} with AI detection results`);
    
    try {
      // This would integrate with your complaint model
      // Add AI detection results to the complaint metadata
      const updateData = {
        aiDetection: {
          processed: true,
          processedAt: new Date(),
          results: aiDetectionResults.detectionResults,
          action: aiDetectionResults.action,
          flagged: aiDetectionResults.flagged,
          blocked: aiDetectionResults.blocked,
          confidence: aiDetectionResults.aiConfidence,
          message: aiDetectionResults.message
        }
      };

      // You would add this to your Complaint model:
      // await Complaint.findByIdAndUpdate(complaintId, { $set: updateData });
      
      console.log(`✅ [AI DETECTION] Complaint ${complaintId} updated with AI detection results`);
      return true;
      
    } catch (error) {
      console.log(`❌ [AI DETECTION] Failed to update complaint ${complaintId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate a summary report for AI detection results
   */
  generateDetectionReport(detectionResults) {
    const report = {
      timestamp: new Date().toISOString(),
      totalFiles: detectionResults.length,
      successfulDetections: detectionResults.filter(r => r.success).length,
      aiGeneratedFiles: detectionResults.filter(r => r.isAIGenerated).length,
      averageConfidence: 0,
      highestConfidence: 0,
      providersUsed: new Set(),
      detectionSummary: []
    };

    let totalConfidence = 0;
    let successfulCount = 0;

    detectionResults.forEach(result => {
      if (result.success) {
        totalConfidence += result.confidence;
        successfulCount++;
        report.highestConfidence = Math.max(report.highestConfidence, result.confidence);
        
        result.individual_results?.forEach(individualResult => {
          if (individualResult.success) {
            report.providersUsed.add(individualResult.provider);
          }
        });
      }

      report.detectionSummary.push({
        mediaUrl: result.mediaUrl,
        mediaType: result.mediaType,
        isAIGenerated: result.isAIGenerated,
        confidence: result.confidence,
        success: result.success
      });
    });

    report.averageConfidence = successfulCount > 0 ? totalConfidence / successfulCount : 0;
    report.providersUsed = Array.from(report.providersUsed);

    return report;
  }
}

module.exports = AIDetectionIntegration;