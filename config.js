const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });
function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

//gg
module.exports = {
SESSION_ID:'CAVCyRaZ#m2Q-2F6EK-657ax02jinK0b8HVRnzdULM4C9C0GiP3M', // methanata ube id eka daganim

ANTI_DELETE: process.env.ANTI_DELETE === undefined ? 'true' : process.env.ANTI_DELETE, 
MV_BLOCK: process.env. MV_BLOCK === undefined ? 'true' : process.env. MV_BLOCK,    
ANTI_LINK: process.env.ANTI_LINK === undefined ? 'true' : process.env.ANTI_LINK, 
SEEDR_MAIL: '',
SEEDR_PASSWORD: '',
SUDO: '',//
DB_NAME: 'Shan',
LANG: 'SI',
OWNER_NUMBER: '94711726564',
LOGO: process.env.LOGO === undefined ? 'https://telegra.ph/file/38a4ba6f7a51c15f5feaf.jpg' : process.env.LOGO

};
//GITHUB_AUTH_TdOKEN: 'ouvnI0xSDsmfWA1filVxx.SZ0vJGYkjlC5VX54U0e10',
