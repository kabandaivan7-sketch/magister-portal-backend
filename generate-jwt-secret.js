// Quick script to generate a secure JWT secret
// Run with: node generate-jwt-secret.js

const crypto = require('crypto');

// Generate a random 64-character hex string
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('\n✅ Your JWT Secret:');
console.log('='.repeat(60));
console.log(jwtSecret);
console.log('='.repeat(60));
console.log('\n📝 Copy this and paste it into your .env file:');
console.log(`JWT_SECRET=${jwtSecret}\n`);

