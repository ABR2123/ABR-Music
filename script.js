// ABR Music - Script
const API_ENDPOINTS = [
    'https://saavn.vercel.app/api',
    'https://jiosaavn-api-eight-blue.vercel.app',
    'https://jiosaavn-api-beta-three.vercel.app/api',
    'https://saavn.dev/api'
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
    'malayalam trending 2026',
    'malayalam latest hits 2026',
    'malayalam 2026'
];
let heroRefreshTimer = null;

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



const MALAYALAM_JUKEBOX = [
    { id: 'xJVO1Mf0', name: 'Darshana', artists: { primary: [{ name: 'Hesham Abdul Wahab' }] }, album: { name: 'Hridayam' }, image: [{url:''},{url:''},{url:'https://c.saavncdn.com/970/Hridayam-Malayalam-2021-20211117145710-500x500.jpg'}] },
    { id: '5SboKYdp', name: 'Uyire', artists: { primary: [{ name: 'Vineeth Sreenivasan' }] }, album: { name: 'Minnal Murali' }, image: [{url:''},{url:''},{url:'https://c.saavncdn.com/152/Minnal-Murali-Malayalam-2021-20211124194035-500x500.jpg'}] },
    { id: 'SA-3G3fh', name: 'Thallumaala Paattu', artists: { primary: [{ name: 'Hrithik Jayakish' }] }, album: { name: 'Thallumaala' }, image: [{url:''},{url:''},{url:'https://c.saavncdn.com/393/Thallumaala-Malayalam-2022-20220812161314-500x500.jpg'}] },
    { id: 'JWg0ED0Q', name: 'Malare', artists: { primary: [{ name: 'Vijay Yesudas' }] }, album: { name: 'Premam' }, image: [{url:''},{url:''},{url:'https://c.saavncdn.com/159/Premam-Malayalam-2015-500x500.jpg'}] },
    { id: '5lKRGwCu', name: 'Pavizha Mazha', artists: { primary: [{ name: 'K.S. Harisankar' }] }, album: { name: 'Athiran' }, image: [{url:''},{url:''},{url:'https://c.saavncdn.com/102/Athiran-Malayalam-2019-20190401140026-500x500.jpg'}] },
    { id: 'wBgCQQ_6', name: 'Illuminati', artists: { primary: [{ name: 'Sushin Shyam' }] }, album: { name: 'Aavesham' }, image: [{url:''},{url:''},{url:'https://c.saavncdn.com/624/Aavesham-Malayalam-2024-20240409161005-500x500.jpg'}] },
    { id: 'AA6FzsBW', name: 'Mini Maharani', artists: { primary: [{ name: 'Kapil Kapilan' }] }, album: { name: 'Premalu' }, image: [{url:''},{url:''},{url:'https://c.saavncdn.com/267/Premalu-Malayalam-2024-20240209121010-500x500.jpg'}] }
];

const AYYAPPA_JUKEBOX = [
    { id: 'Pu1HqVuP', name: 'Akhilanda Brahmathin', artists: { primary: [{ name: 'K.J. Yesudas' }] }, album: { name: 'Ayyappa Devotional Songs' }, image: [{url:''},{url:''},{url:'https://c.saavncdn.com/727/Ayyappa-Devotional-Songs-Malayalam-Vol-6-Malayalam-2021-20211117200404-500x500.jpg'}] },
    { id: 'RJQz8nwe', name: 'Kananavasa', artists: { primary: [{ name: 'K.J. Yesudas' }] }, album: { name: 'Ayyappa Devotional Songs' }, image: [{url:''},{url:''},{url:'https://c.saavncdn.com/727/Ayyappa-Devotional-Songs-Malayalam-Vol-6-Malayalam-2021-20211117200404-500x500.jpg'}] },
    { id: '0iONQOhb', name: 'Aanayirangum Mamalayil', artists: { primary: [{ name: 'K.J. Yesudas' }] }, album: { name: 'Ayyappa Devotional Songs' }, image: [{url:''},{url:''},{url:'https://c.saavncdn.com/727/Ayyappa-Devotional-Songs-Malayalam-Vol-6-Malayalam-2021-20211117200404-500x500.jpg'}] },
    { id: 'B-EJT73C', name: 'Ayyane Kaanan Swami', artists: { primary: [{ name: 'K.J. Yesudas' }] }, album: { name: 'Ayyappa Devotional Songs' }, image: [{url:''},{url:''},{url:'https://c.saavncdn.com/221/Ayyappa-Devotional-Songs-Malayalam-Vol-2-Malayalam-2021-20211117200706-500x500.jpg'}] },
    { id: 'G7_iKAJa', name: 'Swami Sangeethamalapikkum', artists: { primary: [{ name: 'K.J. Yesudas' }] }, album: { name: 'Ayyappa Devotional Songs' }, image: [{url:''},{url:''},{url:'https://c.saavncdn.com/221/Ayyappa-Devotional-Songs-Malayalam-Vol-2-Malayalam-2021-20211117200706-500x500.jpg'}] },
    { id: 'IDqQTDLV', name: 'Vrischika Pularvela', artists: { primary: [{ name: 'K.J. Yesudas' }] }, album: { name: 'Ayyappa Devotional Songs' }, image: [{url:''},{url:''},{url:'https://c.saavncdn.com/727/Ayyappa-Devotional-Songs-Malayalam-Vol-6-Malayalam-2021-20211117200404-500x500.jpg'}] },
    { id: 'Uv7hG00E', name: 'Makarasankrama Deepam', artists: { primary: [{ name: 'K.J. Yesudas' }] }, album: { name: 'Ayyappa Devotional Songs' }, image: [{url:''},{url:''},{url:'https://c.saavncdn.com/221/Ayyappa-Devotional-Songs-Malayalam-Vol-2-Malayalam-2021-20211117200706-500x500.jpg'}] },
    { id: 'jUkVO3Zg', name: 'Pampa Ganapathy', artists: { primary: [{ name: 'M.G. Sreekumar' }] }, album: { name: 'Swami Ayyappan' }, image: [{url:''},{url:''},{url:'https://c.saavncdn.com/234/Swami-Ayyappan-51-Superhit-Ayyappan-Devotional-Songs-of-M-G-Sreekumar-Malayalam-2025-20251104191149-500x500.jpg'}] }
];



// ─── YouTube Direct Iframe Player ─────────────────────────────────────────────
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
        descEl.innerText = "Could not fetch details from Saavn API. Please try again.";
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
        if (query.includes('saavn.com') || query.includes('saavn.dev')) {
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
        const response = await fetch(`${currentApiBase}/search?query=${encodeURIComponent(query)}`);
        const result = await response.json();
        
        if (result && result.success && result.data) {
            const results = result.data;
            const songsList = results.songs?.results || [];
            const albumsList = results.albums?.results || [];
            
            if (songsList.length === 0 && albumsList.length === 0) {
                // Try local fallback
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
        const query = "Featured Hits";
        let playlists = playlistsCache[query];
        
        if (!playlists) {
            const response = await fetch(`${currentApiBase}/search/playlists?query=${encodeURIComponent(query)}&limit=10`);
            const result = await response.json();
            playlists = result.data?.results || result.results || [];
            playlistsCache[query] = playlists;
        }
        
        renderAlbumsOrPlaylists(playlists, container, 'playlist');
    } catch (e) {
        console.error("Failed to load featured playlists:", e);
        container.innerHTML = '<p class="error-state">Failed to load featured playlists.</p>';
    }
}

// Initial Load
window.addEventListener('DOMContentLoaded', () => {
    // Restore Shuffle & Repeat settings
    isShuffle = localStorage.getItem('player_shuffle') === 'true';
    if (shuffleBtn) {
        shuffleBtn.classList.toggle('active', isShuffle);
        shuffleBtn.title = `Shuffle: ${isShuffle ? 'ON' : 'OFF'}`;
    }
    
    isRepeat = localStorage.getItem('player_repeat') || 'all';
    if (repeatBtn) {
        if (isRepeat === 'all') {
            repeatBtn.classList.add('active');
            repeatBtn.title = 'Repeat: ALL';
        } else if (isRepeat === 'one') {
            repeatBtn.classList.add('active');
            repeatBtn.title = 'Repeat: ONE';
            const icon = repeatBtn.querySelector('i');
            if (icon) icon.setAttribute('data-lucide', 'repeat-1');
        } else {
            repeatBtn.classList.remove('active');
            repeatBtn.title = 'Repeat: OFF';
        }
    }
    
    // Initialize Navigation & UI Bindings synchronously
    initNavigation();
    initMobileNavigation();
    initMobilePlayerToggle();
    initVoiceSearch();
    initJioSaavnImport();
    
    // Render local Jukebox & Ayyappa datasets immediately (no network block)
    renderSongs(MALAYALAM_JUKEBOX, document.getElementById('malayalam-jukebox'));
    renderSongs(AYYAPPA_JUKEBOX, document.getElementById('ayyappa-songs'));
    
    // Initialize hero banner click handler and queue immediately on load (pre-load fallback)
    currentHeroSongs = MALAYALAM_JUKEBOX;
    updateHero(MALAYALAM_JUKEBOX[0], MALAYALAM_JUKEBOX);
    restoreHeroFromStorage();
    
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // Check working API mirror in background, then load remote datasets
    findWorkingApi().then(() => {
        // Load Jukebox CDN stream URLs in background
        preloadJukeboxDetails();
        
        // Load Featured Playlists on home page
        loadFeaturedPlaylists();
        
        // Load Handpicked Playlists on home page
        loadHandpickedPlaylistsHome();
        
        // Set up lazy-loading for screen categories
        initLazyLoading();

        // Load & auto-refresh trending Malayalam hero banner
        initMalayalamHeroBanner();
        
        // Inject and observe all dynamic footer categories
        addMoreSections();
    });
});

async function findWorkingApi() {
    console.log("Probing API mirror servers in parallel...");
    try {
        const checks = API_ENDPOINTS.map(async (api) => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);
                const res = await fetch(`${api}/search/songs?query=latest&limit=1`, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (res.ok) {
                    return { api, ok: true };
                }
            } catch (e) {}
            return { api, ok: false };
        });
        
        const results = await Promise.all(checks);
        const working = results.find(r => r.ok);
        if (working) {
            currentApiBase = working.api;
            console.log("Using API:", currentApiBase);
            return;
        }
    } catch (e) {
        console.warn("Parallel API check failed:", e);
    }
    currentApiBase = 'https://jiosaavn-api-eight-blue.vercel.app';
    console.log("Fallback API selected:", currentApiBase);
}

async function preloadJukeboxDetails() {
    try {
        console.log("Preloading Jukebox details in background...");
        const allLocalSongs = [...MALAYALAM_JUKEBOX, ...AYYAPPA_JUKEBOX];
        const ids = allLocalSongs.map(s => s.id).join(',');
        const res = await fetch(`${currentApiBase}/songs?ids=${ids}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        
        let songsList = [];
        if (data && data.success && data.data) {
            songsList = data.data;
        } else if (data && data.data) {
            songsList = data.data;
        } else if (Array.isArray(data)) {
            songsList = data;
        }
        
        if (Array.isArray(songsList)) {
            songsList.forEach(fullSong => {
                const jukeboxSong = allLocalSongs.find(s => s.id === fullSong.id);
                if (jukeboxSong) {
                    jukeboxSong.downloadUrl = fullSong.downloadUrl;
                    if (fullSong.image) jukeboxSong.image = fullSong.image;
                }
            });
            console.log("Preloaded Jukebox details successfully.");
        }
    } catch (e) {
        console.warn("Failed to preload Jukebox details:", e);
    }
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

function renderTrendingData(results, query, container, append) {
    renderSongs(results, container, append);
    if (query.toLowerCase().includes('malayalam trending') || query.toLowerCase().includes('malayalam latest') || query.toLowerCase().includes('malayalam 2026')) {
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
    return [...results].sort((a, b) => {
        const yearA = a?.year ? parseInt(a.year) : 0;
        const yearB = b?.year ? parseInt(b.year) : 0;
        return (isNaN(yearB) ? 0 : yearB) - (isNaN(yearA) ? 0 : yearA);
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
            updateHero(saved.song, saved.songs, { skipFlash: true });
        }
    } catch (e) {}
}

function applyHeroTrending(song, songsList) {
    if (!song) return;
    const prevId = currentHeroSong?.id;
    updateHero(song, songsList, { skipFlash: prevId === song.id });
    saveHeroToStorage(song, songsList);

    const malContainer = document.getElementById('malayalam-songs');
    if (malContainer && !malContainer.getAttribute('data-loaded')) {
        renderSongs(songsList, malContainer);
        malContainer.setAttribute('data-loaded', 'true');
    }
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
        
        const youtubeId = song.youtubeId || '';

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
            ${youtubeId ? `<button class="open-yt" data-id="${youtubeId}" title="Open on YouTube"><i data-lucide="external-link"></i></button>` : ''}
        `;
        
        // Preload song URL on pointerdown for iOS compatibility
        card.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.open-yt')) return;
            preloadSongUrl(song);
        });

        // Main play on card click
        card.addEventListener('click', (e) => {
            // Prevent click when clicking the Open YouTube button
            if (e.target.closest('.open-yt')) return;
            playSong(song);
            updateQueue(songs, song);
            document.querySelectorAll('.song-card').forEach(c => c.classList.remove('playing'));
            card.classList.add('playing');
        });
        // Open YouTube in new tab
        const openBtn = card.querySelector('.open-yt');
        if (openBtn) {
            openBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const vid = openBtn.getAttribute('data-id');
                window.open(`https://www.youtube.com/watch?v=${vid}`, '_blank');
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
    // Handle YouTube Playback — play via hidden YouTube iframe
    if (song.youtubeId) {
        // Pause standard audio
        audio.pause();
        audio.src = '';
        
        // Make sure the visualizer is active
        initVisualizer();
        
        // Show the mini player
        const miniPlayer = document.getElementById('yt-mini-player');
        if (miniPlayer) miniPlayer.classList.remove('hidden');
        
        // Inject the iframe directly
        loadYouTubeIframe(song.youtubeId);

        // Update UI details
        updateUI(song);
        
        isPlaying = true;
        updatePlayPauseIcon(true);
        return;
    }

    // Handle Standard Audio Playback
    if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
    const miniPlayer = document.getElementById('yt-mini-player');
    if (miniPlayer) miniPlayer.classList.add('hidden');
    
    // Enable EQ for standard tracks
    if (eqBtn) {
        eqBtn.style.opacity = '1';
        eqBtn.title = 'Equalizer';
        eqBtn.style.pointerEvents = 'auto';
    }
    
    // Auto-fetch details if missing downloadUrl
    if (!song.downloadUrl && !song.youtubeId) {
        // Keep iOS/Android audio session alive by playing silence synchronously inside user event
        try {
            audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
            audio.play().catch(() => {});
        } catch (e) {}

        try {
            console.log("Fetching missing song details for:", song.id);
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
                // Update properties in case they were placeholders
                if (fullSong.image) song.image = fullSong.image;
            }
        } catch (e) {
            console.error("Failed to auto-fetch details:", e);
        }
    }

    let downloadUrl = '';
    if (Array.isArray(song.downloadUrl)) {
        // Prefer 320kbps (index 4) or 160kbps (index 3)
        downloadUrl = song.downloadUrl[4]?.url || song.downloadUrl[3]?.url || song.downloadUrl[2]?.url || song.downloadUrl[0]?.url;
    } else if (song.downloadUrl) {
        downloadUrl = song.downloadUrl;
    }
    
    if (!downloadUrl) {
        console.error("No download URL found for song:", song);
        showToast("Sorry, this track is currently unavailable.", "error");
        return;
    }

    // Resolve relative URLs to absolute ones based on the current page location
    // This fixes pathing issues on GitHub Pages, especially when accessed without a trailing slash
    if (!downloadUrl.startsWith('http') && !downloadUrl.startsWith('data:')) {
        let path = window.location.pathname;
        // If the path doesn't end with a slash and doesn't look like a file (no dot), add a slash
        if (!path.endsWith('/') && !path.split('/').pop().includes('.')) {
            path += '/';
        }
        const base = window.location.origin + path;
        downloadUrl = new URL(downloadUrl, base).href;
        console.log("Resolved local path:", downloadUrl);
    }

    try {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        if (isIOS) {
            // iOS/Safari: Change src and play directly WITHOUT pausing or loading, to preserve gesture activation token.
            audio.src = downloadUrl;
        } else {
            // Standard Desktop/Android reset
            audio.pause();
            
            // Handle CORS for visualizer
            if (downloadUrl.startsWith('http')) {
                audio.crossOrigin = "anonymous";
            } else {
                audio.removeAttribute('crossOrigin');
            }
            
            audio.src = downloadUrl;
            audio.load(); // Explicitly call load
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
        const isCurrentHeroSongPlaying = currentSong && currentHeroSongs && currentHeroSongs.some(s => s.id === currentSong.id) && playing;
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

// ─── JioSaavn Import & Mobile Compatibility Modules ─────────────────────────

async function handleJioSaavnImport(url) {
    if (!url) return;
    url = url.trim();
    
    if (!url.includes('saavn.com') && !url.includes('saavn.dev')) {
        alert("Please enter a valid JioSaavn link!");
        return;
    }
    
    let type = 'song';
    if (url.includes('/album/')) {
        type = 'album';
    } else if (url.includes('/featured/') || url.includes('/playlist/')) {
        type = 'playlist';
    }
    
    console.log(`[Import] Attempting to load JioSaavn ${type} from link:`, url);
    const importBtn = document.getElementById('import-url-btn');
    const originalText = importBtn ? importBtn.innerText : 'Import';
    if (importBtn) {
        importBtn.innerText = 'Loading...';
        importBtn.disabled = true;
    }
    
    try {
        if (type === 'song') {
            const res = await fetch(`${currentApiBase}/songs?link=${encodeURIComponent(url)}`);
            if (!res.ok) throw new Error("API call returned status: " + res.status);
            const result = await res.json();
            
            let song = null;
            if (result && result.success && result.data) {
                song = result.data[0] || result.data;
            } else if (result && result.data) {
                song = result.data[0] || result.data;
            } else if (Array.isArray(result)) {
                song = result[0];
            } else if (result) {
                song = result;
            }
            
            if (song && song.id) {
                playSong(song);
                updateQueue([song], song);
                const input = document.getElementById('import-url-input');
                if (input) input.value = '';
            } else {
                throw new Error("Could not extract song metadata");
            }
        } else {
            // Album or Playlist
            openDetailView(type, url);
            const input = document.getElementById('import-url-input');
            if (input) input.value = '';
        }
    } catch (e) {
        console.error("[Import] Failed:", e);
        alert("Failed to load content from JioSaavn. The API mirror may be overloaded. Details: " + e.message);
    } finally {
        if (importBtn) {
            importBtn.innerText = originalText;
            importBtn.disabled = false;
        }
    }
}

function initJioSaavnImport() {
    const importBtn = document.getElementById('import-url-btn');
    const importInput = document.getElementById('import-url-input');
    
    if (importBtn && importInput) {
        importBtn.onclick = () => {
            handleJioSaavnImport(importInput.value);
        };
        importInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                handleJioSaavnImport(importInput.value);
            }
        };
    }
}

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
    { name: "Swami Ayyappan", link: "https://www.jiosaavn.com/featured/swami-ayyappan-malayalam/KQ7kT9AqvsQ_" },
    { name: "Mohanlal 90s Hits", link: "https://www.jiosaavn.com/featured/mohanlal-90s-hits-malayalam/HFkafOq5BXjuCJW60TJk1Q__" },
    { name: "90s Dance Hits", link: "https://www.jiosaavn.com/featured/90s-dance-hits-malayalam/GjTlSVfKUZswkg5tVhI3fw__" },
    { name: "Malayalam Superhits Top 50", link: "https://www.jiosaavn.com/featured/malayalam-india-superhits-top-50/1e3vU4q7bbbExeh5N5JWFg__" },
    { name: "Most Streamed Love Songs", link: "https://www.jiosaavn.com/featured/most-streamed-love-songs-malayalam/1rJj5k7kKDipJ,OEBt5Zbg__" },
    { name: "Malayalam Golden Oldies", link: "https://www.jiosaavn.com/featured/malayalam-golden-oldies/tVj-faHettfc1EngHtQQ2g__" },
    { name: "Best of Romance Malayalam", link: "https://www.jiosaavn.com/featured/best-of-romance-malayalam/CBJDUkJa-c-c1EngHtQQ2g__" },
    { name: "Monsoon Masala Malayalam", link: "https://www.jiosaavn.com/featured/monsoon-masala-malayalam/g24AvLD08ys_" },
    { name: "Malayalam Drive Reprise", link: "https://www.jiosaavn.com/featured/malayalam-drive-reprise/pQavzHBrZcfufxkxMEIbIw__" },
    { name: "90s Chill Hits Malayalam", link: "https://www.jiosaavn.com/featured/90s-chill-hits-malayalam/VthPY7bJefZFo9wdEAzFBA__" },
    { name: "Lofi Hits Malayalam", link: "https://www.jiosaavn.com/featured/lofi-hits-malayalam/7xKCz4VSUL,Tb7czG7lKZg__" },
    { name: "Best of 2010s Malayalam", link: "https://www.jiosaavn.com/featured/best-of-2010s-malayalam/R598lCB1ZTuO0eMLZZxqsA__" },
    { name: "Let's Play Manikandan Ayyappa", link: "https://www.jiosaavn.com/featured/lets-play-manikandan-ayyappa-malayalam/fvCT55HTFg82DowkhAtzrw__" }
];

async function loadHandpickedPlaylists() {
    const container = document.getElementById('feed-cat-Handpicked');
    if (!container) return;
    
    container.innerHTML = `<div class="loader-container"><div class="loader-spinner"></div></div>`;
    
    try {
        const promises = HANDPICKED_PLAYLISTS.map(async (item) => {
            try {
                const response = await fetch(`${currentApiBase}/playlists?link=${encodeURIComponent(item.link)}`);
                if (response.ok) {
                    const result = await response.json();
                    return result.data || result;
                }
            } catch (err) {
                console.error(`Error loading handpicked playlist: ${item.name}`, err);
            }
            return {
                id: item.link,
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
        const promises = HANDPICKED_PLAYLISTS.map(async (item) => {
            try {
                const response = await fetch(`${currentApiBase}/playlists?link=${encodeURIComponent(item.link)}`);
                if (response.ok) {
                    const result = await response.json();
                    return result.data || result;
                }
            } catch (err) {
                console.error(`Error loading handpicked playlist: ${item.name}`, err);
            }
            return {
                id: item.link,
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
