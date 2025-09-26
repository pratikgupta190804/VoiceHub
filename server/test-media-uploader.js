require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const { TwitterMediaUploader } = require('./twitter-media-uploader');

// Enhanced logger
const logger = {
    info: (msg, meta = {}) => console.log(`[${new Date().toISOString()}] INFO:`, msg, meta ? JSON.stringify(meta, null, 2) : ''),
    error: (msg, meta = {}) => console.log(`[${new Date().toISOString()}] ERROR:`, msg, meta ? JSON.stringify(meta, null, 2) : ''),
    warn: (msg, meta = {}) => console.log(`[${new Date().toISOString()}] WARN:`, msg, meta ? JSON.stringify(meta, null, 2) : ''),
    debug: (msg, meta = {}) => console.log(`[${new Date().toISOString()}] DEBUG:`, msg, meta ? JSON.stringify(meta, null, 2) : '')
};

async function testTwitterMediaUploader() {
    console.log('🚀 Testing Twitter Media Uploader with proper JPEG format...');
    console.log('=' .repeat(60));
    
    const uploader = new TwitterMediaUploader();
    
    // Create a proper JPEG image buffer
    const canvas = createCanvas(200, 100);
    const ctx = canvas.getContext('2d');
    
    // Draw a simple test image
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, 200, 100);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.fillText('Test Image for Twitter', 20, 50);
    
    // Get JPEG buffer
    const imageBuffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
    
    logger.info('Created JPEG test image', {
        size: imageBuffer.length,
        type: 'image/jpeg'
    });
    
    try {
        logger.info('🔄 Uploading JPEG image to Twitter...');
        
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
        logger.error('❌ Upload error', {
            error: error.message,
            stack: error.stack
        });
        return null;
    }
}

// Test with real image URL from Cloudinary or similar
async function testUrlUpload() {
    console.log('\n🔄 Testing URL upload with real image...');
    
    const uploader = new TwitterMediaUploader();
    
    // Use a real image URL (you can replace with your own)
    const testUrls = [
        'https://picsum.photos/400/300.jpg',
        'https://via.placeholder.com/300x200.jpg'
    ];
    
    for (const url of testUrls) {
        try {
            logger.info('Testing URL upload', { url });
            
            const result = await uploader.uploadMediaFromUrl(url);
            
            if (result.success) {
                logger.info('✅ URL upload successful!', {
                    url,
                    mediaId: result.mediaId
                });
                return result.mediaId;
            } else {
                logger.error('❌ URL upload failed', { url, result });
            }
            
        } catch (error) {
            logger.error('❌ URL upload error', {
                url,
                error: error.message
            });
        }
    }
    
    return null;
}

async function runTests() {
    try {
        // Test 1: Buffer upload with proper JPEG
        const mediaId1 = await testTwitterMediaUploader();
        
        // Test 2: URL upload
        const mediaId2 = await testUrlUpload();
        
        console.log('\n🎉 Test Summary:');
        console.log('=' .repeat(30));
        console.log('Buffer upload media ID:', mediaId1 || 'FAILED');
        console.log('URL upload media ID:', mediaId2 || 'FAILED');
        
        if (mediaId1 || mediaId2) {
            console.log('✅ At least one upload method is working!');
        } else {
            console.log('❌ All upload methods failed. Check your API credentials.');
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
    runTests().catch(console.error);
}

module.exports = { testTwitterMediaUploader, testUrlUpload };