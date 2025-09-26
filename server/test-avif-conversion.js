require('dotenv').config();
const { TwitterMediaUploader } = require('./twitter-media-uploader');
const axios = require('axios');

async function testAvifConversion() {
    console.log('🚀 Testing AVIF to JPEG conversion for Twitter upload...');
    console.log('=' .repeat(60));
    
    const uploader = new TwitterMediaUploader();
    
    // Test with the same AVIF URL from the logs
    const avifUrl = 'https://res.cloudinary.com/drymrm9rs/image/upload/v1758890041/complaints/rsobsti1e471olqhyl6w.avif';
    
    try {
        console.log('📥 Downloading AVIF image from Cloudinary...');
        
        // Download the AVIF image
        const response = await axios.get(avifUrl, {
            responseType: 'arraybuffer',
            timeout: 10000
        });
        
        const avifBuffer = Buffer.from(response.data);
        const originalMimeType = response.headers['content-type'] || 'image/avif';
        
        console.log('✅ AVIF image downloaded:', {
            size: avifBuffer.length,
            mimeType: originalMimeType
        });
        
        // Test conversion
        console.log('🔄 Testing format conversion...');
        const converted = await uploader.convertToSupportedFormat(avifBuffer, originalMimeType);
        
        console.log('✅ Conversion successful:', {
            originalSize: avifBuffer.length,
            convertedSize: converted.buffer.length,
            originalType: originalMimeType,
            convertedType: converted.mimeType
        });
        
        // Test upload to Twitter
        console.log('📤 Testing upload to Twitter...');
        const result = await uploader.uploadMediaBuffer(converted.buffer, converted.mimeType, 'converted-image.jpg');
        
        if (result.success) {
            console.log('🎉 AVIF → JPEG → Twitter upload successful!', {
                mediaId: result.mediaId,
                size: result.size
            });
        } else {
            console.log('❌ Twitter upload failed:', result.error);
        }
        
        return result.success;
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    }
}

// Run the test
if (require.main === module) {
    testAvifConversion()
        .then(success => {
            console.log('\n🏁 Test Result:', success ? 'SUCCESS ✅' : 'FAILED ❌');
            if (success) {
                console.log('AVIF images will now be properly converted and uploaded to Twitter!');
            }
        })
        .catch(console.error);
}