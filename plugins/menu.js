const { cmd, commands } = require('../command');
const config = require('../config');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "menu",
    react: "📜",
    desc: "Custom SHAN-MD Menu",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, prefix, pushname, reply }) => {
    try {
        // Calculate runtime
        const botRuntime = typeof runtime === 'function' ? runtime(process.uptime()) : "Unknown";

        let menuMsg = `╭━━━〔 🤍 SHAN-MD 🤍 〕━━━⬣
┃ 👤 User: ${pushname}
┃ 🕒 Runtime: ${botRuntime}
┃ 👑 Owner: ${config.OWNER_NUMBER || "Not Set"}
┃ 🤖 Version: 3.0.0
╰━━━━━━━━━━━━━━━━━━⬣

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

🚀 Powered By SHAN-MD
╰━━━━━━━━━━━━━━━━━━⬣`;

        // Get the logo URL from config or use a default one
        // Note: Check if config.LOGO or config.logo is used in the project
        const logoUrl = config.LOGO || config.logo || "https://files.catbox.moe/nsv9gv.jpg";

        await conn.sendMessage(from, { 
            image: { url: logoUrl }, 
            caption: menuMsg 
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in menu command:", e);
        reply("An error occurred while generating the menu: " + e.message);
    }
});
