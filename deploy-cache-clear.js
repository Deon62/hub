#!/usr/bin/env node

/**
 * Cache Clearing Script for Student Hustle Hub
 * This script helps ensure cache is cleared when deploying updates
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting cache clearing deployment...');

// Update version.json with new timestamp
const versionPath = path.join(__dirname, 'version.json');
const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));

// Update timestamp to current time
versionData.timestamp = Date.now();
versionData.build = `2024-01-15-${String(Date.now()).slice(-3)}`;

console.log('📝 Updated version.json:', versionData);

// Write updated version
fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));

console.log('✅ Version updated successfully');
console.log('📦 Ready for deployment!');
console.log('');
console.log('🔧 Next steps:');
console.log('1. Commit and push changes to GitHub');
console.log('2. Vercel will automatically deploy');
console.log('3. The app will force cache clear on next visit');
console.log('');
console.log('💡 For immediate cache clear, users can:');
console.log('- Use the manual refresh button (🔄)');
console.log('- Visit /clear-cache.html');
console.log('- Clear browser cache manually');
