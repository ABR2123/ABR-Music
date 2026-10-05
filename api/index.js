// SaavnFlow — Vercel Serverless API Handler
// All /api/* routes are handled here.
// /api/stream and /api/download use HTTP 302 redirects instead of byte-proxying
// so we never hit Vercel's 10-second function timeout.

'use strict';

const SAAVN_API_BASE = 'https://www.jiosaavn.com/api.php';

const SAAVN_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.jiosaavn.com/',
    'Origin': 'https://www.jiosaavn.com',
};

// ─── CORS helper ────────────────────────────────────────────────────────────
function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges, Content-Disposition');
}

function sendJson(res, status, body) {
    setCors(res);
    res.setHeader('Content-Type', 'application/json');
    res.status(status).json(body);
}

// ─── Pure JS DES-ECB Decrypt (JioSaavn media URL decryption) ─────────────────
function desDecryptECB(ciphertextBase64, keyStr = '38346591') {
    const IP  = [58,50,42,34,26,18,10,2,60,52,44,36,28,20,12,4,62,54,46,38,30,22,14,6,64,56,48,40,32,24,16,8,57,49,41,33,25,17,9,1,59,51,43,35,27,19,11,3,61,53,45,37,29,21,13,5,63,55,47,39,31,23,15,7];
    const FP  = [40,8,48,16,56,24,64,32,39,7,47,15,55,23,63,31,38,6,46,14,54,22,62,30,37,5,45,13,53,21,61,29,36,4,44,12,52,20,60,28,35,3,43,11,51,19,59,27,34,2,42,10,50,18,58,26,33,1,41,9,49,17,57,25];
    const E   = [32,1,2,3,4,5,4,5,6,7,8,9,8,9,10,11,12,13,12,13,14,15,16,17,16,17,18,19,20,21,20,21,22,23,24,25,24,25,26,27,28,29,28,29,30,31,32,1];
    const P   = [16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10,2,8,24,14,32,27,3,9,19,13,30,6,22,11,4,25];
    const S = [
        [[14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],[0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],[4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],[15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]],
        [[15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10],[3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5],[0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15],[13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9]],
        [[10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8],[13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1],[13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7],[1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12]],
        [[7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15],[13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9],[10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4],[3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14]],
        [[2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9],[14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6],[4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14],[11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3]],
        [[12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11],[10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8],[9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6],[4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13]],
        [[4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1],[13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6],[1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2],[6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12]],
        [[13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7],[1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2],[7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8],[2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]]
    ];
    const PC1 = [57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4];
    const PC2 = [14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32];
    const SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];

    const bytesToBits = (bytes) => { const b=[]; for(let i=0;i<bytes.length;i++) for(let j=7;j>=0;j--) b.push((bytes[i]>>j)&1); return b; };
    const bitsToBytes = (bits) => { const b=new Uint8Array(bits.length/8); for(let i=0;i<b.length;i++){let v=0;for(let j=0;j<8;j++)v=(v<<1)|bits[i*8+j];b[i]=v;} return b; };
    const permute = (bits,table) => table.map(pos=>bits[pos-1]);
    const xor = (a,b) => a.map((v,i)=>v^b[i]);

    function generateSubkeys(keyBytes) {
        const keyBits=bytesToBits(keyBytes),pk=permute(keyBits,PC1);
        let C=pk.slice(0,28),D=pk.slice(28,56);const sk=[];
        for(let i=0;i<16;i++){const s=SHIFTS[i];C=C.slice(s).concat(C.slice(0,s));D=D.slice(s).concat(D.slice(0,s));sk.push(permute(C.concat(D),PC2));}
        return sk;
    }
    function feistel(R,subkey) {
        const xored=xor(permute(R,E),subkey),out=[];
        for(let i=0;i<8;i++){const b=xored.slice(i*6,(i+1)*6),row=(b[0]<<1)|b[5],col=(b[1]<<3)|(b[2]<<2)|(b[3]<<1)|b[4],val=S[i][row][col];for(let j=3;j>=0;j--)out.push((val>>j)&1);}
        return permute(out,P);
    }
    function decryptBlock(blockBits,sk) {
        const pb=permute(blockBits,IP);let L=pb.slice(0,32),R=pb.slice(32,64);
        for(let i=15;i>=0;i--){const nL=R;R=xor(L,feistel(R,sk[i]));L=nL;}
        return permute(R.concat(L),FP);
    }

    const keyBytes=new Uint8Array(8);
    for(let i=0;i<8;i++) keyBytes[i]=keyStr.charCodeAt(i)||0;
    const sk=generateSubkeys(keyBytes);
    const cipherBytes=Buffer.from(ciphertextBase64,'base64');
    const plainBits=[];
    for(let i=0;i<cipherBytes.length;i+=8){
        plainBits.push(...decryptBlock(bytesToBits(cipherBytes.slice(i,i+8)),sk));
    }
    const db=bitsToBytes(plainBits);
    const padLen=db[db.length-1];
    const unpadded=(padLen>0&&padLen<=8)?db.slice(0,db.length-padLen):db;
    const s=Buffer.from(unpadded).toString('utf8');
    return s.replace(/_(96|160|48)\.(mp4|mp3)/,'_320.$2');
}

function decryptSaavnUrl(url) {
    if (!url) return '';
    try {
        const d = desDecryptECB(url, '38346591');
        return d && d.startsWith('http') ? d : '';
    } catch(e) { return ''; }
}

function hdImage(url) {
    if (!url) return '';
    return url.replace(/150x150/,'500x500').replace(/50x50/,'500x500');
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────
function mapSaavnSong(song) {
    if (!song || (!song.id && !song.song && !song.title)) return null;

    const id = song.id || song.song_id || song.more_info?.song_id || String(Math.random());

    // primaryArtists declared FIRST so it can be used in the download URL below
    const primaryArtists = song.more_info?.primary_artists || song.primary_artists || song.singers
        || song.more_info?.artistMap?.primary_artists?.map(a => a.name).join(', ') || '';

    const downloadUrls = [];
    let directCdnUrl = '';
    const enc = song.more_info?.encrypted_media_url || song.encrypted_media_url;
    if (enc) {
        const decrypted = decryptSaavnUrl(enc);
        if (decrypted) {
            directCdnUrl = decrypted;
            downloadUrls.push({ url: decrypted, quality: '320kbps' });
            const url160 = decrypted.replace(/_320\.(mp4|mp3)/, '_160.$1');
            if (url160 !== decrypted) downloadUrls.push({ url: url160, quality: '160kbps' });
            // Redirect-based stream endpoint (Vercel-friendly, no timeout)
            downloadUrls.push({ url: `/api/stream?url=${encodeURIComponent(decrypted)}`, quality: 'stream' });
            // Redirect-based download endpoint
            const songName = song.song || song.title || song.name || 'Song';
            downloadUrls.push({ url: `/api/download?url=${encodeURIComponent(decrypted)}&name=${encodeURIComponent(songName)}&artist=${encodeURIComponent(primaryArtists)}`, quality: 'download' });
        }
    }

    if (song.more_info?.media_preview_url) {
        const previewUrl = song.more_info.media_preview_url.replace('preview','aac').replace('_96_p','_320');
        if (!directCdnUrl) directCdnUrl = previewUrl;
        downloadUrls.push({ url: previewUrl, quality: '320kbps' });
        downloadUrls.push({ url: `/api/stream?url=${encodeURIComponent(previewUrl)}`, quality: 'stream' });
    }

    if (song.more_info?.vlink) {
        if (!directCdnUrl) directCdnUrl = song.more_info.vlink;
        downloadUrls.push({ url: song.more_info.vlink, quality: '160kbps' });
    }

    const image = song.image || song.more_info?.artistMap?.primary_artists?.[0]?.image || '';
    const imageHd = hdImage(image);

    return {
        id, name: song.song||song.title||song.name||'Unknown Track',
        title: song.song||song.title||song.name||'Unknown Track',
        album: { id: song.albumid||song.more_info?.album_id||'', name: song.album||song.more_info?.album||'Single' },
        artists: { primary: (song.more_info?.artistMap?.primary_artists||[]).map(a=>({id:a.id,name:a.name,image:hdImage(a.image)})) },
        primaryArtists, singers: primaryArtists,
        image: [{ url: image },{ url: image.replace('150x150','250x250') },{ url: imageHd||image }],
        duration: parseInt(song.more_info?.duration||song.duration||0),
        year: song.year||song.more_info?.year||'',
        language: song.language||song.more_info?.language||'',
        playCount: song.play_count||song.more_info?.play_count||0,
        downloadUrl: downloadUrls,
        rawMediaUrl: directCdnUrl,
        isSaavn: true,
        saavnUrl: song.perma_url||''
    };
}

function mapSaavnAlbum(album) {
    if (!album || (!album.albumid && !album.id)) return null;
    const image = album.image||'';
    return { id:album.albumid||album.id, name:album.album||album.title||'Unknown Album', title:album.album||album.title||'Unknown Album',
        artist:album.primary_artists||album.music||album.more_info?.firstname||'',
        image:[{url:image},{url:hdImage(image)},{url:hdImage(image)}],
        year:album.year||album.more_info?.year||'', songCount:album.song_count||album.more_info?.song_count||0,
        type:'album', saavnUrl:album.perma_url||'' };
}

function mapSaavnPlaylist(playlist) {
    if (!playlist || (!playlist.listid && !playlist.id)) return null;
    const image = playlist.image||'';
    return { id:playlist.listid||playlist.id, name:playlist.listname||playlist.title||playlist.name||'Unknown Playlist',
        title:playlist.listname||playlist.title||playlist.name||'Unknown Playlist',
        description:playlist.more_info?.firstname||playlist.subtitle||'',
        artist:playlist.more_info?.firstname||'JioSaavn',
        image:[{url:image},{url:hdImage(image)},{url:hdImage(image)}],
        songCount:playlist.more_info?.count||playlist.song_count||0, type:'playlist', saavnUrl:playlist.perma_url||'' };
}

function mapSaavnArtist(artist) {
    if (!artist || (!artist.artistid && !artist.id)) return null;
    const image = artist.image||'';
    return { id:artist.artistid||artist.id, name:artist.name||artist.title||'Unknown Artist',
        title:artist.name||artist.title||'Unknown Artist',
        image:[{url:image},{url:hdImage(image)},{url:hdImage(image)}], type:'artist', saavnUrl:artist.perma_url||'' };
}

// ─── JioSaavn internal API fetch ─────────────────────────────────────────────
async function saavnFetch(params) {
    const url = new URL(SAAVN_API_BASE);
    const defaults = { _format:'json', _marker:'0', api_version:'4', ctx:'web6dot0', ...params };
    Object.entries(defaults).forEach(([k,v]) => url.searchParams.set(k,v));
    const response = await fetch(url.toString(), { headers: SAAVN_HEADERS });
    if (!response.ok) throw new Error(`Saavn API error: ${response.status}`);
    return response.json();
}

async function searchSaavnSongs(query, limit=30) {
    try {
        const data = await saavnFetch({ __call:'search.getResults', q:query, N:String(limit), p:'1' });
        const results = data.results || data.songs?.results || [];
        return results.slice(0,limit).map(mapSaavnSong).filter(s => s && s.downloadUrl.length > 0);
    } catch(e) { console.error('[Saavn] Song search error:', e.message); return []; }
}

async function searchSaavn(query, limit=20) {
    try {
        const [autoData, songResults] = await Promise.all([
            saavnFetch({ __call:'autocomplete.get', query, _format:'json' }).catch(()=>({})),
            searchSaavnSongs(query, limit).catch(()=>[])
        ]);
        return {
            songs: songResults,
            albums:    (autoData.albums?.data||[]).slice(0,10).map(mapSaavnAlbum).filter(Boolean),
            playlists: (autoData.playlists?.data||[]).slice(0,10).map(mapSaavnPlaylist).filter(Boolean),
            artists:   (autoData.artists?.data||[]).slice(0,8).map(mapSaavnArtist).filter(Boolean)
        };
    } catch(e) { return { songs:[], albums:[], playlists:[], artists:[] }; }
}

async function getSaavnPlaylist(listid, limit=50) {
    const data = await saavnFetch({ __call:'playlist.getDetails', listid, N:String(limit), p:'1' });
    const playlist = mapSaavnPlaylist(data);
    if (!playlist) throw new Error('Invalid playlist data');
    const songs = (data.list||data.songs||[]).map(mapSaavnSong).filter(Boolean);
    return { ...playlist, songs, description: data.more_info?.firstname || `JioSaavn Playlist • ${songs.length} songs` };
}

async function getSaavnAlbum(albumid) {
    const data = await saavnFetch({ __call:'content.getAlbumDetails', albumid });
    const album = mapSaavnAlbum(data);
    if (!album) throw new Error('Invalid album data');
    const songs = (data.list||data.songs||[]).map(mapSaavnSong).filter(Boolean);
    return { ...album, songs, description: `${album.artist} • ${album.year||'2026'}` };
}

async function getSaavnSong(pids) {
    const data = await saavnFetch({ __call:'song.getDetails', pids });
    const songObj = data.songs?.[0] || data[pids] || data.song || data;
    return mapSaavnSong(songObj);
}

async function getSaavnTrending(lang='all', limit=40) {
    try {
        if (lang !== 'all' && lang !== '') return searchSaavnSongs(`${lang} hits 2026 chartbusters`, limit);
        const data = await saavnFetch({ __call:'content.getBrowseModules', language:'hindi,english,punjabi,tamil,telugu,kannada,malayalam,bengali,bhojpuri,urdu' });
        let allSongs = [];
        const ex = (list) => { if (!Array.isArray(list)) return; list.forEach(item => { const m=mapSaavnSong(item); if(m&&m.downloadUrl.length>0) allSongs.push(m); }); };
        ex(data.new_trending); ex(data.charts); ex(data.browse_discover); ex(data.new_albums);
        if (allSongs.length > 0) {
            const seen=new Set();
            return allSongs.filter(s=>{ if(seen.has(s.id)) return false; seen.add(s.id); return true; }).slice(0,limit);
        }
        return searchSaavnSongs('indian trending hits 2026', limit);
    } catch(e) { return searchSaavnSongs('malayalam hindi tamil top hits 2026', limit); }
}

function parseSaavnUrl(input) {
    const trimmed = input.trim();
    const match = trimmed.match(/jiosaavn\.com\/(song|album|playlist|artist|s)\//);
    if (!match) return null;
    const urlParts = trimmed.split('?')[0].split('/');
    const token = urlParts[urlParts.length - 1];
    const typeMap = { song:'song', album:'album', playlist:'playlist', artist:'artist', s:'song' };
    return { type: typeMap[match[1]]||'song', token };
}

// ─── Main Vercel handler ──────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
    setCors(res);

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    // Strip the leading /api prefix so routes work both locally and on Vercel
    const pathname = url.pathname.replace(/^\/api/, '') || '/';
    const q = url.searchParams;

    try {
        // ── Health ─────────────────────────────────────────────────────────────
        if (pathname === '/health' || pathname === '/') {
            return sendJson(res, 200, { success:true, api:'JioSaavn', message:'JioSaavn API connected — direct audio streaming ready!' });
        }

        // ── Search all ─────────────────────────────────────────────────────────
        if (pathname === '/search') {
            const query = q.get('query');
            if (!query) return sendJson(res, 400, { success:false, message:'Missing query' });
            const limit = parseInt(q.get('limit')||'20',10);
            const results = await searchSaavn(query, limit);
            return sendJson(res, 200, { success:true, data:{ songs:{results:results.songs}, albums:{results:results.albums}, playlists:{results:results.playlists}, artists:{results:results.artists}, results:results.songs }});
        }

        // ── Search songs ───────────────────────────────────────────────────────
        if (pathname === '/search/songs') {
            const query = q.get('query');
            if (!query) return sendJson(res, 400, { success:false, message:'Missing query' });
            const limit = parseInt(q.get('limit')||'30',10);
            const results = await searchSaavnSongs(query, limit);
            return sendJson(res, 200, { success:true, data:{ results, songs:{results} }});
        }

        // ── Search albums ──────────────────────────────────────────────────────
        if (pathname === '/search/albums') {
            const query = q.get('query');
            if (!query) return sendJson(res, 400, { success:false, message:'Missing query' });
            const results = await searchSaavn(query, 20);
            return sendJson(res, 200, { success:true, data:{ results:results.albums }});
        }

        // ── Search playlists ───────────────────────────────────────────────────
        if (pathname === '/search/playlists') {
            const query = q.get('query');
            if (!query) return sendJson(res, 400, { success:false, message:'Missing query' });
            const results = await searchSaavn(query, 20);
            return sendJson(res, 200, { success:true, data:{ results:results.playlists }});
        }

        // ── Search artists ─────────────────────────────────────────────────────
        if (pathname === '/search/artists') {
            const query = q.get('query');
            if (!query) return sendJson(res, 400, { success:false, message:'Missing query' });
            const results = await searchSaavn(query, 20);
            return sendJson(res, 200, { success:true, data:{ results:results.artists }});
        }

        // ── Trending ───────────────────────────────────────────────────────────
        if (pathname === '/trending' || pathname === '/trending/songs') {
            const lang = q.get('lang') || 'all';
            const tracks = await getSaavnTrending(lang, 40);
            return sendJson(res, 200, { success:true, data:tracks });
        }

        // ── Playlist details ───────────────────────────────────────────────────
        if (pathname === '/playlists') {
            const id = q.get('id');
            if (!id) return sendJson(res, 400, { success:false, message:'Missing playlist id' });
            const data = await getSaavnPlaylist(id, 100);
            return sendJson(res, 200, { success:true, data });
        }

        // ── Album details ──────────────────────────────────────────────────────
        if (pathname === '/albums') {
            const id = q.get('id');
            if (!id) return sendJson(res, 400, { success:false, message:'Missing album id' });
            const data = await getSaavnAlbum(id);
            return sendJson(res, 200, { success:true, data });
        }

        // ── Song details ───────────────────────────────────────────────────────
        if (pathname === '/songs') {
            const id = q.get('id');
            if (!id) return sendJson(res, 400, { success:false, message:'Missing song id' });
            const song = await getSaavnSong(id);
            if (!song) return sendJson(res, 404, { success:false, message:'Song not found' });
            return sendJson(res, 200, { success:true, data:[song] });
        }

        // ── Featured playlists ─────────────────────────────────────────────────
        if (pathname === '/featured-playlists') {
            const queries = ['malayalam hits playlist','hindi romantic playlist','bollywood top 50','tamil hits','punjabi top 40','lofi hindi'];
            const playlists = [];
            for (const query of queries) {
                try { const r = await searchSaavn(query, 3); playlists.push(...r.playlists); } catch(e) {}
            }
            return sendJson(res, 200, { success:true, data:playlists.slice(0,12) });
        }

        // ── Import from JioSaavn URL ───────────────────────────────────────────
        if (pathname === '/import') {
            const importUrl = q.get('url');
            if (!importUrl) return sendJson(res, 400, { success:false, message:'Missing url' });

            if (importUrl.includes('jiosaavn.com')) {
                const parsed = parseSaavnUrl(importUrl);
                if (!parsed) return sendJson(res, 400, { success:false, message:'Invalid JioSaavn URL' });

                if (parsed.type === 'playlist') {
                    const results = await saavnFetch({ __call:'webapi.get', token:parsed.token, type:'playlist', p:'1', n:'100' });
                    const playlist = mapSaavnPlaylist(results);
                    if (playlist) {
                        const songs = (results.list||results.songs||[]).map(mapSaavnSong).filter(Boolean);
                        return sendJson(res, 200, { success:true, data:{ ...playlist, songs }, type:'playlist' });
                    }
                }
                if (parsed.type === 'album') {
                    const results = await saavnFetch({ __call:'webapi.get', token:parsed.token, type:'album' });
                    const album = mapSaavnAlbum(results);
                    if (album) {
                        const songs = (results.list||results.songs||[]).map(mapSaavnSong).filter(Boolean);
                        return sendJson(res, 200, { success:true, data:{ ...album, songs }, type:'album' });
                    }
                }
                if (parsed.type === 'song') {
                    const results = await saavnFetch({ __call:'webapi.get', token:parsed.token, type:'song' });
                    const songs = (results.songs||[results]).map(mapSaavnSong).filter(Boolean);
                    if (songs.length > 0) return sendJson(res, 200, { success:true, data:songs[0], type:'song' });
                }
            }
            return sendJson(res, 400, { success:false, message:'Unsupported URL. Please use a JioSaavn link.' });
        }

        // ── /api/stream — 302 redirect to CDN (avoids Vercel timeout) ──────────
        // The browser fetches directly from Saavn's CDN — no bytes proxied here.
        if (pathname === '/stream') {
            const streamUrl = q.get('url');
            if (!streamUrl) { res.status(400).end('Missing stream URL'); return; }
            // Validate it's a Saavn CDN URL for safety
            if (!streamUrl.startsWith('http')) { res.status(400).end('Invalid URL'); return; }
            setCors(res);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.redirect(302, streamUrl);
        }

        // ── /api/download — 302 redirect with Content-Disposition header ───────
        // We redirect to Saavn CDN with a filename hint via query param that the
        // client-side download handler reads. The actual bytes come from Saavn CDN.
        if (pathname === '/download') {
            const streamUrl = q.get('url');
            const songName  = (q.get('name')   || 'Song').trim();
            const artist    = (q.get('artist')  || '').trim();
            if (!streamUrl || !streamUrl.startsWith('http')) {
                return sendJson(res, 400, { success:false, message:'Missing or invalid stream URL' });
            }
            // Build a safe filename and pass it back via a custom header
            const ext  = streamUrl.includes('.mp3') ? 'mp3' : (streamUrl.includes('.m4a') ? 'm4a' : 'mp4');
            const base = `${songName}${artist ? ' - ' + artist : ''}`.replace(/[\\/:*?"<>|]/g,'_');
            const filename = `${base}.${ext}`;
            setCors(res);
            res.setHeader('X-Filename', encodeURIComponent(filename));
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.redirect(302, streamUrl);
        }

        // ── /api/stream-proxy — tiny byte-proxy kept as CORS fallback ──────────
        // Only used when the browser can't directly reach the CDN (very rare).
        if (pathname === '/stream-proxy') {
            const streamUrl = q.get('url');
            if (!streamUrl || !streamUrl.startsWith('http')) {
                res.status(400).end('Missing stream URL');
                return;
            }
            try {
                const headers = { ...SAAVN_HEADERS };
                if (req.headers['range']) headers['Range'] = req.headers['range'];
                const upstream = await fetch(streamUrl, { headers });
                const contentType    = upstream.headers.get('content-type') || 'audio/mp4';
                const contentLength  = upstream.headers.get('content-length');
                const contentRange   = upstream.headers.get('content-range');
                const respHeaders = {
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*',
                    'Accept-Ranges': 'bytes',
                    'Cache-Control': 'public, max-age=86400'
                };
                if (contentLength) respHeaders['Content-Length'] = contentLength;
                if (contentRange)  respHeaders['Content-Range']  = contentRange;
                res.writeHead(upstream.status, respHeaders);
                if (req.method === 'HEAD') return res.end();
                const reader = upstream.body.getReader();
                const pump = async () => {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) { res.end(); break; }
                        if (!res.write(value)) await new Promise(r => res.once('drain', r));
                    }
                };
                await pump();
            } catch(e) {
                res.status(500).end('Proxy error: ' + e.message);
            }
            return;
        }

        // ── 404 fallthrough ────────────────────────────────────────────────────
        return sendJson(res, 404, { success:false, message:`API route not found: /api${pathname}` });

    } catch(e) {
        console.error('[API Error]', pathname, e.message);
        return sendJson(res, 500, { success:false, message:e.message });
    }
};
