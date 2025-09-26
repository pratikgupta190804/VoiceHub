require('dotenv').config();
const { TwitterMediaUploader } = require('./twitter-media-uploader');
const axios = require('axios');

// Enhanced logger
const logger = {
    info: (msg, meta = {}) => console.log(`[${new Date().toISOString()}] INFO:`, msg, meta ? JSON.stringify(meta, null, 2) : ''),
    error: (msg, meta = {}) => console.log(`[${new Date().toISOString()}] ERROR:`, msg, meta ? JSON.stringify(meta, null, 2) : ''),
    warn: (msg, meta = {}) => console.log(`[${new Date().toISOString()}] WARN:`, msg, meta ? JSON.stringify(meta, null, 2) : ''),
    debug: (msg, meta = {}) => console.log(`[${new Date().toISOString()}] DEBUG:`, msg, meta ? JSON.stringify(meta, null, 2) : '')
};

async function testWithRealImage() {
    console.log('🚀 Testing Twitter Media Uploader with real image...');
    console.log('=' .repeat(60));
    
    const uploader = new TwitterMediaUploader();
    
    // Use a reliable image URL
    const imageUrl = 'https://httpbin.org/image/jpeg';
    
    try {
        logger.info('Downloading test image from httpbin.org...');
        
        // Download the image
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 10000
        });
        
        const imageBuffer = Buffer.from(response.data);
        
        logger.info('Image downloaded successfully', {
            size: imageBuffer.length,
            contentType: response.headers['content-type']
        });
        
        // Test upload
        logger.info('🔄 Uploading image to Twitter...');
        
        const result = await uploader.uploadMediaBuffer(imageBuffer, 'image/jpeg');
        
        if (result.success) {
            logger.info('✅ Media upload successful!', {
                mediaId: result.mediaId,
                size: result.size,
                imageType: result.imageType
            });
            
            return result.mediaId;
        } else {
            logger.error('❌ Media upload failed', result);
            return null;
        }
        
    } catch (error) {
        logger.error('❌ Test failed', {
            error: error.message,
            stack: error.stack
        });
        return null;
    }
}

async function testMultipleUrls() {
    console.log('\n🔄 Testing multiple URL uploads...');
    
    const uploader = new TwitterMediaUploader();
    
    // Multiple test URLs
    const testUrls = [
        'https://httpbin.org/image/jpeg',
        'https://httpbin.org/image/png'
    ];
    
    try {
        const results = await uploader.uploadMultipleMedia(testUrls);
        
        logger.info('✅ Multiple upload completed', {
            mediaIds: results,
            count: results.length
        });
        
        return results;
        
    } catch (error) {
        logger.error('❌ Multiple upload failed', {
            error: error.message
        });
        return [];
    }
}

async function runSimpleTests() {
    try {
        console.log('Starting simple Twitter media upload tests...\n');
        
        // Test 1: Single image upload
        const mediaId = await testWithRealImage();
        
        // Test 2: Multiple URLs
        const mediaIds = await testMultipleUrls();
        
        console.log('\n🎉 Test Results Summary:');
        console.log('=' .repeat(40));
        console.log('Single upload media ID:', mediaId || 'FAILED');
        console.log('Multiple upload media IDs:', mediaIds.length > 0 ? mediaIds : 'FAILED');
        
        if (mediaId || mediaIds.length > 0) {
            console.log('\n✅ Twitter media upload is working!');
            console.log('You can now use these media IDs to post tweets with images.');
        } else {
            console.log('\n❌ All uploads failed. Please check:');
            console.log('1. Your Twitter API credentials in .env');
            console.log('2. Your internet connection');
            console.log('3. Twitter API rate limits');
        }
        
    } catch (error) {
        logger.error('Test execution failed', {
            error: error.message,
            stack: error.stack
        });
    }
}

// Run the tests
if (require.main === module) {
    runSimpleTests().catch(console.error);
}

module.exports = { testWithRealImage, testMultipleUrls };