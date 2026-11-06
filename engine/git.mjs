// Tiny git helper shared by publish.mjs and state.mjs. Works on the Windows PC (D: drive needs
// safe.directory) and in a cloud checkout (may have no commit identity configured).
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REPO = 'lalapert/yeon-cardnews';

const SAFE = ['-c', `safe.directory=${ROOT.replace(/\\/g, '/')}`];

export function git(...args) {
  return execFileSync('git', [...SAFE, ...args], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function identity() {
  let email = '';
  try {
    email = git('config', 'user.email').trim();
  } catch {}
  return email ? [] : ['-c', 'user.name=yeon-news-bot', '-c', 'user.email=lalapert@users.noreply.github.com'];
}

// The pipeline always publishes to main. Cloud checkouts can start on a detached HEAD
// (`rev-parse --abbrev-ref` then says "HEAD"), so never derive the target from the checkout.
export const TARGET = process.env.YEON_BRANCH || 'main';
export function branch() {
  return TARGET;
}

// Stage `paths`, commit if anything changed, push to main (rebasing on conflicts).
export function commitAndPush(paths, message) {
  git('add', '--', ...paths);
  if (!git('status', '--porcelain', '--', ...paths).trim()) return { changed: false, branch: branch() };
  execFileSync('git', [...SAFE, ...identity(), 'commit', '-q', '-m', `${message}\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const b = TARGET;
  let last;
  for (let i = 0; i < 3; i++) {
    try {
      git('push', '-q', 'origin', `HEAD:refs/heads/${b}`);
      return { changed: true, branch: b };
    } catch (e) {
      last = e;
      try {
        git('pull', '--rebase', '-q', 'origin', b);
      } catch {}
    }
  }
  throw new Error(`git push failed: ${(last.stderr || last.message || '').toString().trim()}`);
}
