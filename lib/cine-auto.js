const axios = require('axios');
const fg = require('api-dylux');
const key = '82406ca340409d44';
const BASE_URL = "https://api-dark-shan-yt.koyeb.app/movie";

async function getMovieData(movieName) {
    // 1. Search Movie
    let { data: search } = await axios.get(`${BASE_URL}/cinesubz-search?q=${encodeURIComponent(movieName)}&apikey=${key}`);
    if (!search.results || search.results.length === 0) return null;
    return search.results[0]; // Return first result {url, title, img}
}

async function getDownloadLink(url) {
    let { data } = await axios.get(`${BASE_URL}/cinesubz-download?url=${encodeURIComponent(url)}&apikey=${key}`);
    const downloads = data?.data?.download || [];
    
    // GDrive එකට ප්‍රමුඛතාවය දීම
    const gdrive = downloads.find(v => v.name === "gdrive");
    if (gdrive) {
        let res = await fg.GDriveDl(gdrive.url.replace('https://drive.usercontent.google.com/download?id=', 'https://drive.google.com/file/d/').replace('&export=download', '/view'));
        return res.downloadUrl;
    }
    
    // Fallback (unknown)
    const unknown = downloads.find(v => v.name === "unknown");
    return unknown ? unknown.url : null;
}

module.exports = { getMovieData, getDownloadLink };
