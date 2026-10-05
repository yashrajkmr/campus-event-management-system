const { execSync } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('🚀 CampusHub Cloud Build Pipeline');
console.log('====================================================');

try {
  console.log('\n[1/4] Installing server dependencies...');
  execSync('npm install', {
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit',
  });

  console.log('\n[2/4] Installing client dependencies...');
  execSync('npm install', {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
  });

  console.log('\n[3/4] Building production React bundle (Vite)...');
  execSync('node node_modules/vite/bin/vite.js build', {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
  });

  console.log('\n[4/4] Checking database seeding...');
  if (process.env.MONGO_URI && process.env.MONGO_URI.includes('mongodb')) {
    try {
      console.log('Seeding initial events and users into MongoDB...');
      execSync('node seed.js', {
        cwd: path.join(__dirname, 'server'),
        stdio: 'inherit',
      });
    } catch (seedErr) {
      console.warn('⚠️ Seeding skipped or warned:', seedErr.message);
    }
  } else {
    console.log('ℹ️ MONGO_URI not detected at build time. Seeding can run at runtime.');
  }

  console.log('\n====================================================');
  console.log('✅ CampusHub Build Succeeded!');
  console.log('====================================================\n');
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
