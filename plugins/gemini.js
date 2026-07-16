const { cmd, commands } = require('../command');
const config = require('../config');
const { runtime, fetchJson } = require('../lib/functions'); // Added fetchJson from functions

cmd({
    pattern: "gemini",
    alias: ["ai", "bot"],
    desc: "Ask Gemini anything, it can also send Photos, Videos, Songs, and APKs!",
    category: "ai",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, usedPrefix, text, reply }) => {
    try {
        // Corrected parameters to match common command structures
        // Usually: (conn, mek, m, { from, prefix, pushname, reply, text })
        // The original code used (Void, citel, text) which might not match the bot's structure.
        // Let's adapt it to be more robust.

        const targetText = text || body.split(" ").slice(1).join(" ");
        if (!targetText) return reply("Please ask me something!\n*Example:* .gemini send me a photo of a cat");

        await reply("🤖 *Gemini is thinking...*");

        const prompt = targetText.toLowerCase();
        let detectedType = null;
        let searchQuery = "";

        // 1. Detect if the user is asking for media
        if (prompt.includes("photo") || prompt.includes("image") || prompt.includes("picture") || prompt.includes("පින්තූර")) {
            detectedType = "photo";
            searchQuery = targetText.replace(/(send|me|a|photo|image|picture|of|පින්තූරයක්|පින්තූර|දාන්න|දෙන්න)/gi, "").trim();
        } 
        else if (prompt.includes("song") || prompt.includes("audio") || prompt.includes("mp3") || prompt.includes("සින්දුව") || prompt.includes("සින්දු")) {
            detectedType = "song";
            searchQuery = targetText.replace(/(send|me|a|song|audio|mp3|download|play|of|සින්දුවක්|සින්දුව|දාන්න|දෙන්න)/gi, "").trim();
        }
        else if (prompt.includes("video") || prompt.includes("mp4") || prompt.includes("වීඩියෝ")) {
            detectedType = "video";
            searchQuery = targetText.replace(/(send|me|a|video|mp4|download|of|වීඩියෝවක්|වීඩියෝ|දාන්න|දෙන්න)/gi, "").trim();
        }
        else if (prompt.includes("apk") || prompt.includes("app") || prompt.includes("ඇප්")) {
            detectedType = "apk";
            searchQuery = targetText.replace(/(send|me|a|apk|app|download|of|ඇප්|එකක්|දාන්න|දෙන්න)/gi, "").trim();
        }

        // 2. Handle Media Requests
        if (detectedType && searchQuery.length > 2) {
            await reply(`🎯 *AI Detected:* Requesting a *${detectedType}* for "${searchQuery}"...\nSearching and sending...`);

            try {
                // --- PHOTO DOWNLOAD ---
                if (detectedType === "photo") {
                    const res = await fetchJson(`https://api.gurusantos.xyz/api/google-image?q=${encodeURIComponent(searchQuery)}`);
                    if (res && res.result && res.result.length > 0) {
                        return await conn.sendMessage(from, { 
                            image: { url: res.result[0] }, 
                            caption: `🤖 *Generated via Gemini search:* ${searchQuery}` 
                        }, { quoted: mek });
                    }
                }

                // --- SONG DOWNLOAD ---
                else if (detectedType === "song") {
                    const res = await fetchJson(`https://api.gurusantos.xyz/api/yt-search?q=${encodeURIComponent(searchQuery)}`);
                    if (res && res.result && res.result[0]) {
                        const download = await fetchJson(`https://api.gurusantos.xyz/api/yt-download?url=${res.result[0].url}&type=mp3`);
                        if (download && download.downloadUrl) {
                            return await conn.sendMessage(from, { 
                                audio: { url: download.downloadUrl }, 
                                mimetype: 'audio/mp4',
                                fileName: `${searchQuery}.mp3`
                            }, { quoted: mek });
                        }
                    }
                }

                // --- VIDEO DOWNLOAD ---
                else if (detectedType === "video") {
                    const res = await fetchJson(`https://api.gurusantos.xyz/api/yt-search?q=${encodeURIComponent(searchQuery)}`);
                    if (res && res.result && res.result[0]) {
                        const download = await fetchJson(`https://api.gurusantos.xyz/api/yt-download?url=${res.result[0].url}&type=mp4`);
                        if (download && download.downloadUrl) {
                            return await conn.sendMessage(from, { 
                                video: { url: download.downloadUrl }, 
                                caption: `🎥 *AI Video Result:* ${res.result[0].title}`
                            }, { quoted: mek });
                        }
                    }
                }

                // --- APK DOWNLOAD ---
                else if (detectedType === "apk") {
                    const res = await fetchJson(`https://api.gurusantos.xyz/api/apk-search?q=${encodeURIComponent(searchQuery)}`);
                    if (res && res.result && res.result[0]) {
                        const download = await fetchJson(`https://api.gurusantos.xyz/api/apk-download?id=${res.result[0].id}`);
                        if (download && download.downloadUrl) {
                            return await conn.sendMessage(from, { 
                                document: { url: download.downloadUrl }, 
                                mimetype: 'application/vnd.android.package-archive',
                                fileName: `${res.result[0].name}.apk`,
                                caption: `✅ *AI APK Result:* ${res.result[0].name}`
                            }, { quoted: mek });
                        }
                    }
                }
            } catch (mediaError) {
                console.error("Media Download Error:", mediaError);
            }

            return reply(`❌ Sorry, I found what you wanted, but I couldn't download that ${detectedType} right now.`);
        }

        // 3. Default Gemini Text Chat
        const apiUrl = `https://api.gurusantos.xyz/api/gemini?q=${encodeURIComponent(targetText)}`;
        const response = await fetchJson(apiUrl);

        if (response && response.result) {
            return await reply(`🤖 *Gemini:* \n\n${response.result}`);
        } else {
            return reply("⚠️ Sorry, I couldn't connect to Gemini. Please try again.");
        }

    } catch (error) {
        console.error("Gemini Smart Bot Error: ", error);
        return reply("❌ Operational error occurred. Please try again.");
    }
});
