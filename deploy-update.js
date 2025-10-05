#!/usr/bin/env node

// BSN Silent Update Deployment Script
// This script helps you deploy updates without user interruption

const fs = require('fs');
const path = require('path');

console.log('🚀 BSN Silent Update Deployment');
console.log('================================\n');

function updateVersion() {
    const versionFile = path.join(__dirname, 'version.json');
    
    try {
        // Read current version
        let currentVersion;
        if (fs.existsSync(versionFile)) {
            currentVersion = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
        } else {
            currentVersion = { version: '1.0.0', timestamp: 0 };
        }
        
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
                `Deployed at ${new Date().toLocaleString()}`
            ]
        };
        
        // Write new version
        fs.writeFileSync(versionFile, JSON.stringify(newVersionData, null, 2));
        
        console.log(`✅ Version updated to ${newVersion}`);
        console.log(`📦 Build: ${newVersionData.build}`);
        console.log(`⏰ Timestamp: ${newVersionData.timestamp}`);
        console.log('\n🎯 Update Deployment Summary:');
        console.log('   • Users will receive updates silently');
        console.log('   • No popup notifications or interruptions');
        console.log('   • Updates applied in background every 30 seconds');
        console.log('   • Cache automatically refreshed');
        console.log('\n📱 To test the update mechanism:');
        console.log('   1. Open update-test.html in your browser');
        console.log('   2. Check the logs for update activity');
        console.log('   3. Users will see updates within 30 seconds');
        
        return newVersionData;
        
    } catch (error) {
        console.error('❌ Error updating version:', error);
        return null;
    }
}

function updateServiceWorkerVersion() {
    const swFile = path.join(__dirname, 'sw.js');
    
    try {
        let swContent = fs.readFileSync(swFile, 'utf8');
        
        // Update cache version
        const newVersion = 'v' + Date.now().toString().slice(-6);
        swContent = swContent.replace(/const CACHE_NAME = 'student-hustle-hub-v\d+'/, `const CACHE_NAME = 'student-hustle-hub-${newVersion}'`);
        swContent = swContent.replace(/const STATIC_CACHE = 'static-cache-v\d+'/, `const STATIC_CACHE = 'static-cache-${newVersion}'`);
        swContent = swContent.replace(/const DYNAMIC_CACHE = 'dynamic-cache-v\d+'/, `const DYNAMIC_CACHE = 'dynamic-cache-${newVersion}'`);
        
        fs.writeFileSync(swFile, swContent);
        console.log(`🔧 Service Worker cache version updated to ${newVersion}`);
        
    } catch (error) {
        console.error('❌ Error updating service worker:', error);
    }
}

function updateAppVersion() {
    const appFile = path.join(__dirname, 'app.js');
    
    try {
        let appContent = fs.readFileSync(appFile, 'utf8');
        
        // Update version references in app.js
        const newVersion = Date.now().toString().slice(-6);
        appContent = appContent.replace(/\/styles\.css\?v=\d+/, `/styles.css?v=${newVersion}`);
        appContent = appContent.replace(/\/app\.js\?v=\d+/, `/app.js?v=${newVersion}`);
        
        fs.writeFileSync(appFile, appContent);
        console.log(`📱 App.js version references updated`);
        
    } catch (error) {
        console.error('❌ Error updating app.js:', error);
    }
}

// Run the deployment
console.log('1. Updating version file...');
const versionData = updateVersion();

if (versionData) {
    console.log('\n2. Updating service worker cache version...');
    updateServiceWorkerVersion();
    
    console.log('\n3. Updating app version references...');
    updateAppVersion();
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   • Upload the updated files to your server');
    console.log('   • Users will automatically receive updates');
    console.log('   • No user action required - completely silent');
    console.log('   • Updates happen in background every 30 seconds');
} else {
    console.log('\n❌ Deployment failed. Please check the errors above.');
}
