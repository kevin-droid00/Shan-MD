const { cmd, commands } = require('../command')
const config = require('../config')
const { runtime } = require('../lib/functions')

cmd({
    pattern: "menu",
    react: "📜",
    desc: "Custom SHAN-MD Menu",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, prefix, pushname, reply }) => {
    try {
        let menuMsg = `╭━━━〔 🤍 SHAN-MD 🤍 〕━━━⬣

😚 Welcome to SHAN-MD User Bot👻💗

╭━━━〔 📥 DOWNLOAD COMMANDS 〕━━⬣
┃ 🎵 ${prefix}mp3
┃ 🎬 ${prefix}video
┃ 📺 ${prefix}fb
┃ 🎥 ${prefix}movie
┃ 🍥 ${prefix}anime
┃ 📦 ${prefix}apk
┃ 🎞 ${prefix}tiktok
┃ 📌 ${prefix}pinterest
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🤖 AI COMMANDS 〕━━⬣
┃ 🤖 ${prefix}gemini
┃ 💬 ${prefix}chatgpt
┃ 🌐 ${prefix}google
┃ 🧠 ${prefix}heck
┃ ✨ ${prefix}enhance
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🔍 SEARCH / STALK 〕━━⬣
┃ 🎬 ${prefix}tiktoksearch
┃ 📦 ${prefix}playstore
┃ 👤 ${prefix}ttstalk
┃ 🎮 ${prefix}ffstalk
┃ 🎥 ${prefix}cinesearch
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 👥 GROUP COMMANDS 〕━━⬣
┃ 👋 ${prefix}welcome
┃ 🚫 ${prefix}antilink
┃ 👑 ${prefix}promote
┃ ❌ ${prefix}demote
┃ 🦵 ${prefix}kick
┃ 📢 ${prefix}tagall
┃ 🔇 ${prefix}mute
┃ 🔊 ${prefix}unmute
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 😈 FUN COMMANDS 〕━━⬣
┃ 💣 ${prefix}hack
┃ ☠️ ${prefix}virus
┃ 👻 ${prefix}ghost
┃ 📱 ${prefix}crash
┃ 🔥 ${prefix}burn
┃ 🛰 ${prefix}track
┃ 🕵️ ${prefix}spy
┃ ⚡ ${prefix}hackwifi
┃ 💀 ${prefix}danger
┃ 📂 ${prefix}leak
┃ 🧠 ${prefix}brainwash
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 ⚡ SYSTEM COMMANDS 〕━━⬣
┃ 💚 ${prefix}alive
┃ 📜 ${prefix}menu
┃ 👑 ${prefix}owner
┃ 🔒 ${prefix}login
┃ 🛰 ${prefix}ping
╰━━━━━━━━━━━━━━━━━━⬣

👑 Owner : ${config.OWNER_NUMBER}

🚀 Powered By SHAN-MD
╰━━━━━━━━━━━━━━━━━━⬣`

        // config.logo එකේ තියෙන පින්තූරය පාවිච්චි කරයි. එය නැතිනම් default පින්තූරය පාවිච්චි කරයි.
        await conn.sendMessage(from, { 
            image: { url: config.logo ? config.logo : "https://files.catbox.moe/f5n28q.jpg" }, 
            caption: menuMsg 
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(e.toString());
    }
})
          
