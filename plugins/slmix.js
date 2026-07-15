const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config'); // ඔයාගේ බොට්ගේ config file එක තියෙන path එක බලන්න

// ==========================================
// 1. SONG SEARCH & BUTTONS COMMAND
// ==========================================
Cmd({
    pattern: "slmix",
    alias: ["slsong"],
    use: '.slmix <song name>',
    react: "🎧",
    desc: "Download songs from SLMix.lk",
    category: "Download",
    filename: __filename
},

async(conn, mek, m, {
  from, prefix, q, reply
}) => {
  try {
    if (!q) return await reply('🔎 *Please provide a song name!* (e.g., .slmix manike mage hithe)');

    // Slmix.lk එකේ සින්දුව search කරනවා
    const searchUrl = `https://www.slmix.lk/search?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' } 
    });
    const $ = cheerio.load(data);

    // සර්ච් රිසල්ට් වලින් පළවෙනි සින්දුවේ විස්තර ගන්නවා
    const firstResult = $('.song-list-item, .result-item, .post-item').first(); 
    
    if (!firstResult.length) return await reply('❌ *No songs found on SLMix for this name!*');

    const title = firstResult.find('.song-title, h2, .title').text().trim() || q;
    const pageLink = firstResult.find('a').attr('href');
    let thumbnail = firstResult.find('img').attr('src') || 'https://www.slmix.lk/assets/images/logo.png'; 

    if (!pageLink) return await reply('❌ *Could not fetch the download page.*');

    // සින්දුවේ Page එකට ගිහින් Direct MP3 Link එක ගන්නවා
    const pageData = await axios.get(pageLink, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $$ = cheerio.load(pageData.data);
    
    const downloadLink = $$('a.download-btn, a[href*=".mp3"]').first().attr('href');

    if (!downloadLink) return await reply('❌ *Download link not found for this song.*');

    const wm = config.FOOTER;

    let caption = `*🎶 SLMIX SONG DOWNLOADER 🎶*

*☘️ Title :* *${title}*
*💃 Source :* *SLMix.lk*
*🔗 Page :* *${pageLink}*`;
	  
    // බටන් සඳහා දත්ත යැවීමේදී 'link' සහ 'title' එක '&' ලකුණෙන් වෙන් කර යවයි
    const buttons = [
      {
        buttonId: `${prefix}slmix_dl audio ${downloadLink}&${title}`,
        buttonText: { displayText: 'Audio Format 🎶' },
        type: 1
      },
      {
        buttonId: `${prefix}slmix_dl doc ${downloadLink}&${title}`,
        buttonText: { displayText: 'Document Format 📂' },
        type: 1
      }
    ];

    const buttonMessage = {
      image: { url: thumbnail },
      caption: caption,
      footer: wm,
      buttons: buttons,
      headerType: 4
    };

    await conn.buttonMessage(from, buttonMessage, mek);

  } catch (e) {
    console.error(e);
    reply('❌ *An error occurred while fetching from SLMix.*');
  }
});


// ==========================================
// 2. BUTTON CLICK DOWNLOAD HANDLER
// ==========================================
Cmd({
    pattern: "slmix_dl",
    dontAddCommandList: true, 
    react: "📥",
    filename: __filename
},

async(conn, mek, m, {
  from, q, reply
}) => {
  try {
    if (!q) return;

    // බටන් එක ක්ලික් කරද්දී ආපු text එක කොටස් වලට කඩනවා
    const parts = q.split('&');
    const type = parts[0].split(' ')[0]; // audio හෝ doc
    const downloadLink = parts[0].split(' ')[1]; // mp3 link එක
    const songTitle = parts[1] || 'Audio'; // සින්දුවේ නම

    if (!downloadLink) return await reply('❌ *Download link missing!*');

    await reply('⏳ *Downloading your song from SLMix... Please wait!*');

    // Audio විදියට එවන්න ක්ලික් කරලා තිබුනොත්
    if (type === 'audio') {
        await conn.sendMessage(from, {
            audio: { url: downloadLink },
            mimetype: 'audio/mpeg',
            fileName: `${songTitle}.mp3`
        }, { quoted: mek });
    } 
    // Document විදියට එවන්න ක්ලික් කරලා තිබුනොත්
    else if (type === 'doc') {
        await conn.sendMessage(from, {
            document: { url: downloadLink },
            mimetype: 'audio/mpeg',
            fileName: `${songTitle}.mp3`
        }, { quoted: mek });
    }

  } catch (e) {
    console.error(e);
    reply('❌ *Failed to download or send the audio file.*');
  }
});
  
