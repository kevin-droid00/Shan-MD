const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    SESSION_ID: process.env.SESSION_ID || 'TMNSXIgD#wTNoTXC4XT5qlRajQTXqvVjR4VKBYKisib8HbSHzxFk',
    ANTI_DELETE: process.env.ANTI_DELETE === undefined ? 'true' : process.env.ANTI_DELETE, 
    MV_BLOCK: process.env.MV_BLOCK === undefined ? 'true' : process.env.MV_BLOCK,    
    ANTI_LINK: process.env.ANTI_LINK === undefined ? 'true' : process.env.ANTI_LINK, 
    SEEDR_MAIL: process.env.SEEDR_MAIL || '',
    SEEDR_PASSWORD: process.env.SEEDR_PASSWORD || '',
    SUDO: process.env.SUDO || '',
    DB_NAME: process.env.DB_NAME || 'movie-xx-free',
    LANG: process.env.LANG || 'SI',
    OWNER_NUMBER: process.env.OWNER_NUMBER || '94711726564',
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
};
