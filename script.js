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
let audioContext, analyser, dataArray, source;
let eqFilters = [];
let hasInitializedAudio = false; // Flag for iOS first interaction
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

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
            loadCategoryPlaylists('Malayalam');
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
                alert("Your library is empty. Like some songs first!");
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
                alert("No songs in this album/playlist to play!");
            }
        });
    }
}

// --- Library & Likes Module ---
function toggleLikeSong(song) {
    if (!song) return;
    const index = likedSongs.findIndex(s => s.id === song.id);
    if (index > -1) {
        likedSongs.splice(index, 1);
    } else {
        likedSongs.push(song);
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

// --- Detail View Module ---
async function openDetailView(type, id) {
    switchView('detail-view');
    
    const coverArt = document.getElementById('detail-cover-art');
    const titleEl = document.getElementById('detail-title');
    const descEl = document.getElementById('detail-description');
    const typeBadge = document.getElementById('detail-type-badge');
    const metaEl = document.getElementById('detail-meta-info');
    const tracksList = document.getElementById('detail-tracks-list');
    
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
        const response = await fetch(`${currentApiBase}/${type}s?id=${id}`);
        const result = await response.json();
        
        if (result && result.success && result.data) {
            const data = result.data;
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
    if (index > -1) {
        likedAlbums.splice(index, 1);
    } else {
        likedAlbums.push(albumData);
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

// --- Search & Categories Module ---
async function performSearch(query) {
    if (!query) return;
    
    // Switch to search view and show results container
    switchView('search-view');
    const categoriesContainer = document.querySelector('.browse-categories-container');
    const resultsWrapper = document.getElementById('search-results-wrapper');
    if (categoriesContainer) categoriesContainer.classList.add('hidden');
    if (resultsWrapper) resultsWrapper.classList.remove('hidden');
    
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
    
    try {
        const response = await fetch(`${currentApiBase}/search?query=${encodeURIComponent(query)}`);
        const result = await response.json();
        
        if (result && result.success && result.data) {
            const results = result.data;
            
            // Render Songs
            const songs = results.songs?.results || [];
            renderSongs(songs, document.getElementById('search-results-songs'));
            
            // Render Albums
            const albums = results.albums?.results || [];
            renderAlbumsOrPlaylists(albums, document.getElementById('search-results-albums'), 'album');
            
            // Render Playlists
            const playlists = results.playlists?.results || [];
            renderAlbumsOrPlaylists(playlists, document.getElementById('search-results-playlists'), 'playlist');
        } else {
            throw new Error("Invalid API response format");
        }
    } catch (e) {
        console.error("Global search failed:", e);
        // Fallback: search just songs
        document.getElementById('search-results-songs').innerHTML = `
            <div class="error-state"><p>Failed to load songs.</p></div>
        `;
        document.getElementById('search-results-albums').innerHTML = `
            <div class="error-state"><p>Failed to load albums.</p></div>
        `;
        document.getElementById('search-results-playlists').innerHTML = `
            <div class="error-state"><p>Failed to load playlists.</p></div>
        `;
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
    
    const grid = document.getElementById('playlists-grid');
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
window.addEventListener('DOMContentLoaded', async () => {
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
    lucide.createIcons();

    // Initialize Navigation & UI Bindings
    initNavigation();
    
    // Probes API mirrors concurrently
    await findWorkingApi();
    
    // Render Jukebox immediately from local dataset
    renderSongs(MALAYALAM_JUKEBOX, document.getElementById('malayalam-jukebox'));
    
    // Render Ayyappa Songs immediately from local dataset
    renderSongs(AYYAPPA_JUKEBOX, document.getElementById('ayyappa-songs'));
    
    // Load Jukebox CDN stream URLs in background
    preloadJukeboxDetails();
    
    // Load Featured Playlists on home page
    loadFeaturedPlaylists();
    
    // Set up lazy-loading for screen categories
    initLazyLoading();
    
    // Inject and observe all dynamic footer categories
    addMoreSections();
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

// Fetch Trending Songs with Retry
async function fetchTrending(query, container, append = false) {
    try {
        const response = await fetch(`${currentApiBase}/search/songs?query=${encodeURIComponent(query)}&limit=50`);
        const data = await response.json();
        
        // Handle different API formats (some wrap results in 'data', some don't)
        let results = [];
        if (data?.data?.results && Array.isArray(data.data.results)) {
            results = data.data.results;
        } else if (data?.data && Array.isArray(data.data)) {
            results = data.data;
        } else if (data?.results && Array.isArray(data.results)) {
            results = data.results;
        } else if (data?.success && data?.data?.results) {
            results = data.data.results;
        }
        
        if (results && results.length > 0) {
            console.log(`Found ${results.length} results for: ${query}`);
            // Sort by year to ensure the newest songs are at the top (with safety checks)
            results.sort((a, b) => {
                const yearA = a && a.year ? parseInt(a.year) : 0;
                const yearB = b && b.year ? parseInt(b.year) : 0;
                return (isNaN(yearB) ? 0 : yearB) - (isNaN(yearA) ? 0 : yearA);
            });
            
            renderSongs(results, container, append);
            if (query.toLowerCase().includes('malayalam trending') || query.toLowerCase().includes('malayalam latest') || query.toLowerCase().includes('malayalam 2026')) updateHero(results[0], results);
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

function updateHero(song, songsList = null) {
    if (!song) return;
    if (songsList) {
        currentHeroSongs = songsList;
    }
    const heroTitle = document.querySelector('.hero h1');
    const heroPara = document.querySelector('.hero p');
    const heroSection = document.getElementById('hero');
    
    heroTitle.innerText = song.name;
    
    let artistName = "";
    if (song.artists && song.artists.primary && song.artists.primary[0]) {
        artistName = song.artists.primary[0].name;
    } else if (song.artists && typeof song.artists === 'string') {
        artistName = song.artists;
    } else if (song.artists && Array.isArray(song.artists)) {
        artistName = song.artists.map(a => a.name).join(', ');
    } else {
        artistName = "Unknown Artist";
    }
    
    if (currentSong && song.id === currentSong.id) {
        heroPara.innerText = artistName;
    } else {
        heroPara.innerText = `Featured Release • ${artistName}`;
    }
    
    let imgUrl = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop';
    if (Array.isArray(song.image)) {
        imgUrl = song.image[2]?.url || song.image[1]?.url || song.image[0]?.url;
    }
    
    heroSection.style.backgroundImage = `url(${imgUrl})`;
    
    // Make the title clickable to search for more from this category
    heroTitle.style.cursor = 'pointer';
    heroTitle.onclick = () => searchByLang('Malayalam');
    
    const heroBadge = document.querySelector('.hero .badge');
    if (heroBadge) {
        heroBadge.innerText = (currentSong && song.id === currentSong.id && isPlaying) ? "Now Playing" : "Featured";
    }
    
    const heroPlayBtn = document.getElementById('hero-play');
    if (heroPlayBtn) {
        if (currentSong && song.id === currentSong.id && isPlaying) {
            heroPlayBtn.innerHTML = `<i data-lucide="pause"></i> Pause`;
        } else {
            heroPlayBtn.innerHTML = `<i data-lucide="play"></i> Play Now`;
        }
    }
    
    document.getElementById('hero-play').onclick = (e) => {
        e.stopPropagation();
        if (currentSong && song.id === currentSong.id) {
            playPauseBtn.click();
        } else {
            playSong(song);
            if (currentHeroSongs && currentHeroSongs.length > 0) {
                updateQueue(currentHeroSongs, song);
                updateTracksPlayingStates();
            }
        }
    };
    
    lucide.createIcons();
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

// Search Functionality
let searchTimeout = null;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const query = searchInput.value.trim();
    if (query) {
        searchTimeout = setTimeout(async () => {
            await performSearch(query);
        }, 350); // 350ms debounce
    } else {
        // Restore browse categories, hide results
        const categoriesContainer = document.querySelector('.browse-categories-container');
        const resultsWrapper = document.getElementById('search-results-wrapper');
        if (categoriesContainer) categoriesContainer.classList.remove('hidden');
        if (resultsWrapper) resultsWrapper.classList.add('hidden');
    }
});

searchInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        clearTimeout(searchTimeout);
        const query = searchInput.value.trim();
        if (query) {
            await performSearch(query);
        }
    }
});

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
        try {
            console.log("Fetching missing song details for:", song.id);
            const res = await fetch(`${currentApiBase}/songs?ids=${song.id}`);
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
        alert("Sorry, this track is currently unavailable from our main server.");
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
        // Reset audio state
        audio.pause();
        
        // Handle CORS for visualizer
        // Local files (relative paths) don't need crossOrigin=anonymous and it can sometimes cause issues on GitHub Pages
        // External URLs (starting with http) DO need it for the visualizer to work
        if (downloadUrl.startsWith('http')) {
            audio.crossOrigin = "anonymous";
        } else {
            audio.removeAttribute('crossOrigin');
        }
        
        audio.src = downloadUrl;
        audio.load(); // Explicitly call load
        
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
                
                // Fallback: Try without CORS if it was enabled
                if (audio.crossOrigin) {
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

    // Visual feedback for error
    const errorMsg = `Failed to play: ${currentSong?.name || 'Unknown'}. This usually happens if the file is missing on GitHub or the server is blocked.`;
    console.warn(errorMsg);
    
    // Check if it's a local file and provide specific advice
    if (url.includes(window.location.hostname) && url.includes('/audio/')) {
        console.error("DEBUG: Local file not found. Please ensure the 'audio' folder and its contents were pushed to GitHub.");
    }

    if (currentIndex === 0 || currentIndex === -1) {
        alert(errorMsg + " Trying next song...");
    }
    setTimeout(() => {
        playNextSong();
    }, 2000);
}

function updatePlayPauseIcon(playing) {
    playPauseBtn.innerHTML = playing ? '<i data-lucide="pause"></i>' : '<i data-lucide="play"></i>';
    
    // Sync Hero section play button and badge if it displays the current song
    const heroTitle = document.querySelector('.hero h1');
    const heroPlayBtn = document.getElementById('hero-play');
    if (heroTitle && heroPlayBtn && currentSong) {
        if (heroTitle.innerText.trim() === currentSong.name.trim()) {
            heroPlayBtn.innerHTML = playing ? `<i data-lucide="pause"></i> Pause` : `<i data-lucide="play"></i> Play Now`;
            const heroBadge = document.querySelector('.hero .badge');
            if (heroBadge) {
                heroBadge.innerText = playing ? "Now Playing" : "Featured";
            }
        }
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
    
    // Premium gradient styling (Amber/Gold/Sunfire) matching the app design system
    const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
    gradient.addColorStop(0, 'rgba(255, 170, 0, 0.2)'); // Amber transparent
    gradient.addColorStop(0.5, 'rgba(255, 94, 0, 0.6)'); // Sunfire Orange medium
    gradient.addColorStop(1, 'rgba(255, 170, 0, 1)'); // Solid gold top
    
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

if (eqBtn && eqModal && closeEqBtn) {
    eqBtn.addEventListener('click', () => {
        eqModal.classList.add('show');
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
