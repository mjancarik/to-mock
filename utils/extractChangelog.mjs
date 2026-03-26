import fs from 'node:fs';
import path from 'node:path/posix';

const ANCHOR_RE = /<a name="\d+\.\d+\.\d+"><\/a>\n/g;
const SPLIT_RE = /(?:^|\n)(?=#{1,2} (?:\[|<small>)?\d+\.\d+\.\d+)/;
const CHANGELOG = path.resolve(process.cwd(), 'CHANGELOG.md');

const changelogContents = fs.readFileSync(CHANGELOG, 'utf-8');
const versionChangelogs = changelogContents.replace(ANCHOR_RE, '').split(SPLIT_RE);
versionChangelogs.shift();

fs.writeFileSync(
  path.resolve(process.cwd(), 'current-changelog.txt'),
  versionChangelogs?.[0]?.trim?.() ?? '',
);
