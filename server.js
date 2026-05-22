const http = require('http');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

const PORT = 8080;

const PIPED_INSTANCES = [
    "https://api.piped.private.coffee",
    "https://pipedapi.colloquial.services",
    "https://pipedapi.owo.si",
    "https://pipedapi.reallyaweso.me",
    "https://pipedapi.kavin.rocks"
];

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

const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    // Handle stream proxy API
    if (pathname === '/api/stream') {
        const youtubeId = parsedUrl.searchParams.get('youtubeId');
        if (!youtubeId) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            return res.end("Missing youtubeId parameter");
        }

        console.log(`[Proxy] Resolving stream for YouTube ID: ${youtubeId}`);
        let streamUrl = null;

        for (const instance of PIPED_INSTANCES) {
            try {
                const response = await fetch(`${instance}/streams/${youtubeId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.audioStreams && data.audioStreams.length > 0) {
                        // Sort by bitrate descending to get best quality
                        data.audioStreams.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
                        const stream = data.audioStreams[0];
                        if (stream && stream.url) {
                            streamUrl = stream.url;
                            console.log(`[Proxy] Resolved stream URL from ${instance}`);
                            break;
                        }
                    }
                }
            } catch (err) {
                console.error(`[Proxy] Error querying ${instance}:`, err.message);
            }
        }

        if (!streamUrl) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end("Failed to resolve audio stream from all Piped instances");
        }

        try {
            console.log(`[Proxy] Streaming data from: ${streamUrl}`);
            const streamResponse = await fetch(streamUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://www.youtube.com/'
                }
            });

            if (!streamResponse.ok) {
                console.error(`[Proxy] Stream host returned status: ${streamResponse.status}`);
                res.writeHead(streamResponse.status, { 'Content-Type': 'text/plain' });
                return res.end("Failed to fetch audio stream data from proxy host");
            }

            res.writeHead(200, {
                'Content-Type': streamResponse.headers.get('Content-Type') || 'audio/mpeg',
                'Accept-Ranges': 'bytes',
                'Access-Control-Allow-Origin': '*'
            });

            Readable.fromWeb(streamResponse.body).pipe(res);
        } catch (e) {
            console.error(`[Proxy] Streaming error:`, e.message);
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end("Error streaming audio: " + e.message);
            }
        }
        return;
    }

    // Serve static files
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    
    // Normalize path to prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        return res.end("Forbidden");
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end("Not Found");
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
