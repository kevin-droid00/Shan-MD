const mongoose = require('mongoose');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const config = require('../config');

const databaseFolder = path.join(__dirname, 'database');
const filePath = path.join(databaseFolder, 'data.json');

// Ensure database folder exists
if (!fs.existsSync(databaseFolder)) {
    fs.mkdirSync(databaseFolder, { recursive: true });
}

const settingsSchema = new mongoose.Schema({
    OWNER_NUMBER: { type: String, default: "94721475081" },
    MV_SIZE: { type: String, default: "0" },
    NAME: { type: String, default: "" },
    SESSION_ID2: { type: String, default: "" },
    SESSION_ID3: { type: String, default: "" },
    SESSION_ID4: { type: String, default: "" },
    SESSION_ID5: { type: String, default: "" },
    SESSION_ID6: { type: String, default: "" },
    SESSION_ID7: { type: String, default: "" },
    SESSION_ID8: { type: String, default: "" },
    SESSION_ID9: { type: String, default: "" },
    SESSION_ID10: { type: String, default: "" },
    JID: { type: String, default: "" },
    SEEDR_MAIL: { type: String, default: "" },
    SEEDR_PASSWORD: { type: String, default: "" },
    LANG: { type: String, default: "SI" },
    SUDO: { type: [String], default: [] },
    JID_BLOCK: { type: [String], default: [] },
    ANTI_BAD: { type: String, default: "" },
    MAX_SIZE: { type: Number, default: 150 },
    ANTI_CALL: { type: String, default: "false" },
    AUTO_READ_STATUS: { type: String, default: "false" },
    AUTO_BLOCK: { type: String, default: "false" },
    AUTO_STICKER: { type: String, default: "false" },
    AUTO_VOICE: { type: String, default: "false" },
    AUTO_REACT: { type: String, default: "false" },
    CMD_ONLY_READ: { type: String, default: "true" },
    WORK_TYPE: { type: String, default: "private" },
    XNXX_BLOCK: { type: String, default: "true" },
    AUTO_MSG_READ: { type: String, default: "false" },
    AUTO_TYPING: { type: String, default: "false" },
    AUTO_RECORDING: { type: String, default: "false" },
    AUTO_WELCOME_LEAVE: { type: [String], default: [] },
    ANTI_LINK: { type: String, default: "false" },
    ANTI_BOT: { type: String, default: "false" },
    ALIVE: { type: String, default: "default" },
    PREFIX: { type: String, default: "." },
    CHAT_BOT: { type: String, default: "false" },
    ALWAYS_OFFLINE: { type: String, default: "false" }, // Fixed typo: ALLWAYS -> ALWAYS
    MV_BLOCK: { type: String, default: "true" },
    BUTTON: { type: String, default: "false" },
    ACTION: { type: String, default: "delete" },
    ANTILINK_ACTION: { type: String, default: "delete" },
    VALUES: { type: [String], default: [] },
    LOGO: { type: String, default: "https://files.catbox.moe/loaugg.jpeg" },
    MAINMENU: { type: String, default: "https://files.catbox.moe/nv1b5u.png" },
    GROUPMENU: { type: String, default: "https://files.catbox.moe/g014f8.png" },
    OWNERMENU: { type: String, default: "https://files.catbox.moe/6pb0fx.png" },
    CONVERTMENU: { type: String, default: "https://files.catbox.moe/w5txfy.png" },
    AIMENU: { type: String, default: "https://files.catbox.moe/ucpido.png" },
    LOGOMENU: { type: String, default: "https://files.catbox.moe/aijuom.png" },
    DOWNMENU: { type: String, default: "https://files.catbox.moe/5gri9l.png" },
    SEARCHMENU: { type: String, default: "https://files.catbox.moe/c00eef.png" },
    OTHERMENU: { type: String, default: "https://files.catbox.moe/5s4i1d.png" },
    MOVIEMENU: { type: String, default: "https://files.catbox.moe/f31voy.png" },
    ANTI_DELETE: { type: String, default: "off" },
    LEAVE_MSG: { type: String, default: "" },
    AUTO_STATUS_REACT: { type: String, default: "true" },
    CUSTOM_REACT: { type: String, default: "" },
});

// Use a static model name if config.SESSION_ID is not provided or invalid
const modelName = (config.SESSION_ID && typeof config.SESSION_ID === 'string' && config.SESSION_ID.trim() !== '') 
    ? config.SESSION_ID 
    : 'Settings';

const Settings = mongoose.model(modelName, settingsSchema);

async function connectdb() {
    try {
        // Hardcoded MongoDB URI - Consider moving to environment variables for security
        await mongoose.connect('mongodb+srv://ARmfHjXz:YiSbuJIMvWfjA95M@us-east-1.ufsuw.mongodb.net/Sadasnew');
        console.log("Database connected 🛢️");

        const settingsCount = await Settings.countDocuments();
        if (settingsCount === 0) {
            await new Settings().save();
            console.log("Settings initialized ✅");
        }
    } catch (error) {
        console.error(" ├ Database connection error:", error);
    }
}

async function readJsonFile() {
    try {
        const data = await fsPromises.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

async function writeJsonFile(data) {
    try {
        await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error writing JSON file:", e);
    }
}

async function updateCMDStore(MsgID, CmdID) {
    try {
        const olds = await readJsonFile();
        olds.push({ [MsgID]: CmdID });
        await writeJsonFile(olds);
        return true;
    } catch (e) {
        return false;
    }
}

async function isbtnID(MsgID) {
    const olds = await readJsonFile();
    return olds.some(item => item[MsgID]);
}

async function getCMDStore(MsgID) {
    const olds = await readJsonFile();
    const foundItem = olds.find(item => item[MsgID]);
    return foundItem ? foundItem[MsgID] : null;
}

// --- Settings Management ---
async function input(setting, data) {
    try {
        await Settings.findOneAndUpdate({}, { [setting]: data }, { upsert: true });
    } catch (e) {
        console.error(`Error updating setting ${setting}:`, e);
    }
}

async function get(setting) {
    try {
        const settings = await Settings.findOne();
        return settings ? settings[setting] : null;
    } catch (e) {
        return null;
    }
}

async function updb() {
    try {
        const settings = await Settings.findOne();
        if (settings) {
            Object.assign(config, settings.toObject());
            console.log("Database updated ✅");
        }
    } catch (e) {
        console.error("Error updating config from database:", e);
    }
}

async function updfb() {
    try {
        await Settings.deleteMany({});
        await new Settings().save();
        console.log("Database reset ✅");
    } catch (e) {
        console.error("Error resetting database:", e);
    }
}

async function upresbtn() {
    await writeJsonFile([]);
    console.log(" ├ Command store reset ✅");
}

function getCmdForCmdId(CMD_ID_MAP, cmdId) {
    if (!Array.isArray(CMD_ID_MAP)) return null;
    const result = CMD_ID_MAP.find(entry => entry.cmdId === cmdId);
    return result ? result.cmd : null;
}

async function getalls() {
    try {
        const settings = await Settings.findOne();
        return settings ? settings.toJSON() : null;
    } catch (e) {
        return null;
    }
}

// Initial connection
connectdb().catch(console.error);

module.exports = {
    updateCMDStore, 
    isbtnID, 
    getCMDStore, 
    input, 
    get, 
    getalls, 
    updb, 
    updfb, 
    upresbtn, 
    getCmdForCmdId, 
    connectdb
};
