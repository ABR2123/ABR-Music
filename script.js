const API_ENDPOINTS = [
    window.location.origin + '/api'
];

let currentApiBase = API_ENDPOINTS[0];
let currentSong = null;
let queue = [];
let currentIndex = -1;
let audio = document.getElementById('main-audio');
let isPlaying = false;
let isShuffle = false;
let isRepeat = 'all'; // 'none' | 'one' | 'all'
let currentHeroSongs = [];
let currentHeroSong = null;
let audioContext, analyser, dataArray, source;
let eqFilters = [];
let hasInitializedAudio = false; // Flag for iOS first interaction
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

// ─── Pure JS DES Decrypter for Client-Side GitHub Pages Fallback Mode ─────────
function clientDesDecrypt(ciphertextBase64, keyStr = '38346591') {
    try {
        const IP = [58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7];
        const FP = [40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25];
        const E = [32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1];
        const P = [16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25];
        const S = [
            [[14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],[0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],[4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],[15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]],
            [[15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],[3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],[0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],[13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]],
            [[10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],[13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],[13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],[1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]],
            [[7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],[13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],[10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],[3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]],
            [[2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],[14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],[4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],[11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]],
            [[12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],[10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],[9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],[4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]],
            [[4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],[13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],[1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],[6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]],
            [[13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],[1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],[7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],[2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]]
        ];
        const PC1 = [57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4];
        const PC2 = [14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32];
        const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

        function bytesToBits(bytes) {
            const bits = [];
            for (let i = 0; i < bytes.length; i++) for (let j = 7; j >= 0; j--) bits.push((bytes[i] >> j) & 1);
            return bits;
        }
        function bitsToBytes(bits) {
            const bytes = new Uint8Array(bits.length / 8);
            for (let i = 0; i < bytes.length; i++) {
                let b = 0;
                for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
                bytes[i] = b;
            }
            return bytes;
        }
        function permute(bits, table) { return table.map(pos => bits[pos - 1]); }
        function xor(a, b) { return a.map((val, i) => val ^ b[i]); }
        function generateSubkeys(keyBytes) {
            const keyBits = bytesToBits(keyBytes);
            const permutedKey = permute(keyBits, PC1);
            let C = permutedKey.slice(0, 28), D = permutedKey.slice(28, 56);
            const subkeys = [];
            for (let i = 0; i < 16; i++) {
                const shift = SHIFTS[i];
                C = C.slice(shift).concat(C.slice(0, shift));
                D = D.slice(shift).concat(D.slice(0, shift));
                subkeys.push(permute(C.concat(D), PC2));
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
                for (let j = 3; j >= 0; j--) sOutput.push((val >> j) & 1);
            }
            return permute(sOutput, P);
        }
        function decryptBlock(blockBits, subkeys) {
            const permutedBlock = permute(blockBits, IP);
            let L = permutedBlock.slice(0, 32), R = permutedBlock.slice(32, 64);
            for (let i = 15; i >= 0; i--) {
                const nextL = R;
                R = xor(L, feistel(R, subkeys[i]));
                L = nextL;
            }
            return permute(R.concat(L), FP);
        }

        const keyBytes = new Uint8Array(8);
        for (let i = 0; i < 8; i++) keyBytes[i] = keyStr.charCodeAt(i) || 0;
        const subkeys = generateSubkeys(keyBytes);
        const binaryStr = atob(ciphertextBase64);
        const cipherBytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) cipherBytes[i] = binaryStr.charCodeAt(i);

        const plainBits = [];
        for (let i = 0; i < cipherBytes.length; i += 8) {
            plainBits.push(...decryptBlock(bytesToBits(cipherBytes.slice(i, i + 8)), subkeys));
        }
        const decryptedBytes = bitsToBytes(plainBits);
        const padLen = decryptedBytes[decryptedBytes.length - 1];
        const unpaddedBytes = (padLen > 0 && padLen <= 8) ? decryptedBytes.slice(0, decryptedBytes.length - padLen) : decryptedBytes;
        const decryptedStr = new TextDecoder().decode(unpaddedBytes);
        return decryptedStr.replace(/_96\.mp4/, '_320.mp4').replace(/_96\.mp3/, '_320.mp3');
    } catch (e) {
        return '';
    }
}

function mapClientSong(song) {
    if (!song || (!song.id && !song.song && !song.title)) return null;
    const enc = song.more_info?.encrypted_media_url || song.encrypted_media_url;
    let url = '';
    if (enc) {
        url = clientDesDecrypt(enc);
    }
    if (!url && song.more_info?.media_preview_url) {
        url = song.more_info.media_preview_url.replace('preview', 'aac').replace('_96_p', '_320');
    }
    if (!url && song.more_info?.vlink) {
        url = song.more_info.vlink;
    }

    const image = song.image || song.more_info?.artistMap?.primary_artists?.[0]?.image || '';
    const imageHd = image ? image.replace('150x150', '500x500') : '';
    const primaryArtists = song.more_info?.primary_artists || song.primary_artists || song.singers || '';

    return {
        id: song.id || String(Math.random()),
        name: song.song || song.title || song.name || 'Unknown Track',
        title: song.song || song.title || song.name || 'Unknown Track',
        album: { id: song.albumid || '', name: song.album || 'Single' },
        artists: { primary: (song.more_info?.artistMap?.primary_artists || []).map(a => ({ id: a.id, name: a.name, image: a.image })) },
        primaryArtists: primaryArtists,
        singers: primaryArtists,
        image: [{ url: image }, { url: image }, { url: imageHd || image }],
        duration: parseInt(song.more_info?.duration || song.duration || 0),
        downloadUrl: [{ url: url, quality: '320kbps' }],
        isSaavn: true
    };
}

async function directClientFetch(params) {
    const url = new URL('https://www.jiosaavn.com/api.php');
    const defaultParams = {
        _format: 'json',
        _marker: '0',
        api_version: '4',
        ctx: 'web6dot0',
        ...params
    };
    Object.entries(defaultParams).forEach(([k, v]) => url.searchParams.set(k, v));
    try {
        const res = await fetch(url.toString());
        return await res.json();
    } catch (e) {
        const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url.toString());
        const res = await fetch(proxyUrl);
        return await res.json();
    }
}

// ─── API Caching Utilities ───────────────────────────────────────────────────
const apiCache = {
    search: {},
    details: {},
    trending: {},
    playlists: {},
    albums: {},
    artists: {}
};
const CACHE_TTL = 300000; // 5 minutes in milliseconds
const HERO_STORAGE_KEY = 'abr_malayalam_hero_song';
const HERO_REFRESH_INTERVAL = 900000; // 15 minutes
const MALAYALAM_HERO_QUERIES = [
    'latest malayalam hits',
    'new malayalam songs',
    'malayalam hits'
];
let heroRefreshTimer = null;
let currentHeroIndex = 0;
const HERO_CAROUSEL_LIMIT = 8;
let heroAutoplayTimer = null;
const HERO_AUTOPLAY_DELAY = 6000; // 6 seconds
let hasInitializedHeroCarousel = false;

function getCachedData(type, key) {
    const cached = apiCache[type] && apiCache[type][key];
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return cached.data;
    }
    return null;
}

function setCachedData(type, key, data) {
    if (!apiCache[type]) apiCache[type] = {};
    apiCache[type][key] = {
        data: data,
        timestamp: Date.now()
    };
}

// ─── Custom Premium Toast System ─────────────────────────────────────────────
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    else if (type === 'error') iconName = 'alert-triangle';
    else if (type === 'warning') iconName = 'alert-circle';
    
    toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        const onFadeEnd = () => {
            toast.removeEventListener('transitionend', onFadeEnd);
            toast.remove();
        };
        toast.addEventListener('transitionend', onFadeEnd);
    }, 4000);
}

// Override native alert to use custom Toast notifications globally
window.alert = function(message) {
    showToast(message, 'info');
};

// Global navigation & library state
let previousActiveView = 'home-view';
let activeView = 'home-view';
let likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];
let likedAlbums = JSON.parse(localStorage.getItem('likedAlbums')) || [];
let currentDetailSongs = [];

let ytPlayer;
let isYTReady = false;
let isYTMuted = false;
let isSeeking = false;
let spotifyTrendingCache = {};
let currentSpotifyTrendingLang = 'all';

// ─── YouTube Direct Iframe Player (fallback playback only) ─────────────────────
// We do NOT use the YouTube IFrame API because it cannot autoplay from a
// scripted call (browser autoplay policy blocks it). Instead, we build a plain
// <iframe> with autoplay=1 in the src URL. This is the ONLY reliable approach.

let currentYTVideoId = null;
const ytDurationCache = {};

function loadYouTubeIframe(videoId) {
    if (currentYTVideoId === videoId) return; // already loaded
    currentYTVideoId = videoId;
    const container = document.getElementById('youtube-player-container');
    if (!container) return;
    // Replace container contents with a fresh autoplay iframe
    container.innerHTML = `<iframe
        id="yt-iframe"
        width="100%"
        height="100%"
        src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&enablejsapi=1"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        style="display:block;width:100%;height:100%;border:none;"
    ></iframe>`;
}

// Mini Player UI Listeners
document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('#close-yt-player');
    if (closeBtn) {
        const miniPlayer = document.getElementById('yt-mini-player');
        if (miniPlayer) {
            miniPlayer.classList.add('hidden');
            // Stop video when closed
            const container = document.getElementById('youtube-player-container');
            if (container) container.innerHTML = '';
            currentYTVideoId = null;
            isPlaying = false;
            updatePlayPauseIcon(false);
        }
    }
    const toggleBtn = e.target.closest('#toggle-yt-size');
    if (toggleBtn) {
        const miniPlayer = document.getElementById('yt-mini-player');
        if (miniPlayer) {
            miniPlayer.classList.toggle('expanded');
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', miniPlayer.classList.contains('expanded') ? 'minimize-2' : 'maximize-2');
                lucide.createIcons();
            }
        }
    }
    const muteBtn = e.target.closest('#mute-yt');
    if (muteBtn) {
        const iframe = document.getElementById('yt-iframe');
        if (iframe && iframe.contentWindow) {
            isYTMuted = !isYTMuted;
            const action = isYTMuted ? 'mute' : 'unmute';
            iframe.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: action, args: [] }),
                '*'
            );
            // Update mute button icon/tooltip
            const icon = muteBtn.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', isYTMuted ? 'volume-x' : 'volume-2');
                lucide.createIcons();
            }
            muteBtn.title = isYTMuted ? 'Unmute' : 'Mute';
        }
    }
});

// Listen for postMessage events from the YouTube iframe
window.addEventListener('message', (event) => {
    try {
        let data;
        if (typeof event.data === 'string') {
            data = JSON.parse(event.data);
        } else if (event.data && typeof event.data === 'object') {
            data = event.data;
        } else {
            return;
        }
        
        if (data && data.event === 'infoDelivery' && data.info) {
            const info = data.info;
            
            // Sync play/pause state
            if (info.playerState !== undefined) {
                const state = info.playerState;
                if (state === 0) {
                    playNextSong();
                } else if (state === 1) {
                    isPlaying = true;
                    updatePlayPauseIcon(true);
                    
                    // Sync volume and mute when it starts playing
                    const iframe = document.getElementById('yt-iframe');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage(
                            JSON.stringify({ event: 'command', func: 'setVolume', args: [parseInt(volumeBar.value)] }),
                            '*'
                        );
                        iframe.contentWindow.postMessage(
                            JSON.stringify({ event: 'command', func: isYTMuted ? 'mute' : 'unmute', args: [] }),
                            '*'
                        );
                    }
                } else if (state === 2) {
                    isPlaying = false;
                    updatePlayPauseIcon(false);
                }
            }
            
            // Sync current playback time and duration
            if (currentSong && currentSong.youtubeId) {
                if (info.currentTime !== undefined) {
                    const time = info.currentTime;
                    if (!isSeeking) {
                        currentTimeEl.innerText = formatTime(time);
                    }
                    
                    const duration = info.duration !== undefined ? info.duration : (ytDurationCache[currentSong.youtubeId] || 0);
                    if (duration > 0) {
                        if (!isSeeking) {
                            totalDurationEl.innerText = formatTime(duration);
                            progressBar.value = (time / duration) * 100;
                        }
                    }
                    // Sync native media session details for YT streams
                    updateMediaSessionPositionState(time, duration);
                }
                if (info.duration !== undefined) {
                    ytDurationCache[currentSong.youtubeId] = info.duration;
                    if (!isSeeking) {
                        totalDurationEl.innerText = formatTime(info.duration);
                    }
                }
            }
        }
    } catch (e) {
        // Ignore non-JSON messages
    }
});

// Hardcoded Fallback Songs (in case API is down)
const FALLBACK_SONGS = {
    malayalam: [
        { id: '1', name: 'Manasariyunnunde', artists: { primary: [{ name: 'Vineeth Sreenivasan' }] }, image: [{url:''},{url:''},{url:'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop'}], downloadUrl: [{url:''},{url:''},{url:''},{url:''},{url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}], album: { name: 'Minnal Murali' } },
        { id: '2', name: 'Darshana', artists: { primary: [{ name: 'Hesham Abdul Wahab' }] }, image: [{url:''},{url:''},{url:'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop'}], downloadUrl: [{url:''},{url:''},{url:''},{url:''},{url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'}], album: { name: 'Hridayam' } }
    ]
};

// Initialize Lucide Icons
lucide.createIcons();

// Register Service Worker for Background Play
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('SW registered:', registration);
        }).catch(error => {
            console.log('SW registration failed:', error);
        });
    });
}

// Elements
const searchInput = document.getElementById('search-input');
const malayalamContainer = document.getElementById('malayalam-songs');
const hindiContainer = document.getElementById('hindi-songs');
const tamilContainer = document.getElementById('tamil-songs');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const backwardBtn = document.getElementById('backward-btn');
const forwardBtn = document.getElementById('forward-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const progressBar = document.getElementById('progress-bar');
const volumeBar = document.getElementById('volume-bar');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');
const currentAlbumArt = document.getElementById('current-album-art');
const currentSongTitle = document.getElementById('current-song-title');
const currentSongArtist = document.getElementById('current-song-artist');

function isCurrentlyPlayingYT() {
    if (!currentSong || !currentSong.youtubeId) return false;
    if (!currentSong.downloadUrl) return true;
    const miniPlayer = document.getElementById('yt-mini-player');
    return miniPlayer && !miniPlayer.classList.contains('hidden');
}

// Search by Language Helper
async function searchByLang(lang) {
    if (lang === 'Malayalam Jukebox') {
        await showSearchResults("Malayalam Hits Jukebox", MALAYALAM_JUKEBOX);
        return;
    }
    if (lang === 'Ayyappa Devotional') {
        await showSearchResults("Sabarimala Specials (Ayyappa)", AYYAPPA_JUKEBOX);
        return;
    }
    
    let query = `${lang} latest trending hits 2026 chartbusters`;
    if (lang === 'Hindi Arijit') {
        query = "arijit singh top romantic hits";
    } else if (lang === 'Ayyappa Devotional') {
        query = "Malayalam Ayyappa Devotional Songs Latest 2026 Harivarasanam";
    } else if (lang === 'Malayalam Old') {
        query = "Malayalam Evergreen Old Hits Yesudas Prem Nazir";
    } else if (lang === 'Hindi Romantic') {
        query = "latest bollywood romantic hits arijit singh shreya ghoshal";
    } else if (lang === 'Hindi 90s') {
        query = "90s bollywood gold hits kumar sanu udit narayan";
    } else if (lang === 'Hindi Party') {
        query = "bollywood party";
    } else if (lang === 'Hindi') {
        query = "latest hindi trending hits 2026 chartbusters";
    } else if (lang === 'Tamil') {
        query = "latest tamil trending hits 2026 chartbusters";
    } else if (lang === 'Indian') {
        query = "latest indian pop hits 2026";
    }
    
    searchInput.value = lang;
    await performSearch(query);
}

// --- Navigation Module ---
function switchView(viewId) {
    if (viewId !== 'detail-view') {
        previousActiveView = viewId;
    }
    activeView = viewId;
    
    // Hide all view panels
    document.querySelectorAll('.view-panel').forEach(panel => {
        panel.classList.add('hidden');
    });
    
    // Show target view panel
    const targetPanel = document.getElementById(viewId);
    if (targetPanel) {
        targetPanel.classList.remove('hidden');
    }
    
    // Update sidebar active highlights
    document.querySelectorAll('.sidebar nav li').forEach(li => {
        li.classList.remove('active');
    });
    
    if (viewId === 'home-view') {
        const homeTab = document.getElementById('tab-home');
        if (homeTab) homeTab.classList.add('active');
    } else if (viewId === 'playlists-view') {
        const playlistsTab = document.getElementById('tab-playlists');
        if (playlistsTab) playlistsTab.classList.add('active');
    } else if (viewId === 'search-view') {
        const searchTab = document.getElementById('tab-search');
        if (searchTab) searchTab.classList.add('active');
    } else if (viewId === 'library-view') {
        const libraryTab = document.getElementById('tab-library');
        if (libraryTab) libraryTab.classList.add('active');
    }

    // Update mobile bottom nav highlights
    document.querySelectorAll('.mobile-nav li').forEach(li => {
        li.classList.remove('active');
    });
    if (viewId === 'home-view') {
        const tab = document.getElementById('mobile-tab-home');
        if (tab) tab.classList.add('active');
    } else if (viewId === 'playlists-view') {
        const tab = document.getElementById('mobile-tab-playlists');
        if (tab) tab.classList.add('active');
    } else if (viewId === 'search-view') {
        const tab = document.getElementById('mobile-tab-search');
        if (tab) tab.classList.add('active');
    } else if (viewId === 'library-view') {
        const tab = document.getElementById('mobile-tab-library');
        if (tab) tab.classList.add('active');
    }
}

function initNavigation() {
    // Sidebar navigation tabs
    const homeTab = document.getElementById('tab-home');
    const playlistsTab = document.getElementById('tab-playlists');
    const searchTab = document.getElementById('tab-search');
    const libraryTab = document.getElementById('tab-library');
    
    if (homeTab) {
        homeTab.addEventListener('click', () => {
            switchView('home-view');
        });
    }
    if (playlistsTab) {
        playlistsTab.addEventListener('click', () => {
            switchView('playlists-view');
            showDiscoverPlaylistsFeed();
        });
    }
    if (searchTab) {
        searchTab.addEventListener('click', () => {
            switchView('search-view');
        });
    }
    if (libraryTab) {
        libraryTab.addEventListener('click', () => {
            switchView('library-view');
            updateLibraryUI();
        });
    }
    
    // Top Playlists button pill
    const topPlaylistsBtn = document.getElementById('top-playlists-btn');
    if (topPlaylistsBtn) {
        topPlaylistsBtn.addEventListener('click', () => {
            switchView('playlists-view');
            showDiscoverPlaylistsFeed();
        });
    }
    
    // Liked Songs playlist item in sidebar
    const playlistList = document.getElementById('playlist-list');
    if (playlistList) {
        const likedSongsLi = playlistList.querySelector('li');
        if (likedSongsLi) {
            likedSongsLi.style.cursor = 'pointer';
            likedSongsLi.addEventListener('click', () => {
                switchView('library-view');
                updateLibraryUI();
            });
        }
    }
    
    // Detail view back button
    const detailBackBtn = document.getElementById('detail-back-btn');
    if (detailBackBtn) {
        detailBackBtn.addEventListener('click', () => {
            switchView(previousActiveView);
        });
    }
    
    // Play All button in Library view
    const playLibraryBtn = document.getElementById('play-library-btn');
    if (playLibraryBtn) {
        playLibraryBtn.addEventListener('click', () => {
            if (likedSongs.length > 0) {
                playSong(likedSongs[0]);
                updateQueue(likedSongs, likedSongs[0]);
                updateTracksPlayingStates();
            } else {
                showToast("Your library is empty. Like some songs first!", "warning");
            }
        });
    }
    
    // Play All button in Detail view
    const detailPlayBtn = document.getElementById('detail-play-btn');
    if (detailPlayBtn) {
        detailPlayBtn.addEventListener('click', () => {
            if (currentDetailSongs.length > 0) {
                playSong(currentDetailSongs[0]);
                updateQueue(currentDetailSongs, currentDetailSongs[0]);
                updateTracksPlayingStates();
            } else {
                showToast("No songs in this album/playlist to play!", "warning");
            }
        });
    }
}

// --- Library & Likes Module ---
function toggleLikeSong(song) {
    if (!song) return;
    const index = likedSongs.findIndex(s => s.id === song.id);
    const songName = song.name || song.title || "Song";
    if (index > -1) {
        likedSongs.splice(index, 1);
        showToast(`Removed "${songName}" from Library`, 'info');
    } else {
        likedSongs.push(song);
        showToast(`Added "${songName}" to Library`, 'success');
    }
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
    
    // Sync states
    updatePlayerHeartIcon();
    updateLibraryUI();
    updateTracksHeartStates();
}

function isSongLiked(songId) {
    return likedSongs.some(s => s.id === songId);
}

function updatePlayerHeartIcon() {
    const playerHeartBtn = document.getElementById('player-heart-btn');
    if (!playerHeartBtn) return;
    const icon = playerHeartBtn.querySelector('i');
    if (!icon) return;
    
    const liked = currentSong && isSongLiked(currentSong.id);
    if (liked) {
        icon.style.fill = '#ef4444';
        icon.style.color = '#ef4444';
        icon.setAttribute('fill', '#ef4444');
        icon.setAttribute('stroke', '#ef4444');
    } else {
        icon.style.fill = 'none';
        icon.style.color = 'var(--text-secondary)';
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', 'currentColor');
    }
    lucide.createIcons();
}

function updateTracksPlayingStates() {
    // Update all track rows in detail-view
    document.querySelectorAll('#detail-tracks-list tr').forEach((tr, index) => {
        if (currentDetailSongs[index]) {
            const song = currentDetailSongs[index];
            const playBtn = tr.querySelector('.play-track-row-btn i');
            
            if (currentSong && song.id === currentSong.id) {
                tr.classList.add('playing-row');
                if (playBtn) {
                    playBtn.setAttribute('data-lucide', isPlaying ? 'pause' : 'play');
                }
            } else {
                tr.classList.remove('playing-row');
                if (playBtn) {
                    playBtn.setAttribute('data-lucide', 'play');
                }
            }
        }
    });
    
    // Update all track rows in library-view
    document.querySelectorAll('#library-tracks-list tr').forEach((tr, index) => {
        if (likedSongs[index]) {
            const song = likedSongs[index];
            const playBtn = tr.querySelector('.play-track-row-btn i');
            
            if (currentSong && song.id === currentSong.id) {
                tr.classList.add('playing-row');
                if (playBtn) {
                    playBtn.setAttribute('data-lucide', isPlaying ? 'pause' : 'play');
                }
            } else {
                tr.classList.remove('playing-row');
                if (playBtn) {
                    playBtn.setAttribute('data-lucide', 'play');
                }
            }
        }
    });
    
    lucide.createIcons();
}

function updateTracksHeartStates() {
    // Update hearts in detail list
    document.querySelectorAll('#detail-tracks-list tr').forEach((tr, index) => {
        if (currentDetailSongs[index]) {
            const song = currentDetailSongs[index];
            const liked = isSongLiked(song.id);
            const heartIcon = tr.querySelector('.like-track-row-btn i');
            if (heartIcon) {
                if (liked) {
                    heartIcon.style.fill = '#ef4444';
                    heartIcon.style.color = '#ef4444';
                    heartIcon.setAttribute('fill', '#ef4444');
                    heartIcon.setAttribute('stroke', '#ef4444');
                } else {
                    heartIcon.style.fill = 'none';
                    heartIcon.style.color = 'var(--text-secondary)';
                    heartIcon.setAttribute('fill', 'none');
                    heartIcon.setAttribute('stroke', 'currentColor');
                }
            }
        }
    });
    lucide.createIcons();
}

function updateLibraryUI() {
    const tracksList = document.getElementById('library-tracks-list');
    const countEl = document.getElementById('library-count');
    const emptyState = document.getElementById('library-empty-state');
    
    if (!tracksList) return;
    
    countEl.innerText = `${likedSongs.length} song${likedSongs.length === 1 ? '' : 's'}`;
    
    if (likedSongs.length === 0) {
        tracksList.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    tracksList.innerHTML = '';
    
    likedSongs.forEach((song, index) => {
        const tr = document.createElement('tr');
        tr.className = 'track-row';
        if (currentSong && song.id === currentSong.id) {
            tr.classList.add('playing-row');
        }
        
        let imgUrl = 'https://via.placeholder.com/50';
        if (Array.isArray(song.image)) {
            imgUrl = song.image[1]?.url || song.image[0]?.url;
        } else if (typeof song.image === 'string') {
            imgUrl = song.image;
        }
        
        const songName = song.name || song.title || "Unknown Track";
        
        let artistName = "Unknown Artist";
        if (song.artists && song.artists.primary && song.artists.primary[0]) {
            artistName = song.artists.primary[0].name;
        } else if (song.primaryArtists) {
            artistName = song.primaryArtists;
        } else if (song.singers) {
            artistName = song.singers;
        }
        
        const albumName = (song.album && typeof song.album === 'object') ? song.album.name : (song.album || 'Single');
        
        tr.innerHTML = `
            <td class="track-num">${index + 1}</td>
            <td class="track-title-cell">
                <img class="track-img" src="${imgUrl}" alt="${songName}">
                <div class="track-info-text">
                    <h5>${songName}</h5>
                </div>
            </td>
            <td>${artistName}</td>
            <td class="track-album-cell">${albumName}</td>
            <td>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <button class="play-track-row-btn" title="Play">
                        <i data-lucide="${(currentSong && song.id === currentSong.id && isPlaying) ? 'pause' : 'play'}"></i>
                    </button>
                    <button class="like-track-row-btn" title="Remove" style="background: none; border: none; cursor: pointer; color: #ef4444; transition: var(--transition);">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Preload song URL on pointerdown for iOS compatibility
        tr.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.like-track-row-btn')) return;
            preloadSongUrl(song);
        });

        tr.addEventListener('click', (e) => {
            if (e.target.closest('.like-track-row-btn')) return;
            
            if (currentSong && song.id === currentSong.id) {
                playPauseBtn.click();
            } else {
                playSong(song);
                updateQueue(likedSongs, song);
            }
            updateTracksPlayingStates();
        });
        
        const removeBtn = tr.querySelector('.like-track-row-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLikeSong(song);
        });
        
        tracksList.appendChild(tr);
    });
    
    lucide.createIcons();
}

function renderDetailViewData(type, id, data, coverArt, titleEl, descEl, typeBadge, metaEl, tracksList) {
    currentDetailSongs = data.songs || [];
    
    // Set header info
    let imgUrl = 'https://via.placeholder.com/200';
    if (Array.isArray(data.image)) {
        imgUrl = data.image[2]?.url || data.image[1]?.url || data.image[0]?.url;
    } else if (typeof data.image === 'string') {
        imgUrl = data.image;
    }
    
    coverArt.src = imgUrl;
    titleEl.innerText = data.name || data.title || "Untitled";
    descEl.innerText = data.description || "";
    typeBadge.innerText = type.charAt(0).toUpperCase() + type.slice(1);
    metaEl.innerText = `${data.year || '2026'} • ${currentDetailSongs.length} songs`;
    
    // Render tracks
    renderDetailTracks(currentDetailSongs);
    
    // Update detail-like-btn state
    updateDetailLikeBtn(id);
    
    // Bind detail-like-btn click
    const detailLikeBtn = document.getElementById('detail-like-btn');
    if (detailLikeBtn) {
        detailLikeBtn.onclick = () => {
            toggleLikeAlbum(id, { id, name: data.name || data.title, type, image: data.image, year: data.year });
        };
    }
}

// --- Detail View Module ---
async function openDetailView(type, id) {
    switchView('detail-view');
    
    const coverArt = document.getElementById('detail-cover-art');
    const titleEl = document.getElementById('detail-title');
    const descEl = document.getElementById('detail-description');
    const typeBadge = document.getElementById('detail-type-badge');
    const metaEl = document.getElementById('detail-meta-info');
    const tracksList = document.getElementById('detail-tracks-list');
    
    const cacheKey = `${type}_${id}`;
    const cached = getCachedData('details', cacheKey);
    if (cached) {
        console.log(`[Cache Hit] Details for ${type}: ${id}`);
        renderDetailViewData(type, id, cached, coverArt, titleEl, descEl, typeBadge, metaEl, tracksList);
        return;
    }
    
    // Set loading state
    titleEl.innerText = "Loading...";
    descEl.innerText = "";
    metaEl.innerText = "";
    tracksList.innerHTML = `
        <tr>
            <td colspan="5">
                <div class="loader-container"><div class="loader-spinner"></div></div>
            </td>
        </tr>
    `;
    
    try {
        let fetchUrl = `${currentApiBase}/${type}s?`;
        if (id.startsWith('http://') || id.startsWith('https://')) {
            fetchUrl += `link=${encodeURIComponent(id)}`;
        } else {
            fetchUrl += `id=${id}`;
        }
        const response = await fetch(fetchUrl);
        const result = await response.json();
        
        if (result && result.success && result.data) {
            const data = result.data;
            setCachedData('details', cacheKey, data);
            renderDetailViewData(type, id, data, coverArt, titleEl, descEl, typeBadge, metaEl, tracksList);
        } else {
            throw new Error("Failed to load details");
        }
    } catch (e) {
        console.error("Error loading detail view:", e);
        titleEl.innerText = "Error Loading Playlist";
        descEl.innerText = "Could not fetch details from Spotify API. Please try again.";
        tracksList.innerHTML = `
            <tr>
                <td colspan="5" class="error-state">
                    <p>Error loading tracks. Click below to retry.</p>
                    <button onclick="openDetailView('${type}', '${id}')" style="background: var(--accent-color); color: white; border: none; padding: 8px 16px; border-radius: 8px; margin-top: 10px; cursor: pointer;">Retry</button>
                </td>
            </tr>
        `;
    }
}

function toggleLikeAlbum(albumId, albumData) {
    const index = likedAlbums.findIndex(a => a.id === albumId);
    const title = albumData.name || albumData.title || "Collection";
    if (index > -1) {
        likedAlbums.splice(index, 1);
        showToast(`Removed "${title}" from Library`, 'info');
    } else {
        likedAlbums.push(albumData);
        showToast(`Added "${title}" to Library`, 'success');
    }
    localStorage.setItem('likedAlbums', JSON.stringify(likedAlbums));
    updateDetailLikeBtn(albumId);
}

function updateDetailLikeBtn(albumId) {
    const likeBtn = document.getElementById('detail-like-btn');
    if (!likeBtn) return;
    const icon = likeBtn.querySelector('i');
    if (!icon) return;
    const isLiked = likedAlbums.some(a => a.id === albumId);
    if (isLiked) {
        icon.style.fill = '#ef4444';
        icon.style.color = '#ef4444';
        icon.setAttribute('fill', '#ef4444');
        icon.setAttribute('stroke', '#ef4444');
    } else {
        icon.style.fill = 'none';
        icon.style.color = 'var(--text-secondary)';
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', 'currentColor');
    }
    lucide.createIcons();
}

function renderDetailTracks(songs) {
    const tracksList = document.getElementById('detail-tracks-list');
    tracksList.innerHTML = '';
    
    if (songs.length === 0) {
        tracksList.innerHTML = `<tr><td colspan="5" style="text-align:center;">No songs in this playlist.</td></tr>`;
        return;
    }
    
    // Deduplicate songs by id
    const seen = new Set();
    const uniqueSongs = songs.filter(song => {
        if (!song || !song.id) return false;
        if (seen.has(song.id)) return false;
        seen.add(song.id);
        return true;
    });
    
    currentDetailSongs = uniqueSongs;
    
    uniqueSongs.forEach((song, index) => {
        const tr = document.createElement('tr');
        tr.className = 'track-row';
        if (currentSong && song.id === currentSong.id) {
            tr.classList.add('playing-row');
        }
        
        let imgUrl = 'https://via.placeholder.com/50';
        if (Array.isArray(song.image)) {
            imgUrl = song.image[1]?.url || song.image[0]?.url;
        } else if (typeof song.image === 'string') {
            imgUrl = song.image;
        }
        
        const songName = song.name || song.title || "Unknown Track";
        
        let artistName = "Unknown Artist";
        if (song.artists && song.artists.primary && song.artists.primary[0]) {
            artistName = song.artists.primary[0].name;
        } else if (song.primaryArtists) {
            artistName = song.primaryArtists;
        } else if (song.singers) {
            artistName = song.singers;
        }
        
        const albumName = (song.album && typeof song.album === 'object') ? song.album.name : (song.album || 'Single');
        
        const liked = isSongLiked(song.id);
        const heartStyle = liked ? 'fill: #ef4444; color: #ef4444;' : '';
        
        tr.innerHTML = `
            <td class="track-num">${index + 1}</td>
            <td class="track-title-cell">
                <img class="track-img" src="${imgUrl}" alt="${songName}">
                <div class="track-info-text">
                    <h5>${songName}</h5>
                </div>
            </td>
            <td>${artistName}</td>
            <td class="track-album-cell">${albumName}</td>
            <td>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <button class="play-track-row-btn" title="Play">
                        <i data-lucide="${(currentSong && song.id === currentSong.id && isPlaying) ? 'pause' : 'play'}"></i>
                    </button>
                    <button class="like-track-row-btn" title="Like / Unlike" style="background: none; border: none; cursor: pointer; color: var(--text-secondary); transition: var(--transition);">
                        <i data-lucide="heart" style="${heartStyle}"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Preload song URL on pointerdown for iOS compatibility
        tr.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.like-track-row-btn')) return;
            preloadSongUrl(song);
        });

        tr.addEventListener('click', (e) => {
            if (e.target.closest('.like-track-row-btn')) return;
            
            if (currentSong && song.id === currentSong.id) {
                playPauseBtn.click();
            } else {
                playSong(song);
                updateQueue(songs, song);
            }
            updateTracksPlayingStates();
        });
        
        const likeBtn = tr.querySelector('.like-track-row-btn');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLikeSong(song);
        });
        
        tracksList.appendChild(tr);
    });
    
    lucide.createIcons();
}

function renderSearchResults(results) {
    // Render Songs
    const songs = results.songs?.results || [];
    renderSongs(songs, document.getElementById('search-results-songs'));
    
    // Render Albums
    const albums = results.albums?.results || [];
    renderAlbumsOrPlaylists(albums, document.getElementById('search-results-albums'), 'album');
    
    // Render Playlists
    const playlists = results.playlists?.results || [];
    renderAlbumsOrPlaylists(playlists, document.getElementById('search-results-playlists'), 'playlist');
    
    // Render Artists
    const artists = results.artists?.results || [];
    renderArtists(artists, document.getElementById('search-results-artists'));
    
    // iOS Autoplay Bypass: Background prefetch top 10 songs
    preloadSearchResultsUrls(songs);
}

function preloadSearchResultsUrls(songs) {
    if (!songs || songs.length === 0) return;
    const targets = songs.slice(0, 10).filter(s => !s.downloadUrl && !s.youtubeId);
    if (targets.length === 0) return;
    
    console.log(`[iOS Optimization] Background preloading details for top ${targets.length} search results...`);
    targets.forEach(song => {
        preloadSongUrl(song); // async prefetch
    });
}

// --- Search & Categories Module ---
// Local backup fuzzy matching for search queries
function searchLocalBackup(query) {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
    if (terms.length === 0) return [];
    
    // Combine local datasets and likedSongs
    const allLocal = [...MALAYALAM_JUKEBOX, ...AYYAPPA_JUKEBOX, ...likedSongs];
    
    // Deduplicate by ID
    const seen = new Set();
    const uniqueLocal = allLocal.filter(song => {
        if (!song || !song.id) return false;
        if (seen.has(song.id)) return false;
        seen.add(song.id);
        return true;
    });
    
    return uniqueLocal.filter(song => {
        const title = (song.name || song.title || '').toLowerCase();
        let artist = '';
        if (song.artists && song.artists.primary && song.artists.primary[0]) {
            artist = song.artists.primary[0].name.toLowerCase();
        } else if (song.primaryArtists) {
            artist = song.primaryArtists.toLowerCase();
        } else if (song.singers) {
            artist = song.singers.toLowerCase();
        } else if (song.artists && typeof song.artists === 'string') {
            artist = song.artists.toLowerCase();
        }
        
        const albumName = (song.album?.name || song.album || '').toLowerCase();
        
        return terms.every(term => title.includes(term) || artist.includes(term) || albumName.includes(term));
    });
}

async function performSearch(query) {
    if (!query) return;
    
    // Check if it is a JioSaavn link and handle importing
    if (query.trim().startsWith('http://') || query.trim().startsWith('https://')) {
        if (query.includes('jiosaavn.com') || query.includes('saavn.com') || query.includes('saavn.dev')) {
            handleJioSaavnImport(query);
            return;
        }
    }
    
    // Switch to search view and show results container
    switchView('search-view');
    const categoriesContainer = document.querySelector('.browse-categories-container');
    const resultsWrapper = document.getElementById('search-results-wrapper');
    if (categoriesContainer) categoriesContainer.classList.add('hidden');
    if (resultsWrapper) resultsWrapper.classList.remove('hidden');
    
    const cacheKey = query.trim().toLowerCase();
    const cached = getCachedData('search', cacheKey);
    if (cached) {
        console.log(`[Cache Hit] Search results for: ${query}`);
        renderSearchResults(cached);
        return;
    }
    
    // Show spinner inside all columns
    document.getElementById('search-results-songs').innerHTML = `
        <div class="loader-container"><div class="loader-spinner"></div></div>
    `;
    document.getElementById('search-results-albums').innerHTML = `
        <div class="loader-container"><div class="loader-spinner"></div></div>
    `;
    document.getElementById('search-results-playlists').innerHTML = `
        <div class="loader-container"><div class="loader-spinner"></div></div>
    `;
    document.getElementById('search-results-artists').innerHTML = `
        <div class="loader-container"><div class="loader-spinner"></div></div>
    `;
    
    try {
        let result;
        try {
            const response = await fetch(`${currentApiBase}/search?query=${encodeURIComponent(query)}`);
            if (response.ok) {
                result = await response.json();
            }
        } catch (e) {}

        if (!result || !result.success || !result.data) {
            console.log('[Search] Running client-side direct search...');
            const rawData = await directClientFetch({ __call: 'search.getResults', q: query, N: '30', p: '1' });
            const rawSongs = rawData.results || rawData.songs?.results || [];
            const songs = rawSongs.map(mapClientSong).filter(Boolean);
            result = {
                success: true,
                data: { songs: { results: songs }, albums: { results: [] }, playlists: { results: [] }, artists: { results: [] }, results: songs }
            };
        }

        if (result && result.success && result.data) {
            const results = result.data;
            const songsList = results.songs?.results || [];
            const albumsList = results.albums?.results || [];
            
            if (songsList.length === 0 && albumsList.length === 0) {
                const localSongs = searchLocalBackup(query);
                if (localSongs.length > 0) {
                    showToast("Showing local matches for: " + query, "info");
                    const fallbackData = {
                        songs: { results: localSongs },
                        albums: { results: [] },
                        playlists: { results: [] },
                        artists: { results: [] }
                    };
                    setCachedData('search', cacheKey, fallbackData);
                    renderSearchResults(fallbackData);
                    return;
                }
            }
            
            setCachedData('search', cacheKey, results);
            renderSearchResults(results);
        } else {
            throw new Error("Invalid API response format");
        }
    } catch (e) {
        console.error("Global search failed:", e);
        // Try fallback to local songs
        const localSongs = searchLocalBackup(query);
        if (localSongs.length > 0) {
            showToast("Showing local matches for: " + query, "info");
            const fallbackData = {
                songs: { results: localSongs },
                albums: { results: [] },
                playlists: { results: [] },
                artists: { results: [] }
            };
            renderSearchResults(fallbackData);
        } else {
            document.getElementById('search-results-songs').innerHTML = `
                <div class="error-state"><p>No results found locally or online.</p></div>
            `;
            document.getElementById('search-results-albums').innerHTML = '';
            document.getElementById('search-results-playlists').innerHTML = '';
            document.getElementById('search-results-artists').innerHTML = '';
        }
    }
}

async function showSearchResults(title, songs) {
    switchView('search-view');
    const categoriesContainer = document.querySelector('.browse-categories-container');
    const resultsWrapper = document.getElementById('search-results-wrapper');
    if (categoriesContainer) categoriesContainer.classList.add('hidden');
    if (resultsWrapper) resultsWrapper.classList.remove('hidden');
    
    // Set songs
    renderSongs(songs, document.getElementById('search-results-songs'));
    
    // Clear albums and playlists since it's a specific jukebox playlist
    document.getElementById('search-results-albums').innerHTML = '';
    document.getElementById('search-results-playlists').innerHTML = '';
}

function renderAlbumsOrPlaylists(items, container, type) {
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="error-state">No results found.</p>';
        return;
    }
    
    container.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'song-card';
        
        let imgUrl = 'https://via.placeholder.com/150';
        if (Array.isArray(item.image)) {
            imgUrl = item.image[2]?.url || item.image[1]?.url || item.image[0]?.url;
        } else if (typeof item.image === 'string') {
            imgUrl = item.image;
        }
        
        const title = item.name || item.title || "Untitled";
        const subtitle = item.description || item.artist || (type === 'album' ? 'Album' : 'Playlist');

        card.innerHTML = `
            <div class="card-img-container">
                <img src="${imgUrl}" alt="${title}" loading="lazy">
                <div class="play-overlay">
                    <div class="btn-play-circle">
                        <i data-lucide="folder-open" style="fill: white; color: white;"></i>
                    </div>
                </div>
            </div>
            <div class="song-card-info">
                <h4>${title}</h4>
                <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${subtitle}</p>
            </div>
        `;
        
        card.addEventListener('click', () => {
            openDetailView(type, item.id);
        });
        
        container.appendChild(card);
    });
    lucide.createIcons();
}

// Global Lazy Observer
let lazySectionObserver = null;

function initLazyLoading() {
    if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers: load everything immediately
        document.querySelectorAll('.lazy-section').forEach(sec => {
            const query = sec.getAttribute('data-query');
            if (query) fetchTrending(query, sec);
        });
        return;
    }

    lazySectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const container = entry.target;
                const query = container.getAttribute('data-query');
                if (query && !container.getAttribute('data-loaded')) {
                    container.setAttribute('data-loaded', 'true');
                    fetchTrending(query, container);
                }
                observer.unobserve(container);
            }
        });
    }, {
        root: null,
        rootMargin: '200px', // start loading 200px before scroll
        threshold: 0.01
    });

    // Observe categories
    document.querySelectorAll('.lazy-section').forEach(sec => {
        lazySectionObserver.observe(sec);
    });
}

// Playlists Logic
const playlistsCache = {};

async function loadCategoryPlaylists(category, btn) {
    if (btn) {
        document.querySelectorAll('.playlist-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    
    const feed = document.getElementById('all-playlists-feed');
    const grid = document.getElementById('playlists-grid');
    
    if (feed) feed.classList.add('hidden');
    if (grid) grid.classList.remove('hidden');
    
    if (!grid) return;
    
    grid.innerHTML = `<div class="loader-container"><div class="loader-spinner"></div></div>`;
    
    try {
        let playlists = playlistsCache[category];
        if (!playlists) {
            let query = category;
            if (category === 'Devotional') {
                query = 'Malayalam devotional';
            } else if (category === 'English') {
                query = 'Pop Hits';
            } else {
                query = `${category} Hits`;
            }
            
            const response = await fetch(`${currentApiBase}/search/playlists?query=${encodeURIComponent(query)}&limit=15`);
            const result = await response.json();
            playlists = result.data?.results || result.results || [];
            playlistsCache[category] = playlists;
        }
        
        renderAlbumsOrPlaylists(playlists, grid, 'playlist');
    } catch (e) {
        console.error(`Failed to load ${category} playlists:`, e);
        grid.innerHTML = `<p class="error-state">Failed to load playlists. Please try again.</p>`;
    }
}

async function loadFeaturedPlaylists() {
    const container = document.getElementById('featured-playlists');
    if (!container) return;
    
    try {
        const response = await fetch(`${currentApiBase}/featured-playlists`);
        const result = await response.json();
        const playlists = result.data || result.results || [];
        renderAlbumsOrPlaylists(playlists, container, 'playlist');
    } catch (e) {
        console.error("Failed to load featured playlists:", e);
        container.innerHTML = '<p class="error-state">Failed to load featured playlists.</p>';
    }
}

// Initial Load - Optimized for Speed
window.addEventListener('DOMContentLoaded', () => {
    // 1. Core UI Init (Fastest)
    initNavigation();
    initMobileNavigation();
    initMobilePlayerToggle();
    if (window.lucide) lucide.createIcons();
    
    // 2. High Priority Content (Visible on load)
    loadSpotifyTrendingSection('all');
    initMalayalamHeroBanner();
    
    // 3. Defer background tasks to keep UI responsive
    const deferredTasks = () => {
        initVoiceSearch();
        initSpotifyImport();
        initLazyLoading();
        
        // Load jukebox and specific sections with a tiny delay to prevent network congestion
        setTimeout(() => {
            fetchTrending('malayalam jukebox hits', document.getElementById('malayalam-jukebox'));
            fetchTrending('ayyappa devotional songs', document.getElementById('ayyappa-songs'));
            loadFeaturedPlaylists();
            loadHandpickedPlaylistsHome();
            addMoreSections();
        }, 50);
    };

    if (window.requestIdleCallback) {
        requestIdleCallback(deferredTasks);
    } else {
        setTimeout(deferredTasks, 200);
    }
});

async function findWorkingApi() {
    console.log("Using YouTube API via local proxy...");
    currentApiBase = window.location.origin + '/api';
    try {
        const res = await fetch(`${currentApiBase}/health`);
        const data = await res.json();
        console.log("API health check:", data.message || "Connected");
    } catch (e) {
        console.warn("API health check failed:", e);
    }
    console.log("Using API:", currentApiBase);
}

async function preloadJukeboxDetails() {
    // Spotify tracks include stream URLs in search results — no preload needed
}

async function addMoreSections() {
    const main = document.querySelector('.main-content');
    if (!main) return;
    
    // Removed duplicate sections that are already loaded statically in index.html
    const sections = [
        { id: 'malayalam-melodies', title: 'Malayalam Melodies', query: 'latest malayalam melodies' },
        { id: 'malayalam-classics', title: 'Malayalam Evergreen Classics', query: 'old malayalam hits prem nazir yesudas' },
        { id: 'malayalam-folk', title: 'Malayalam Folk & Nadanpattu', query: 'malayalam nadanpattu folk songs' },
        { id: 'malayalam-indie', title: 'Malayalam Indie & Rock', query: 'malayalam indie rock songs' },
        { id: 'hindi-lofi', title: 'Bollywood Lo-Fi Beats', query: 'hindi lofi chill mix' },
        { id: 'hindi-unplugged', title: 'Hindi Unplugged & Acoustic', query: 'hindi unplugged covers' },
        { id: 'tamil-fast', title: 'Tamil Fast Tracks', query: 'latest tamil fast songs' },
        { id: 'party-hits', title: 'Party & Dance Hits', query: '2026 party dance songs' },
        { id: 'lofi-chill', title: 'Lofi & Chill', query: 'indian lofi hip hop' },
        { id: 'devotional', title: 'Spirit & Soul', query: 'indian devotional songs' },
        { id: 'indian-pop', title: 'Indie & Pop', query: 'latest indian pop' },
        { id: 'global-hits', title: 'Global Trending', query: 'top english hits 2026' }
    ];

    sections.forEach(sec => {
        if (document.getElementById(sec.id)) return;
        
        const section = document.createElement('section');
        section.className = 'music-section';
        section.innerHTML = `
            <div class="section-header">
                <div class="trending-tag">
                    <h2>${sec.title}</h2>
                    <span class="pulse"></span>
                </div>
                <a href="#">See All</a>
            </div>
            <div class="horizontal-scroll lazy-section" id="${sec.id}" data-query="${sec.query}">
                <div class="loader-container">
                    <div class="loader-spinner"></div>
                </div>
            </div>
        `;
        main.appendChild(section);
        
        if (lazySectionObserver) {
            const lazyContainer = section.querySelector('.lazy-section');
            lazySectionObserver.observe(lazyContainer);
        }
    });
}

// ─── Spotify Trending Section ────────────────────────────────────────────────
async function loadSpotifyTrendingSection(lang = 'all') {
    const container = document.getElementById('spotify-trending-songs') || document.getElementById('yt-trending-songs');
    if (!container) return;

    if (!spotifyTrendingCache[lang]) {
        container.innerHTML = '<div class="loader-container"><div class="loader-spinner"></div></div>';
        try {
            let data;
            try {
                const response = await fetch(`${currentApiBase}/trending/songs?lang=${encodeURIComponent(lang)}`);
                if (response.ok) data = await response.json();
            } catch (err) {}

            if (data && data.success && data.data) {
                spotifyTrendingCache[lang] = parseTrendingResults(data);
            } else {
                console.log('[Trending] Running client-side direct trending fetch...');
                const rawData = await directClientFetch({ __call: 'search.getResults', q: `${lang === 'all' ? 'indian' : lang} hits 2026`, N: '40', p: '1' });
                const rawSongs = rawData.results || rawData.songs?.results || [];
                spotifyTrendingCache[lang] = rawSongs.map(mapClientSong).filter(Boolean);
            }
        } catch (e) {
            console.error('[Spotify Trending] Failed:', e);
            container.innerHTML = '<div class="error-state"><p>Could not load Spotify charts.</p></div>';
            return;
        }
    }

    renderSpotifyTrendingSection(lang, spotifyTrendingCache[lang], container);
}

function filterSpotifyTrending(lang, btn) {
    document.querySelectorAll('.spotify-lang-tab, .yt-lang-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const container = document.getElementById('spotify-trending-songs') || document.getElementById('yt-trending-songs');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(6px)';
        container.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        setTimeout(async () => {
            await loadSpotifyTrendingSection(lang);
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 200);
    }
}
window.filterSpotifyTrending = filterSpotifyTrending;
window.filterYtTrending = filterSpotifyTrending;

function renderSpotifyTrendingSection(lang, songs, containerEl) {
    const container = containerEl || document.getElementById('spotify-trending-songs') || document.getElementById('yt-trending-songs');
    if (!container || !songs?.length) {
        if (container) container.innerHTML = '<div class="error-state"><p>No tracks found.</p></div>';
        return;
    }

    container.innerHTML = '';
    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card spotify-trend-card yt-trend-card';
        if (currentSong && song.id === currentSong.id && isPlaying) card.classList.add('playing');

        const imgUrl = getSongImageUrl(song, 'https://via.placeholder.com/200');
        const artist = getSongArtistName(song);
        const spotifyUrl = song.spotifyUrl || (song.spotifyId ? `https://open.spotify.com/track/${song.spotifyId}` : '');

        card.innerHTML = `
            <div class="spotify-card-thumb-wrap yt-card-thumb-wrap">
                <img src="${imgUrl}" alt="${song.name}" class="song-img" loading="lazy"
                    onerror="this.src='https://via.placeholder.com/200'">
                <div class="spotify-card-overlay yt-card-overlay">
                    <svg class="spotify-play-logo yt-play-logo" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm4.8 17.34c-.24.36-.66.48-1.02.24-2.64-1.62-5.94-1.98-9.9-1.08-.39.12-.72-.18-.84-.51-.12-.39.18-.72.51-.84 4.26-.96 7.98-.57 10.92 1.26.39.18.45.63.33.93z"/></svg>
                </div>
            </div>
            <div class="song-info">
                <p class="song-name">${song.name}</p>
                <p class="song-artist">${artist}${song.album?.name ? ' • ' + song.album.name : ''}</p>
            </div>`;

        card.addEventListener('click', () => {
            playSong(song);
            updateQueue(songs, song);
        });

        container.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
}

function renderYtTrendingSection(lang) { loadSpotifyTrendingSection(lang); }

function renderTrendingData(results, query, container, append) {

    renderSongs(results, container, append);
    const qLower = query.toLowerCase();
    const isMalayalamTrending = 
        qLower === 'latest malayalam hits' || 
        qLower === 'new malayalam songs' ||
        qLower === 'malayalam hits' ||
        qLower.includes('malayalam trending') || 
        qLower.includes('malayalam latest') || 
        qLower.includes('malayalam 2026');
    if (isMalayalamTrending) {
        applyHeroTrending(results[0], results);
    }
}

function getSongArtistName(song) {
    if (!song) return 'Unknown Artist';
    if (song.artists?.primary?.[0]?.name) return song.artists.primary[0].name;
    if (song.primaryArtists) return song.primaryArtists;
    if (song.singers) return song.singers;
    if (typeof song.artists === 'string') return song.artists;
    if (Array.isArray(song.artists)) return song.artists.map(a => a.name).join(', ');
    return 'Unknown Artist';
}

function getSongImageUrl(song, fallback = '') {
    if (!song) return fallback;
    if (Array.isArray(song.image)) {
        return song.image[2]?.url || song.image[1]?.url || song.image[0]?.url || fallback;
    }
    if (typeof song.image === 'string' && song.image) return song.image;
    return fallback;
}

function parseTrendingResults(data) {
    if (data?.data?.results && Array.isArray(data.data.results)) return data.data.results;
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (data?.results && Array.isArray(data.results)) return data.results;
    if (data?.success && data?.data?.results) return data.data.results;
    return [];
}

function sortTrendingByYear(results) {
    const currentYear = new Date().getFullYear();
    const cutoffYear = currentYear - 2; // 2024
    
    // Filter to keep only recent songs
    const recentSongs = results.filter(s => {
        const year = s.year ? parseInt(s.year) : 0;
        return !isNaN(year) && year >= cutoffYear;
    });
    
    // Fallback to all results if no recent songs are found
    const listToSort = recentSongs.length > 0 ? recentSongs : results;
    
    // Sort by playCount descending to order by trending popularity
    return [...listToSort].sort((a, b) => {
        const countA = a?.playCount ? parseInt(a.playCount) : 0;
        const countB = b?.playCount ? parseInt(b.playCount) : 0;
        return (isNaN(countB) ? 0 : countB) - (isNaN(countA) ? 0 : countA);
    });
}

function saveHeroToStorage(song, songs) {
    try {
        localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify({
            song,
            songs: songs.slice(0, 30),
            updatedAt: Date.now()
        }));
    } catch (e) {}
}

function restoreHeroFromStorage() {
    try {
        const saved = JSON.parse(localStorage.getItem(HERO_STORAGE_KEY));
        if (saved?.song && saved?.songs?.length) {
            currentHeroSongs = saved.songs;
            const idx = saved.songs.findIndex(s => s.id === saved.song.id);
            currentHeroIndex = idx > -1 ? idx : 0;
            
            initHeroCarousel();
            renderHeroIndicators();
            changeHeroSlide(currentHeroIndex, true);
            return true;
        }
    } catch (e) {}
    return false;
}

function applyHeroTrending(song, songsList) {
    if (!song) return;
    
    currentHeroSongs = songsList;
    const idx = songsList.findIndex(s => s.id === song.id);
    currentHeroIndex = idx > -1 ? idx : 0;
    
    initHeroCarousel();
    renderHeroIndicators();
    changeHeroSlide(currentHeroIndex, true);

    const malContainer = document.getElementById('malayalam-songs');
    if (malContainer && !malContainer.getAttribute('data-loaded')) {
        renderSongs(songsList, malContainer);
        malContainer.setAttribute('data-loaded', 'true');
    }
}

// ─── Hero Carousel Slide Logic ──────────────────────────────────────────────
function initHeroCarousel() {
    if (hasInitializedHeroCarousel) return;
    
    const prevBtn = document.getElementById('hero-prev');
    const nextBtn = document.getElementById('hero-next');
    const heroSection = document.getElementById('hero');
    const indicatorsContainer = document.getElementById('hero-indicators');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateHeroSlide(-1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateHeroSlide(1);
        });
    }
    
    // Hover pause/resume autoplay
    if (heroSection) {
        heroSection.addEventListener('mouseenter', () => {
            stopHeroAutoplay();
        });
        
        heroSection.addEventListener('mouseleave', () => {
            startHeroAutoplay();
        });
        
        // Touch gestures for swipe (Mobile)
        let touchStartX = 0;
        let touchEndX = 0;
        
        heroSection.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        heroSection.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleHeroSwipe(touchStartX, touchEndX);
        }, { passive: true });
    }
    
    hasInitializedHeroCarousel = true;
}

function handleHeroSwipe(startX, endX) {
    const diffX = endX - startX;
    const swipeThreshold = 50; // pixels
    if (diffX > swipeThreshold) {
        // Swipe Right -> Prev
        navigateHeroSlide(-1);
    } else if (diffX < -swipeThreshold) {
        // Swipe Left -> Next
        navigateHeroSlide(1);
    }
}

function navigateHeroSlide(direction) {
    const limit = Math.min(currentHeroSongs.length, HERO_CAROUSEL_LIMIT);
    if (limit <= 1) return;
    
    let newIndex = currentHeroIndex + direction;
    if (newIndex < 0) {
        newIndex = limit - 1;
    } else if (newIndex >= limit) {
        newIndex = 0;
    }
    changeHeroSlide(newIndex);
}

function renderHeroIndicators() {
    const indicatorsContainer = document.getElementById('hero-indicators');
    if (!indicatorsContainer) return;
    
    indicatorsContainer.innerHTML = '';
    const limit = Math.min(currentHeroSongs.length, HERO_CAROUSEL_LIMIT);
    for (let i = 0; i < limit; i++) {
        const dot = document.createElement('div');
        dot.className = `hero-indicator ${i === currentHeroIndex ? 'active' : ''}`;
        dot.setAttribute('data-index', i);
        dot.setAttribute('title', `Slide ${i + 1}`);
        indicatorsContainer.appendChild(dot);
    }
}

function startHeroAutoplay() {
    stopHeroAutoplay();
    const limit = Math.min(currentHeroSongs.length, HERO_CAROUSEL_LIMIT);
    if (limit <= 1) return;
    
    heroAutoplayTimer = setInterval(() => {
        navigateHeroSlide(1);
    }, HERO_AUTOPLAY_DELAY);
}

function stopHeroAutoplay() {
    if (heroAutoplayTimer) {
        clearInterval(heroAutoplayTimer);
        heroAutoplayTimer = null;
    }
}

function changeHeroSlide(index, skipFlash = false) {
    const limit = Math.min(currentHeroSongs.length, HERO_CAROUSEL_LIMIT);
    if (limit === 0) return;
    
    currentHeroIndex = index;
    const song = currentHeroSongs[currentHeroIndex];
    if (!song) return;
    
    currentHeroSong = song;
    
    // Update active dot indicator
    const dots = document.querySelectorAll('.hero-indicator');
    dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentHeroIndex);
    });
    
    const heroContent = document.querySelector('.hero-content');
    
    const updateDOM = () => {
        // Call the original updateHero logic but without recreating/triggering flashes again
        updateHero(song, currentHeroSongs, { skipFlash: true });
        
        // Custom background flash effect if not skipped
        const heroSection = document.getElementById('hero');
        if (heroSection && !skipFlash) {
            heroSection.classList.remove('hero-updated');
            void heroSection.offsetWidth;
            heroSection.classList.add('hero-updated');
        }
    };
    
    if (heroContent && !skipFlash) {
        // Fade out
        heroContent.classList.add('fade-out');
        
        // Wait for fade-out transition, update contents, and fade back in
        setTimeout(() => {
            updateDOM();
            heroContent.classList.remove('fade-out');
        }, 220);
    } else {
        updateDOM();
        if (heroContent) heroContent.classList.remove('fade-out');
    }
    
    // Save state and restart autoplay timer
    saveHeroToStorage(song, currentHeroSongs);
    startHeroAutoplay();
}

async function fetchTrendingMalayalamHero(forceRefresh = false) {
    if (forceRefresh) {
        MALAYALAM_HERO_QUERIES.forEach(q => {
            delete apiCache.trending[q.trim().toLowerCase()];
        });
    }

    for (const query of MALAYALAM_HERO_QUERIES) {
        const cacheKey = query.trim().toLowerCase();
        if (!forceRefresh) {
            const cached = getCachedData('trending', cacheKey);
            if (cached?.length) {
                applyHeroTrending(cached[0], cached);
                return;
            }
        }

        try {
            const response = await fetch(`${currentApiBase}/search/songs?query=${encodeURIComponent(query)}&limit=50`);
            const data = await response.json();
            let results = sortTrendingByYear(parseTrendingResults(data));

            if (results.length > 0) {
                console.log(`[Hero] Trending Malayalam: "${results[0].name}" via "${query}"`);
                setCachedData('trending', cacheKey, results);
                applyHeroTrending(results[0], results);
                return;
            }
        } catch (e) {
            console.warn(`[Hero] Failed query "${query}":`, e);
        }
    }
}

function initMalayalamHeroBanner() {
    fetchTrendingMalayalamHero(false);

    if (heroRefreshTimer) clearInterval(heroRefreshTimer);
    heroRefreshTimer = setInterval(() => fetchTrendingMalayalamHero(true), HERO_REFRESH_INTERVAL);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') return;
        try {
            const saved = JSON.parse(localStorage.getItem(HERO_STORAGE_KEY) || '{}');
            if (!saved.updatedAt || Date.now() - saved.updatedAt > CACHE_TTL) {
                fetchTrendingMalayalamHero(true);
            }
        } catch (e) {
            fetchTrendingMalayalamHero(true);
        }
    });
}

// Fetch Trending Songs with Retry
async function fetchTrending(query, container, append = false) {
    const cacheKey = query.trim().toLowerCase();
    const cached = getCachedData('trending', cacheKey);
    if (cached) {
        console.log(`[Cache Hit] Trending songs for: ${query}`);
        renderTrendingData(cached, query, container, append);
        return;
    }

    try {
        const response = await fetch(`${currentApiBase}/search/songs?query=${encodeURIComponent(query)}&limit=50`);
        const data = await response.json();
        
        // Handle different API formats (some wrap results in 'data', some don't)
        let results = parseTrendingResults(data);
        
        if (results && results.length > 0) {
            console.log(`Found ${results.length} results for: ${query}`);
            results = sortTrendingByYear(results);
            
            setCachedData('trending', cacheKey, results);
            renderTrendingData(results, query, container, append);
        } else {
            throw new Error("No results found for " + query);
        }
    } catch (error) {
        console.error(`Error fetching ${query}:`, error);
        container.innerHTML = `<div class="error-state">
            <p>Error loading ${query}</p>
            <button onclick="location.reload()" style="background: var(--accent-color); color: white; border: none; padding: 8px 16px; border-radius: 8px; margin-top: 10px; cursor: pointer;">Retry</button>
        </div>`;
        // Simple search retry with different query if primary fails
        if (!query.includes('backup')) {
            await new Promise(r => setTimeout(r, 2000));
            fetchTrending(query + " 2026 hits backup", container);
        }
    }
}

function updateHero(song, songsList = null, options = {}) {
    if (!song) return;
    const { skipFlash = false } = options;
    
    // If called from playSong(song) without songsList, we check if it is part of the carousel
    if (!songsList && currentHeroSongs?.length > 0) {
        const idx = currentHeroSongs.slice(0, HERO_CAROUSEL_LIMIT).findIndex(s => s.id === song.id);
        if (idx > -1) {
            // If it is in the carousel, transition to it
            if (idx !== currentHeroIndex) {
                changeHeroSlide(idx, true);
            }
            return;
        } else {
            // If it's not in the carousel, we do not change the slide, just update play/pause state
            updatePlayPauseIcon(isPlaying);
            return;
        }
    }
    
    const songChanged = currentHeroSong?.id !== song.id;
    currentHeroSong = song;
    if (songsList) {
        currentHeroSongs = songsList;
    }

    const heroTitle = document.getElementById('hero-song-title') || document.querySelector('.hero h1');
    const heroPara = document.getElementById('hero-song-artist') || document.querySelector('.hero p:not(.hero-label)');
    const heroSection = document.getElementById('hero');
    const heroBadge = document.getElementById('hero-badge') || document.querySelector('.hero .badge');

    const songName = song.name || song.title || 'Unknown Song';
    const artistName = getSongArtistName(song);
    const albumName = song.album?.name || '';

    if (heroTitle) {
        heroTitle.innerText = songName;
        heroTitle.style.cursor = 'pointer';
        heroTitle.onclick = () => playSong(song);
    }

    if (heroPara) {
        if (currentSong && song.id === currentSong.id && isPlaying) {
            heroPara.innerText = `Now Playing • ${artistName}${albumName ? ` • ${albumName}` : ''}`;
        } else {
            heroPara.innerText = albumName
                ? `${artistName} • ${albumName}`
                : `Trending Malayalam Song • ${artistName}`;
        }
    }

    const imgUrl = getSongImageUrl(song);
    if (heroSection && imgUrl) {
        heroSection.style.backgroundImage = `url(${imgUrl})`;
        if (songChanged && !skipFlash) {
            heroSection.classList.remove('hero-updated');
            void heroSection.offsetWidth;
            heroSection.classList.add('hero-updated');
        }
    }

    const isCurrentSong = currentSong && song.id === currentSong.id;

    if (heroBadge) {
        heroBadge.innerHTML = isCurrentSong && isPlaying
            ? '<span class="badge-pulse"></span> Now Playing'
            : '<span class="badge-pulse"></span> Trending Now';
    }

    const heroPlayBtn = document.getElementById('hero-play');
    if (heroPlayBtn) {
        heroPlayBtn.innerHTML = isCurrentSong && isPlaying
            ? `<i data-lucide="pause"></i> Pause`
            : `<i data-lucide="play"></i> Play Now`;

        heroPlayBtn.onclick = (e) => {
            e.stopPropagation();
            if (currentSong && song.id === currentSong.id) {
                const playPauseBtn = document.getElementById('play-pause-btn');
                if (playPauseBtn) playPauseBtn.click();
            } else {
                playSong(song);
                if (currentHeroSongs?.length > 0) {
                    const idx = currentHeroSongs.findIndex(s => s.id === song.id);
                    updateQueue(idx > -1 ? currentHeroSongs : [song], song);
                    updateTracksPlayingStates();
                } else {
                    updateQueue([song], song);
                }
            }
        };
    }

    if (window.lucide) {
        lucide.createIcons();
    }
}

function renderSongs(songs, container, append = false) {
    if (!songs || songs.length === 0) {
        if (!append) container.innerHTML = '<p class="error-state">No songs found in this category.</p>';
        return;
    }
    
    // Deduplicate songs by id
    const seen = new Set();
    const uniqueSongs = songs.filter(song => {
        if (!song || !song.id) return false;
        if (seen.has(song.id)) return false;
        seen.add(song.id);
        return true;
    });
    
    if (uniqueSongs.length === 0) {
        if (!append) container.innerHTML = '<p class="error-state">No unique songs found in this category.</p>';
        return;
    }
    
    if (!append) container.innerHTML = '';
    uniqueSongs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';
        if (currentSong && song.id === currentSong.id && isPlaying) {
            card.classList.add('playing');
        }
        
        let imgUrl = 'https://via.placeholder.com/150';
        if (Array.isArray(song.image)) {
            imgUrl = song.image[2]?.url || song.image[1]?.url || song.image[0]?.url;
        } else if (typeof song.image === 'string') {
            imgUrl = song.image;
        }
        
        const songName = song.name || song.title || "Unknown Song";
        
        let artistName = "Unknown Artist";
        if (song.artists && song.artists.primary && song.artists.primary[0]) {
            artistName = song.artists.primary[0].name;
        } else if (song.primaryArtists) {
            artistName = song.primaryArtists;
        } else if (song.singers) {
            artistName = song.singers;
        } else if (song.artists && typeof song.artists === 'string') {
            artistName = song.artists;
        }
        
        const spotifyUrl = song.spotifyUrl || (song.spotifyId ? `https://open.spotify.com/track/${song.spotifyId}` : '');

        card.innerHTML = `
            <div class="card-img-container">
                <img src="${imgUrl}" alt="${songName}" loading="lazy">
                <div class="play-overlay">
                    <div class="btn-play-circle">
                        <i data-lucide="play" style="fill: white; color: white;"></i>
                    </div>
                </div>
            </div>
            <div class="song-card-info">
                <h4>${songName}</h4>
                <p>${artistName}</p>
            </div>
            ${spotifyUrl ? `<button class="open-spotify" data-url="${spotifyUrl}" title="Open on Spotify"><i data-lucide="external-link"></i></button>` : ''}
        `;
        
        // Preload song URL on pointerdown for iOS compatibility
        card.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.open-spotify')) return;
            preloadSongUrl(song);
        });

        // Main play on card click
        card.addEventListener('click', (e) => {
            if (e.target.closest('.open-spotify')) return;
            playSong(song);
            updateQueue(songs, song);
            document.querySelectorAll('.song-card').forEach(c => c.classList.remove('playing'));
            card.classList.add('playing');
        });
        const openBtn = card.querySelector('.open-spotify');
        if (openBtn) {
            openBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.open(openBtn.getAttribute('data-url'), '_blank');
            });
        }
        
        container.appendChild(card);
    });
    lucide.createIcons();
}

// Search & Suggestions Dropdown System
let searchTimeout = null;
const dropdown = document.getElementById('search-suggestions-dropdown');

// Save search query into recent searches history
function saveRecentSearch(query) {
    if (!query) return;
    const cleanQuery = query.trim();
    if (cleanQuery.length < 2) return;
    let recents = JSON.parse(localStorage.getItem('abr_recent_searches') || '[]');
    recents = recents.filter(q => q.toLowerCase() !== cleanQuery.toLowerCase());
    recents.unshift(cleanQuery);
    recents = recents.slice(0, 5); // keep top 5
    localStorage.setItem('abr_recent_searches', JSON.stringify(recents));
}

// Render search history and trending items
function renderRecentAndTrendingSuggestions() {
    if (!dropdown) return;
    
    let html = '';
    
    // Add Recent Searches from local storage
    const recents = JSON.parse(localStorage.getItem('abr_recent_searches') || '[]');
    if (recents.length > 0) {
        html += `<div class="suggestion-section-title">Recent Searches</div>`;
        recents.forEach((query) => {
            html += `
                <div class="suggestion-item recent-search-item">
                    <div class="recent-search-left" onclick="runSearchFromSuggestion('${query.replace(/'/g, "\\'")}')">
                        <i data-lucide="history"></i>
                        <span class="suggestion-item-title">${query}</span>
                    </div>
                    <button class="delete-recent-btn" onclick="deleteRecentSearch('${query.replace(/'/g, "\\'")}', event)" title="Delete recent search">
                        <i data-lucide="x"></i>
                    </button>
                </div>
            `;
        });
    }
    
    // Add Popular Categories / Trending Searches
    html += `<div class="suggestion-section-title" style="${recents.length > 0 ? 'margin-top: 10px;' : ''}">Trending Searches</div>`;
    const populars = ['Malayalam Jukebox', 'Sabarimala Specials', 'Hindi Romantic', 'Arijit Singh Hits', 'Global Pop'];
    populars.forEach(term => {
        let actualQuery = term;
        if (term === 'Sabarimala Specials') actualQuery = 'Ayyappa Devotional';
        html += `
            <div class="suggestion-item" onclick="runSearchFromSuggestion('${actualQuery.replace(/'/g, "\\'")}')">
                <i data-lucide="trending-up" style="color: var(--accent-color);"></i>
                <span class="suggestion-item-title">${term}</span>
            </div>
        `;
    });
    
    dropdown.innerHTML = html;
    dropdown.classList.remove('hidden');
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Global hook functions
function deleteRecentSearch(query, event) {
    if (event) event.stopPropagation();
    let recents = JSON.parse(localStorage.getItem('abr_recent_searches') || '[]');
    recents = recents.filter(q => q.toLowerCase() !== query.toLowerCase());
    localStorage.setItem('abr_recent_searches', JSON.stringify(recents));
    renderRecentAndTrendingSuggestions();
}

async function runSearchFromSuggestion(term) {
    if (searchInput) {
        searchInput.value = term;
        searchInput.blur();
    }
    if (dropdown) dropdown.classList.add('hidden');
    saveRecentSearch(term);
    await performSearch(term);
}

window.deleteRecentSearch = deleteRecentSearch;
window.runSearchFromSuggestion = runSearchFromSuggestion;

// Fetch suggestions from API and render inline preview
async function fetchSuggestions(query) {
    if (!dropdown) return;
    
    const cacheKey = query.trim().toLowerCase();
    const cached = getCachedData('search', cacheKey);
    
    let results = null;
    if (cached) {
        results = cached;
    } else {
        try {
            const response = await fetch(`${currentApiBase}/search?query=${encodeURIComponent(query)}`);
            const result = await response.json();
            if (result && result.success && result.data) {
                results = result.data;
                setCachedData('search', cacheKey, results);
            }
        } catch (e) {
            console.warn("Suggestions fetch failed:", e);
        }
    }
    
    if (results) {
        renderSuggestionsResults(query, results);
    }
}

function renderSuggestionsResults(query, results) {
    if (!dropdown) return;
    
    const songs = results.songs?.results?.slice(0, 4) || [];
    const artists = results.artists?.results?.slice(0, 3) || [];
    
    if (songs.length === 0 && artists.length === 0) {
        dropdown.innerHTML = `<div style="padding: 12px; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">No matches found for "${query}"</div>`;
        dropdown.classList.remove('hidden');
        return;
    }
    
    let html = '';
    
    if (songs.length > 0) {
        html += `<div class="suggestion-section-title">Songs</div>`;
        songs.forEach(song => {
            let imgUrl = 'https://via.placeholder.com/50';
            if (Array.isArray(song.image)) {
                imgUrl = song.image[1]?.url || song.image[0]?.url || imgUrl;
            } else if (typeof song.image === 'string') {
                imgUrl = song.image;
            }
            
            const songName = song.name || song.title || "Unknown Song";
            let artistName = "Unknown Artist";
            if (song.artists && song.artists.primary && song.artists.primary[0]) {
                artistName = song.artists.primary[0].name;
            } else if (song.primaryArtists) {
                artistName = song.primaryArtists;
            } else if (song.artists && typeof song.artists === 'string') {
                artistName = song.artists;
            }
            
            html += `
                <div class="suggestion-item song-suggestion" data-song-id="${song.id}">
                    <img class="suggestion-thumb" src="${imgUrl}" alt="${songName}">
                    <div class="suggestion-item-info">
                        <span class="suggestion-item-title">${songName}</span>
                        <span class="suggestion-item-subtitle">${artistName}</span>
                    </div>
                    <i data-lucide="play-circle" style="color: var(--accent-color); width: 18px; height: 18px;"></i>
                </div>
            `;
        });
    }
    
    if (artists.length > 0) {
        html += `<div class="suggestion-section-title" style="margin-top: 8px;">Artists</div>`;
        artists.forEach(artist => {
            let imgUrl = 'https://via.placeholder.com/50';
            if (Array.isArray(artist.image)) {
                imgUrl = artist.image[1]?.url || artist.image[0]?.url || imgUrl;
            } else if (typeof artist.image === 'string') {
                imgUrl = artist.image;
            }
            
            html += `
                <div class="suggestion-item artist-suggestion" data-name="${artist.name}">
                    <img class="suggestion-thumb" src="${imgUrl}" alt="${artist.name}" style="border-radius: 50%;">
                    <div class="suggestion-item-info">
                        <span class="suggestion-item-title">${artist.name}</span>
                        <span class="suggestion-item-subtitle">Artist</span>
                    </div>
                    <i data-lucide="arrow-up-left" style="color: var(--text-secondary); width: 16px; height: 16px;"></i>
                </div>
            `;
        });
    }
    
    html += `
        <div class="suggestion-item see-all-suggestion" onclick="runSearchFromSuggestion('${query.replace(/'/g, "\\'")}')">
            <span>See all results for "${query}"</span>
        </div>
    `;
    
    dropdown.innerHTML = html;
    dropdown.classList.remove('hidden');
    
    // Bind click events on suggestions
    dropdown.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.classList.contains('see-all-suggestion')) return;
            
            e.stopPropagation();
            if (item.classList.contains('artist-suggestion')) {
                const artistName = item.getAttribute('data-name');
                runSearchFromSuggestion(artistName);
            } else if (item.classList.contains('song-suggestion')) {
                const songId = item.getAttribute('data-song-id');
                const matchedSong = songs.find(s => s.id === songId);
                if (matchedSong) {
                    playSong(matchedSong);
                    updateQueue(songs, matchedSong);
                    if (dropdown) dropdown.classList.add('hidden');
                    saveRecentSearch(matchedSong.name);
                }
            }
        });
    });
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Search input interaction handlers
searchInput.addEventListener('focus', () => {
    const query = searchInput.value.trim();
    if (!query) {
        renderRecentAndTrendingSuggestions();
    } else {
        fetchSuggestions(query);
    }
});

searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const query = searchInput.value.trim();
    if (query) {
        searchTimeout = setTimeout(async () => {
            await fetchSuggestions(query);
        }, 300);
    } else {
        renderRecentAndTrendingSuggestions();
    }
});

searchInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        clearTimeout(searchTimeout);
        const query = searchInput.value.trim();
        if (query) {
            if (dropdown) dropdown.classList.add('hidden');
            saveRecentSearch(query);
            await performSearch(query);
        }
    }
});

// Click outside suggestion dropdown to hide it
document.addEventListener('click', (e) => {
    if (dropdown && !e.target.closest('.search-container')) {
        dropdown.classList.add('hidden');
    }
});

// Touch Preloader for iOS compatibility
async function preloadSongUrl(song) {
    if (!song || song.downloadUrl || song.youtubeId) return;
    
    // Avoid parallel preloads for the same song
    if (song._isPreloading) return;
    song._isPreloading = true;
    
    try {
        console.log("[iOS Touch Preload] Preloading URL for:", song.name || song.title);
        let fetchUrl = `${currentApiBase}/songs?`;
        if (song.id.startsWith('http://') || song.id.startsWith('https://')) {
            fetchUrl += `link=${encodeURIComponent(song.id)}`;
        } else {
            fetchUrl += `ids=${song.id}`;
        }
        const res = await fetch(fetchUrl);
        const data = await res.json();
        const fullSong = data.data?.[0] || data?.[0];
        if (fullSong && fullSong.downloadUrl) {
            song.downloadUrl = fullSong.downloadUrl;
            if (fullSong.image) song.image = fullSong.image;
            console.log("[iOS Touch Preload] Preload success:", song.name || song.title);
        }
    } catch (e) {
        console.warn("[iOS Touch Preload] Preload failed:", e);
    } finally {
        delete song._isPreloading;
    }
}

// Play Song
async function playSong(song) {
    if (!song) return;
    currentSong = song;
    
    // Sync queue index
    if (queue && queue.length > 0) {
        const idx = queue.findIndex(s => s.id === song.id);
        if (idx > -1) {
            currentIndex = idx;
        } else {
            currentIndex = -1;
        }
    } else {
        queue = [song];
        currentIndex = 0;
    }
    
    // Update UI immediately
    updateUI(song);
    updateHero(song);
    
    // iOS/Safari background play optimization: "Touch" the audio element on first click
    if (!hasInitializedAudio) {
        audio.play().then(() => audio.pause()).catch(() => {});
        hasInitializedAudio = true;
    }

    // Haptic feedback for mobile
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }

    // Handle YouTube Playback (Prioritize direct audio stream if available)
    if ((song.youtubeId || song.isYouTube) && !song.downloadUrl) {
        const ytId = song.youtubeId || song.id;
        console.log(`[Playback] Playing YouTube track via IFrame: ${ytId}`);
        
        // Pause standard audio and clear source
        audio.pause();
        audio.src = '';
        
        // Show visualizer
        initVisualizer();
        
        // Show the mini player
        const miniPlayer = document.getElementById('yt-mini-player');
        if (miniPlayer) miniPlayer.classList.remove('hidden');
        
        // Inject the iframe directly
        loadYouTubeIframe(ytId);
        
        isPlaying = true;
        updatePlayPauseIcon(true);
        return;
    }

    // Handle Standard Audio Playback
    console.log(`[Playback] Playing direct audio: ${song.name}`);
    
    // Pause YouTube if active
    if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
    const miniPlayer = document.getElementById('yt-mini-player');
    if (miniPlayer) miniPlayer.classList.add('hidden');
    
    // Enable EQ
    if (eqBtn) {
        eqBtn.style.opacity = '1';
        eqBtn.style.pointerEvents = 'auto';
    }
    
    // Pre-calculate URL
    let downloadUrl = '';
    if (Array.isArray(song.downloadUrl) && song.downloadUrl.length > 0) {
        // Pick best available stream link (320kbps or first available link)
        const bestObj = song.downloadUrl.find(u => u.url && u.url.startsWith('http')) || song.downloadUrl.find(u => u.url && u.url.startsWith('/api/stream')) || song.downloadUrl[0];
        downloadUrl = bestObj?.url || '';
    } else if (typeof song.downloadUrl === 'string') {
        downloadUrl = song.downloadUrl;
    }

    // If no URL (legacy/partial data), try to fetch full data
    if (!downloadUrl) {
        console.log("[Playback] Resolving missing stream URL...");
        try {
            const res = await fetch(`${currentApiBase}/songs?id=${song.id}`);
            const data = await res.json();
            const freshSong = data.data?.[0] || data?.[0];
            if (freshSong && freshSong.downloadUrl) {
                song.downloadUrl = freshSong.downloadUrl;
                return playSong(song); // Recursive retry
            } else {
                throw new Error("No download URL returned");
            }
        } catch (e) {
            console.error("[Playback] Stream resolution failed:", e);
            showToast("Falling back to alternate playback...", "warning");
            // Fallback: search for this song on YouTube
            try {
                const sRes = await fetch(`${currentApiBase}/search/songs?query=${encodeURIComponent(song.name + ' ' + (song.primaryArtists || ''))}&limit=1`);
                const sData = await sRes.json();
                const ytRes = sData.data?.results?.[0];
                if (ytRes && ytRes.youtubeId) {
                    song.youtubeId = ytRes.youtubeId;
                    return playSong(song);
                }
            } catch (err) {}
            showToast("Failed to load this track.", "error");
            return;
        }
    }

    // Resolve relative path
    if (!downloadUrl.startsWith('http') && !downloadUrl.startsWith('data:')) {
        let path = window.location.pathname;
        if (!path.endsWith('/') && !path.split('/').pop().includes('.')) path += '/';
        const base = window.location.origin + path;
        downloadUrl = new URL(downloadUrl, base).href;
    }

    try {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        if (isIOS) {
            audio.src = downloadUrl;
        } else {
            audio.pause();
            if (downloadUrl.startsWith('http')) {
                audio.crossOrigin = "anonymous";
            } else {
                audio.removeAttribute('crossOrigin');
            }
            audio.src = downloadUrl;
            audio.load();
        }
        
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                initVisualizer();
                isPlaying = true;
                updatePlayPauseIcon(true);
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.playbackState = 'playing';
                }
            }).catch(err => {
                console.warn("Primary playback failed, trying fallback...", err);
                
                // Fallback: Try without CORS if it was enabled (non-iOS only)
                if (!isIOS && audio.crossOrigin) {
                    audio.pause();
                    audio.removeAttribute('crossOrigin');
                    audio.load();
                    audio.play().then(() => {
                        isPlaying = true;
                        updatePlayPauseIcon(true);
                    }).catch(e => {
                        handlePlaybackError(downloadUrl, e);
                    });
                } else {
                    handlePlaybackError(downloadUrl, err);
                }
            });
        }
    } catch (err) {
        console.error("Error in playSong:", err);
        handlePlaybackError(downloadUrl, err);
    }
}

function handlePlaybackError(url, error) {
    console.error("Playback failure for URL:", url, error);
    
    // If a YouTube proxy stream failed, fall back to the YouTube iframe!
    if (currentSong && currentSong.youtubeId && currentSong.downloadUrl && !url.includes('youtube-nocookie.com')) {
        console.warn("Proxy stream failed. Falling back to YouTube iframe for:", currentSong.youtubeId);
        
        // Disable EQ for YouTube iframe tracks
        if (eqBtn) {
            eqBtn.style.opacity = '0.5';
            eqBtn.title = 'Equalizer (Not available for YouTube tracks)';
            eqBtn.style.pointerEvents = 'none';
        }

        // Show the mini player
        const miniPlayer = document.getElementById('yt-mini-player');
        if (miniPlayer) miniPlayer.classList.remove('hidden');

        // Stop any standard audio
        audio.pause();

        // Inject the iframe directly
        loadYouTubeIframe(currentSong.youtubeId);

        isPlaying = true;
        updatePlayPauseIcon(true);
        return;
    }

    // Auto-refresh expired URLs once
    if (currentSong && !currentSong.youtubeId && (!currentSong._refreshAttempts || currentSong._refreshAttempts < 1)) {
        currentSong._refreshAttempts = (currentSong._refreshAttempts || 0) + 1;
        console.log(`[Auto-Refresh] Retrying playback with a fresh URL for: ${currentSong.name || currentSong.title}`);
        showToast("Refreshing stream link...", "warning");
        currentSong.downloadUrl = null;
        playSong(currentSong);
        return;
    }

    // Proceed to next track if retry failed or if we have already retried
    const errorMsg = `Failed to play: ${currentSong?.name || 'Unknown'}. Let's skip to the next track.`;
    console.warn(errorMsg);
    
    // Check if it's a local file and provide specific advice
    if (url && url.includes(window.location.hostname) && url.includes('/audio/')) {
        console.error("DEBUG: Local file not found. Please ensure the 'audio' folder and its contents were pushed to GitHub.");
    }

    showToast(errorMsg, "error");
    setTimeout(() => {
        playNextSong();
    }, 1500);
}

function updatePlayPauseIcon(playing) {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playPauseBtnMobile = document.getElementById('play-pause-btn-mobile');
    const iconHtml = playing ? '<i data-lucide="pause"></i>' : '<i data-lucide="play"></i>';
    if (playPauseBtn) playPauseBtn.innerHTML = iconHtml;
    if (playPauseBtnMobile) playPauseBtnMobile.innerHTML = iconHtml;
    
    // Sync Hero section play button and badge
    const heroPlayBtn = document.getElementById('hero-play');
    if (heroPlayBtn && currentHeroSong) {
        const isCurrentHeroSongPlaying = currentSong && currentHeroSong && currentHeroSong.id === currentSong.id && playing;
        heroPlayBtn.innerHTML = isCurrentHeroSongPlaying ? `<i data-lucide="pause"></i> Pause` : `<i data-lucide="play"></i> Play Now`;
        const heroBadge = document.getElementById('hero-badge') || document.querySelector('.hero .badge');
        if (heroBadge) {
            heroBadge.innerHTML = isCurrentHeroSongPlaying
                ? '<span class="badge-pulse"></span> Now Playing'
                : '<span class="badge-pulse"></span> Trending Now';
        }
        const heroPara = document.getElementById('hero-song-artist');
        if (heroPara && currentHeroSong) {
            const artistName = getSongArtistName(currentHeroSong);
            const albumName = currentHeroSong.album?.name || '';
            heroPara.innerText = isCurrentHeroSongPlaying
                ? `Now Playing • ${artistName}${albumName ? ` • ${albumName}` : ''}`
                : (albumName ? `${artistName} • ${albumName}` : `Trending Malayalam Song • ${artistName}`);
        }
        if (window.lucide) lucide.createIcons();
    }
    
    // Toggle vinyl spin class state
    if (currentAlbumArt) {
        if (playing) {
            currentAlbumArt.classList.add('playing-vinyl');
            currentAlbumArt.classList.remove('paused-vinyl');
        } else {
            currentAlbumArt.classList.add('paused-vinyl');
        }
    }
    
    lucide.createIcons();
}

function getDominantColors(imgUrl) {
    return new Promise((resolve) => {
        const fallback = {
            primary: 'rgb(255, 170, 0)',
            secondary: 'rgb(255, 94, 0)',
            glow: 'rgba(255, 170, 0, 0.25)',
            accent: '#ffaa00',
            accentHover: '#ffc837',
            accentSecondary: '#ff5e00'
        };
        
        if (!imgUrl || imgUrl.includes('placeholder') || imgUrl.includes('via.placeholder.com')) {
            resolve(fallback);
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imgUrl;
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 10;
                canvas.height = 10;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, 10, 10);
                const data = ctx.getImageData(0, 0, 10, 10).data;
                
                let r = 0, g = 0, b = 0;
                let count = 0;
                for (let i = 0; i < data.length; i += 4) {
                    const rVal = data[i];
                    const gVal = data[i+1];
                    const bVal = data[i+2];
                    const brightness = (rVal * 299 + gVal * 587 + bVal * 114) / 1000;
                    
                    // Keep moderately saturated pixels to avoid pitch black or pure white accents
                    if (brightness > 20 && brightness < 235) {
                        r += rVal;
                        g += gVal;
                        b += bVal;
                        count++;
                    }
                }
                
                if (count === 0) {
                    for (let i = 0; i < data.length; i += 4) {
                        r += data[i];
                        g += data[i+1];
                        b += data[i+2];
                        count++;
                    }
                }
                
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);
                
                // Keep accents legible by ensuring they meet a minimum brightness
                const minBrightness = 45;
                const currentBrightness = (r * 299 + g * 587 + b * 114) / 1000;
                if (currentBrightness < minBrightness) {
                    const factor = minBrightness / (currentBrightness || 1);
                    r = Math.min(255, Math.round(r * factor));
                    g = Math.min(255, Math.round(g * factor));
                    b = Math.min(255, Math.round(b * factor));
                }

                const primary = `rgb(${r}, ${g}, ${b})`;
                const glow = `rgba(${r}, ${g}, ${b}, 0.25)`;
                
                // Create a secondary hue shifted color for background gradients
                let sr = Math.min(255, Math.round(r * 0.7));
                let sg = Math.min(255, Math.round(g * 0.6));
                let sb = Math.min(255, Math.round(b * 1.1));
                if (sr === r && sg === g && sb === b) {
                    sr = Math.max(0, r - 50);
                    sg = Math.max(0, g - 50);
                    sb = Math.max(0, b - 50);
                }
                const secondary = `rgb(${sr}, ${sg}, ${sb})`;
                const accent = primary;
                
                // Hover color is slightly lightened
                const hr = Math.min(255, r + 30);
                const hg = Math.min(255, g + 30);
                const hb = Math.min(255, b + 30);
                const accentHover = `rgb(${hr}, ${hg}, ${hb})`;
                
                resolve({
                    primary,
                    secondary,
                    glow,
                    accent,
                    accentHover,
                    accentSecondary: secondary
                });
            } catch (e) {
                console.warn("Failed canvas color read:", e);
                resolve(fallback);
            }
        };
        
        img.onerror = () => {
            resolve(fallback);
        };
    });
}

let isPreloadingNext = false;
async function preloadNextSong() {
    if (isPreloadingNext || !queue || queue.length <= 1) return;
    
    // Sync queue index
    let nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
        if (isRepeat === 'all') {
            nextIndex = 0;
        } else {
            return;
        }
    }
    
    const nextSong = queue[nextIndex];
    if (!nextSong || nextSong.downloadUrl || nextSong.youtubeId) {
        return; // Already has source URL or is YouTube video
    }
    
    isPreloadingNext = true;
    try {
        console.log("[Background Preload] Preloading next song URL for:", nextSong.name);
        let fetchUrl = `${currentApiBase}/songs?`;
        if (nextSong.id.startsWith('http://') || nextSong.id.startsWith('https://')) {
            fetchUrl += `link=${encodeURIComponent(nextSong.id)}`;
        } else {
            fetchUrl += `ids=${nextSong.id}`;
        }
        const res = await fetch(fetchUrl);
        const data = await res.json();
        const fullSong = data.data?.[0] || data?.[0];
        if (fullSong && fullSong.downloadUrl) {
            nextSong.downloadUrl = fullSong.downloadUrl;
            if (fullSong.image) nextSong.image = fullSong.image;
            console.log("[Background Preload] Successfully resolved next song download URL in advance.");
        }
    } catch (e) {
        console.warn("[Background Preload] Preload failed:", e);
    } finally {
        isPreloadingNext = false;
    }
}

function updateUI(song) {
    if (!song) return;
    const songName = song.name || song.title || "Unknown Song";
    currentSongTitle.innerText = songName;
    
    let artistName = "Unknown Artist";
    if (song.artists && song.artists.primary && song.artists.primary[0]) {
        artistName = song.artists.primary[0].name;
    } else if (song.primaryArtists) {
        artistName = song.primaryArtists;
    } else if (song.singers) {
        artistName = song.singers;
    } else if (song.artists && typeof song.artists === 'string') {
        artistName = song.artists;
    }
    
    currentSongArtist.innerText = artistName;
    
    let imgUrl = 'https://via.placeholder.com/150';
    if (Array.isArray(song.image)) {
        imgUrl = song.image[2]?.url || song.image[1]?.url || song.image[0]?.url;
    } else if (typeof song.image === 'string') {
        imgUrl = song.image;
    }
    
    currentAlbumArt.src = imgUrl;
    
    // Update theme custom variables dynamically on track load!
    getDominantColors(imgUrl).then(colors => {
        document.documentElement.style.setProperty('--dynamic-accent', colors.accent);
        document.documentElement.style.setProperty('--dynamic-accent-hover', colors.accentHover);
        document.documentElement.style.setProperty('--dynamic-accent-secondary', colors.accentSecondary);
        document.documentElement.style.setProperty('--current-song-color-primary', colors.primary);
        document.documentElement.style.setProperty('--current-song-color-secondary', colors.secondary);
        document.documentElement.style.setProperty('--current-song-color-glow', colors.glow);
    });

    // Update ambient background glow
    const backdrop = document.getElementById('ambient-backdrop');
    if (backdrop) {
        backdrop.style.backgroundImage = `url(${imgUrl})`;
    }
    
    updatePlayPauseIcon(true);
    updatePlayerHeartIcon();
    
    // Synchronize card highlight in UI and auto-scroll
    document.querySelectorAll('.song-card').forEach(c => {
        c.classList.remove('playing');
        const h4 = c.querySelector('h4');
        if (h4 && h4.innerText.trim() === songName.trim()) {
            c.classList.add('playing');
            try {
                c.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } catch (e) {}
        }
    });

    // Sync table row icons and colors automatically on track change
    updateTracksPlayingStates();
    
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: songName,
            artist: artistName,
            album: (song.album && typeof song.album === 'object') ? song.album.name : (song.album || ''),
            artwork: [
                { src: imgUrl, sizes: '96x96', type: 'image/jpg' },
                { src: imgUrl, sizes: '128x128', type: 'image/jpg' },
                { src: imgUrl, sizes: '192x192', type: 'image/jpg' },
                { src: imgUrl, sizes: '256x256', type: 'image/jpg' },
                { src: imgUrl, sizes: '384x384', type: 'image/jpg' },
                { src: imgUrl, sizes: '512x512', type: 'image/jpg' },
            ]
        });

        // Add action handlers for background control
        navigator.mediaSession.setActionHandler('play', () => {
            if (isCurrentlyPlayingYT()) {
                const iframe = document.getElementById('yt-iframe');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage(
                        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
                        'https://www.youtube-nocookie.com'
                    );
                }
            } else {
                audio.play();
            }
            isPlaying = true;
            updatePlayPauseIcon(true);
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
            }
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            if (isCurrentlyPlayingYT()) {
                const iframe = document.getElementById('yt-iframe');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage(
                        JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
                        'https://www.youtube-nocookie.com'
                    );
                }
            } else {
                audio.pause();
            }
            isPlaying = false;
            updatePlayPauseIcon(false);
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'paused';
            }
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
            playPreviousSong();
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            playNextSong();
        });

        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
            const skipTime = details.seekOffset || 10;
            if (isCurrentlyPlayingYT()) {
                const duration = ytDurationCache[currentSong.youtubeId] || 0;
                if (duration > 0) {
                    const currentTime = (parseFloat(progressBar.value) / 100) * duration || 0;
                    const newTime = Math.max(0, currentTime - skipTime);
                    const iframe = document.getElementById('yt-iframe');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage(
                            JSON.stringify({ event: 'command', func: 'seekTo', args: [newTime, true] }),
                            '*'
                        );
                    }
                    progressBar.value = (newTime / duration) * 100;
                    currentTimeEl.innerText = formatTime(newTime);
                    updateMediaSessionPositionState(newTime, duration);
                }
            } else {
                audio.currentTime = Math.max(audio.currentTime - skipTime, 0);
                updateMediaSessionPositionState();
            }
        });

        navigator.mediaSession.setActionHandler('seekforward', (details) => {
            const skipTime = details.seekOffset || 10;
            if (isCurrentlyPlayingYT()) {
                const duration = ytDurationCache[currentSong.youtubeId] || 0;
                if (duration > 0) {
                    const currentTime = (parseFloat(progressBar.value) / 100) * duration || 0;
                    const newTime = Math.min(duration, currentTime + skipTime);
                    const iframe = document.getElementById('yt-iframe');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage(
                            JSON.stringify({ event: 'command', func: 'seekTo', args: [newTime, true] }),
                            '*'
                        );
                    }
                    progressBar.value = (newTime / duration) * 100;
                    currentTimeEl.innerText = formatTime(newTime);
                    updateMediaSessionPositionState(newTime, duration);
                }
            } else {
                audio.currentTime = Math.min(audio.currentTime + skipTime, audio.duration);
                updateMediaSessionPositionState();
            }
        });

        if ('setActionHandler' in navigator.mediaSession) {
            try {
                navigator.mediaSession.setActionHandler('seekto', (details) => {
                    const seekTime = details.seekTime;
                    if (isCurrentlyPlayingYT()) {
                        const duration = ytDurationCache[currentSong.youtubeId] || 0;
                        if (duration > 0 && seekTime !== undefined) {
                            const iframe = document.getElementById('yt-iframe');
                            if (iframe && iframe.contentWindow) {
                                iframe.contentWindow.postMessage(
                                    JSON.stringify({ event: 'command', func: 'seekTo', args: [seekTime, true] }),
                                    '*'
                                );
                            }
                            progressBar.value = (seekTime / duration) * 100;
                            currentTimeEl.innerText = formatTime(seekTime);
                            updateMediaSessionPositionState(seekTime, duration);
                        }
                    } else if (seekTime !== undefined) {
                        audio.currentTime = seekTime;
                        updateMediaSessionPositionState();
                    }
                });
            } catch (e) {
                console.warn("Could not register seekto action handler:", e);
            }
        }
    }
}

function updateQueue(songs, current) {
    queue = songs;
    currentIndex = queue.findIndex(s => s.id === current.id);
}

// Update native iOS/Android Media Session position state
function updateMediaSessionPositionState(customPosition, customDuration) {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
        if (currentSong) {
            try {
                if (isCurrentlyPlayingYT()) {
                    const duration = customDuration !== undefined ? customDuration : (ytDurationCache[currentSong.youtubeId] || 0);
                    const position = customPosition !== undefined ? customPosition : ((parseFloat(progressBar.value) / 100) * duration || 0);
                    if (duration > 0 && position <= duration && position >= 0) {
                        navigator.mediaSession.setPositionState({
                            duration: duration,
                            playbackRate: 1.0,
                            position: position
                        });
                    }
                } else if (audio.duration && !isNaN(audio.duration)) {
                    navigator.mediaSession.setPositionState({
                        duration: audio.duration,
                        playbackRate: audio.playbackRate || 1.0,
                        position: audio.currentTime
                    });
                }
            } catch (error) {
                console.warn("Failed to set Media Session position state:", error);
            }
        }
    }
}

// Player Controls
playPauseBtn.addEventListener('click', () => {
    if (!currentSong) return;
    
    if (isCurrentlyPlayingYT()) {
        // Send postMessage command to the embedded iframe
        const iframe = document.getElementById('yt-iframe');
        if (iframe && iframe.contentWindow) {
            const action = isPlaying ? 'pauseVideo' : 'playVideo';
            iframe.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: action, args: [] }),
                'https://www.youtube-nocookie.com'
            );
        }
    } else {
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
    }
    isPlaying = !isPlaying;
    updatePlayPauseIcon(isPlaying);
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
});

function playNextSong() {
    if (!queue || queue.length === 0) return;
    
    // Sync current index in case queue was updated
    if (currentSong) {
        const idx = queue.findIndex(s => s.id === currentSong.id);
        if (idx > -1) currentIndex = idx;
    }
    
    if (isRepeat === 'one' && currentSong) {
        playSong(currentSong);
        return;
    }
    
    let newIndex;
    if (isShuffle) {
        newIndex = Math.floor(Math.random() * queue.length);
    } else {
        newIndex = currentIndex + 1;
        if (newIndex >= queue.length) {
            if (isRepeat === 'all') {
                newIndex = 0;
            } else {
                // stop playback at end of queue
                isPlaying = false;
                updatePlayPauseIcon(false);
                if (isCurrentlyPlayingYT()) {
                    const iframe = document.getElementById('yt-iframe');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage(
                            JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
                            'https://www.youtube-nocookie.com'
                        );
                    }
                } else {
                    audio.pause();
                }
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.playbackState = 'paused';
                }
                return;
            }
        }
    }
    
    const nextSong = queue[newIndex];
    if (nextSong) {
        currentIndex = newIndex;
        playSong(nextSong);
    }
}

function playPreviousSong() {
    if (!queue || queue.length === 0) return;
    
    // Sync current index
    if (currentSong) {
        const idx = queue.findIndex(s => s.id === currentSong.id);
        if (idx > -1) currentIndex = idx;
    }
    
    let newIndex;
    if (isShuffle) {
        newIndex = Math.floor(Math.random() * queue.length);
    } else {
        newIndex = currentIndex - 1;
        if (newIndex < 0) {
            if (isRepeat === 'all') {
                newIndex = queue.length - 1;
            } else {
                newIndex = 0; // Stay at first track
            }
        }
    }
    
    const prevSong = queue[newIndex];
    if (prevSong) {
        currentIndex = newIndex;
        playSong(prevSong);
    }
}

prevBtn.addEventListener('click', () => {
    playPreviousSong();
});

nextBtn.addEventListener('click', () => {
    playNextSong();
});

// Shuffle & Repeat Click Bindings
if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle('active', isShuffle);
        shuffleBtn.title = `Shuffle: ${isShuffle ? 'ON' : 'OFF'}`;
        localStorage.setItem('player_shuffle', isShuffle ? 'true' : 'false');
    });
}

if (repeatBtn) {
    repeatBtn.addEventListener('click', () => {
        if (isRepeat === 'all') {
            isRepeat = 'one';
            repeatBtn.classList.add('active');
            repeatBtn.title = 'Repeat: ONE';
            const icon = repeatBtn.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', 'repeat-1');
                lucide.createIcons();
            }
        } else if (isRepeat === 'one') {
            isRepeat = 'none';
            repeatBtn.classList.remove('active');
            repeatBtn.title = 'Repeat: OFF';
            const icon = repeatBtn.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', 'repeat');
                lucide.createIcons();
            }
        } else {
            isRepeat = 'all';
            repeatBtn.classList.add('active');
            repeatBtn.title = 'Repeat: ALL';
            const icon = repeatBtn.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', 'repeat');
                lucide.createIcons();
            }
        }
        localStorage.setItem('player_repeat', isRepeat);
    });
}

if (backwardBtn) {
    backwardBtn.addEventListener('click', () => {
        if (!currentSong) return;
        const skipTime = 10;
        if (isCurrentlyPlayingYT()) {
            const duration = ytDurationCache[currentSong.youtubeId] || 0;
            if (duration > 0) {
                const currentTime = (parseFloat(progressBar.value) / 100) * duration || 0;
                const newTime = Math.max(0, currentTime - skipTime);
                const iframe = document.getElementById('yt-iframe');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage(
                        JSON.stringify({ event: 'command', func: 'seekTo', args: [newTime, true] }),
                        '*'
                    );
                }
                progressBar.value = (newTime / duration) * 100;
                currentTimeEl.innerText = formatTime(newTime);
                updateMediaSessionPositionState(newTime, duration);
            }
        } else {
            audio.currentTime = Math.max(audio.currentTime - skipTime, 0);
            updateMediaSessionPositionState();
        }
    });
}

if (forwardBtn) {
    forwardBtn.addEventListener('click', () => {
        if (!currentSong) return;
        const skipTime = 10;
        if (isCurrentlyPlayingYT()) {
            const duration = ytDurationCache[currentSong.youtubeId] || 0;
            if (duration > 0) {
                const currentTime = (parseFloat(progressBar.value) / 100) * duration || 0;
                const newTime = Math.min(duration, currentTime + skipTime);
                const iframe = document.getElementById('yt-iframe');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage(
                        JSON.stringify({ event: 'command', func: 'seekTo', args: [newTime, true] }),
                        '*'
                    );
                }
                progressBar.value = (newTime / duration) * 100;
                currentTimeEl.innerText = formatTime(newTime);
                updateMediaSessionPositionState(newTime, duration);
            }
        } else {
            audio.currentTime = Math.min(audio.currentTime + skipTime, audio.duration);
            updateMediaSessionPositionState();
        }
    });
}

audio.addEventListener('timeupdate', () => {
    if (isSeeking) return;
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progress || 0;
    currentTimeEl.innerText = formatTime(audio.currentTime);
    totalDurationEl.innerText = formatTime(audio.duration);
    updateMediaSessionPositionState();
    
    // Preload next track at 85% completion to prevent background playback gaps
    if (audio.duration && (audio.currentTime / audio.duration) > 0.85) {
        preloadNextSong();
    }
});

audio.addEventListener('loadedmetadata', () => {
    updateMediaSessionPositionState();
});

audio.addEventListener('durationchange', () => {
    updateMediaSessionPositionState();
});

audio.addEventListener('ended', () => {
    playNextSong();
});

audio.addEventListener('error', (e) => {
    console.error("Audio error event triggered:", audio.error);
    if (currentSong) {
        handlePlaybackError(audio.src, audio.error);
    }
});

// Seeker interaction for progress bar (seeking audio playback)
progressBar.addEventListener('mousedown', () => {
    isSeeking = true;
});
progressBar.addEventListener('touchstart', () => {
    isSeeking = true;
});

progressBar.addEventListener('input', () => {
    isSeeking = true;
    if (!currentSong) return;
    if (isCurrentlyPlayingYT()) {
        const duration = ytDurationCache[currentSong.youtubeId] || 0;
        const time = (progressBar.value / 100) * duration;
        if (!isNaN(time) && duration > 0) {
            currentTimeEl.innerText = formatTime(time);
        }
    } else {
        const time = (progressBar.value / 100) * audio.duration;
        if (!isNaN(time)) {
            currentTimeEl.innerText = formatTime(time);
        }
    }
});

progressBar.addEventListener('change', () => {
    if (!currentSong) {
        isSeeking = false;
        return;
    }
    if (isCurrentlyPlayingYT()) {
        const duration = ytDurationCache[currentSong.youtubeId] || 0;
        const time = (progressBar.value / 100) * duration;
        if (!isNaN(time) && duration > 0) {
            const iframe = document.getElementById('yt-iframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(
                    JSON.stringify({ event: 'command', func: 'seekTo', args: [time, true] }),
                    '*'
                );
            }
        }
    } else {
        const time = (progressBar.value / 100) * audio.duration;
        if (!isNaN(time)) {
            audio.currentTime = time;
        }
    }
    setTimeout(() => {
        isSeeking = false;
    }, 150);
});

const endSeeking = () => {
    if (isSeeking) {
        setTimeout(() => {
            isSeeking = false;
        }, 150);
    }
};
document.addEventListener('mouseup', endSeeking);
document.addEventListener('touchend', endSeeking);

// YouTube iframe does not expose time data via postMessage easily with nocookie,
// so we just show indeterminate progress while a YT track is playing.
// (Standard audio tracks still have full seek/time support.)


volumeBar.addEventListener('input', () => {
    const volume = volumeBar.value / 100;
    audio.volume = volume;
    
    // Set volume on the YouTube iframe
    const iframe = document.getElementById('yt-iframe');
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'setVolume', args: [volumeBar.value] }),
            '*'
        );
    }
});
// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            playPauseBtn.click();
            break;
        case 'ArrowRight':
            if (isCurrentlyPlayingYT()) {
                const duration = ytDurationCache[currentSong.youtubeId] || 0;
                if (duration > 0) {
                    const currentTime = (progressBar.value / 100) * duration;
                    const newTime = Math.min(duration, currentTime + 5);
                    const iframe = document.getElementById('yt-iframe');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage(
                            JSON.stringify({ event: 'command', func: 'seekTo', args: [newTime, true] }),
                            '*'
                        );
                    }
                }
            } else {
                audio.currentTime += 5;
            }
            break;
        case 'ArrowLeft':
            if (isCurrentlyPlayingYT()) {
                const duration = ytDurationCache[currentSong.youtubeId] || 0;
                if (duration > 0) {
                    const currentTime = (progressBar.value / 100) * duration;
                    const newTime = Math.max(0, currentTime - 5);
                    const iframe = document.getElementById('yt-iframe');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage(
                            JSON.stringify({ event: 'command', func: 'seekTo', args: [newTime, true] }),
                            '*'
                        );
                    }
                }
            } else {
                audio.currentTime -= 5;
            }
            break;
        case 'KeyM':
            volumeBar.value = volumeBar.value == 0 ? 80 : 0;
            const targetVolume = volumeBar.value / 100;
            audio.volume = targetVolume;
            const iframe = document.getElementById('yt-iframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(
                    JSON.stringify({ event: 'command', func: 'setVolume', args: [volumeBar.value] }),
                    '*'
                );
            }
            break;
        case 'KeyN':
            playNextSong();
            break;
        case 'KeyP':
            playPreviousSong();
            break;
    }
});

// Visibility Change Handling for Background Play
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Refresh UI or sync state if needed
        console.log("App back in foreground");
    } else {
        console.log("App moved to background");
        // Most browsers will keep audio playing if MediaSession is active
    }
});

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Visualizer Logic
function initVisualizer() {
    // iOS Safari breaks background audio if AudioContext is attached to the media element
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) {
        console.warn("Visualizer disabled on iOS to preserve background audio playback.");
        return;
    }

    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    if (audioContext) return;
    // Note: Visualizer requires CORS for cross-origin audio
    if (!audio.crossOrigin && audio.src.startsWith('http') && !audio.src.includes(window.location.hostname)) {
        console.warn("Visualizer may not work for cross-origin audio without CORS");
    }
    try {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (!analyser) {
            analyser = audioContext.createAnalyser();
            source = audioContext.createMediaElementSource(audio);
            
            // Create EQ nodes (5-band)
            const frequencies = [60, 230, 910, 3600, 14000];
            eqFilters = frequencies.map((freq, index) => {
                const filter = audioContext.createBiquadFilter();
                filter.type = 'peaking';
                filter.frequency.value = freq;
                filter.Q.value = 1;
                filter.gain.value = 0;
                
                // Initialize with current slider value
                const sliderIds = ['eq-60', 'eq-230', 'eq-910', 'eq-3k', 'eq-14k'];
                const slider = document.getElementById(sliderIds[index]);
                if (slider) filter.gain.value = parseFloat(slider.value) || 0;
                
                return filter;
            });
            
            // Connect nodes: source -> eq[0] -> eq[1] ... -> analyser -> destination
            let currentNode = source;
            eqFilters.forEach(filter => {
                currentNode.connect(filter);
                currentNode = filter;
            });
            
            currentNode.connect(analyser);
            analyser.connect(audioContext.destination);
        }
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        draw();
    } catch (e) {
        console.warn("Visualizer failed to initialize:", e);
    }
}

function draw() {
    requestAnimationFrame(draw);
    canvas.width = window.innerWidth;
    canvas.height = 100;
    
    if (isCurrentlyPlayingYT() && isPlaying) {
        // Generate simulated visualizer frequency values
        if (!dataArray || dataArray.length !== 128) {
            dataArray = new Uint8Array(128);
        }
        const timeFactor = Date.now() * 0.005;
        for (let i = 0; i < dataArray.length; i++) {
            // Combine multiple sine waves for organic audio visualizer feel
            const value = Math.abs(
                Math.sin(i * 0.1 + timeFactor) * 0.4 +
                Math.cos(i * 0.05 - timeFactor * 1.5) * 0.3 +
                Math.sin(i * 0.2 + timeFactor * 2.2) * 0.3
            );
            // Add some noise/randomness
            const noise = Math.random() * 0.1;
            dataArray[i] = Math.floor((value + noise) * 160); // range 0 - 160
        }
    } else if (analyser) {
        analyser.getByteFrequencyData(dataArray);
    } else {
        // Silent/flat visualization when paused or not playing
        if (dataArray) {
            dataArray.fill(0);
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!dataArray) return;
    
    // Sync visualizer rendering dynamically with custom theme properties
    const style = getComputedStyle(document.documentElement);
    const primColor = style.getPropertyValue('--current-song-color-primary').trim() || 'rgb(255, 170, 0)';
    const secColor = style.getPropertyValue('--current-song-color-secondary').trim() || 'rgb(255, 94, 0)';
    
    const primMatch = primColor.match(/\d+/g);
    const secMatch = secColor.match(/\d+/g);
    const pr = primMatch ? primMatch[0] : 255;
    const pg = primMatch ? primMatch[1] : 170;
    const pb = primMatch ? primMatch[2] : 0;
    const sr = secMatch ? secMatch[0] : 255;
    const sg = secMatch ? secMatch[1] : 94;
    const sb = secMatch ? secMatch[2] : 0;

    const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
    gradient.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, 0.2)`);
    gradient.addColorStop(0.5, `rgba(${sr}, ${sg}, ${sb}, 0.6)`);
    gradient.addColorStop(1, `rgb(${pr}, ${pg}, ${pb})`);
    
    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let barHeight;
    let x = 0;
    for (let i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
}

// Equalizer UI Logic
const eqBtn = document.getElementById('eq-btn');
const eqModal = document.getElementById('eq-modal');
const closeEqBtn = document.getElementById('close-eq');

function showEqModalWithIosCheck() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS && eqModal) {
        const modalContent = eqModal.querySelector('.modal-content');
        if (modalContent && !modalContent.querySelector('.eq-ios-warning')) {
            const warning = document.createElement('div');
            warning.className = 'eq-ios-warning';
            warning.innerHTML = `<i data-lucide="alert-triangle"></i> <span>iOS Safari disables programmatic Web Audio API features during background playback. Standard settings will apply.</span>`;
            
            const header = modalContent.querySelector('.modal-header');
            if (header) {
                header.insertAdjacentElement('afterend', warning);
            } else {
                modalContent.insertBefore(warning, modalContent.firstChild);
            }
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }
    if (eqModal) eqModal.classList.add('show');
}

if (eqBtn && eqModal && closeEqBtn) {
    eqBtn.addEventListener('click', () => {
        showEqModalWithIosCheck();
    });
    closeEqBtn.addEventListener('click', () => {
        eqModal.classList.remove('show');
    });
    eqModal.addEventListener('click', (e) => {
        if (e.target === eqModal) {
            eqModal.classList.remove('show');
        }
    });
}

// Bind Sliders to EQ Filters
const eqSliderIds = ['eq-60', 'eq-230', 'eq-910', 'eq-3k', 'eq-14k'];
eqSliderIds.forEach((id, index) => {
    const slider = document.getElementById(id);
    if (slider) {
        slider.addEventListener('input', (e) => {
            if (eqFilters && eqFilters[index]) {
                eqFilters[index].gain.value = parseFloat(e.target.value);
            }
        });
    }
});

// User Profile Logic
const userProfileContainer = document.getElementById('user-profile-container');
const currentUserAvatar = document.getElementById('current-user-avatar');

if (userProfileContainer) {
    userProfileContainer.addEventListener('click', (e) => {
        // Toggle if clicking the avatar
        if (e.target.closest('.avatar') && e.target.id === 'current-user-avatar') {
            userProfileContainer.classList.toggle('active');
            e.stopPropagation();
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (userProfileContainer.classList.contains('active')) {
            userProfileContainer.classList.remove('active');
        }
    });

    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown) {
        userDropdown.addEventListener('click', (e) => {
            // Prevent clicks inside the dropdown from closing it immediately
            // except for specific actions which are handled separately
            if (!e.target.closest('.user-option')) {
                e.stopPropagation();
            }
        });
    }

    // Action options functionality
    document.querySelectorAll('.action-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const text = option.innerText || option.textContent;
            if (text.includes('Add New User')) {
                alert('Add New User feature is coming soon!');
            } else if (text.includes('Sign Out')) {
                alert('You have been signed out.');
                switchUser('G', 'Guest User', document.querySelectorAll('.user-option')[2]);
            }
            userProfileContainer.classList.remove('active');
            e.stopPropagation();
        });
    });
}

function switchUser(initials, name, element) {
    currentUserAvatar.innerText = initials;
    
    // Update active state in dropdown
    document.querySelectorAll('.user-option').forEach(opt => {
        opt.classList.remove('active');
    });
    
    if (element) {
        element.classList.add('active');
    }
    
    // Change the avatar background based on user
    if (initials === 'G') {
        currentUserAvatar.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
    } else if (initials === 'AB') {
        currentUserAvatar.style.background = 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)';
    } else {
        currentUserAvatar.style.background = 'var(--accent-gradient)';
    }

    // Close dropdown
    userProfileContainer.classList.remove('active');
    
    // Refresh lucide icons if needed
    lucide.createIcons();
}

// ─── JioSaavn Import Handler ─────────────────────────────────────────────────

async function handleJioSaavnImport(url) {
    if (!url) return;
    url = url.trim();

    if (!url.includes('jiosaavn.com') && !url.includes('saavn.com')) {
        alert('Please enter a valid JioSaavn song, album, or playlist link.');
        return;
    }

    const importBtn = document.getElementById('import-url-btn');
    const originalText = importBtn ? importBtn.innerText : 'Import';
    if (importBtn) {
        importBtn.innerText = 'Loading...';
        importBtn.disabled = true;
    }

    try {
        const res = await fetch(`${currentApiBase}/import?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error('API call returned status: ' + res.status);
        const result = await res.json();
        if (!result.success) throw new Error(result.message || 'Import failed');

        const input = document.getElementById('import-url-input');
        if (input) input.value = '';

        if (result.type === 'playlist' || result.type === 'album' || result.type === 'artist') {
            openDetailView(result.type, result.data.id);
            showToast(`Loading ${result.type}...`, 'info');
        } else {
            const song = result.data;
            if (song?.id) {
                playSong(song);
                updateQueue([song], song);
                showToast(`Imported: ${song.name || 'Track'}`, 'success');
            } else {
                throw new Error('Could not extract track metadata');
            }
        }
    } catch (e) {
        console.error('[Import] Failed:', e);
        alert('Failed to load content from JioSaavn. Details: ' + e.message);
    } finally {
        if (importBtn) {
            importBtn.innerText = originalText;
            importBtn.disabled = false;
        }
    }
}

async function handleSpotifyImport(url) { return handleJioSaavnImport(url); }

function initSpotifyImport() {
    const importBtn = document.getElementById('import-url-btn');
    const importInput = document.getElementById('import-url-input');

    if (importBtn && importInput) {
        importBtn.onclick = () => handleJioSaavnImport(importInput.value);
        importInput.onkeydown = (e) => {
            if (e.key === 'Enter') handleJioSaavnImport(importInput.value);
        };
    }
}

async function handleYouTubeImport(url) { return handleJioSaavnImport(url); }
function initYouTubeImport() { initSpotifyImport(); }

async function performPlaylistSearch(query) {
    const feed = document.getElementById('all-playlists-feed');
    const grid = document.getElementById('playlists-grid');

    if (!query) {
        showDiscoverPlaylistsFeed();
        return;
    }
    
    if (feed) feed.classList.add('hidden');
    if (grid) grid.classList.remove('hidden');
    
    if (!grid) return;
    
    grid.innerHTML = `<div class="loader-container"><div class="loader-spinner"></div></div>`;
    
    try {
        const response = await fetch(`${currentApiBase}/search/playlists?query=${encodeURIComponent(query)}&limit=24`);
        const result = await response.json();
        const playlists = result.data?.results || result.results || [];
        
        document.querySelectorAll('.playlist-nav-btn').forEach(b => b.classList.remove('active'));
        renderAlbumsOrPlaylists(playlists, grid, 'playlist');
    } catch (e) {
        console.error("Playlist search failed:", e);
        grid.innerHTML = `<p class="error-state">Failed to find matching playlists. Please try again.</p>`;
    }
}

function initMobileNavigation() {
    const mobHome = document.getElementById('mobile-tab-home');
    const mobPlaylists = document.getElementById('mobile-tab-playlists');
    const mobSearch = document.getElementById('mobile-tab-search');
    const mobLibrary = document.getElementById('mobile-tab-library');
    
    if (mobHome) mobHome.onclick = () => switchMobileView('home-view', 'mobile-tab-home');
    if (mobPlaylists) mobPlaylists.onclick = () => {
        switchMobileView('playlists-view', 'mobile-tab-playlists');
        showDiscoverPlaylistsFeed();
    };
    if (mobSearch) mobSearch.onclick = () => switchMobileView('search-view', 'mobile-tab-search');
    if (mobLibrary) mobLibrary.onclick = () => {
        switchMobileView('library-view', 'mobile-tab-library');
        updateLibraryUI();
    };

    // Bind playlist search bar listeners
    const playlistSearchInput = document.getElementById('playlist-search-input');
    let playlistSearchTimeout = null;
    if (playlistSearchInput) {
        playlistSearchInput.addEventListener('input', () => {
            clearTimeout(playlistSearchTimeout);
            const query = playlistSearchInput.value.trim();
            playlistSearchTimeout = setTimeout(() => {
                performPlaylistSearch(query);
            }, 400);
        });
        
        playlistSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(playlistSearchTimeout);
                performPlaylistSearch(playlistSearchInput.value.trim());
            }
        });
    }
}

function switchMobileView(viewId, mobileTabId) {
    switchView(viewId);
    document.querySelectorAll('.mobile-nav li').forEach(li => {
        li.classList.remove('active');
    });
    const activeTab = document.getElementById(mobileTabId);
    if (activeTab) activeTab.classList.add('active');
}

function initMobilePlayerToggle() {
    const playerBar = document.querySelector('.player-bar');
    const minimizeBtn = document.getElementById('minimize-mobile-player');
    const mobileEqBtn = document.getElementById('mobile-eq-btn');
    const playPauseBtnMobile = document.getElementById('play-pause-btn-mobile');
    
    if (playerBar) {
        playerBar.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && !playerBar.classList.contains('fullscreen-mobile')) {
                // Prevent toggle if clicking buttons, ranges or hearts
                if (!e.target.closest('button') && !e.target.closest('input')) {
                    playerBar.classList.add('fullscreen-mobile');
                }
            }
        });

        // iOS style swipe-down to minimize gesture
        let startY = 0;
        let currentY = 0;
        
        playerBar.addEventListener('touchstart', (e) => {
            if (playerBar.classList.contains('fullscreen-mobile')) {
                // Ignore touches on sliders or buttons
                if (!e.target.closest('button') && !e.target.closest('input') && !e.target.closest('.eq-sliders')) {
                    startY = e.touches[0].clientY;
                }
            }
        }, { passive: true });
        
        playerBar.addEventListener('touchmove', (e) => {
            if (playerBar.classList.contains('fullscreen-mobile') && startY > 0) {
                currentY = e.touches[0].clientY;
                const diffY = currentY - startY;
                if (diffY > 0) {
                    // Translate down for physics effect
                    playerBar.style.transform = `translateY(${diffY}px)`;
                    playerBar.style.transition = 'none';
                }
            }
        }, { passive: true });
        
        playerBar.addEventListener('touchend', () => {
            if (playerBar.classList.contains('fullscreen-mobile') && startY > 0) {
                const diffY = currentY - startY;
                
                playerBar.style.transform = '';
                playerBar.style.transition = '';
                
                if (diffY > 80) { // 80px threshold to minimize
                    playerBar.classList.remove('fullscreen-mobile');
                }
                
                startY = 0;
                currentY = 0;
            }
        }, { passive: true });
    }
    
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (playerBar) playerBar.classList.remove('fullscreen-mobile');
        });
    }
    
    if (mobileEqBtn) {
        mobileEqBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showEqModalWithIosCheck();
        });
    }
    
    if (playPauseBtnMobile) {
        playPauseBtnMobile.addEventListener('click', (e) => {
            e.stopPropagation();
            const playPauseBtn = document.getElementById('play-pause-btn');
            if (playPauseBtn) playPauseBtn.click();
        });
    }
}

// Playlists Discover Feed Logic

function showDiscoverPlaylistsFeed() {
    const feed = document.getElementById('all-playlists-feed');
    const grid = document.getElementById('playlists-grid');
    
    if (feed) feed.classList.remove('hidden');
    if (grid) grid.classList.add('hidden');
    
    document.querySelectorAll('.playlist-nav-btn').forEach(b => b.classList.remove('active'));
    loadAllPlaylistsFeed();
}

async function loadAllPlaylistsFeed() {
    const feed = document.getElementById('all-playlists-feed');
    if (!feed) return;
    
    if (feed.getAttribute('data-loaded') === 'true') return;
    
    feed.innerHTML = `<div class="loader-container"><div class="loader-spinner"></div></div>`;
    
    const categories = [
        { name: 'Handpicked', title: 'Handpicked Malayalam Specials', isHandpicked: true },
        { name: 'Malayalam', title: 'Trending Malayalam Playlists', query: 'Malayalam Hits' },
        { name: 'Hindi', title: 'Hindi Chartbusters', query: 'Hindi Hits' },
        { name: 'Tamil', title: 'Tamil Hits & Melodies', query: 'Tamil Hits' },
        { name: 'Telugu', title: 'Telugu Chartbusters', query: 'Telugu Hits' },
        { name: 'Punjabi', title: 'Punjabi Chartbusters', query: 'Punjabi Hits' },
        { name: 'Kannada', title: 'Kannada Melodies', query: 'Kannada Hits' },
        { name: 'English', title: 'Global Pop & English Hits', query: 'Pop Hits' },
        { name: 'Lofi', title: 'Lofi & Chillout Playlists', query: 'Indian lofi chill' },
        { name: 'Party', title: 'Party & Dance Anthems', query: 'Bollywood dance party' },
        { name: 'Devotional', title: 'Spirit & Soul (Devotional)', query: 'Malayalam devotional' }
    ];
    
    try {
        feed.innerHTML = '';
        
        for (const cat of categories) {
            const section = document.createElement('div');
            section.className = 'music-section';
            section.style.marginBottom = '32px';
            section.innerHTML = `
                <div class="section-header">
                    <h3>${cat.title}</h3>
                </div>
                <div class="horizontal-scroll" id="feed-cat-${cat.name}">
                    <div class="loader-container"><div class="loader-spinner"></div></div>
                </div>
            `;
            feed.appendChild(section);
            
            if (cat.isHandpicked) {
                loadHandpickedPlaylists();
            } else {
                fetchPlaylistSection(cat.query, `feed-cat-${cat.name}`);
            }
        }
        
        feed.setAttribute('data-loaded', 'true');
    } catch (e) {
        console.error("Failed to load all playlists feed:", e);
        feed.innerHTML = `<p class="error-state">Failed to load discover feed. Please try again.</p>`;
    }
}

async function fetchPlaylistSection(query, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    try {
        const response = await fetch(`${currentApiBase}/search/playlists?query=${encodeURIComponent(query)}&limit=10`);
        const result = await response.json();
        const playlists = result.data?.results || result.results || [];
        
        renderAlbumsOrPlaylists(playlists, container, 'playlist');
    } catch (e) {
        console.error(`Failed to fetch playlists for ${query}:`, e);
        container.innerHTML = `<p class="error-state">Failed to load playlists.</p>`;
    }
}

function renderArtists(items, container) {
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="error-state">No artists found.</p>';
        return;
    }
    
    container.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.style.borderRadius = '20px';
        card.style.textAlign = 'center';
        card.style.padding = '20px 14px';
        
        let imgUrl = 'https://via.placeholder.com/150';
        if (Array.isArray(item.image)) {
            imgUrl = item.image[2]?.url || item.image[1]?.url || item.image[0]?.url;
        } else if (typeof item.image === 'string') {
            imgUrl = item.image;
        }
        
        const name = item.name || item.title || "Artist";
        
        card.innerHTML = `
            <div class="card-img-container" style="border-radius: 50%; overflow: hidden; width: 130px; height: 130px; margin: 0 auto 12px auto; border: 2px solid var(--glass-border);">
                <img src="${imgUrl}" alt="${name}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
                <div class="play-overlay" style="border-radius: 50%;">
                    <div class="btn-play-circle">
                        <i data-lucide="user" style="fill: white; color: white;"></i>
                    </div>
                </div>
            </div>
            <div class="song-card-info" style="text-align: center;">
                <h4 style="font-size: 0.95rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">${name}</h4>
                <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0;">Artist</p>
            </div>
        `;
        
        card.addEventListener('click', () => {
            openDetailView('artist', item.id);
        });
        
        container.appendChild(card);
    });
    lucide.createIcons();
}

// ─── Handpicked Playlists Logic ──────────────────────────────────────────────

const HANDPICKED_PLAYLISTS = [
    { name: "Swami Ayyappan", query: "Ayyappa Swamy Devotional Songs Malayalam" },
    { name: "Mohanlal 90s Hits", query: "Mohanlal 90s Hits Malayalam" },
    { name: "90s Dance Hits", query: "90s dance hits malayalam songs" },
    { name: "Malayalam Superhits", query: "latest malayalam superhits top songs 2026" },
    { name: "Malayalam Love Songs", query: "Malayalam Romantic Mix" },
    { name: "Golden Oldies", query: "Malayalam Evergreen Golden Hits Yesudas" },
    { name: "Summer Hits", query: "Malayalam summer vibes" },
    { name: "Lofi Malayalam", query: "Lofi hits malayalam chill" },
    { name: "Dance Party", query: "Latest Malayalam dance numbers" }
];

async function loadHandpickedPlaylists() {
    const container = document.getElementById('feed-cat-Handpicked');
    if (!container) return;
    
    container.innerHTML = `<div class="loader-container"><div class="loader-spinner"></div></div>`;
    
    try {
        const promises = HANDPICKED_PLAYLISTS.map(async (item) => {
            try {
                const response = await fetch(`${currentApiBase}/search/playlists?query=${encodeURIComponent(item.query)}&limit=1`);
                if (response.ok) {
                    const result = await response.json();
                    const playlists = result.data?.results || result.results || [];
                    if (playlists.length > 0) {
                        return { ...playlists[0], name: item.name }; // Keep our pretty name
                    }
                }
            } catch (err) {
                console.error(`Error loading handpicked playlist: ${item.name}`, err);
            }
            return {
                id: item.query,
                name: item.name,
                image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop",
                type: 'playlist'
            };
        });
        
        const playlists = await Promise.all(promises);
        renderAlbumsOrPlaylists(playlists.filter(p => p), container, 'playlist');
    } catch (e) {
        console.error("Failed to load handpicked playlists:", e);
        container.innerHTML = `<p class="error-state">Failed to load handpicked playlists.</p>`;
    }
}

async function loadHandpickedPlaylistsHome() {
    const container = document.getElementById('handpicked-playlists');
    if (!container) return;
    
    container.innerHTML = `<div class="loader-container"><div class="loader-spinner"></div></div>`;
    
    try {
        const promises = HANDPICKED_PLAYLISTS.slice(0, 6).map(async (item) => {
            try {
                const response = await fetch(`${currentApiBase}/search/playlists?query=${encodeURIComponent(item.query)}&limit=1`);
                if (response.ok) {
                    const result = await response.json();
                    const playlists = result.data?.results || result.results || [];
                    if (playlists.length > 0) {
                        return { ...playlists[0], name: item.name };
                    }
                }
            } catch (err) {
                console.error(`Error loading handpicked playlist: ${item.name}`, err);
            }
            return {
                id: item.query,
                name: item.name,
                image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop",
                type: 'playlist'
            };
        });
        
        const playlists = await Promise.all(promises);
        renderAlbumsOrPlaylists(playlists.filter(p => p), container, 'playlist');
    } catch (e) {
        console.error("Failed to load handpicked playlists on home:", e);
        container.innerHTML = `<p class="error-state">Failed to load handpicked playlists.</p>`;
    }
}

// Speech Recognition (Voice Search) API Integration
function initVoiceSearch() {
    const voiceSearchBtn = document.getElementById('voice-search-btn');
    const searchInput = document.getElementById('search-input');
    
    if (!voiceSearchBtn) return;
    
    // Check SpeechRecognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn("SpeechRecognition API is not supported in this browser. Hiding microphone button.");
        voiceSearchBtn.style.display = 'none';
        return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN'; // Default standard locale
    recognition.interimResults = false;
    
    let isListening = false;
    
    voiceSearchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isListening) {
            recognition.stop();
        } else {
            // Touch pre-trigger standard audio (iOS workaround for audio recording context)
            if (!hasInitializedAudio) {
                audio.play().then(() => audio.pause()).catch(() => {});
                hasInitializedAudio = true;
            }
            try {
                recognition.start();
            } catch (err) {
                console.error("Speech recognition start failed:", err);
            }
        }
    });
    
    recognition.onstart = () => {
        isListening = true;
        voiceSearchBtn.classList.add('listening');
        voiceSearchBtn.title = "Listening...";
        showToast("Voice Search: Listening...", "info");
    };
    
    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        if (searchInput && transcript) {
            searchInput.value = transcript;
            showToast(`Voice Search: "${transcript}"`, "success");
            
            // Trigger suggestion dropdown close and run full search
            const dropdown = document.getElementById('search-suggestions-dropdown');
            if (dropdown) dropdown.classList.add('hidden');
            
            saveRecentSearch(transcript);
            await performSearch(transcript);
        }
    };
    
    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
            showToast("Voice search permission denied.", "error");
        } else {
            showToast("Voice search failed: " + event.error, "error");
        }
        voiceSearchBtn.classList.remove('listening');
        voiceSearchBtn.title = "Search with Voice";
        isListening = false;
    };
    
    recognition.onend = () => {
        voiceSearchBtn.classList.remove('listening');
        voiceSearchBtn.title = "Search with Voice";
        isListening = false;
    };
}
