const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // 去掉查询参数，只保留路径
    let pathname = req.url.split('?')[0];
    
    // 处理 API 请求
    if (pathname === '/api/init-examples') {
        const examplesDir = path.join(__dirname, 'data', 'examples');
        const examples = {};
        
        try {
            const files = fs.readdirSync(examplesDir);
            files.forEach(file => {
                if (file.endsWith('.json')) {
                    const filePath = path.join(examplesDir, file);
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const data = JSON.parse(content);
                    if (data.id) {
                        examples[data.id] = data;
                    }
                }
            });
            
            res.writeHead(200, { 
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(examples));
            console.log('API: init-examples loaded', Object.keys(examples).length, 'examples');
            return;
        } catch (error) {
            console.error('Error loading examples:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to load examples' }));
            return;
        }
    }
    
    // 默认首页
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    const filePath = '.' + pathname;
    console.log('Request:', pathname, '-> File:', filePath);
    
    const extname = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };
    
    const contentType = contentTypes[extname] || 'text/plain';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            console.log('404 Error:', filePath);
            res.writeHead(404);
            res.end('404 Not Found: ' + pathname);
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(8080, () => {
    console.log('=================================');
    console.log('Server running at http://localhost:8080');
    console.log('=================================');
});
