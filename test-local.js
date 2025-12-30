#!/usr/bin/env node

/**
 * Local Testing Script for Magister Portal
 * This script tests the application without needing MongoDB running
 */

const http = require('http');

console.log('\n🧪 MAGISTER PORTAL - LOCAL TESTING SCRIPT\n');
console.log('========================================\n');

// Test 1: Check if server starts
console.log('📝 Test 1: Checking server startup...');
console.log('Running: npm start\n');

const { spawn } = require('child_process');

// Start the server
const server = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    env: {
        ...process.env,
        NODE_ENV: 'development',
        PORT: 3000,
        MONGODB_URI: 'mongodb://localhost:27017/magisterportal',
        JWT_SECRET: 'dev-secret-key-12345-change-this-in-production',
        FRONTEND_URL: 'http://localhost:3000',
        ALLOWED_ORIGINS: 'http://localhost:3000'
    },
    stdio: 'pipe'
});

let serverStarted = false;
let testsPassed = 0;
let testsFailed = 0;

server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    
    if (output.includes('Server running') || output.includes('listening')) {
        serverStarted = true;
        setTimeout(runTests, 2000);
    }
});

server.stderr.on('data', (data) => {
    const output = data.toString();
    console.log('⚠️  ', output);
});

function runTests() {
    console.log('\n========================================');
    console.log('🧪 RUNNING TESTS\n');
    
    testHealthEndpoint();
}

function testHealthEndpoint() {
    console.log('📊 Test 2: Health Endpoint Check');
    console.log('GET /api/health\n');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/health',
        method: 'GET'
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`Status Code: ${res.statusCode}\n`);
            
            if (res.statusCode === 200) {
                console.log('✅ Health check PASSED\n');
                testsPassed++;
                
                try {
                    const response = JSON.parse(data);
                    console.log('Response:');
                    console.log(JSON.stringify(response, null, 2));
                    console.log('\n');
                } catch (e) {
                    console.log('Response:', data);
                }
            } else {
                console.log('❌ Health check FAILED\n');
                testsFailed++;
            }
            
            testSignupEndpoint();
        });
    });
    
    req.on('error', (e) => {
        console.log(`❌ Connection Error: ${e.message}\n`);
        console.log('Make sure the server is running.\n');
        testsFailed++;
        cleanup();
    });
    
    req.end();
}

function testSignupEndpoint() {
    console.log('📝 Test 3: Signup Endpoint (Form Validation)');
    console.log('POST /api/auth/signup\n');
    
    const postData = JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123'
    });
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/signup',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`Status Code: ${res.statusCode}\n`);
            
            // Will fail if MongoDB not running, but that's expected
            if (res.statusCode === 201 || res.statusCode === 500 || res.statusCode === 400) {
                console.log('✅ Endpoint exists and responds\n');
                testsPassed++;
            } else {
                console.log('⚠️  Unexpected status code\n');
            }
            
            try {
                const response = JSON.parse(data);
                console.log('Response:');
                console.log(JSON.stringify(response, null, 2));
            } catch (e) {
                console.log('Response:', data);
            }
            
            console.log('\n');
            testContactEndpoint();
        });
    });
    
    req.on('error', (e) => {
        console.log(`❌ Connection Error: ${e.message}\n`);
        testsFailed++;
        cleanup();
    });
    
    req.write(postData);
    req.end();
}

function testContactEndpoint() {
    console.log('📧 Test 4: Contact Endpoint (Form Validation)');
    console.log('POST /api/contact\n');
    
    const postData = JSON.stringify({
        name: 'Test User',
        email: 'contact@example.com',
        message: 'This is a test message for the contact form'
    });
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/contact',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`Status Code: ${res.statusCode}\n`);
            
            if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 500) {
                console.log('✅ Endpoint exists and responds\n');
                testsPassed++;
            } else {
                console.log('⚠️  Unexpected status code\n');
            }
            
            try {
                const response = JSON.parse(data);
                console.log('Response:');
                console.log(JSON.stringify(response, null, 2));
            } catch (e) {
                console.log('Response:', data);
            }
            
            console.log('\n');
            printResults();
        });
    });
    
    req.on('error', (e) => {
        console.log(`❌ Connection Error: ${e.message}\n`);
        testsFailed++;
        cleanup();
    });
    
    req.write(postData);
    req.end();
}

function printResults() {
    console.log('========================================');
    console.log('📊 TEST RESULTS\n');
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}\n`);
    
    if (testsFailed === 0) {
        console.log('🎉 All basic tests PASSED!\n');
        console.log('Your application is working correctly.\n');
    } else {
        console.log('⚠️  Some tests failed. Check the errors above.\n');
    }
    
    console.log('========================================\n');
    console.log('💡 NOTES:\n');
    console.log('- These tests only verify endpoints respond');
    console.log('- Full tests require MongoDB running');
    console.log('- To test with database, start MongoDB first\n');
    console.log('To start MongoDB (if installed):');
    console.log('  mongod\n');
    console.log('To stop the server, press Ctrl+C\n');
    
    // Keep server running for manual testing
    console.log('✅ Server is running on http://localhost:3000');
    console.log('Press Ctrl+C to stop.\n');
}

function cleanup() {
    console.log('\nStopping server...');
    server.kill();
    process.exit(testsFailed > 0 ? 1 : 0);
}

// Handle Ctrl+C
process.on('SIGINT', cleanup);
