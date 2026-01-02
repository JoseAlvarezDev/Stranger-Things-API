const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

const creatures = [
    {
        name: 'Demogorgon',
        filename: 'demogorgon.webp',
        url: 'https://static.wikia.nocookie.net/strangerthings/images/0/07/The_Demogorgon_DBD.png'
    },
    {
        name: 'Demo-dogs',
        filename: 'demodogs.webp',
        url: 'https://static.wikia.nocookie.net/strangerthings/images/9/90/Demodog.png'
    },
    {
        name: 'Mind Flayer',
        filename: 'mind_flayer.webp',
        url: 'https://static.wikia.nocookie.net/strangerthings/images/3/3e/The_Mind_Flayer.png'
    },
    {
        name: 'The Flayed',
        filename: 'flayed.webp',
        url: 'https://static.wikia.nocookie.net/strangerthings/images/f/f6/Flayed_Billy_S3.png'
    },
    {
        name: 'Demo-bats',
        filename: 'demobats.webp',
        url: 'https://static.wikia.nocookie.net/strangerthings/images/7/77/Demobats.jpg'
    },
    {
        name: 'Vecna',
        filename: 'vecna.webp',
        url: 'https://static.wikia.nocookie.net/strangerthings/images/e/e5/Vecna_001.png'
    },
    {
        name: 'Slug/Pollywog',
        filename: 'pollywog.webp',
        url: 'https://static.wikia.nocookie.net/strangerthings/images/3/3e/Dart_Stage_2.png'
    },
    {
        name: 'Spider Monster',
        filename: 'spider_monster.webp',
        url: 'https://static.wikia.nocookie.net/strangerthings/images/8/87/The_Spider_Monster.png'
    },
    {
        name: 'Vines',
        filename: 'vines.webp',
        url: 'https://static.wikia.nocookie.net/strangerthings/images/5/54/The_Gate_S2.png'
    },
    {
        name: 'Russian Demogorgon',
        filename: 'russian_demogorgon.webp',
        url: 'https://static.wikia.nocookie.net/strangerthings/images/6/66/Russian_Demogorgon.png'
    }
];

const downloadImage = async (url, filepath) => {
    try {
        const response = await axios({
            url,
            responseType: 'arraybuffer'
        });

        // Use sharp to convert to WebP and resize if necessary
        await sharp(response.data)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 80 })
            .toFile(filepath);

        console.log(`Successfully downloaded and converted: ${filepath}`);
    } catch (error) {
        console.error(`Error downloading ${url}:`, error.message);
    }
};

const main = async () => {
    const outputDir = path.join(__dirname, 'public/images/creatures');

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('Starting creature image download and conversion...');

    for (const creature of creatures) {
        const filepath = path.join(outputDir, creature.filename);
        await downloadImage(creature.url, filepath);
    }

    console.log('All downloads completed!');
};

main();
