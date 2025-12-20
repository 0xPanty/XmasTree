const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Handle API routes
    if (req.url.startsWith('/api/')) {
        // Import and handle API
        const apiPath = req.url.replace('/api/', '');
        const apiFile = path.join(__dirname, 'api', `${apiPath}.js`);
        
        if (fs.existsSync(apiFile)) {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', async () => {
                try {
                    // Parse query params
                    const urlParts = req.url.split('?');
                    const query = {};
                    if (urlParts[1]) {
                        urlParts[1].split('&').forEach(param => {
                            const [key, value] = param.split('=');
                            query[key] = decodeURIComponent(value);
                        });
                    }

                    // Mock request/response
                    const mockReq = {
                        method: req.method,
                        query: query,
                        body: body ? JSON.parse(body) : {}
                    };
                    
                    const mockRes = {
                        status: (code) => ({
                            json: (data) => {
                                res.writeHead(code, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify(data));
                            },
                            end: () => res.end()
                        }),
                        setHeader: (key, value) => res.setHeader(key, value)
                    };

                    // Load and execute API handler
                    delete require.cache[require.resolve(apiFile)];
                    const handler = require(apiFile).default;
                    await handler(mockReq, mockRes);
                } catch (err) {
                    console.error('API Error:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                }
            });
        } else {
            res.writeHead(404);
            res.end('API not found');
        }
        return;
    }

    // Serve static files
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🎄 Jingle Gift Local Server`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`\n✨ Press Ctrl+C to stop\n`);
});
