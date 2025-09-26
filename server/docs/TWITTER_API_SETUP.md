# Twitter API Testing Guide

This guide helps you test and debug Twitter API integration in the SilentShout project.

## Files Created

1. **`test-twitter-post.js`** - Comprehensive Twitter API test script with detailed logging
2. **`run-twitter-test.js`** - Simple test runner script  
3. **`services/twitterService.js`** - Updated Twitter service with proper API client
4. **`.env-twitter-config-help.txt`** - Configuration troubleshooting guide

## Quick Start

### 1. Fix Your Environment Variables

Your current `.env` file has some issues. Please update these values:

```bash
# Replace these in your .env file:
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAACR+4QEAAAAA6FZBgElkzzdZTfEtQxwsCyGda14=6h3nYDw5ZbGgZp9EVVkAFtnA82mjwI4TfczPGn2qyrG8BDbv6o
X_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAACR+4QEAAAAA6FZBgElkzzdZTfEtQxwsCyGda14=6h3nYDw5ZbGgZp9EVVkAFtnA82mjwI4TfczPGn2qyrG8BDbv6o
```

**Note:** Your original Bearer token was URL encoded (`%2B` instead of `+`). The scripts will auto-decode it, but it's better to store it correctly.

### 2. Run the Test

```bash
# Navigate to server directory
cd server

# Run the comprehensive test
npm run test-twitter

# Or run the standalone test
npm run test-twitter-standalone
```

### 3. Check the Logs

After running the test, check the detailed logs in:
- `logs/twitter-test-YYYY-MM-DD.log`
- `logs/twitter-service-YYYY-MM-DD.log`

## What the Test Does

1. ✅ **Configuration Validation** - Checks all required API keys
2. ✅ **Client Initialization** - Sets up OAuth 1.0a and Bearer Token clients  
3. ✅ **Authentication Test** - Verifies credentials work
4. ✅ **Post Dummy Tweet** - Actually posts a test tweet
5. ✅ **Rate Limit Check** - Shows current API limits
6. ✅ **Error Handling** - Comprehensive error logging and fallback methods

## Expected Output

### Success:
```
🚀 Starting comprehensive Twitter API test...
STEP 1: Configuration validation ✓
STEP 2: Client initialization ✓  
STEP 3: Authentication test ✓
STEP 4: Posting dummy tweet ✅
🎉 All tests completed successfully!
Tweet URL: https://twitter.com/user/status/1234567890
```

### Common Issues:

#### 1. **401 Unauthorized**
- Check your API keys are correct
- Ensure your Twitter App has "Read and Write" permissions
- Regenerate Access Token after changing permissions

#### 2. **403 Forbidden**  
- Your app lacks write permissions
- Go to Twitter Developer Portal > Your App > Settings > User authentication settings
- Enable "Read and Write" permissions
- Regenerate Access Token and Secret

#### 3. **429 Rate Limited**
- You've exceeded API limits
- Wait 15 minutes and try again
- Check rate limits with the test script

#### 4. **Missing Credentials**
- Ensure all 4 OAuth credentials are in .env:
  - `TWITTER_API_KEY`
  - `TWITTER_API_SECRET` 
  - `TWITTER_ACCESS_TOKEN`
  - `TWITTER_ACCESS_TOKEN_SECRET`

## Twitter Developer App Setup

If you need to set up or modify your Twitter Developer App:

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal)
2. Select your app
3. Go to "Settings" tab
4. Click "Set up" under "User authentication settings"
5. Enable "OAuth 1.0a" 
6. Set permissions to "Read and Write"
7. Add callback URLs (can be localhost for testing)
8. Save settings
9. Go to "Keys and tokens" tab
10. Regenerate "Access Token and Secret" (important after permission changes)
11. Copy all 4 credentials to your .env file

## Integration with Main App

The updated `complaintController.js` now uses the new `twitterService.js`, which provides:

- Proper OAuth 1.0a authentication
- Automatic media upload handling
- Comprehensive error handling and logging
- Fallback to development mode if credentials are missing

## Debugging Tips

1. **Check log files** - All operations are logged with timestamps
2. **Verify permissions** - Most issues are permission-related
3. **Test credentials separately** - Use the test scripts before integrating
4. **Monitor rate limits** - Twitter has strict rate limits
5. **Use development mode** - The service falls back gracefully when credentials are missing

## Need Help?

Check these files for more details:
- `.env-twitter-config-help.txt` - Configuration troubleshooting
- `logs/twitter-test-*.log` - Detailed test logs
- `logs/twitter-service-*.log` - Service operation logs

The test scripts provide comprehensive debugging information to help identify and fix any issues!