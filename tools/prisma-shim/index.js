#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2).join(' ');
if (args.includes('migrate dev')) {
  const root = process.cwd();
  const dataDir = path.join(root, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  for (const file of ['videos.json', 'events.json', 'moduleAttempts.json']) {
    const p = path.join(dataDir, file);
    if (!fs.existsSync(p)) fs.writeFileSync(p, '[]');
  }
  fs.writeFileSync(path.join(root, 'prisma', 'dev.db'), 'sqlite-placeholder');
  console.log('Prisma shim: migrate dev completed.');
} else {
  console.log('Prisma shim: supported command is `migrate dev`.');
}
