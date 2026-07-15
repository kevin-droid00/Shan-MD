const { cmd, commands } = require('../command')
const config = require('../config')
const { runtime, fetchJson } = require('../lib/functions')

cmd({
    pattern: "pastpaper",
    alias: ["paper", "wiki"],
    react: "📖",
    desc: "Search and download past papers directly as PDF.",
    category: "education",
    use: ".pastpaper [subject] [year]",
    filename: __filename
},
async (Void, citel, text) => {
    try {
        if (!text) return citel.reply("❌ කරුණාකර විෂය සහ වසර ඇතුලත් කරන්න.😒 (e.g., .pastpaper physics 2022)");

        await citel.reply("📚 *Searching and downloading PDF...* Please wait.");

        const apiUrl = `https://dark-shan-yt.com/education/wiki-search?q=${encodeURIComponent(text)}`;
        const response = await fetchJson(apiUrl);

        // API එකෙන් දත්ත ලැබිලා තියෙනවාද බලනවා
        if (response && response.status && response.result && response.result.length > 0) {
            
            // සර්ච් එකට වැඩියෙන්ම ගැලපෙන පළවෙනි පේපර් එක තෝරාගැනීම
            const topResult = response.result[0];
            const pdfUrl = topResult.url; 
            const paperTitle = topResult.title || "Past Paper";

            // ඔයා දුන්න caption variable එක මෙතනට දාලා තියෙනවා
            let caption = `*📖 \`\`SHAN PASTPEPAR DOWNLOADER\`\` 📖*\n\n✅ *Here is your past paper:* \n📄 ${paperTitle}\n\n*Powered by Shan*`;

            // WhatsApp එකට කෙලින්ම Document (PDF) එකක් විදිහට යැවීම
            return await Void.sendMessage(citel.chat, {
                document: { url: pdfUrl },
                mimetype: 'application/pdf',
                fileName: `${paperTitle}.pdf`,
                caption: caption
            }, { quoted: citel });

        } else {
            return citel.reply("❌ ඔයා සොයපු Past Paper එක සොයා ගැනීමට නොහැකි විය🥺❤️‍🩹");
        }

    } catch (error) {
        console.error("Pastpaper PDF Error: ", error);
        return citel.reply("❌ PDF එක බාගත කිරීමේදී හෝ සෙවීමේදී දෝෂයක් ඇති විය🥺❤️‍🩹");
    }
});
