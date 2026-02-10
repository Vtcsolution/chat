const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging .env File Issues\n');
console.log('==============================\n');

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found at:', envPath);
  process.exit(1);
}

console.log('📄 Reading .env file...\n');

// Read raw file content
const rawContent = fs.readFileSync(envPath, 'utf8');
console.log('Raw file content (first 500 chars):');
console.log('-----------------------------------');
console.log(rawContent.substring(0, 500));
console.log('-----------------------------------\n');

// Show character codes for debugging
console.log('🔤 Character analysis for TWILIO lines:');
console.log('----------------------------------------');

const lines = rawContent.split('\n');
lines.forEach((line, index) => {
  if (line.includes('TWILIO')) {
    console.log(`\nLine ${index + 1}: "${line}"`);
    console.log(`Length: ${line.length} chars`);
    
    // Show character codes (helpful for invisible characters)
    const charCodes = [];
    for (let i = 0; i < Math.min(line.length, 50); i++) {
      const char = line[i];
      if (char === ' ') {
        charCodes.push('SPACE(32)');
      } else if (char === '\t') {
        charCodes.push('TAB(9)');
      } else if (char === '\r') {
        charCodes.push('CR(13)');
      } else if (char === '\n') {
        charCodes.push('LF(10)');
      } else if (char.charCodeAt(0) < 32) {
        charCodes.push(`CTRL(${char.charCodeAt(0)})`);
      } else {
        charCodes.push(`${char}(${char.charCodeAt(0)})`);
      }
    }
    console.log(`Chars: ${charCodes.join(' ')}`);
    
    // Check for common issues
    if (line.includes(' = ')) {
      console.log('⚠️  Found spaces around equals sign');
    }
    if (line.endsWith(' ') || line.endsWith('\t') || line.endsWith('\r')) {
      console.log('⚠️  Line has trailing whitespace');
    }
    if (line.includes('\t')) {
      console.log('⚠️  Line contains tabs (use spaces)');
    }
  }
});

console.log('\n🧪 Testing process.env extraction:');
console.log('---------------------------------');

// Test if Node.js can read the variables
console.log('TWILIO_ACCOUNT_SID exists:', !!process.env.TWILIO_ACCOUNT_SID);
console.log('TWILIO_AUTH_TOKEN exists:', !!process.env.TWILIO_AUTH_TOKEN);
console.log('TWILIO_API_KEY exists:', !!process.env.TWILIO_API_KEY);
console.log('TWILIO_API_SECRET exists:', !!process.env.TWILIO_API_SECRET);

if (process.env.TWILIO_ACCOUNT_SID) {
  console.log('\n📏 TWILIO_ACCOUNT_SID details:');
  console.log(`Value: "${process.env.TWILIO_ACCOUNT_SID}"`);
  console.log(`Length: ${process.env.TWILIO_ACCOUNT_SID.length}`);
  console.log(`Starts with "AC": ${process.env.TWILIO_ACCOUNT_SID.startsWith('AC')}`);
}

if (process.env.TWILIO_AUTH_TOKEN) {
  console.log('\n📏 TWILIO_AUTH_TOKEN details:');
  console.log(`Value: "${process.env.TWILIO_AUTH_TOKEN.substring(0, 4)}...${process.env.TWILIO_AUTH_TOKEN.substring(process.env.TWILIO_AUTH_TOKEN.length - 4)}"`);
  console.log(`Length: ${process.env.TWILIO_AUTH_TOKEN.length}`);
}

console.log('\n💡 Recommendations:');
console.log('1. Remove ALL whitespace after values');
console.log('2. Ensure no invisible characters');
console.log('3. Use LF line endings (not CRLF)');
console.log('4. Restart terminal after fixing .env');

// Create a cleaned version
console.log('\n✨ Here is a cleaned version of your Twilio lines:');
console.log('TWILIO_ACCOUNT_SID=ACe88856152bdb204fa6c35aa313c7d9a6');
console.log('TWILIO_AUTH_TOKEN=5b28b83acd9bcba7ed9db0421c2a9e8f');
console.log('TWILIO_PHONE_NUMBER=+19789177347');
console.log('TWILIO_API_KEY=SKa494413d9fcd805450ef1b07aad1142a');
console.log('TWILIO_API_SECRET=n5igmNIbBGaf4c1V4b2JOd42E2d7knIS');