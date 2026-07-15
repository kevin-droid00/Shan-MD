const { cmd, commands } = require('../command')
const config = require('../config')
const { runtime } = require('../lib/functions')

//---------------------------------------------------------------------------

cmd({
    pattern: "shan",
    category: "ishi", // අවශ්‍ය නම් category එක වෙනස් කරගන්න පුළුවන්
    desc: "greeting message for shan",
    filename: __filename,
},

async (Void, citel, text) => {
    return citel.reply('hello 👻♥');
})
