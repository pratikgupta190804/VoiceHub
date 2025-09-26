# Complaint Controller Integration with Twitter API

## Overview

The `complaintController.js` has been completely updated to integrate with the Twitter API using the tested Twitter service. When users submit complaints through the complaint form, the system now:

1. **Validates** the complaint data and media files
2. **Uploads** media to Cloudinary
3. **Generates** compelling tweet content using Gemini AI
4. **Posts** to Twitter automatically using the Twitter service
5. **Saves** the complaint to the database with Twitter metadata
6. **Provides** comprehensive logging for debugging

## Key Features

### 🚀 **Automatic Tweet Generation & Posting**

- Uses Gemini AI to create compelling tweet content based on complaint description, location, and images
- Automatically tags relevant Mumbai authorities (@mybmc, @MumbaiPolice)
- Includes appropriate hashtags (#MumbaiCivicIssue, #CleanMumbai)
- Posts tweets with up to 4 images (Twitter limit)

### 📊 **Comprehensive Logging**

- Logs every step of the complaint submission process
- Creates daily log files: `logs/complaint-controller-YYYY-MM-DD.log`
- Tracks performance metrics and processing times
- Includes unique complaint IDs for easy tracking

### 🔄 **Robust Error Handling**

- Graceful fallback if Twitter posting fails
- Continues processing even if individual media uploads fail
- Development mode support when credentials are missing
- Detailed error reporting for debugging

### 🏥 **Health Check Endpoint**

- New `/api/complaints/health` endpoint
- Checks status of all integrated services (Twitter, Cloudinary, Gemini, Database)
- No authentication required - useful for monitoring

## Updated Endpoints

### 1. **POST /api/complaints/submit**

Submit a new complaint with automatic Twitter posting.

**Request:**

```javascript
// Form Data
{
  description: "Large pothole causing traffic issues",
  location: "Bandra West, Mumbai, Maharashtra",
  locationType: "street",
  media: [File1, File2, ...] // Up to 10 files
}

// Headers
{
  "Authorization": "Bearer JWT_TOKEN",
  "Content-Type": "multipart/form-data"
}
```

**Response:**

```javascript
{
  "message": "Complaint submitted successfully!",
  "complaintId": "64f7b1234567890abcdef123",
  "customComplaintId": "complaint_1695123456789_abc123def",
  "tweetText": "🚨 Large pothole at Bandra West causing traffic issues! @mybmc please take immediate action #MumbaiCivicIssue #FixOurRoads",
  "twitterResult": {
    "success": true,
    "tweetId": "1234567890123456789",
    "tweetUrl": "https://twitter.com/user/status/1234567890123456789",
    "message": "Tweet posted successfully with Twitter service"
  },
  "complaint": {
    "id": "64f7b1234567890abcdef123",
    "status": "posted",
    "location": "Bandra West, Mumbai, Maharashtra",
    "mediaCount": 2,
    "createdAt": "2023-09-19T10:30:00.000Z"
  }
}
```

### 2. **GET /api/complaints/user**

Get all complaints for the authenticated user.

**Response:**

```javascript
{
  "complaints": [
    {
      "_id": "64f7b1234567890abcdef123",
      "description": "Large pothole...",
      "location": "Bandra West, Mumbai",
      "status": "posted",
      "twitter": {
        "tweetId": "1234567890123456789",
        "tweetUrl": "https://twitter.com/user/status/1234567890123456789",
        "status": "posted",
        "postedAt": "2023-09-19T10:30:15.000Z"
      },
      "hasTwitterPost": true,
      "mediaCount": 2,
      "isRecent": true
    }
  ],
  "total": 1,
  "userId": "64f7a9876543210fedcba987"
}
```

### 3. **GET /api/complaints/:id**

Get a specific complaint by ID.

### 4. **GET /api/complaints/health** ⭐ NEW

Check the health of all integrated services.

**Response:**

```javascript
{
  "status": "healthy",
  "timestamp": "2023-09-19T10:30:00.000Z",
  "services": {
    "cloudinary": true,
    "gemini": true,
    "twitter": true,
    "database": true
  }
}
```

## Processing Flow

```
User Submits Complaint
         ↓
    Validate Input
         ↓
   Upload to Cloudinary
         ↓
  Generate Tweet with Gemini AI
         ↓
    Upload Media to Twitter
         ↓
      Post Tweet
         ↓
   Save to Database
         ↓
   Return Response
```

## Database Schema Updates

The `Complaint` model now includes:

```javascript
{
  // ... existing fields
  status: "pending" | "posted" | "failed",
  twitter: {
    tweetId: String,
    tweetUrl: String,
    status: "posted" | "failed",
    postedAt: Date,
    error: String,
    generatedText: String
  },
  metadata: {
    complaintId: String, // Custom tracking ID
    submittedAt: Date,
    processingTime: Number // milliseconds
  }
}
```

## Error Handling

### Common Scenarios:

1. **Missing Files**: Returns 400 with clear message
2. **Missing Location**: Returns 400 with clear message
3. **Unauthenticated User**: Returns 401
4. **Cloudinary Upload Fails**: Returns 500 with error details
5. **Twitter Posting Fails**: Saves complaint but marks Twitter status as "failed"
6. **Gemini AI Fails**: Uses fallback tweet template
7. **Database Save Fails**: Returns 500 with error details

### Logging Levels:

- **ERROR**: Critical failures that stop processing
- **WARN**: Issues that don't stop processing (like missing API keys)
- **INFO**: Important process steps and results
- **DEBUG**: Detailed technical information

## Testing

### Automated Tests

```bash
# Test the complaint controller
npm run test-complaint

# Test Twitter integration specifically
npm run test-twitter
```

### Manual Testing with Postman/curl

```bash
# 1. Test health check
curl http://localhost:5001/api/complaints/health

# 2. Submit complaint (need valid JWT)
curl -X POST http://localhost:5001/api/complaints/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "description=Test pothole complaint" \
  -F "location=Bandra West, Mumbai" \
  -F "locationType=street" \
  -F "media=@/path/to/image.jpg"

# 3. Get user complaints
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/complaints/user
```

## Configuration Required

Make sure your `.env` file has:

```bash
# Cloudinary (for media upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gemini AI (for tweet generation)
GEMINI_API_KEY=your_gemini_key

# Twitter API (for posting tweets)
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_secret
TWITTER_BEARER_TOKEN=your_bearer_token

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret
```

## Monitoring & Debugging

### Log Files Created:

- `logs/complaint-controller-YYYY-MM-DD.log` - Main controller logs
- `logs/twitter-service-YYYY-MM-DD.log` - Twitter service logs
- `logs/twitter-test-YYYY-MM-DD.log` - Twitter testing logs

### Key Metrics Logged:

- Processing time per complaint
- Media upload success rates
- Twitter posting success rates
- Error frequencies and types
- User activity patterns

### Health Monitoring:

- Use `/api/complaints/health` endpoint for service monitoring
- Set up alerts based on service status
- Monitor log files for error patterns

## Production Considerations

1. **Rate Limits**: Twitter has strict rate limits - monitor usage
2. **Error Alerts**: Set up monitoring for failed tweet postings
3. **Log Rotation**: Set up log file rotation for production
4. **Fallback Mode**: System works even if Twitter credentials are missing
5. **Performance**: Media processing can be slow - consider background queues for large files

## Integration with Frontend

The frontend complaint form should:

1. Show loading states during processing
2. Display Twitter posting results to users
3. Handle both success and failure scenarios gracefully
4. Show tweet links when available
5. Provide retry options for failed submissions
