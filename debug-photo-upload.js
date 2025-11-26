// Debug script to test photo upload process
async function debugPhotoUpload(photoFile) {
    console.log('=== Photo Upload Debug ===');
    console.log('Photo file:', photoFile);
    
    if (!photoFile) {
        console.error('No photo file provided');
        return;
    }
    
    // Step 1: Upload photo to server
    console.log('Step 1: Uploading photo to server');
    const formDataObj = new FormData();
    formDataObj.append('photo', photoFile);
    
    try {
        const response = await fetch('http://localhost/school-app/backend/api.php?endpoint=photos', {
            method: 'POST',
            body: formDataObj
        });
        
        console.log('Photo upload response status:', response.status);
        const result = await response.json();
        console.log('Photo upload response:', result);
        
        if (result.success) {
            console.log('Photo uploaded successfully:', result.url);
            return result.url;
        } else {
            console.error('Photo upload failed:', result.error);
            return null;
        }
    } catch (error) {
        console.error('Photo upload error:', error);
        return null;
    }
}

// Test with a real file (you would call this with an actual file)
// debugPhotoUpload(file);