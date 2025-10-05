// Update Version Script for BSN
// Run this script to update the version and trigger silent updates

const fs = require('fs');
const path = require('path');

function updateVersion() {
    const versionFile = path.join(__dirname, 'version.json');
    
    try {
        // Read current version
        const currentVersion = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
        
        // Increment version
        const versionParts = currentVersion.version.split('.');
        const patch = parseInt(versionParts[2]) + 1;
        const newVersion = `${versionParts[0]}.${versionParts[1]}.${patch}`;
        
        // Create new version data
        const newVersionData = {
            version: newVersion,
            build: new Date().toISOString().slice(0, 19).replace('T', '-'),
            timestamp: Date.now(),
            changelog: [
                "Silent update mechanism implemented",
                "Background update checking every 30 seconds", 
                "No user interruption for updates",
                "Automatic cache refresh",
                `Updated at ${new Date().toLocaleString()}`
            ]
        };
        
        // Write new version
        fs.writeFileSync(versionFile, JSON.stringify(newVersionData, null, 2));
        
        console.log(`✅ Version updated to ${newVersion}`);
        console.log(`📦 Build: ${newVersionData.build}`);
        console.log(`⏰ Timestamp: ${newVersionData.timestamp}`);
        console.log('\n🚀 Users will receive the update silently within 30 seconds!');
        
    } catch (error) {
        console.error('❌ Error updating version:', error);
    }
}

// Run the update
updateVersion();
