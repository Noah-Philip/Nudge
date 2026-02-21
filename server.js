const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(publicDir, 'uploads');
const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

for (const dir of [dataDir, uploadsDir]) fs.mkdirSync(dir, { recursive: true });
for (const file of ['videos.json', 'events.json', 'moduleAttempts.json']) {
  const p = path.join(dataDir, file);
  if (!fs.existsSync(p)) fs.writeFileSync(p, '[]');
}

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));
const writeJson = (name, data) => fs.writeFileSync(path.join(dataDir, name), JSON.stringify(data, null, 2));

function send(res, status, body, type = 'application/json') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

function serveStatic(res, filePath) {
  if (!fs.existsSync(filePath)) return send(res, 404, 'Not found', 'text/plain');
  const ext = path.extname(filePath);
  const map = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.mp4': 'video/mp4' };
  send(res, 200, fs.readFileSync(filePath), map[ext] || 'application/octet-stream');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > MAX_UPLOAD_SIZE * 2) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error('Invalid JSON')); }
    });
  });
}

function pushEvent(type, videoId = null) {
  const events = readJson('events.json');
  events.unshift({ id: randomUUID(), type, videoId, createdAt: new Date().toISOString() });
  writeJson('events.json', events);
}

http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') return serveStatic(res, path.join(publicDir, 'index.html'));
    if (req.method === 'GET' && req.url === '/upload') return serveStatic(res, path.join(publicDir, 'upload.html'));
    if (req.method === 'GET' && req.url === '/library') return serveStatic(res, path.join(publicDir, 'library.html'));
    if (req.method === 'GET' && req.url.startsWith('/uploads/')) return serveStatic(res, path.join(publicDir, req.url));

    if (req.method === 'GET' && req.url === '/api/videos') return send(res, 200, { videos: readJson('videos.json') });

    if (req.method === 'POST' && req.url === '/api/upload') {
      const body = await parseBody(req);
      const { title, topic, filename, mimeType, contentBase64 } = body;
      if (!title || !topic || !filename || !contentBase64) return send(res, 400, { error: 'Missing required fields.' });
      if (mimeType !== 'video/mp4' || !filename.toLowerCase().endsWith('.mp4')) return send(res, 400, { error: 'Only MP4 uploads are supported.' });
      const buffer = Buffer.from(contentBase64, 'base64');
      if (buffer.length > MAX_UPLOAD_SIZE) return send(res, 400, { error: 'File exceeds 50MB limit.' });

      const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9_.-]/g, '-')}`;
      fs.writeFileSync(path.join(uploadsDir, safeName), buffer);

      const videos = readJson('videos.json');
      const video = { id: randomUUID(), title, topic, filePath: `/uploads/${safeName}`, createdAt: new Date().toISOString(), views: 0, likes: 0 };
      videos.unshift(video);
      writeJson('videos.json', videos);
      return send(res, 200, { ok: true, video });
    }


    if (req.method === 'POST' && req.url === '/api/modules/attempt') {
      const { moduleType, topic, completed } = await parseBody(req);
      if (!moduleType || !topic) return send(res, 400, { error: 'moduleType and topic required' });
      const attempts = readJson('moduleAttempts.json');
      attempts.unshift({ id: randomUUID(), moduleType, topic, completed: Boolean(completed), createdAt: new Date().toISOString() });
      writeJson('moduleAttempts.json', attempts);
      pushEvent(completed ? 'MODULE_COMPLETE' : 'MODULE_START', null);
      return send(res, 200, { ok: true });
    }

    if (req.method === 'POST' && req.url === '/api/videos/view') {
      const { videoId } = await parseBody(req);
      const videos = readJson('videos.json');
      const video = videos.find((v) => v.id === videoId);
      if (!video) return send(res, 404, { error: 'Video not found' });
      video.views += 1;
      writeJson('videos.json', videos);
      pushEvent('VIEW', videoId);
      return send(res, 200, { ok: true, views: video.views });
    }

    if (req.method === 'POST' && req.url === '/api/videos/like') {
      const { videoId } = await parseBody(req);
      const videos = readJson('videos.json');
      const video = videos.find((v) => v.id === videoId);
      if (!video) return send(res, 404, { error: 'Video not found' });
      video.likes += 1;
      writeJson('videos.json', videos);
      pushEvent('LIKE', videoId);
      return send(res, 200, { ok: true, likes: video.likes });
    }

    if (req.method === 'DELETE' && req.url.startsWith('/api/videos/')) {
      const videoId = req.url.split('/').pop();
      let videos = readJson('videos.json');
      const target = videos.find((v) => v.id === videoId);
      videos = videos.filter((v) => v.id !== videoId);
      writeJson('videos.json', videos);
      if (target) {
        const localFile = path.join(publicDir, target.filePath);
        if (fs.existsSync(localFile)) fs.unlinkSync(localFile);
      }
      return send(res, 200, { ok: true });
    }

    send(res, 404, { error: 'Not found' });
  } catch (error) {
    send(res, 500, { error: error.message || 'Server error' });
  }
}).listen(port, () => console.log(`Nudge running on http://localhost:${port}`));
