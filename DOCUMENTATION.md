# 🛡️ SilentShout - Civic Complaint Platform

## Overview

SilentShout is a comprehensive civic complaint management system that empowers citizens to report local issues and automatically amplifies them on social media for maximum impact. The platform combines modern web technologies with AI-powered content generation to create engaging civic awareness campaigns.

## 🏗️ System Architecture

### Backend Stack

- **Node.js/Express**: RESTful API server
- **MongoDB/Mongoose**: Document database for complaint storage
- **Cloudinary**: Media file storage and CDN
- **Twitter API v2 & v1.1**: Social media integration
- **Google Gemini AI**: Intelligent tweet content generation
- **Sharp**: Image processing and format conversion

### Frontend Stack

- **React**: Modern UI framework
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Axios**: HTTP client for API communication

### Authentication & Security

- **JWT**: Secure token-based authentication
- **bcrypt**: Password hashing
- **CORS**: Cross-origin resource sharing
- **Rate limiting**: API protection

## 🚀 Key Features

### 1. **Universal Image Support**

- Accepts all modern image formats (JPEG, PNG, AVIF, WebP, GIF)
- Automatic format conversion for Twitter compatibility
- Smart compression and optimization
- Multi-file upload support

### 2. **AI-Powered Tweet Generation**

- Google Gemini AI analyzes complaint context
- Generates engaging, location-specific tweets
- Includes relevant hashtags and mentions
- Fallback system for reliability

### 3. **Social Media Amplification**

- Automatic Twitter posting with images
- OAuth 1.0a authentication
- Media upload with Twitter API v1.1
- Real-time status tracking

### 4. **Geolocation Integration**

- Precise GPS coordinates capture
- Location-based complaint categorization
- Geographic data storage with MongoDB GeoJSON

### 5. **Real-time Processing**

- Instant media upload to Cloudinary
- Concurrent Twitter media processing
- Asynchronous complaint handling
- Status tracking throughout pipeline

## 📁 Project Structure

```
SilentShout/
├── server/
│   ├── controllers/
│   │   ├── authController.js         # User authentication
│   │   └── complaintController.js    # Main complaint handling
│   ├── models/
│   │   ├── User.js                   # User data schema
│   │   └── Complaint.js              # Complaint data schema
│   ├── routes/
│   │   ├── authRouter.js             # Auth endpoints
│   │   └── complaintRouter.js        # Complaint endpoints
│   ├── services/
│   │   └── twitterService.js         # Twitter API integration
│   ├── middlewares/
│   │   ├── checkUser.js              # Authentication middleware
│   │   └── multerUpload.js           # File upload handling
│   ├── lib/
│   │   ├── cloudinary.js             # Cloud storage config
│   │   ├── db.js                     # Database connection
│   │   ├── generateToken.js          # JWT utilities
│   │   └── google.js                 # Google OAuth
│   ├── twitter-media-uploader.js     # Custom Twitter media handler
│   ├── index.js                      # Server entry point
│   └── .env                          # Environment variables
├── client/
│   ├── src/
│   │   ├── Components/               # Reusable UI components
│   │   ├── Pages/                    # Application pages
│   │   ├── store/                    # State management
│   │   ├── lib/                      # Utilities
│   │   └── App.jsx                   # Main React component
│   ├── public/                       # Static assets
│   ├── index.html                    # Entry HTML
│   └── package.json                  # Frontend dependencies
└── README.md                         # This documentation
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Server Configuration
PORT=5001
NODE_ENV=development

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Twitter API Credentials
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret

# Google AI (Gemini) Configuration
GEMINI_API_KEY=your_gemini_api_key

# Google OAuth (Optional)
Client_ID=your_google_client_id
Client_secret=your_google_client_secret

# Client Configuration
CLIENT_URL=http://localhost:5174
```

### API Keys Setup

#### 1. Twitter API Setup

1. Apply for Twitter Developer Account
2. Create a new app in Twitter Developer Portal
3. Generate API keys and access tokens
4. Enable OAuth 1.0a authentication
5. Add keys to environment variables

#### 2. Google Gemini AI Setup

1. Visit Google AI Studio
2. Create a new project
3. Generate API key for Gemini
4. Add to environment variables

#### 3. Cloudinary Setup

1. Create Cloudinary account
2. Get cloud name, API key, and secret
3. Configure upload presets if needed

#### 4. MongoDB Setup

1. Create MongoDB Atlas cluster
2. Set up database user
3. Whitelist IP addresses
4. Get connection string

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- MongoDB database
- Twitter Developer Account
- Google AI API access
- Cloudinary account

### Step 1: Clone Repository

```bash
git clone https://github.com/19shubhamgupta/SilentShout.git
cd SilentShout
```

### Step 2: Backend Setup

```bash
cd server
npm install
```

### Step 3: Frontend Setup

```bash
cd ../client
npm install
```

### Step 4: Environment Configuration

Create `.env` file in server directory with all required variables (see Configuration section above).

### Step 5: Start Development Servers

```bash
# From project root
npm run dev
```

This will start:

- Backend server: http://localhost:5001
- Frontend client: http://localhost:5174

## 📡 API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Complaints

- `POST /api/complaints/submit` - Submit new complaint
- `GET /api/complaints/user` - Get user's complaints
- `GET /api/complaints/:id` - Get specific complaint
- `GET /api/complaints/health` - Health check

### Request/Response Examples

#### Submit Complaint

```javascript
// Request
POST /api/complaints/submit
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

{
  "description": "Overflowing garbage bin",
  "latitude": "19.0760",
  "longitude": "72.8777",
  "locationType": "auto",
  "files": [<image_files>]
}

// Response
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaint": {
    "id": "complaint_id",
    "description": "Overflowing garbage bin",
    "location": {...},
    "mediaUrls": ["https://cloudinary.com/..."],
    "status": "posted",
    "createdAt": "2025-09-26T...",
    "twitterData": {
      "tweetId": "1234567890",
      "tweetUrl": "https://twitter.com/...",
      "tweetText": "🗑️ Overflowing garbage..."
    }
  },
  "twitter": {
    "success": true,
    "tweetId": "1234567890",
    "tweetUrl": "https://twitter.com/...",
    "message": "Tweet posted successfully"
  }
}
```

## 🧠 AI Tweet Generation

The system uses Google Gemini AI to generate contextual, engaging tweets:

### Input Processing

- Location coordinates
- Complaint description (optional)
- Uploaded images (analyzed)
- User context

### AI Prompt Engineering

```javascript
const prompt = `Generate a compelling tweet about a civic complaint at location ${location} 
with the following issue: ${description}. Include relevant hashtags like 
#MumbaiCivicIssue, #CleanMumbai, #SwachhBharat, #CivicIssue and mention @mybmc 
if it's in Mumbai. Keep it under 280 characters and make it engaging to drive 
public attention to the issue.`;
```

### Fallback System

If AI generation fails, the system uses pre-defined templates:

- Location-based messages
- Issue-specific templates
- Generic civic complaint format

## 🖼️ Image Processing Pipeline

### Upload Flow

1. **Client Upload**: Files sent via multipart/form-data
2. **Server Validation**: File type, size, and format checks
3. **Cloudinary Storage**: Automatic upload with optimization
4. **Format Detection**: MIME type analysis
5. **Twitter Preparation**: Format conversion if needed
6. **Social Upload**: Twitter API v1.1 media upload
7. **Database Storage**: URLs and metadata saved

### Supported Formats

- **Input**: JPEG, PNG, AVIF, WebP, GIF, BMP, TIFF
- **Twitter Output**: JPEG, PNG, GIF, WebP (auto-converted)
- **Conversion**: AVIF → JPEG with 90% quality
- **Compression**: Automatic optimization by Cloudinary

## 🐦 Twitter Integration

### Authentication Flow

1. OAuth 1.0a signature generation
2. HMAC-SHA1 encryption
3. Authorization header creation
4. API request with credentials

### Media Upload Process

1. Download from Cloudinary URL
2. Format validation and conversion
3. Buffer preparation for Twitter
4. OAuth signature for upload endpoint
5. FormData creation with media
6. Upload to Twitter API v1.1
7. Media ID extraction
8. Tweet posting with media IDs

### Rate Limiting

- Built-in delays between uploads
- Concurrent upload limits (max 2)
- Retry logic for failed uploads
- Error handling and fallbacks

## 📱 Frontend Features

### User Interface

- **Modern Design**: Clean, intuitive interface
- **Responsive Layout**: Mobile-first approach
- **Real-time Feedback**: Upload progress and status
- **Interactive Maps**: Location selection and display
- **Media Preview**: Image thumbnails and validation

### User Experience

- **Geolocation**: Automatic location detection
- **File Drag & Drop**: Easy media upload
- **Form Validation**: Client-side input checking
- **Status Tracking**: Real-time complaint processing
- **History View**: Past complaints and their status

## 🔒 Security & Privacy

### Data Protection

- JWT-based authentication
- Secure password hashing
- HTTPS enforcement (production)
- Input sanitization
- File type validation

### Privacy Measures

- User data encryption
- Location data anonymization options
- Media file access control
- Twitter integration consent
- GDPR compliance ready

## 📊 Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String (unique),
  password: String (hashed),
  profilePic: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Complaint Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  description: String,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  locationType: String, // 'auto' | 'manual'
  mediaUrls: [String],
  status: String, // 'pending' | 'posted' | 'failed'
  twitterData: {
    tweetId: String,
    tweetText: String,
    tweetUrl: String,
    postedAt: Date
  },
  metadata: {
    complaintId: String,
    submittedAt: Date,
    ipAddress: String,
    userAgent: String,
    twitterSuccess: Boolean,
    twitterError: String,
    mediaCount: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🚨 Error Handling

### Client-Side Errors

- Network connectivity issues
- File size/format validation
- Form input validation
- Authentication expiry
- Upload progress tracking

### Server-Side Errors

- Database connection failures
- API rate limiting
- External service downtime
- File processing errors
- Authentication failures

### Error Response Format

```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details",
  "code": 400, // HTTP status code
  "timestamp": "2025-09-26T12:00:00.000Z"
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Twitter API 400 Error

**Problem**: Invalid media IDs being passed
**Solution**: Ensure media IDs are strings, not objects

#### 2. AVIF Images Not Uploading

**Problem**: Format not supported by Twitter
**Solution**: Automatic conversion to JPEG implemented

#### 3. Rate Limiting (429 Error)

**Problem**: Too many API requests
**Solution**: Built-in delays and retry logic

#### 4. Gemini AI Model Not Found

**Problem**: Model version changed
**Solution**: Fallback tweet generation active

#### 5. Database Connection Issues

**Problem**: MongoDB URI incorrect
**Solution**: Check connection string and network access

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
```

## 🎯 Performance Optimization

### Backend Optimizations

- Asynchronous processing
- Connection pooling
- Image compression
- API response caching
- Database indexing

### Frontend Optimizations

- Code splitting
- Lazy loading
- Image optimization
- Bundle size reduction
- Service worker caching

### Media Processing

- Sharp-based image conversion
- Cloudinary automatic optimization
- Concurrent upload handling
- Format-specific compression
- Progressive image loading

## 🚀 Deployment

### Production Environment

1. Set `NODE_ENV=production`
2. Configure HTTPS certificates
3. Set up reverse proxy (Nginx)
4. Enable database SSL
5. Configure monitoring and logging
6. Set up automated backups

### Environment Variables (Production)

```env
NODE_ENV=production
CLIENT_URL=https://your-domain.com
MONGODB_URI=mongodb+srv://prod-connection-string
# ... other production configs
```

### Monitoring

- Health check endpoints
- Error tracking
- Performance metrics
- API usage statistics
- User activity monitoring

## 📈 Scaling Considerations

### Horizontal Scaling

- Load balancer configuration
- Multiple server instances
- Database sharding
- CDN implementation
- Microservices architecture

### Vertical Scaling

- Server resource optimization
- Database performance tuning
- Memory usage optimization
- CPU-intensive task handling
- Network bandwidth management

## 🤝 Contributing

### Development Guidelines

1. Follow existing code structure
2. Maintain consistent formatting
3. Add comprehensive error handling
4. Include input validation
5. Write descriptive commit messages
6. Test thoroughly before submission

### Code Style

- Use meaningful variable names
- Add comments for complex logic
- Follow JavaScript ES6+ standards
- Maintain consistent indentation
- Use async/await for promises

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:

- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting section
- Contact development team

---

**SilentShout** - Empowering Citizens, Amplifying Voices, Creating Change 🗳️✊

_Built with ❤️ for civic engagement and social impact_
