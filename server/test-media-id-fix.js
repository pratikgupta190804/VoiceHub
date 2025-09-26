require('dotenv').config();
const { TwitterMediaUploader } = require('./twitter-media-uploader');

async function testMediaIdExtraction() {
    console.log('🔧 Testing Media ID Extraction Fix...');
    console.log('=' .repeat(50));
    
    const uploader = new TwitterMediaUploader();
    
    // Test with sample URLs
    const testUrls = [
        'https://httpbin.org/image/jpeg'
    ];
    
    try {
        console.log('📤 Testing uploadMultipleMedia...');
        const uploadResults = await uploader.uploadMultipleMedia(testUrls);
        
        console.log('✅ Raw upload results:', JSON.stringify(uploadResults, null, 2));
        
        // Extract media IDs like the complaint controller now does
        const mediaIds = uploadResults
            .filter(result => result.success)
            .map(result => result.mediaId);
            
        console.log('✅ Extracted media IDs:', mediaIds);
        console.log('✅ Media ID types:', mediaIds.map(id => typeof id));
        
        // Verify they are strings (what Twitter API expects)
        const allStrings = mediaIds.every(id => typeof id === 'string');
        console.log('✅ All media IDs are strings:', allStrings);
        
        if (allStrings && mediaIds.length > 0) {
            console.log('🎉 Media ID extraction is working correctly!');
            console.log('🎯 Twitter API will now accept these media IDs');
            return true;
        } else {
            console.log('❌ Media ID extraction failed');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    }
}

if (require.main === module) {
    testMediaIdExtraction()
        .then(success => {
            console.log('\n🏁 Fix Status:', success ? 'SUCCESS ✅' : 'FAILED ❌');
            if (success) {
                console.log('The Twitter 400 error should now be resolved!');
                console.log('Try submitting a complaint with an image now.');
            }
        })
        .catch(console.error);
}