const { cmd, commands } = require('../command')
const config = require('../config')
const { runtime } = require('../lib/functions')

//---------------------------------------------------------------------------

cmd({
    pattern: "spam",
    category: "spam",
    desc: "Spam messages a specific number of times",
    filename: __filename,
},

async (Void, citel, text) => {
    // text එකක් ඇතුළත් කර නැත්නම් සාමාන්‍ය message එකක් සකසයි
    let spamMessage = text || "Hello! This is a spam message🥺😔.";
    
    // වාර 5 ක් message එක එක දිගට යැවීමට (5 වෙනුවට කැමති අගයක් දිය හැක)
    for (let i = 0; i < 100 ; i++) {
        await citel.reply(spamMessage);
        await sleep(500); // WhatsApp block වීම වැළැක්වීමට තත්පර බාගයක (ms 500) විරාමයක්
    }
})
