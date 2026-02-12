const fs = require('fs');
const https = require('https');
const path = require('path');

const animationsDir = path.join(__dirname, 'frontend', 'src', 'assets', 'animations');

if (!fs.existsSync(animationsDir)) {
    fs.mkdirSync(animationsDir, { recursive: true });
}

const files = [
    {
        name: 'otp.json',
        url: 'https://assets5.lottiefiles.com/packages/lf20_u25cckyh.json' // "OTP" or "Message Sent" animation
    }
];

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: Status Code ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve());
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

async function downloadAll() {
    console.log('Starting downloads...');
    for (const file of files) {
        const dest = path.join(animationsDir, file.name);
        try {
            console.log(`Downloading ${file.name} from ${file.url}...`);
            await download(file.url, dest);
            console.log(`Successfully downloaded ${file.name}`);
        } catch (error) {
            console.error(`Error downloading ${file.name}:`, error.message);
            // Fallback: copy login.json
            try {
                const loginPath = path.join(animationsDir, 'login.json');
                if (fs.existsSync(loginPath)) {
                    console.log('Using login.json as fallback for otp.json');
                    fs.copyFileSync(loginPath, dest);
                }
            } catch (copyErr) {
                console.error('Fallback copy failed:', copyErr.message);
            }
        }
    }
    console.log('Download process complete.');
}

downloadAll();
