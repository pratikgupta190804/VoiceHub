# AI Detection System for SilentShout

A comprehensive AI content detection system that identifies AI-generated images and videos to ensure authenticity of civic complaints.

## 🎯 Overview

This system integrates multiple AI detection APIs to identify potentially AI-generated content in user submissions. It helps maintain the integrity of civic complaints by flagging or blocking suspicious media.

## 🔧 Features

- **Multiple Provider Support**: Integrates with AI or Not, Hive AI, and Sensity AI
- **Configurable Thresholds**: Set custom confidence levels for flagging and blocking
- **Batch Processing**: Analyze multiple media files efficiently
- **Detailed Reporting**: Comprehensive detection results and confidence scores
- **Flexible Integration**: Can be used standalone or integrated into existing workflows
- **Fallback Handling**: Graceful failure handling with configurable actions

## 📋 Supported APIs

### 1. AI or Not

- **Best for**: General AI-generated image detection
- **Free tier**: 100 requests/month
- **Signup**: https://aiornot.com/
- **Strengths**: Simple API, good for basic detection

### 2. Hive AI

- **Best for**: Content moderation with AI detection
- **Pricing**: Pay per request
- **Signup**: https://thehive.ai/
- **Strengths**: Multi-modal detection, good accuracy

### 3. Sensity AI

- **Best for**: Deepfake and face manipulation detection
- **Pricing**: Enterprise focused
- **Signup**: https://sensity.ai/
- **Strengths**: Specialized in face/video manipulation

## 🚀 Quick Start

### 1. Installation

```bash
cd server
npm install form-data
```

### 2. Configuration

Copy the environment template:

```bash
cp .env.ai-detection.example .env.local
```

Add your API keys to `.env`:

```bash
# Enable AI detection
AI_DETECTION_ENABLED=true

# Get API keys from the respective services
AI_OR_NOT_API_KEY=your_api_key_here
HIVE_AI_API_KEY=your_api_key_here
SENSITY_AI_API_KEY=your_api_key_here

# Configure thresholds (0.0 - 1.0)
AI_DETECTION_BLOCKING_THRESHOLD=0.8
AI_DETECTION_FLAGGING_THRESHOLD=0.5
```

### 3. Test the System

```bash
# Run test suite
node test-ai-detection.js

# Test single image
node ai-detection-script.js "https://example.com/image.jpg"

# Test with multiple providers
node ai-detection-script.js "https://example.com/image.jpg" "image" "aiornot,hiveai"
```

## 📖 Usage Examples

### Standalone Script

```bash
# Basic image detection
node ai-detection-script.js "https://example.com/suspicious-image.jpg"

# Video detection with multiple providers
node ai-detection-script.js "https://example.com/video.mp4" "video" "aiornot,sensityai"
```

### Integration in Complaint System

```javascript
const AIDetectionIntegration = require("./services/ai-detection-integration");

// Initialize service
const aiDetection = new AIDetectionIntegration();

// Process complaint media
const result = await aiDetection.processComplaintMedia(
  ["https://cloudinary.com/image1.jpg", "https://cloudinary.com/image2.jpg"],
  "complaint_123"
);

// Handle result
if (result.blocked) {
  // Block the complaint submission
  return res.status(400).json({
    success: false,
    message: "Content blocked due to AI detection",
  });
} else if (result.flagged) {
  // Flag for manual review but allow submission
  complaint.needsReview = true;
}
```

### Service API

```javascript
const AIDetectionService = require("./services/ai-detection-service");

const detector = new AIDetectionService();

// Single detection
const result = await detector.detectAIContent(
  "https://example.com/image.jpg",
  "image",
  ["aiornot", "hiveai"]
);

// Batch detection
const results = await detector.detectMultipleMedia(
  ["url1.jpg", "url2.jpg", "url3.mp4"],
  "image",
  ["aiornot"]
);
```

## 🔍 Detection Results

The system returns detailed detection results:

```javascript
{
  "success": true,
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "image",
  "isAIGenerated": false,
  "confidence": 0.23,
  "providers_tested": 2,
  "successful_detections": 2,
  "recommendation": "LOW_CONFIDENCE",
  "individual_results": [
    {
      "provider": "aiornot",
      "success": true,
      "isAIGenerated": false,
      "confidence": 0.15,
      "details": {
        "ai_probability": 0.15,
        "human_probability": 0.85,
        "model_version": "v2.1"
      }
    }
  ],
  "timestamp": "2025-09-27T10:30:00.000Z"
}
```

## ⚙️ Configuration Options

### Environment Variables

| Variable                          | Description                       | Default    |
| --------------------------------- | --------------------------------- | ---------- |
| `AI_DETECTION_ENABLED`            | Enable/disable AI detection       | `false`    |
| `AI_DETECTION_BLOCKING_THRESHOLD` | Confidence level to block content | `0.8`      |
| `AI_DETECTION_FLAGGING_THRESHOLD` | Confidence level to flag content  | `0.5`      |
| `AI_DETECTION_FAILURE_ACTION`     | Action on detection failure       | `continue` |
| `AI_DETECTION_DEFAULT_PROVIDERS`  | Default providers to use          | `aiornot`  |

### Thresholds Guide

| Confidence | Risk Level   | Recommended Action |
| ---------- | ------------ | ------------------ |
| 0.8 - 1.0  | High Risk    | Block content      |
| 0.5 - 0.8  | Medium Risk  | Flag for review    |
| 0.2 - 0.5  | Low Risk     | Allow with note    |
| 0.0 - 0.2  | Minimal Risk | Allow normally     |

## 🔄 Integration with Complaint Flow

The AI detection can be integrated into the complaint submission process:

```javascript
// In complaintController.js
const AIDetectionIntegration = require("./services/ai-detection-integration");
const aiDetection = new AIDetectionIntegration();

exports.submitComplaint = async (req, res) => {
  // ... existing code ...

  // After Cloudinary upload, before Twitter posting
  if (aiDetection.isConfigured()) {
    console.log("🔍 [AI DETECTION] Starting media analysis...");

    const detectionResult = await aiDetection.processComplaintMedia(
      mediaUrls,
      complaintId
    );

    if (detectionResult.blocked) {
      console.log("🚫 [AI DETECTION] Content blocked");
      return res.status(400).json({
        success: false,
        message: detectionResult.message,
        aiDetection: detectionResult,
      });
    }

    if (detectionResult.flagged) {
      console.log("🏁 [AI DETECTION] Content flagged for review");
      // Add flag to complaint metadata
      complaint.flaggedForReview = true;
      complaint.flagReason = detectionResult.message;
    }
  }

  // ... continue with existing flow ...
};
```

## 🧪 Testing

### Run Test Suite

```bash
node test-ai-detection.js
```

The test suite verifies:

- Service initialization
- API configuration
- Single image detection
- Batch processing
- Integration workflow
- URL validation

### Manual Testing

```bash
# Test with a real image
node ai-detection-script.js "https://picsum.photos/800/600"

# Test with potentially AI-generated content
node ai-detection-script.js "https://example.com/ai-generated-image.jpg"
```

## 🚨 Error Handling

The system includes comprehensive error handling:

- **API failures**: Graceful fallback with configurable actions
- **Network timeouts**: 30-60 second timeouts with retry logic
- **Invalid URLs**: URL validation before processing
- **Rate limiting**: Built-in delays between API calls
- **Missing configuration**: Clear error messages and skipping

## 📊 Monitoring and Logging

The system provides detailed logging:

```
🔍 [AI DETECTION] Starting AI detection with AI or Not API
🔍 [AI DETECTION] Media URL: https://example.com/image.jpg
🤖 [AI DETECTION] Sending request to AI or Not API...
✅ [AI DETECTION] AI or Not API response received
🔍 [AI DETECTION] Detection completed
```

## 🔐 Security Considerations

- API keys stored in environment variables
- No media content stored locally
- All processing via secure HTTPS APIs
- Rate limiting to prevent abuse
- Configurable failure modes

## 💰 Cost Estimation

| Provider   | Free Tier | Paid Plans     | Best For              |
| ---------- | --------- | -------------- | --------------------- |
| AI or Not  | 100/month | $0.01/request  | Small projects        |
| Hive AI    | None      | $0.005/request | Production use        |
| Sensity AI | None      | Enterprise     | High-stakes detection |

## 🤝 Contributing

To add new AI detection providers:

1. Add API configuration to `AIDetectionService`
2. Implement detection method
3. Add to provider options
4. Update tests and documentation

## 📝 License

This AI detection system is part of the SilentShout project and follows the same license terms.

---

**Ready to deploy?** Make sure to:

1. ✅ Configure API keys
2. ✅ Set appropriate thresholds
3. ✅ Test with sample content
4. ✅ Monitor detection results
5. ✅ Review flagged content regularly
