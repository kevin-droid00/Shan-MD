const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });
function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
SESSION_ID: '6ZknzSKR#KGsNXinavE78XWj2YqLSOW5DUrOS4S0uJ0zyXCBmDig', // ඔයාගේ Session ID එක අනිවාර්යයෙන්ම මෙතනට දාන්න.

PREFIX: process.env.PREFIX === undefined ? '.' : process.env.PREFIX, // Prefix එක '.' ලෙස auto set වේ.
MODE: process.env.MODE === undefined ? 'public' : process.env.MODE, // Bot එක public වැඩ කිරීමට.

ANTI_DELETE: process.env.ANTI_DELETE === undefined ? 'true' : process.env.ANTI_DELETE, 
MV_BLOCK: process.env.MV_BLOCK === undefined ? 'true' : process.env.MV_BLOCK, // Space එක අයින් කරන ලදී   
ANTI_LINK: process.env.ANTI_LINK === undefined ? 'true' : process.env.ANTI_LINK, 
SEEDR_MAIL: '',
SEEDR_PASSWORD: '',
SUDO: '94711726564', // ඔයාගේ නම්බර් එක මෙතනටත් දාන්න
DB_NAME: 'Shan',
LANG: 'SI',
OWNER_NUMBER: '94711726564',
LOGO: process.env.LOGO === undefined ? 'https://files.catbox.moe/nsv9gv.jpg' : process.env.LOGO

};
    
