#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Domlii Dashboard...\n');

// Check if .env exists, if not create it from .env.example
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('📄 Creating .env file from .env.example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created. Please update it with your database connection string.\n');
}

try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully!\n');

  console.log('🔧 Generating Prisma client...');
  execSync('npm run db:generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated!\n');

  console.log('🎉 Setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Update your .env file with your database connection string');
  console.log('2. Run "npm run db:push" to sync your database schema');
  console.log('3. Run "npm run dev" to start the development server');
  console.log('\nHappy coding! 🎯');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}