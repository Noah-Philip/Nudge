const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const seedDir = path.join(__dirname, '..', 'seed_videos');
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

const topics = ['fitness', 'chess', 'mindset', 'productivity', 'wellness'];
const EMBEDDED_MP4_BASE64 =
  'AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAANsbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAB9AAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAA5R0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAA+gAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAQAAAAEAAAAAAACkbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAoAAAAKABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAACFG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAdxzdGJsAAAAxHN0c2QAAAAAAAAAAQAAALRhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAQABAEgAAABIAAAAAAAAAAEVTGF2YzU2LjM1LjEwMAAAABhzdHRzAAAAAAAAAAEAAAABAAAEAAAAABRzdHNzAAAAAAAAAAEAAAABAAAAFHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAABRzdHN6AAAAAAAAAAAAAAABAAAD9AAAABRzdGNvAAAAAAAAAAEAAAAsAAAAGG1kYXQAAAABZYiE';

const ensureDirectory = (dir) => fs.mkdirSync(dir, { recursive: true });

function ensureDemoSeedVideos() {
  ensureDirectory(seedDir);
  const existing = fs.readdirSync(seedDir).filter((file) => file.toLowerCase().endsWith('.mp4'));
  if (existing.length > 0) return existing;

  const clip = Buffer.from(EMBEDDED_MP4_BASE64, 'base64');
  const generatedFiles = [];

  for (let index = 1; index <= 6; index += 1) {
    const filename = `auto-seed-${String(index).padStart(2, '0')}.mp4`;
    fs.writeFileSync(path.join(seedDir, filename), clip);
    generatedFiles.push(filename);
  }

  console.log('No videos found in /seed_videos. Generated 6 local MP4 demo clips automatically.');
  return generatedFiles;
}

function copyToUploads(files) {
  ensureDirectory(uploadsDir);
  for (const file of files) {
    const sourcePath = path.join(seedDir, file);
    const targetPath = path.join(uploadsDir, file);
    if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

ensureDirectory(dataDir);

const files = ensureDemoSeedVideos().slice(0, 10);
copyToUploads(files);

const videos = files.map((file, i) => ({
  id: `seed-${i + 1}`,
  title: `Seed video ${i + 1}`,
  topic: topics[i % topics.length],
  filePath: `/uploads/${file}`,
  createdAt: new Date().toISOString(),
  views: 0,
  likes: 0,
}));

fs.writeFileSync(path.join(dataDir, 'videos.json'), JSON.stringify(videos, null, 2));
if (!fs.existsSync(path.join(dataDir, 'events.json'))) fs.writeFileSync(path.join(dataDir, 'events.json'), '[]');
if (!fs.existsSync(path.join(dataDir, 'moduleAttempts.json'))) fs.writeFileSync(path.join(dataDir, 'moduleAttempts.json'), '[]');
console.log(`Seeded ${videos.length} videos from /seed_videos and synced files to /public/uploads.`);
