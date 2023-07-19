import { statSync, symlink, createReadStream } from 'fs';
import { createServer } from 'http';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const hostname = '192.168.68.66';
const port = 3004;

const assets = ['chat_viewer.js', 'chat_display.html', 'chat_display.css'];
for (const asset of assets) {
    symlink(
        join(__dirname, asset),
        join(__dirname, 'messages', asset),
        (err) => {
            console.log(err);
        }
    );
}

const server = createServer((req, res) => {
    const filePath = join(__dirname, '/messages' + (req.url === '/' ? '/chat_display.html' : req.url));
    try {
        const stat = statSync(filePath);

        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': stat.size
        });
    
        const readStream = createReadStream(filePath);
        readStream.pipe(res);
    } catch {}
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
