import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import domino from '@mixmark-io/domino';

const execFileAsync = promisify(execFile);

// Narration voice for the Listen feature: Piper TTS (github.com/OHF-Voice/piper1-gpl), running
// locally — free, no account, no per-use cost, no commercial-use restriction (unlike e.g.
// ElevenLabs' free tier). Its output is a plain static .mp3 per post; a visitor's browser just
// plays it with a normal <audio> element, so none of this — Piper, espeak-ng, Python — is a
// dependency for readers, only for whoever generates the audio. Run `npm run tts:setup` once
// locally before this will work (see scripts/setup-piper.sh).
const PIPER_DIR = '.piper';
const PIPER_BIN = join(PIPER_DIR, 'venv', 'bin', 'piper');
const MODEL_PATH = join(PIPER_DIR, 'models', 'en_US-ryan-high.onnx');
// Slightly slower than Piper's default pace — carries over the same "too fast by default" tuning
// applied to the old Web Speech rate (see git history of listen.js).
const LENGTH_SCALE = '1.05';

// Generated narration is opt-in per post (frontmatter `listen: true`, see components/share.liquid)
// and, once generated, is committed to git like any other asset — a post's mp3 tends to run a few
// MB, nowhere near GitHub's 100MB per-file limit, and this avoids needing Piper/espeak-ng/ffmpeg
// installed wherever the site actually gets built (see scripts/generate-audio.js's header comment).
export const AUDIO_DIR = 'src/assets/audio';
// Tracked alongside the code, not the audio itself (audio lives under src/, which passthrough-
// copies straight into the built site — a stray manifest.json there would too) so a fresh clone
// still knows, from git alone, which posts' cached audio is already current.
const MANIFEST_PATH = 'lib/audio-manifest.json';

/** Locates espeak-ng's data files, which Piper's phonemizer shells out to.
 * macOS only for now — Homebrew's install layout is discoverable via `brew --prefix`. Linux (e.g.
 * the GitHub Actions runners this hasn't been wired into yet) would need its own resolution once
 * the CI build is set up.
 */
const resolveEspeakDataDir = () => {
  if (process.platform !== 'darwin') {
    throw new Error('Audio generation currently only supports macOS (local builds). See lib/audio.js.');
  }
  const prefix = execFileSync('brew', ['--prefix', 'espeak-ng']).toString().trim();
  return { dataDir: join(prefix, 'share'), dataPath: join(prefix, 'share', 'espeak-ng-data') };
};

/** Extracts the same block-by-block "readable text" as the client-side fallback used to (see git
 * history of assets/scripts/listen.js) — headings/paragraphs/list items joined with periods so
 * narration gets a natural pause between them, with <pre> (code) and inline <svg> dropped.
 * @param {{ title: string, proseHtml: string }} post
 */
export const extractReadableText = ({ title, proseHtml }) => {
  const document = domino.createDocument(`<div id="root">${proseHtml}</div>`);
  const root = document.getElementById('root');
  root.querySelectorAll('pre, svg').forEach((el) => el.remove());

  const blocks = root.querySelectorAll('h1, h2, h3, h4, p, li, blockquote, td, th');
  const body = [...blocks]
    .map((el) => el.textContent.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('. ');

  const titleText = title ? `${title.trim()}. ` : '';
  return titleText + body;
};

const hashText = (text) => createHash('sha256').update(text).digest('hex');

const readManifest = () => (existsSync(MANIFEST_PATH) ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) : {});

const writeManifest = (manifest) => writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

/** Cheap, synchronous lookup — is this post's committed audio already current? Used by
 * scripts/generate-audio.js to decide what needs (re)narrating; a post whose text hasn't changed
 * since its mp3 was generated is skipped.
 * @param {{ slug: string, title: string, proseHtml: string }} post
 */
export const getCachedAudioPath = ({ slug, title, proseHtml }) => {
  const text = extractReadableText({ title, proseHtml });
  const hash = hashText(text);
  const manifest = readManifest();
  const audioPath = join(AUDIO_DIR, `${slug}.mp3`);
  return manifest[slug] === hash && existsSync(audioPath) ? audioPath : null;
};

/** Generates (or regenerates, if the text changed) the narration .mp3 for one post, writing it
 * straight into AUDIO_DIR. Slow — intended to run one post at a time via scripts/generate-audio.js.
 * @param {{ slug: string, title: string, proseHtml: string }} post
 */
export const generateAudio = async ({ slug, title, proseHtml }) => {
  if (!existsSync(PIPER_BIN) || !existsSync(MODEL_PATH)) {
    throw new Error('Piper TTS is not set up — run `npm run tts:setup` once (see scripts/setup-piper.sh).');
  }

  const text = extractReadableText({ title, proseHtml });
  const hash = hashText(text);

  mkdirSync(AUDIO_DIR, { recursive: true });
  const audioPath = join(AUDIO_DIR, `${slug}.mp3`);
  const textPath = join(tmpdir(), `${slug}.txt`);
  const wavPath = join(tmpdir(), `${slug}.wav`);
  writeFileSync(textPath, text, 'utf8');

  const { dataDir, dataPath } = resolveEspeakDataDir();
  await execFileAsync(
    PIPER_BIN,
    [
      '-m',
      MODEL_PATH,
      '-c',
      `${MODEL_PATH}.json`,
      '-f',
      wavPath,
      '--length-scale',
      LENGTH_SCALE,
      '--data-dir',
      dataDir,
      '-i',
      textPath,
    ],
    { env: { ...process.env, ESPEAK_DATA_PATH: dataPath }, maxBuffer: 16 * 1024 * 1024 }
  );

  // mp3 instead of the raw wav Piper emits — a several-minute post's wav runs tens of MB; encoded
  // at this bitrate the mp3 is roughly a tenth of that, for no audible loss on spoken narration.
  await execFileAsync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-i',
    wavPath,
    '-codec:a',
    'libmp3lame',
    '-qscale:a',
    '4',
    audioPath,
  ]);

  unlinkSync(wavPath);
  unlinkSync(textPath);

  const manifest = readManifest();
  manifest[slug] = hash;
  writeManifest(manifest);

  return audioPath;
};
