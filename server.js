const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

function loadEnvFile() {
    try {
        const envPath = path.join(__dirname, '.env');
        if (!fs.existsSync(envPath)) return;
        fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;
            const eq = trimmed.indexOf('=');
            if (eq === -1) return;
            const key = trimmed.slice(0, eq).trim();
            const value = trimmed.slice(eq + 1).trim();
            if (key && process.env[key] === undefined) process.env[key] = value;
        });
    } catch (e) {}
}
loadEnvFile();

const PORT = process.env.PORT || 8081;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ico': 'image/x-icon'
};

// ─── JioSaavn API Base URLs & Headers ──────────────────────────────────────────
const SAAVN_API_BASES = [
    'https://www.jiosaavn.com/api.php',
];

const SAAVN_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.jiosaavn.com/',
    'Origin': 'https://www.jiosaavn.com',
};

function json(res, status, body) {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(body));
}

// ─── Pure JavaScript DES-ECB Deciphering ──────────────────────────────────────
function desDecryptECB(ciphertextBase64, keyStr = '38346591') {
    const IP = [
        58, 50, 42, 34, 26, 18, 10, 2,
        60, 52, 44, 36, 28, 20, 12, 4,
        62, 54, 46, 38, 30, 22, 14, 6,
        64, 56, 48, 40, 32, 24, 16, 8,
        57, 49, 41, 33, 25, 17, 9, 1,
        59, 51, 43, 35, 27, 19, 11, 3,
        61, 53, 45, 37, 29, 21, 13, 5,
        63, 55, 47, 39, 31, 23, 15, 7
    ];

    const FP = [
        40, 8, 48, 16, 56, 24, 64, 32,
        39, 7, 47, 15, 55, 23, 63, 31,
        38, 6, 46, 14, 54, 22, 62, 30,
        37, 5, 45, 13, 53, 21, 61, 29,
        36, 4, 44, 12, 52, 20, 60, 28,
        35, 3, 43, 11, 51, 19, 59, 27,
        34, 2, 42, 10, 50, 18, 58, 26,
        33, 1, 41, 9, 49, 17, 57, 25
    ];

    const E = [
        32, 1, 2, 3, 4, 5,
        4, 5, 6, 7, 8, 9,
        8, 9, 10, 11, 12, 13,
        12, 13, 14, 15, 16, 17,
        16, 17, 18, 19, 20, 21,
        20, 21, 22, 23, 24, 25,
        24, 25, 26, 27, 28, 29,
        28, 29, 30, 31, 32, 1
    ];

    const P = [
        16, 7, 20, 21, 29, 12, 28, 17,
        1, 15, 23, 26, 5, 18, 31, 10,
        2, 8, 24, 14, 32, 27, 3, 9,
        19, 13, 30, 6, 22, 11, 4, 25
    ];

    const S = [
        [
            [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
            [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
            [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
            [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]
        ],
        [
            [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
            [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
            [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
            [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]
        ],
        [
            [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
            [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
            [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
            [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]
        ],
        [
            [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
            [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
            [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
            [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]
        ],
        [
            [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
            [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
            [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
            [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]
        ],
        [
            [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
            [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
            [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
            [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]
        ],
        [
            [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
            [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
            [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
            [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]
        ],
        [
            [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
            [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
            [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
            [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]
        ]
    ];

    const PC1 = [
        57, 49, 41, 33, 25, 17, 9,
        1, 58, 50, 42, 34, 26, 18,
        10, 2, 59, 51, 43, 35, 27,
        19, 11, 3, 60, 52, 44, 36,
        63, 55, 47, 39, 31, 23, 15,
        7, 62, 54, 46, 38, 30, 22,
        14, 6, 61, 53, 45, 37, 29,
        21, 13, 5, 28, 20, 12, 4
    ];

    const PC2 = [
        14, 17, 11, 24, 1, 5,
        3, 28, 15, 6, 21, 10,
        23, 19, 12, 4, 26, 8,
        16, 7, 27, 20, 13, 2,
        41, 52, 31, 37, 47, 55,
        30, 40, 51, 45, 33, 48,
        44, 49, 39, 56, 34, 53,
        46, 42, 50, 36, 29, 32
    ];

    const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

    function bytesToBits(bytes) {
        const bits = [];
        for (let i = 0; i < bytes.length; i++) {
            for (let j = 7; j >= 0; j--) {
                bits.push((bytes[i] >> j) & 1);
            }
        }
        return bits;
    }

    function bitsToBytes(bits) {
        const bytes = new Uint8Array(bits.length / 8);
        for (let i = 0; i < bytes.length; i++) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                byte = (byte << 1) | bits[i * 8 + j];
            }
            bytes[i] = byte;
        }
        return bytes;
    }

    function permute(bits, table) {
        return table.map(pos => bits[pos - 1]);
    }

    function xor(a, b) {
        return a.map((val, i) => val ^ b[i]);
    }

    function generateSubkeys(keyBytes) {
        const keyBits = bytesToBits(keyBytes);
        const permutedKey = permute(keyBits, PC1);
        let C = permutedKey.slice(0, 28);
        let D = permutedKey.slice(28, 56);
        const subkeys = [];

        for (let i = 0; i < 16; i++) {
            const shift = SHIFTS[i];
            C = C.slice(shift).concat(C.slice(0, shift));
            D = D.slice(shift).concat(D.slice(0, shift));
            const CD = C.concat(D);
            subkeys.push(permute(CD, PC2));
        }
        return subkeys;
    }

    function feistel(R, subkey) {
        const expandedR = permute(R, E);
        const xored = xor(expandedR, subkey);
        const sOutput = [];

        for (let i = 0; i < 8; i++) {
            const block = xored.slice(i * 6, (i + 1) * 6);
            const row = (block[0] << 1) | block[5];
            const col = (block[1] << 3) | (block[2] << 2) | (block[3] << 1) | block[4];
            const val = S[i][row][col];
            for (let j = 3; j >= 0; j--) {
                sOutput.push((val >> j) & 1);
            }
        }
        return permute(sOutput, P);
    }

    function decryptBlock(blockBits, subkeys) {
        const permutedBlock = permute(blockBits, IP);
        let L = permutedBlock.slice(0, 32);
        let R = permutedBlock.slice(32, 64);

        for (let i = 15; i >= 0; i--) {
            const nextL = R;
            const fResult = feistel(R, subkeys[i]);
            R = xor(L, fResult);
            L = nextL;
        }

        const combined = R.concat(L);
        return permute(combined, FP);
    }

    const keyBytes = new Uint8Array(8);
    for (let i = 0; i < 8; i++) keyBytes[i] = keyStr.charCodeAt(i) || 0;
    const subkeys = generateSubkeys(keyBytes);

    const cipherBytes = Buffer.from(ciphertextBase64, 'base64');
    const plainBits = [];

    for (let i = 0; i < cipherBytes.length; i += 8) {
        const blockBytes = cipherBytes.slice(i, i + 8);
        const blockBits = bytesToBits(blockBytes);
        const decryptedBlockBits = decryptBlock(blockBits, subkeys);
        plainBits.push(...decryptedBlockBits);
    }

    const decryptedBytes = bitsToBytes(plainBits);
    const padLen = decryptedBytes[decryptedBytes.length - 1];
    const unpaddedBytes = (padLen > 0 && padLen <= 8) 
        ? decryptedBytes.slice(0, decryptedBytes.length - padLen) 
        : decryptedBytes;

    const decryptedStr = Buffer.from(unpaddedBytes).toString('utf8');
    return decryptedStr.replace(/_96\.mp4/, '_320.mp4').replace(/_96\.mp3/, '_320.mp3');
}

/**
 * Decrypt JioSaavn encrypted_media_url to get playable stream URL
 */
function decryptSaavnUrl(url) {
    if (!url) return '';
    try {
        const decrypted = desDecryptECB(url, '38346591');
        if (decrypted && decrypted.startsWith('http')) {
            return decrypted;
        }
        return '';
    } catch (e) {
        console.error('[Saavn] Decrypt error:', e.message);
        return '';
    }
}

/**
 * Convert Saavn image URL from 150x150 to 500x500 for HD cover art
 */
function hdImage(url) {
    if (!url) return '';
    return url.replace(/150x150/, '500x500').replace(/50x50/, '500x500');
}

/**
 * Map a JioSaavn song object from their API to our standard format
 */
function mapSaavnSong(song) {
    if (!song || (!song.id && !song.song && !song.title)) return null;

    const id = song.id || song.song_id || song.more_info?.song_id || String(Math.random());

    const downloadUrls = [];
    const enc = song.more_info?.encrypted_media_url || song.encrypted_media_url;
    if (enc) {
        const decrypted = decryptSaavnUrl(enc);
        if (decrypted) {
            // Provide direct CDN URL as primary quality
            downloadUrls.push({ url: decrypted, quality: '320kbps' });
            // Provide server stream proxy URL for 100% CORS & Range header support
            downloadUrls.push({ url: `/api/stream?url=${encodeURIComponent(decrypted)}`, quality: '320kbps' });
        }
    }

    if (song.more_info?.media_preview_url) {
        const previewUrl = song.more_info.media_preview_url.replace('preview', 'aac').replace('_96_p', '_320');
        downloadUrls.push({ url: previewUrl, quality: '320kbps' });
        downloadUrls.push({ url: `/api/stream?url=${encodeURIComponent(previewUrl)}`, quality: '320kbps' });
    }

    if (song.more_info?.vlink) {
        downloadUrls.push({ url: song.more_info.vlink, quality: '160kbps' });
    }

    const image = song.image || song.more_info?.artistMap?.primary_artists?.[0]?.image || '';
    const imageHd = hdImage(image);

    const primaryArtists = song.more_info?.primary_artists || song.primary_artists || song.singers || song.more_info?.artistMap?.primary_artists?.map(a => a.name).join(', ') || '';

    return {
        id: id,
        name: song.song || song.title || song.name || 'Unknown Track',
        title: song.song || song.title || song.name || 'Unknown Track',
        album: {
            id: song.albumid || song.more_info?.album_id || '',
            name: song.album || song.more_info?.album || 'Single'
        },
        artists: {
            primary: (song.more_info?.artistMap?.primary_artists || []).map(a => ({
                id: a.id,
                name: a.name,
                image: hdImage(a.image)
            }))
        },
        primaryArtists: primaryArtists,
        singers: primaryArtists,
        image: [
            { url: image ? image.replace('150x150', '150x150') : '' },
            { url: image ? image.replace('150x150', '250x250') : '' },
            { url: imageHd || image }
        ],
        duration: parseInt(song.more_info?.duration || song.duration || 0),
        year: song.year || song.more_info?.year || '',
        language: song.language || song.more_info?.language || '',
        playCount: song.play_count || song.more_info?.play_count || 0,
        downloadUrl: downloadUrls,
        isSaavn: true,
        saavnUrl: song.perma_url || ''
    };
}

/**
 * Map a JioSaavn album object to standard format
 */
function mapSaavnAlbum(album) {
    if (!album || (!album.albumid && !album.id)) return null;
    const image = album.image || '';
    return {
        id: album.albumid || album.id,
        name: album.album || album.title || 'Unknown Album',
        title: album.album || album.title || 'Unknown Album',
        artist: album.primary_artists || album.music || album.more_info?.firstname || '',
        image: [
            { url: image },
            { url: hdImage(image) },
            { url: hdImage(image) }
        ],
        year: album.year || album.more_info?.year || '',
        songCount: album.song_count || album.more_info?.song_count || 0,
        type: 'album',
        saavnUrl: album.perma_url || ''
    };
}

/**
 * Map a JioSaavn playlist object to standard format
 */
function mapSaavnPlaylist(playlist) {
    if (!playlist || (!playlist.listid && !playlist.id)) return null;
    const image = playlist.image || '';
    return {
        id: playlist.listid || playlist.id,
        name: playlist.listname || playlist.title || playlist.name || 'Unknown Playlist',
        title: playlist.listname || playlist.title || playlist.name || 'Unknown Playlist',
        description: playlist.more_info?.firstname || playlist.subtitle || '',
        artist: playlist.more_info?.firstname || 'JioSaavn',
        image: [
            { url: image },
            { url: hdImage(image) },
            { url: hdImage(image) }
        ],
        songCount: playlist.more_info?.count || playlist.song_count || 0,
        type: 'playlist',
        saavnUrl: playlist.perma_url || ''
    };
}

/**
 * Map a JioSaavn artist object to standard format
 */
function mapSaavnArtist(artist) {
    if (!artist || (!artist.artistid && !artist.id)) return null;
    const image = artist.image || '';
    return {
        id: artist.artistid || artist.id,
        name: artist.name || artist.title || 'Unknown Artist',
        title: artist.name || artist.title || 'Unknown Artist',
        image: [
            { url: image },
            { url: hdImage(image) },
            { url: hdImage(image) }
        ],
        type: 'artist',
        saavnUrl: artist.perma_url || ''
    };
}

/**
 * Fetch from JioSaavn internal API
 */
async function saavnFetch(params) {
    const url = new URL(SAAVN_API_BASES[0]);
    const defaultParams = {
        _format: 'json',
        _marker: '0',
        api_version: '4',
        ctx: 'web6dot0',
        ...params
    };
    Object.entries(defaultParams).forEach(([k, v]) => url.searchParams.set(k, v));

    const response = await fetch(url.toString(), { headers: SAAVN_HEADERS });
    if (!response.ok) throw new Error(`Saavn API error: ${response.status}`);
    return response.json();
}

/**
 * Comprehensive search using JioSaavn internal API
 */
async function searchSaavn(query, limit = 20) {
    try {
        console.log(`[Saavn] Full search: "${query}"`);
        const [autoData, songResults] = await Promise.all([
            saavnFetch({ __call: 'autocomplete.get', query: query, _format: 'json' }).catch(() => ({})),
            searchSaavnSongs(query, limit).catch(() => ([]))
        ]);

        const albums = (autoData.albums?.data || []).slice(0, 10).map(mapSaavnAlbum).filter(Boolean);
        const playlists = (autoData.playlists?.data || []).slice(0, 10).map(mapSaavnPlaylist).filter(Boolean);
        const artists = (autoData.artists?.data || []).slice(0, 8).map(mapSaavnArtist).filter(Boolean);

        return { songs: songResults, albums, playlists, artists };
    } catch (e) {
        console.error('[Saavn] Search error:', e.message);
        return { songs: [], albums: [], playlists: [], artists: [] };
    }
}

/**
 * Search just songs using the dedicated search.getResults endpoint
 */
async function searchSaavnSongs(query, limit = 30) {
    try {
        console.log(`[Saavn] Song search: "${query}"`);
        const data = await saavnFetch({
            __call: 'search.getResults',
            q: query,
            N: String(limit),
            p: '1'
        });

        const results = data.results || data.songs?.results || [];
        return results.slice(0, limit).map(mapSaavnSong).filter(song => song && song.downloadUrl.length > 0);
    } catch (e) {
        console.error('[Saavn] Song search error:', e.message);
        return [];
    }
}

/**
 * Get playlist songs from JioSaavn
 */
async function getSaavnPlaylist(playlistId, limit = 50) {
    try {
        const data = await saavnFetch({
            __call: 'playlist.getDetails',
            listid: playlistId,
            N: String(limit),
            p: '1'
        });

        const playlist = mapSaavnPlaylist(data);
        if (!playlist) throw new Error('Invalid playlist data');

        const songs = (data.list || data.songs || []).map(mapSaavnSong).filter(Boolean);
        return {
            ...playlist,
            songs,
            description: data.more_info?.firstname || `JioSaavn Playlist • ${songs.length} songs`
        };
    } catch (e) {
        console.error('[Saavn] Playlist error:', e.message);
        throw e;
    }
}

/**
 * Get album songs from JioSaavn
 */
async function getSaavnAlbum(albumId) {
    try {
        const data = await saavnFetch({
            __call: 'content.getAlbumDetails',
            albumid: albumId
        });

        const album = mapSaavnAlbum(data);
        if (!album) throw new Error('Invalid album data');

        const songs = (data.list || data.songs || []).map(mapSaavnSong).filter(Boolean);
        return {
            ...album,
            songs,
            description: `${album.artist} • ${album.year || '2026'}`
        };
    } catch (e) {
        console.error('[Saavn] Album error:', e.message);
        throw e;
    }
}

/**
 * Get song details by ID
 */
async function getSaavnSong(songId) {
    try {
        const data = await saavnFetch({
            __call: 'song.getDetails',
            pids: songId
        });
        const songObj = (data.songs?.[0] || data[songId] || data.song || data);
        return mapSaavnSong(songObj);
    } catch (e) {
        console.error('[Saavn] Song details error:', e.message);
        throw e;
    }
}

/**
 * Get trending/chart songs using JioSaavn chart API
 */
async function getSaavnTrending(lang = 'all', limit = 40) {
    try {
        if (lang !== 'all' && lang !== '') {
            return searchSaavnSongs(`${lang} hits 2026 chartbusters`, limit);
        }

        // For 'all' language, fetch from browse modules
        const data = await saavnFetch({
            __call: 'content.getBrowseModules',
            language: 'hindi,english,punjabi,tamil,telugu,kannada,malayalam,bengali,bhojpuri,urdu',
        });

        let allSongs = [];
        const extractSongs = (list) => {
            if (!Array.isArray(list)) return;
            list.forEach(item => {
                const mapped = mapSaavnSong(item);
                if (mapped && mapped.downloadUrl.length > 0) {
                    allSongs.push(mapped);
                }
            });
        };

        extractSongs(data.new_trending);
        extractSongs(data.charts);
        extractSongs(data.browse_discover);
        extractSongs(data.new_albums);

        if (allSongs.length > 0) {
            // Unique by song ID
            const seen = new Set();
            const uniqueSongs = allSongs.filter(s => {
                if (seen.has(s.id)) return false;
                seen.add(s.id);
                return true;
            });
            return uniqueSongs.slice(0, limit);
        }

        // Fallback: search top Indian hits
        return searchSaavnSongs('indian trending hits 2026', limit);
    } catch (e) {
        console.error('[Saavn] Trending error:', e.message);
        return searchSaavnSongs('malayalam hindi tamil top hits 2026', limit);
    }
}

// Parse permalink/URL to get type and ID
function parseSaavnUrl(input) {
    const trimmed = input.trim();
    const match = trimmed.match(/jiosaavn\.com\/(song|album|playlist|artist|s)\//);
    if (!match) return null;

    const urlParts = trimmed.split('?')[0].split('/');
    const token = urlParts[urlParts.length - 1];
    const typeMap = { 'song': 'song', 'album': 'album', 'playlist': 'playlist', 'artist': 'artist', 's': 'song' };
    return { type: typeMap[match[1]] || 'song', token };
}

// ─── HTTP Server ──────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    try {
        if (req.method === 'OPTIONS') {
            res.writeHead(204, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Range'
            });
            return res.end();
        }

        // ── Health check ──────────────────────────────────────────────────────
        if (pathname === '/api/health') {
            return json(res, 200, {
                success: true,
                api: 'JioSaavn',
                message: 'JioSaavn API connected — direct audio streaming ready!'
            });
        }

        // ── Search all ───────────────────────────────────────────────────────
        if (pathname === '/api/search') {
            const query = parsedUrl.searchParams.get('query');
            if (!query) return json(res, 400, { success: false, message: 'Missing query' });

            const limit = parseInt(parsedUrl.searchParams.get('limit') || '20', 10);
            const results = await searchSaavn(query, limit);

            return json(res, 200, {
                success: true,
                data: {
                    songs: { results: results.songs },
                    albums: { results: results.albums },
                    playlists: { results: results.playlists },
                    artists: { results: results.artists },
                    results: results.songs
                }
            });
        }

        // ── Search songs ─────────────────────────────────────────────────────
        if (pathname === '/api/search/songs') {
            const query = parsedUrl.searchParams.get('query');
            if (!query) return json(res, 400, { success: false, message: 'Missing query' });
            const limit = parseInt(parsedUrl.searchParams.get('limit') || '30', 10);
            const results = await searchSaavnSongs(query, limit);
            return json(res, 200, {
                success: true,
                data: { results, songs: { results } }
            });
        }

        // ── Search albums ────────────────────────────────────────────────────
        if (pathname === '/api/search/albums') {
            const query = parsedUrl.searchParams.get('query');
            if (!query) return json(res, 400, { success: false, message: 'Missing query' });
            const results = await searchSaavn(query, 20);
            return json(res, 200, {
                success: true,
                data: { results: results.albums }
            });
        }

        // ── Search playlists ─────────────────────────────────────────────────
        if (pathname === '/api/search/playlists') {
            const query = parsedUrl.searchParams.get('query');
            if (!query) return json(res, 400, { success: false, message: 'Missing query' });
            const results = await searchSaavn(query, 20);
            return json(res, 200, {
                success: true,
                data: { results: results.playlists }
            });
        }

        // ── Search artists ───────────────────────────────────────────────────
        if (pathname === '/api/search/artists') {
            const query = parsedUrl.searchParams.get('query');
            if (!query) return json(res, 400, { success: false, message: 'Missing query' });
            const results = await searchSaavn(query, 20);
            return json(res, 200, {
                success: true,
                data: { results: results.artists }
            });
        }

        // ── Trending ─────────────────────────────────────────────────────────
        if (pathname === '/api/trending' || pathname === '/api/trending/songs') {
            const lang = parsedUrl.searchParams.get('lang') || 'all';
            const tracks = await getSaavnTrending(lang, 40);
            return json(res, 200, { success: true, data: tracks });
        }

        // ── Playlist details ─────────────────────────────────────────────────
        if (pathname === '/api/playlists') {
            const id = parsedUrl.searchParams.get('id');
            if (!id) return json(res, 400, { success: false, message: 'Missing playlist id' });
            const data = await getSaavnPlaylist(id, 100);
            return json(res, 200, { success: true, data });
        }

        // ── Album details ────────────────────────────────────────────────────
        if (pathname === '/api/albums') {
            const id = parsedUrl.searchParams.get('id');
            if (!id) return json(res, 400, { success: false, message: 'Missing album id' });
            const data = await getSaavnAlbum(id);
            return json(res, 200, { success: true, data });
        }

        // ── Song details ──────────────────────────────────────────────────────
        if (pathname === '/api/songs') {
            const id = parsedUrl.searchParams.get('id');
            if (!id) return json(res, 400, { success: false, message: 'Missing song id' });
            const song = await getSaavnSong(id);
            if (!song) return json(res, 404, { success: false, message: 'Song not found' });
            return json(res, 200, { success: true, data: [song] });
        }

        // ── Featured playlists ───────────────────────────────────────────────
        if (pathname === '/api/featured-playlists') {
            const queries = ['malayalam hits playlist', 'hindi romantic playlist', 'bollywood top 50', 'tamil hits', 'punjabi top 40', 'lofi hindi'];
            const playlists = [];
            for (const q of queries) {
                try {
                    const results = await searchSaavn(q, 3);
                    playlists.push(...results.playlists);
                } catch (e) {}
            }
            return json(res, 200, { success: true, data: playlists.slice(0, 12) });
        }

        // ── Import from JioSaavn URL ──────────────────────────────────────────
        if (pathname === '/api/import') {
            const url = parsedUrl.searchParams.get('url');
            if (!url) return json(res, 400, { success: false, message: 'Missing url' });

            if (url.includes('jiosaavn.com')) {
                const parsed = parseSaavnUrl(url);
                if (!parsed) return json(res, 400, { success: false, message: 'Invalid JioSaavn URL' });

                if (parsed.type === 'playlist') {
                    const results = await saavnFetch({
                        __call: 'webapi.get',
                        token: parsed.token,
                        type: 'playlist',
                        p: '1',
                        n: '100'
                    });
                    const playlist = mapSaavnPlaylist(results);
                    if (playlist) {
                        const songs = (results.list || results.songs || []).map(mapSaavnSong).filter(Boolean);
                        return json(res, 200, { success: true, data: { ...playlist, songs }, type: 'playlist' });
                    }
                }

                if (parsed.type === 'album') {
                    const results = await saavnFetch({
                        __call: 'webapi.get',
                        token: parsed.token,
                        type: 'album'
                    });
                    const album = mapSaavnAlbum(results);
                    if (album) {
                        const songs = (results.list || results.songs || []).map(mapSaavnSong).filter(Boolean);
                        return json(res, 200, { success: true, data: { ...album, songs }, type: 'album' });
                    }
                }

                if (parsed.type === 'song') {
                    const results = await saavnFetch({
                        __call: 'webapi.get',
                        token: parsed.token,
                        type: 'song'
                    });
                    const songs = (results.songs || [results]).map(mapSaavnSong).filter(Boolean);
                    if (songs.length > 0) {
                        return json(res, 200, { success: true, data: songs[0], type: 'song' });
                    }
                }
            }

            return json(res, 400, { success: false, message: 'Unsupported URL. Please use a JioSaavn link.' });
        }

        // ── Stream proxy (for CORS & Range headers) ───────────────────────────
        if (pathname === '/api/stream') {
            const streamUrl = parsedUrl.searchParams.get('url');
            if (!streamUrl) {
                res.writeHead(400);
                return res.end('Missing stream URL');
            }

            try {
                const upstreamRes = await fetch(streamUrl, {
                    headers: {
                        ...SAAVN_HEADERS,
                        'Range': req.headers['range'] || 'bytes=0-'
                    }
                });

                const status = upstreamRes.status;
                const contentType = upstreamRes.headers.get('content-type') || 'audio/mpeg';
                const contentLength = upstreamRes.headers.get('content-length');
                const contentRange = upstreamRes.headers.get('content-range');

                const headers = {
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=3600',
                    'Accept-Ranges': 'bytes'
                };
                if (contentLength) headers['Content-Length'] = contentLength;
                if (contentRange) headers['Content-Range'] = contentRange;

                res.writeHead(status, headers);

                req.on('close', () => {
                    if (upstreamRes.body && !upstreamRes.body.locked) {
                        try { upstreamRes.body.cancel(); } catch(e) {}
                    }
                });

                const reader = upstreamRes.body.getReader();
                const pump = async () => {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) { res.end(); break; }
                        if (!res.write(value)) {
                            await new Promise(r => res.once('drain', r));
                        }
                    }
                };
                pump().catch(() => res.destroy());
                return;
            } catch (e) {
                console.error('[Stream] Proxy error:', e.message);
                res.writeHead(500);
                return res.end('Stream error');
            }
        }

        // ── Static file serving ───────────────────────────────────────────────
        const requestedPath = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
        const filePath = path.join(__dirname, requestedPath);
        const relativePath = path.relative(__dirname, filePath);
        if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
            res.writeHead(403);
            return res.end('Forbidden');
        }
        const ext = path.extname(filePath).toLowerCase();
        fs.stat(filePath, (err, stats) => {
            if (err || !stats.isFile()) {
                res.writeHead(404);
                return res.end('Not Found');
            }

            const etag = crypto.createHash('md5').update(stats.mtime.toString() + stats.size.toString()).digest('hex');

            const headers = {
                'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
                'Access-Control-Allow-Origin': '*',
                'ETag': etag
            };

            if (req.headers['if-none-match'] === etag) {
                res.writeHead(304, headers);
                return res.end();
            }

            if (['.png', '.jpg', '.webp', '.svg', '.ico'].includes(ext)) {
                headers['Cache-Control'] = 'public, max-age=86400';
            } else if (['.js', '.css'].includes(ext)) {
                headers['Cache-Control'] = 'public, max-age=3600';
            }

            const acceptEncoding = req.headers['accept-encoding'] || '';
            const rawStream = fs.createReadStream(filePath);

            if (acceptEncoding.includes('gzip')) {
                headers['Content-Encoding'] = 'gzip';
                res.writeHead(200, headers);
                rawStream.pipe(zlib.createGzip()).pipe(res);
            } else {
                res.writeHead(200, headers);
                rawStream.pipe(res);
            }
        });

    } catch (e) {
        console.error(`[API Error] ${pathname}:`, e.message);
        return json(res, 500, { success: false, message: e.message });
    }
});

server.listen(PORT, () => {
    console.log(`\n🎵 SaavnFlow Server running at http://localhost:${PORT}`);
    console.log(`   Powered by JioSaavn API — Direct audio streaming & proxy active!`);
    console.log(`   Open http://localhost:${PORT} in your browser.\n`);
});
