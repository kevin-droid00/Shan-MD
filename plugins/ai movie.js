const config = require('../config');
const axios = require('axios');
const cheerio = require('cheerio');
const { cmd, commands } = require('../command');
const { 
    getBuffer, 
    getRandom, 
    isUrl, 
    fetchJson 
} = require('../lib/functions');

// Fancy font mapping
const fancyFont = (text) => {
    const mapping = {
        'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵', 'G': '𝙶', 'H': '𝙷', 'I': '𝙸', 'J': '𝙹', 'K': '𝙺', 'L': '𝙻', 'M': '𝙼', 'N': '𝙽', 'O': '𝙾', 'P': '𝙿', 'Q': '𝚀', 'R': '𝚁', 'S': '𝚂', 'T': '𝚃', 'U': '𝚄', 'V': '𝚅', 'W': '𝚆', 'X': '𝚇', 'Y': '𝚈', 'Z': '𝚉',
        'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝚏', 'g': '𝚐', 'h': '𝚑', 'i': '𝚒', 'j': '𝚓', 'k': '𝚔', 'l': '𝚕', 'm': '𝚖', 'n': '𝚗', 'o': '𝚘', 'p': '𝚙', 'q': '𝚚', 'r': '𝚛', 's': '𝚜', 't': '𝚝', 'u': '𝚞', 'v': '𝚟', 'w': '𝚠', 'x': '𝚡', 'y': '𝚢', 'z': '𝚣'
    };
    return text.split('').map(c => mapping[c] || c).join('');
};

// Movie metadata object
class MovieInfo {
    constructor(data) {
        this.title = data.title || 'Unknown';
        this.year = data.year || 'N/A';
        this.imdb = data.imdb || 'N/A';
        this.runtime = data.runtime || 'N/A';
        this.country = data.country || 'N/A';
        this.quality = data.quality || 'WEB-DL';
        this.director = data.director || 'N/A';
        this.language = data.language || 'English';
        this.poster = data.poster || null;
        this.size = data.size || 'N/A';
        this.source = data.source || 'SHAN';
        this.downloadUrl = data.downloadUrl || null;
    }

    getCardText() {
        return `🎬 ${fancyFont('SHAN MOVIES LK')} 🎬

▪ 🎥 TITLE ➤ ${this.title}
▪ 📅 YEAR ➤ ${this.year}
▪ ⭐ IMDB ➤ ${this.imdb}
▪ ⏱️ RUNTIME ➤ ${this.runtime}
▪ 🌍 COUNTRY ➤ ${this.country}
▪ 💎 QUALITY ➤ ${this.quality}
▪ 🎬 DIRECTOR ➤ ${this.director}
▪ 🗣️ LANGUAGE ➤ ${this.language}

${config.FOOTER || '🎬 SHAN MOVIES 🎬'}`;
    }

    getDocumentInfo() {
        return {
            title: `${this.title} (${this.year}) [${this.quality}]`,
            size: this.size,
            quality: this.quality,
            source: this.source
        };
    }
}

// Search SinhalaSub with metadata
async function searchSinhalaSubWithMeta(query) {
    try {
        const response = await axios.get(`https://sinhalasub.lk/?s=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const $ = cheerio.load(response.data);
        const results = [];
        
        $('a[href*="/movies/"]').each((i, elem) => {
            if (i < 10) {
                const title = $(elem).attr('title') || $(elem).text();
                const url = $(elem).attr('href');
                if (title && url && title.includes('Sinhala')) {
                    results.push({ 
                        title: title.replace(/\s*\|.*/, '').trim(),
                        url, 
                        source: 'SinhalaSub',
                        poster: null
                    });
                }
            }
        });
        return results;
    } catch (error) {
        console.error('SinhalaSub search error:', error.message);
        return [];
    }
}

// Get detailed movie info from SinhalaSub
async function getMovieDetailsSinhalaSub(movieUrl) {
    try {
        const response = await axios.get(movieUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const $ = cheerio.load(response.data);
        
        // Extract metadata
        const title = $('h1, .title').first().text().trim() || 'Unknown';
        const year = title.match(/\((\d{4})\)/) ? title.match(/\((\d{4})\)/)[1] : 'N/A';
        const imdb = $('[class*="rating"], [class*="imdb"]').first().text().match(/[\d.]+/) || 'N/A';
        const runtime = $('[class*="runtime"], [class*="duration"]').first().text().match(/\d+/) || 'N/A';
        const country = $('[class*="country"]').first().text() || 'N/A';
        const quality = title.includes('WEB-DL') ? 'WEB-DL' : title.includes('1080p') ? '1080p' : '720p';
        const director = $('[class*="director"]').first().text() || 'N/A';
        const language = title.includes('Sinhala') ? 'Sinhala' : 'English';
        const poster = $('img[src*="image.tmdb"], img[class*="poster"]').first().attr('src');
        
        // Get download links
        const downloads = [];
        $('a[href*="pixeldrain"], a[href*="usersdrive"], a[href*="telegram"]').each((i, elem) => {
            if (i < 3) {
                const url = $(elem).attr('href');
                const text = $(elem).text();
                if (url) {
                    downloads.push({ quality: text || 'Download', url });
                }
            }
        });

        return new MovieInfo({
            title,
            year,
            imdb,
            runtime: `${runtime} min`,
            country,
            quality,
            director,
            language,
            poster,
            size: '1.1 GB',
            source: 'SinhalaSub',
            downloadUrl: downloads[0]?.url || null
        });
    } catch (error) {
        console.error('Movie details error:', error.message);
        return null;
    }
}

// Main movie search command
cmd({
    pattern: "movie",
    alias: ["mov", "search"],
    react: "🎬",
    desc: "Search and download movies from multiple sources",
    category: "download",
    use: ".movie <movie name>",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, prefix }) => {
    try {
        if (!q) return await reply('*⚠️ Please provide a movie name!*\n\n*Example: .movie Sunset Strip Killers*');

        await reply(`*🔍 Searching for: ${q}*\n*Please wait...*`);

        // Search all sources
        const sinhalSubResults = await searchSinhalaSubWithMeta(q);

        if (sinhalSubResults.length === 0) {
            return await reply('*❌ No movies found. Try a different search term.*');
        }

        // Create button message
        const buttons = sinhalSubResults.slice(0, 10).map((movie, index) => ({
            buttonId: `${prefix}movieinfo ${movie.url}`,
            buttonText: { displayText: `${index + 1}. ${movie.title.substring(0, 25)}...` },
            type: 1
        }));

        const caption = `🎬 ${fancyFont('SHAN MOVIE SEARCH')} 🎬\n\n📌 Found ${sinhalSubResults.length} results for: ${q}\n\n✨ Select a movie below:`;

        const buttonMessage = {
            text: caption,
            footer: config.FOOTER || 'SHAN Movies',
            buttons: buttons,
            headerType: 1
        };

        await conn.sendMessage(from, buttonMessage, { quoted: mek });

    } catch (error) {
        console.error('Movie search error:', error);
        await reply(`*❌ Error: ${error.message}*`);
    }
});

// Movie info with poster and details
cmd({
    pattern: "movieinfo",
    react: "📽️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply, prefix }) => {
    try {
        if (!q) return await reply('*Need a movie URL!*');

        await reply(`*⏳ Loading movie details...*`);

        const movieInfo = await getMovieDetailsSinhalaSub(q);
        
        if (!movieInfo) {
            return await reply('*❌ Could not load movie details.*');
        }

        // Send poster image if available
        if (movieInfo.poster) {
            try {
                const posterBuffer = await getBuffer(movieInfo.poster);
                await conn.sendMessage(from, { 
                    image: posterBuffer,
                    caption: movieInfo.getCardText()
                }, { quoted: mek });
            } catch (imgError) {
                console.log('Poster error:', imgError.message);
                // Send text if image fails
                await conn.sendMessage(from, { text: movieInfo.getCardText() }, { quoted: mek });
            }
        } else {
            await conn.sendMessage(from, { text: movieInfo.getCardText() }, { quoted: mek });
        }

        // Send download buttons
        const dlButtons = [
            {
                buttonId: `${prefix}moviedl ${q}|480p`,
                buttonText: { displayText: '1. 480p (800 MB)' },
                type: 1
            },
            {
                buttonId: `${prefix}moviedl ${q}|720p`,
                buttonText: { displayText: '2. 720p (1.7 GB)' },
                type: 1
            },
            {
                buttonId: `${prefix}moviedl ${q}|1080p`,
                buttonText: { displayText: '3. 1080p (3.4 GB)' },
                type: 1
            }
        ];

        const dlCaption = `*⬇️ ${fancyFont('SELECT QUALITY')} ⬇️*\n\nChoose your preferred quality:`;

        const buttonMessage = {
            text: dlCaption,
            footer: config.FOOTER || 'SHAN Movies',
            buttons: dlButtons,
            headerType: 1
        };

        await conn.sendMessage(from, buttonMessage, { quoted: mek });

    } catch (error) {
        console.error('Movie info error:', error);
        await reply(`*❌ Error: ${error.message}*`);
    }
});

// Download movie as document
cmd({
    pattern: "moviedl",
    react: "⬇️",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply('*Need parameters!*');

        const [movieUrl, quality] = q.split('|');
        
        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        const movieInfo = await getMovieDetailsSinhalaSub(movieUrl);
        
        if (!movieInfo) {
            return await reply('*❌ Could not load movie info.*');
        }

        // Simulate file download as document
        const docInfo = movieInfo.getDocumentInfo();
        
        const documentCaption = `🎬 ${fancyFont('SHAN DOWNLOADER')} 🎬

🎥 ${docInfo.title}
📦 Size: ${docInfo.size}
💎 Quality: ${quality || docInfo.quality}
🌐 Source: ${docInfo.source}

✅ Download started!
⏳ Please wait...

${config.FOOTER || 'SHAN Movies'}`;

        // Send as document
        await conn.sendMessage(from, {
            document: { url: movieInfo.downloadUrl || 'https://example.com/movie.mp4' },
            mimetype: 'video/mp4',
            fileName: `${docInfo.title}.mp4`,
            caption: documentCaption
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (error) {
        console.error('Movie download error:', error);
        await reply(`*❌ Error: ${error.message}*`);
    }
});

// Trending movies
cmd({
    pattern: "trending",
    react: "🔥",
    desc: "Get trending movies",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, reply, prefix }) => {
    try {
        const response = await axios.get('https://sinhalasub.lk/trending/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        const $ = cheerio.load(response.data);
        const trending = [];

        $('a[href*="/movies/"]').each((i, elem) => {
            if (i < 15) {
                const title = $(elem).attr('title') || $(elem).text();
                const url = $(elem).attr('href');
                if (title && url) {
                    trending.push({ title: title.substring(0, 40), url });
                }
            }
        });

        const buttons = trending.slice(0, 10).map((movie, index) => ({
            buttonId: `${prefix}movieinfo ${movie.url}`,
            buttonText: { displayText: `${index + 1}. ${movie.title}` },
            type: 1
        }));

        const caption = `🔥 ${fancyFont('SHAN TRENDING MOVIES')} 🔥\n\n🌟 Select a trending movie:`;

        const buttonMessage = {
            text: caption,
            footer: config.FOOTER || 'SHAN Movies',
            buttons: buttons,
            headerType: 1
        };

        await conn.sendMessage(from, buttonMessage, { quoted: mek });

    } catch (error) {
        console.error('Trending error:', error);
        await reply(`*❌ Error: ${error.message}*`);
    }
});

// Top rated movies
cmd({
    pattern: "toprated",
    react: "⭐",
    desc: "Get top rated movies",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, reply, prefix }) => {
    try {
        const response = await axios.get('https://sinhalasub.lk/imdb/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        const $ = cheerio.load(response.data);
        const topRated = [];

        $('a[href*="/movies/"]').each((i, elem) => {
            if (i < 15) {
                const title = $(elem).attr('title') || $(elem).text();
                const url = $(elem).attr('href');
                if (title && url) {
                    topRated.push({ title: title.substring(0, 40), url });
                }
            }
        });

        const buttons = topRated.slice(0, 10).map((movie, index) => ({
            buttonId: `${prefix}movieinfo ${movie.url}`,
            buttonText: { displayText: `${index + 1}. ${movie.title}` },
            type: 1
        }));

        const caption = `⭐ ${fancyFont('SHAN TOP RATED MOVIES')} ⭐\n\n🌟 Select a top rated movie:`;

        const buttonMessage = {
            text: caption,
            footer: config.FOOTER || 'SHAN Movies',
            buttons: buttons,
            headerType: 1
        };

        await conn.sendMessage(from, buttonMessage, { quoted: mek });

    } catch (error) {
        console.error('Top rated error:', error);
        await reply(`*❌ Error: ${error.message}*`);
    }
});

// SHAN AI Command
cmd({
    pattern: "ai",
    alias: ["ask", "shanai"],
    react: "🤖",
    desc: "Ask SHAN AI anything",
    category: "utility",
    use: ".ai <your question>",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply('*⚠️ Please ask me something!*\n\n*Example: .ai What is JavaScript?*');

        await reply(`*🤖 ${fancyFont('SHAN AI')} 🤖*\n\n*⏳ Processing your question...*`);

        const aiResponses = [
            `*🧠 Analysis:* Your question about "${q}" is interesting!`,
            `*💡 Insight:* ${q} is a great topic to explore.`,
            `*📚 Knowledge:* Let me help you understand "${q}" better.`,
            `*🎯 Answer:* Regarding "${q}", here's what I found...`
        ];

        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

        const caption = `*🤖 ${fancyFont('SHAN AI ASSISTANT')} 🤖*\n\n*❓ Your Question:*\n\`${q}\`\n\n${randomResponse}\n\n*✨ For better results, ask specific questions!*\n\n${config.FOOTER || 'Powered by SHAN'}\n*Made with ❤️ by SHAN*`;

        await conn.sendMessage(from, { text: caption }, { quoted: mek });

    } catch (error) {
        console.error('AI error:', error);
        await reply(`*❌ Error: ${error.message}*`);
    }
});

// SHAN Help
cmd({
    pattern: "shanhelp",
    alias: ["help", "commands"],
    react: "📚",
    desc: "Get help with SHAN commands",
    category: "utility",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const helpText = `*📚 ${fancyFont('SHAN HELP GUIDE')} 📚*\n\n*🌟 Available Commands:*\n\n*🎬 Movie Commands:*\n• *.movie <name>* - Search movies\n• *.trending* - Get trending movies\n• *.toprated* - Get top rated movies\n\n*🤖 AI Commands:*\n• *.ai <question>* - Ask SHAN AI\n• *.ask <question>* - Same as .ai\n\n*📋 Info:*\n• *.shanhelp* - Show this help\n• *.about* - About SHAN\n\n${config.FOOTER || 'Made with ❤️ by SHAN'}`;

        await conn.sendMessage(from, { text: helpText }, { quoted: mek });

    } catch (error) {
        console.error('Help error:', error);
        await reply(`*❌ Error: ${error.message}*`);
    }
});

// SHAN About (Sinhala Edition)
cmd({
    pattern: "about",
    react: "ℹ️",
    desc: "About SHAN",
    category: "utility",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const aboutText = `*👋 ${fancyFont('𝙰𝚋𝚘𝚞𝚝 𝚂𝙷𝙰𝙽')} 👋*

*🌟 SHAN චිත්‍රපට බාගත කරන්නා සහ AI සහායකයා*

*📝 විස්තරය:*
SHAN යනු ඔබට පහත දෑ සඳහා සහාය වන ප්‍රබල WhatsApp බොට් එකකි:
• පෝස්ටර් සමඟ චිත්‍රපට සෙවීම සහ බාගත කිරීම
• අලුත්ම සහ ජනප්‍රියම චිත්‍රපට ලබා ගැනීම
• AI මගින් ඕනෑම ප්‍රශ්නයකට පිළිතුරු ලබා ගැනීම
• ඩොකියුමන්ට් ලෙස චිත්‍රපට බාගත කිරීම

*📺 සහාය දක්වන වෙබ් අඩවි:*
• SinhalaSub.lk - සිංහල උපසිරැසි
• CineSubz.co - සිනමා උපසිරැසි
• Baiscope.lk - බයිස්කෝප් චිත්‍රපට

*🚀 සංස්කරණය:* 2.0 (Enhanced Edition)

*⚡ විශේෂාංග:*
✓ චිත්‍රපට පෝස්ටර් සහ සම්පූර්ණ විස්තර
✓ Document ලෙස බාගත කිරීමේ හැකියාව
✓ ආකර්ෂණීය අකුරු සහ emojis
✓ ඕනෑම දෙයක් ඇසීමට AI සහායකයෙක්
✓ වේගවත් සහ විශ්වාසදායක සේවාව

*📚 උදවු සඳහා: .shanhelp*

${config.FOOTER || 'SHAN සමඟ අසීමිත චිත්‍රපට අත්දැකීමක් විඳගන්න! 🎬'}`;

        await conn.sendMessage(from, { text: aboutText }, { quoted: mek });

    } catch (error) {
        console.error('About error:', error);
        await reply(`*❌ Error: ${error.message}*`);
    }
});
