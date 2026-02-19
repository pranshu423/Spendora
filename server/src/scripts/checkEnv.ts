import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredEnvVars = [
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'CLIENT_URL',
    'NODE_ENV'
];

const checkEnv = () => {
    console.log('🔍 Checking Environment Variables...');

    let missing: string[] = [];

    requiredEnvVars.forEach(key => {
        if (!process.env[key]) {
            missing.push(key);
        }
    });

    if (missing.length > 0) {
        console.error('❌ Missing Required Environment Variables:');
        missing.forEach(key => console.error(`   - ${key}`));
        process.exit(1);
    } else {
        console.log('✅ All Environment Variables configured correctly.');
        console.log(`   - Environment: ${process.env.NODE_ENV}`);
        console.log(`   - Client URL: ${process.env.CLIENT_URL}`);
    }
};

checkEnv();
