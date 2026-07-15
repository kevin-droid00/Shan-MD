const { cmd, commands } = require('../command');
const config = require('../config');
const { runtime, sleep } = require('../lib/functions'); // sleep function එක මෙතනින් ගනියි

// Usersලගේ මැසේජ් ඉතිහාසය මතක තියාගන්න object එක
const MessageData = {};

cmd({
    on: "antispam", // හැම මැසේජ් එකක්ම automate පරික්ෂා කිරීමට
    category: "group",
    filename: __filename
},
async (Void, citel, text, { isGroup, isAdmin, isBotAdmin }) => {
    
    // Config එකෙන් anti-spam active ද නැද්ද කියලා check කරන්න පුළුවන් (e.g. config.ANTISPAM_ON)
    // සටහන: ඔයාගේ config එකේ මේ වගේ variable එකක් නැත්නම් මේ line එක අයින් කරන්න.
    if (config.ANTISPAM === 'false') return;

    // Inbox සහ Group දෙකේම ක්‍රියාත්මක වන නිසා chat ID එක සහ Sender ID එක වෙන් කරගැනීම
    const chatId = citel.chat;
    const userId = citel.sender;
    const isInbox = !isGroup;

    // 1. Group Admin කෙනෙක් නම් Spam පරික්ෂා කරන්නේ නැත
    if (isGroup && isAdmin) return;

    const currentTime = Date.now();
    const timeWindow = 2000; // තත්පර 2ක කාලයක්

    // User කෙනෙක්ට අදාළ tracker එකක් නැත්නම් අලුතෙන් නිර්මාණය කිරීම
    if (!MessageData[userId]) {
        MessageData[userId] = { 
            MessageNumber: 0, 
            LastMessageTimes: [],
            LastMessages: [] 
        };
    }

    const userTracker = MessageData[userId];

    // තත්පර 2කට වඩා පැරණි timestamps සහ මැසේජ් දත්ත ඉවත් කිරීම
    const validIndices = userTracker.LastMessageTimes.map((time, index) => ({ time, index }))
        .filter(item => currentTime - item.time < timeWindow)
        .map(item => item.index);

    userTracker.LastMessageTimes = validIndices.map(i => userTracker.LastMessageTimes[i]);
    userTracker.LastMessages = validIndices.map(i => userTracker.LastMessages[i]);

    // වත්මන් මැසේජ් එකේ දත්ත එකතු කිරීම
    userTracker.LastMessageTimes.push(currentTime);
    userTracker.LastMessages.push(citel);
    userTracker.MessageNumber = userTracker.LastMessageTimes.length;

    // 2. මැසේජ් 3ක් හෝ ඊට වැඩි වූ විට (Warning Stage)
    if (userTracker.MessageNumber === 3) {
        
        // WhatsApp වල Botට message එකක් delete කරන්න පුළුවන් නම් delete කරයි
        try {
            if (citel.key) {
                await Void.sendMessage(chatId, { delete: citel.key });
            }
        } catch (e) {
            console.log("Delete error: ", e);
        }

        // Warning Message එකක් යැවීම
        const warnMsg = await Void.sendMessage(chatId, { 
            text: `⚠️ @${userId.split("@")[0]} *Stop Spamming!* (තත්පර 2ක් ඇතුලත මැසේජ් 3ක් එවලා ඇත)`,
            mentions: [userId]
        }, { quoted: citel });

        // Warning මැසේජ් එක තත්පර 3කින් auto-delete කිරීම
        setTimeout(async () => {
            try {
                await Void.sendMessage(chatId, { delete: warnMsg.key });
            } catch (e) {
                console.log("Warning delete error: ", e);
            }
        }, 3000);
    }

    // 3. මැසේජ් 4ක් හෝ ඊට වැඩි වූ විට (Action Stage)
    if (userTracker.MessageNumber >= 4) {
        
        // Inbox එකකදී නම්: යූසර්ව Block කර දමයි
        if (isInbox) {
            await Void.sendMessage(chatId, { text: "❌ *You have been blocked for spamming!*" });
            await sleep(1000);
            await Void.updateBlockStatus(userId, "block"); // WhatsApp Userව Block කිරීම
            delete MessageData[userId];
            return;
        }

        // Group එකකදී නම්:
        if (isGroup) {
            // Botට Admin බලතල නැත්නම් remove කරන්න බැරි නිසා warning එකක් දෙයි
            if (!isBotAdmin) {
                return await Void.sendMessage(chatId, { 
                    text: `⚠️ @${userId.split("@")[0]} *is spamming!* (I need Admin rights to remove this user)`,
                    mentions: [userId]
                });
            }

            // එකම මැසේජ් එකද ස්පෑම් කරන්නේ කියා බැලීම (Content Check)
            let isSameContent = false;
            const messages = userTracker.LastMessages;
            
            if (messages.length >= 2) {
                const lastMsgText = messages[messages.length - 1].text || "";
                const prevMsgText = messages[messages.length - 2].text || "";
                
                if (lastMsgText === prevMsgText && lastMsgText !== "") {
                    isSameContent = true;
                }
            }

            // එකම දේ ස්පෑම් කර තිබේ නම් හෝ මැසේජ් සීමාව 4 ඉක්මවා ඇත්නම් Kick කරයි
            if (isSameContent || userTracker.MessageNumber >= 4) {
                
                // ස්පෑම් කරපු මැසේජ් ටික delete කිරීමට උත්සාහ කිරීම
                for (const msg of messages) {
                    try {
                        if (msg.key) {
                            await Void.sendMessage(chatId, { delete: msg.key });
                        }
                    } catch (err) {
                        // error ignore
                    }
                }

                // Kick කිරීමට පෙර දැනුම් දීම
                await Void.sendMessage(chatId, { 
                    text: `😡 @${userId.split("@")[0]} *has been kicked for spamming!*`,
                    mentions: [userId]
                });

                await sleep(1500); // පොඩි delay එකක් ලබාදීම

                try {
                    // Userව group එකෙන් remove කිරීම
                    await Void.groupParticipantsUpdate(chatId, [userId], "remove");
                } catch (err) {
                    console.log("Kick error: ", err);
                }

                // Tracker එකෙන් දත්ත clear කිරීම
                delete MessageData[userId];
            }
        }
    }
});
       
