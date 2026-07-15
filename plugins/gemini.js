const { cmd, commands } = require('../command')
const config = require('../config')
const { runtime } = require('../lib/functions')

cmd({
    pattern: "gemini",
    alias: ["ai", "bot"],
    desc: "Ask Gemini anything, it can also send Photos, Videos, Songs, and APKs!",
    category: "ai",
    filename: __filename
},
async (Void, citel, text) => {
    try {
        if (!text) return citel.reply("Please ask me something!\n*Example:* .gemini send me a photo of a cat");

        await citel.reply("🤖 *Gemini is thinking...*");

        // 1. පරිශීලකයා ලියපු text එකේ තියෙන වචන අනුව "photo, video, song, apk" ඉල්ලනවාද කියා බැලීම
        const prompt = text.toLowerCase();
        let detectedType = null;
        let searchQuery = "";

        // පින්තූරයක් ඉල්ලනවාදැයි බැලීම (e.g., "send me a photo of car", "කාර් එකක photo එකක් දාන්න")
        if (prompt.includes("photo") || prompt.includes("image") || prompt.includes("picture") || prompt.includes("පින්තූර")) {
            detectedType = "photo";
            searchQuery = text.replace(/(send|me|a|photo|image|picture|of|පින්තූරයක්|පින්තූර|දාන්න|දෙන්න)/gi, "").trim();
        } 
        // සින්දුවක් ඉල්ලනවාදැයි බැලීම (e.g., "download song alone", "සින්දුවක් දාන්න")
        else if (prompt.includes("song") || prompt.includes("audio") || prompt.includes("mp3") || prompt.includes("සින්දුව") || prompt.includes("සින්දු")) {
            detectedType = "song";
            searchQuery = text.replace(/(send|me|a|song|audio|mp3|download|play|of|සින්දුවක්|සින්දුව|දාන්න|දෙන්න)/gi, "").trim();
        }
        // වීඩියෝවක් ඉල්ලනවාදැයි බැලීම
        else if (prompt.includes("video") || prompt.includes("mp4") || prompt.includes("වීඩියෝ")) {
            detectedType = "video";
            searchQuery = text.replace(/(send|me|a|video|mp4|download|of|වීඩියෝවක්|වීඩියෝ|දාන්න|දෙන්න)/gi, "").trim();
        }
        // App එකක් ඉල්ලනවාදැයි බැලීම
        else if (prompt.includes("apk") || prompt.includes("app") || prompt.includes("ඇප්")) {
            detectedType = "apk";
            searchQuery = text.replace(/(send|me|a|apk|app|download|of|ඇප්|එකක්|දාන්න|දෙන්න)/gi, "").trim();
        }

        // 2. පරිශීලකයා Media එකක් ඉල්ලා තිබේ නම්, කෙලින්ම Downloader එක ක්‍රියාත්මක කිරීම
        if (detectedType && searchQuery.length > 2) {
            await citel.reply(`🎯 *AI Detected:* Requesting a *${detectedType}* for "${searchQuery}"...\nSearching and sending...`);

            // --- PHOTO DOWNLOAD ---
            if (detectedType === "photo") {
                const res = await fetchJson(`https://api.gurusantos.xyz/api/google-image?q=${encodeURIComponent(searchQuery)}`);
                if (res && res.result && res.result.length > 0) {
                    return await Void.sendMessage(citel.chat, { 
                        image: { url: res.result[0] }, 
                        caption: `🤖 *Generated via Gemini search:* ${searchQuery}` 
                    }, { quoted: citel });
                }
            }

            // --- SONG DOWNLOAD ---
            else if (detectedType === "song") {
                const res = await fetchJson(`https://api.gurusantos.xyz/api/yt-search?q=${encodeURIComponent(searchQuery)}`);
                if (res && res.result && res.result[0]) {
                    const download = await fetchJson(`https://api.gurusantos.xyz/api/yt-download?url=${res.result[0].url}&type=mp3`);
                    if (download && download.downloadUrl) {
                        return await Void.sendMessage(citel.chat, { 
                            audio: { url: download.downloadUrl }, 
                            mimetype: 'audio/mp4',
                            fileName: `${searchQuery}.mp3`
                        }, { quoted: citel });
                    }
                }
            }

            // --- VIDEO DOWNLOAD ---
            else if (detectedType === "video") {
                const res = await fetchJson(`https://api.gurusantos.xyz/api/yt-search?q=${encodeURIComponent(searchQuery)}`);
                if (res && res.result && res.result[0]) {
                    const download = await fetchJson(`https://api.gurusantos.xyz/api/yt-download?url=${res.result[0].url}&type=mp4`);
                    if (download && download.downloadUrl) {
                        return await Void.sendMessage(citel.chat, { 
                            video: { url: download.downloadUrl }, 
                            caption: `🎥 *AI Video Result:* ${res.result[0].title}`
                        }, { quoted: citel });
                    }
                }
            }

            // --- APK DOWNLOAD ---
            else if (detectedType === "apk") {
                const res = await fetchJson(`https://api.gurusantos.xyz/api/apk-search?q=${encodeURIComponent(searchQuery)}`);
                if (res && res.result && res.result[0]) {
                    const download = await fetchJson(`https://api.gurusantos.xyz/api/apk-download?id=${res.result[0].id}`);
                    if (download && download.downloadUrl) {
                        return await Void.sendMessage(citel.chat, { 
                            document: { url: download.downloadUrl }, 
                            mimetype: 'application/vnd.android.package-archive',
                            fileName: `${res.result[0].name}.apk`,
                            caption: `✅ *AI APK Result:* ${res.result[0].name}`
                        }, { quoted: citel });
                    }
                }
            }

            return citel.reply(`❌ Sorry, I found what you wanted, but I couldn't download that ${detectedType} right now.`);
        }

        // 3. Media එකක් ඉල්ලා නැත්නම්, සාමාන්‍ය Gemini Text Chat එකක් ලෙස පිළිතුරු දීම
        const apiUrl = `https://api.gurusantos.xyz/api/gemini?q=${encodeURIComponent(text)}`;
        const response = await fetchJson(apiUrl);

        if (response && response.result) {
            return await citel.reply(`🤖 *Gemini:* \n\n${response.result}`);
        } else {
            return citel.reply("⚠️ Sorry, I couldn't connect to Gemini. Please try again.");
        }

    } catch (error) {
        console.error("Gemini Smart Bot Error: ", error);
        return citel.reply("❌ Operational error occurred. Please try again.");
    }
});
    
