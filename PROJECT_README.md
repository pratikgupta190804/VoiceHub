# SilentShout - Civic Complaint Platform

SilentShout is a modern web application that allows citizens to report civic issues and automatically posts them to Twitter for increased visibility and faster resolution.

## Features

### 🚨 **Civic Complaint Reporting**

- Upload images and videos of civic issues
- Add detailed descriptions and location information
- Auto-detect location using GPS
- Manual location entry support

### 🤖 **AI-Powered Tweet Generation**

- Uses Google Gemini AI to create compelling tweets
- Analyzes uploaded images and descriptions
- Automatically tags relevant authorities (@mybmc, @MumbaiPolice)
- Includes appropriate hashtags for better reach

### 🐦 **Automatic Twitter Integration**

- Posts complaints directly to Twitter
- Uploads up to 4 images per tweet
- Provides tweet URLs for tracking
- Handles rate limits gracefully

### 📊 **User Dashboard**

- View all submitted complaints
- Track Twitter posting status
- See complaint resolution progress
- Access complaint history

## Tech Stack

### Backend

- **Node.js** with Express.js
- **MongoDB** for data storage
- **Cloudinary** for media storage
- **Google Gemini AI** for tweet generation
- **Twitter API v2** for posting tweets
- **JWT** for authentication

### Frontend

- **React** with Vite
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Router** for navigation

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Twitter Developer Account
- Cloudinary Account
- Google AI Studio Account (for Gemini API)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/19shubhamgupta/SilentShout.git
   cd SilentShout
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `server` directory:

   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # JWT
   JWT_SECRET=your_jwt_secret

   # Server
   PORT=5001
   NODE_ENV=development

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Google Gemini AI
   GEMINI_API_KEY=your_gemini_api_key

   # Twitter API
   TWITTER_API_KEY=your_api_key
   TWITTER_API_SECRET=your_api_secret
   TWITTER_ACCESS_TOKEN=your_access_token
   TWITTER_ACCESS_TOKEN_SECRET=your_access_secret
   TWITTER_BEARER_TOKEN=your_bearer_token

   # Client URL (for production)
   CLIENT_URL=your_production_client_url
   ```

4. **Start the application**

   ```bash
   # From the root directory
   npm run dev
   ```

   This will start:

   - Backend server on `http://localhost:5001`
   - Frontend on `http://localhost:5173` (or 5174 if 5173 is busy)

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status

### Complaint Endpoints

- `POST /api/complaints/submit` - Submit a new complaint
- `GET /api/complaints/user` - Get user's complaints
- `GET /api/complaints/:id` - Get specific complaint
- `GET /api/complaints/health` - Service health check

## Project Structure

```
SilentShout/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and configurations
│   │   └── store/         # State management
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Custom middlewares
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── lib/               # Utilities and configurations
│   └── package.json
└── package.json           # Root package.json
```

## Key Features Implementation

### Complaint Submission Flow

1. User uploads media files (images/videos)
2. Files are uploaded to Cloudinary
3. Gemini AI analyzes content and generates tweet text
4. Media is uploaded to Twitter
5. Tweet is posted with generated content
6. Complaint is saved to database with Twitter metadata

### Twitter Integration

- Uses OAuth 1.0a for posting tweets
- Supports image uploads (up to 4 per tweet)
- Handles rate limits gracefully
- Provides fallback mechanisms

### Error Handling

- Comprehensive logging system
- Graceful degradation when services fail
- User-friendly error messages
- Development and production modes

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please:

1. Check the logs in the `logs/` directory
2. Use the health check endpoint: `/api/complaints/health`
3. Create an issue on GitHub

## Acknowledgments

- Mumbai BMC for inspiring civic engagement
- Twitter API for social media integration
- Google Gemini AI for intelligent content generation
- All contributors who help make civic reporting more effective

---

**Made with ❤️ for better civic engagement**
