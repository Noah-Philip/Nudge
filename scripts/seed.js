const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const seedDir = path.join(__dirname, '..', 'seed_videos');

const topics = ['fitness', 'chess', 'mindset', 'productivity', 'wellness'];
const files = fs.existsSync(seedDir)
  ? fs.readdirSync(seedDir).filter((f) => f.toLowerCase().endsWith('.mp4')).slice(0, 10)
  : [];

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
console.log(`Seeded ${videos.length} videos from /seed_videos.`);
