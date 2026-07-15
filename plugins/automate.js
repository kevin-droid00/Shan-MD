const { cmd, commands } = require('../command')
const config = require('../config')
const { runtime } = require('../lib/functions')

// Usersලගේ මැසේජ් ඉතිහාසය මතක තියාගන්න object එක
const spamTracker = {};

cmd({
    on: "main", // මේකෙන් තමයි command එකක් නැතත් හැම මැසේජ් එකක්ම automate පරික්ෂා කරන්නේ
    category: "group",
    filename: __filename
},
async (Void, citel, text, { isGroup, isAdmin, isBotAdmin }) => {
    // 1. Group එකක එන මැසේජ් විතරක් පරික්ෂා කරයි
    if (!isGroup) return;
    
    // 2. මැසේජ් එක එවපු කෙනා Admin කෙනෙක් නම් පරික්ෂා කරන්නේ නැත (Adminsලට Spam කරන්න අවසර දීම)
    if (isAdmin) return;

    const userId = citel.sender;
    const currentTime = Date.now();
    const timeWindow = 4000; // තත්පර 4ක කාලයක් (Milliseconds)
    const maxMessages = 4;   // තත්පර 4ක් ඇතුලත එවන්න පුළුවන් උපරිම මැසේජ් ගණන

    if (!spamTracker[userId]) {
        spamTracker[userId] = [];
    }

    // පරණ timestamps ඉවත් කිරීම (තත්පර 4කට වඩා පරණ ඒවා)
    spamTracker[userId] = spamTracker[userId].filter(timestamp => currentTime - timestamp < timeWindow);

    // වත්මන් මැසේජ් එකේ timestamp එක ලැයිස්තුවට එකතු කිරීම
    spamTracker[userId].push(currentTime);

    // සීමාව ඉක්මවා ඇත්නම් (User එක දිගට Spam කර ඇත්නම්)
    if (spamTracker[userId].length > maxMessages) {
        
        // Botට Admin බලතල නැත්නම් Warning එකක් විතරක් දෙයි
        if (!isBotAdmin) {
            return citel.reply("⚠️ *Spam Detected!* Please slow down. (I need Admin rights to remove spammers)");
        }

        // Spam කරන කෙනාව ඉවත් කිරීමට ක්‍රියාමාර්ග ගැනීම
        await Void.sendMessage(citel.chat, { 
            text: `⚠️ @${userId.split("@")[0]} *is Spamming!* Removing in 2 seconds...`, 
            mentions: [userId] 
        }, { quoted: citel });

        await sleep(2000); // තත්පර 2ක් මදක් නවතී (Delay)

        try {
            // Userව group එකෙන් ඉවත් කිරීම
            await Void.groupParticipantsUpdate(citel.chat, [userId], "remove");
            
            // Tracker එකෙන් ඒ Userගේ දත්ත clear කිරීම
            delete spamTracker[userId];

            return await Void.sendMessage(citel.chat, { 
                text: `✅ Successfully removed @${userId.split("@")[0]} for spamming.`, 
                mentions: [userId] 
            });
        } catch (error) {
            console.log("Error removing user: ", error);
        }
    }
});
  
