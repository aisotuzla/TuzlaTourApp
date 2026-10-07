const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const app = express();
const PORT = process.env.PORT || 5001;

// Ensure audio cache directory exists
const CACHE_DIR = path.join(__dirname, 'audio-cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());

// Recommended Microsoft Neural Voices for Tuzla Tour App
const DEFAULT_VOICES = {
  bs: 'bs-BA-GoranNeural',
  en: 'en-US-AndrewNeural',
  de: 'de-DE-ConradNeural',
  tr: 'tr-TR-AhmetNeural'
};

// Alternative fallback voices
const FALLBACK_VOICES = {
  bs: 'bs-BA-VesnaNeural',
  en: 'en-US-AvaNeural',
  de: 'de-DE-KatjaNeural',
  tr: 'tr-TR-EmelNeural'
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Tuzla Tour TTS Backend',
    voices: DEFAULT_VOICES
  });
});

// List available voices
app.get('/api/voices', async (req, res) => {
  try {
    const tts = new MsEdgeTTS();
    const voices = await tts.getVoices();
    res.json(voices);
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ error: 'Failed to fetch voices' });
  }
});

// Synthesize Text-to-Speech stream / file
// Supports GET (/api/tts?text=...&lang=bs&voice=...) and POST (/api/tts with body)
const handleTTS = async (req, res) => {
  try {
    const text = (req.method === 'POST' ? req.body.text : req.query.text) || '';
    const lang = ((req.method === 'POST' ? req.body.lang : req.query.lang) || 'bs').toLowerCase();
    const customVoice = req.method === 'POST' ? req.body.voice : req.query.voice;

    const trimmedText = text.trim();
    if (!trimmedText) {
      return res.status(400).json({ error: 'Text parameter is required' });
    }

    const selectedVoice = customVoice || DEFAULT_VOICES[lang] || DEFAULT_VOICES.bs;

    // Create unique cache key for voice + text
    const cacheKey = crypto
      .createHash('md5')
      .update(`${selectedVoice}_${trimmedText}`)
      .digest('hex');
    const cachedFilePath = path.join(CACHE_DIR, `${cacheKey}.mp3`);

    // 1. If cached on disk, serve immediately with full Range / 206 Partial Content support for Mobile Safari
    if (fs.existsSync(cachedFilePath)) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      return res.sendFile(cachedFilePath);
    }

    // 2. Synthesize with Microsoft Neural TTS
    const tts = new MsEdgeTTS();
    await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

    const { audioStream } = tts.toStream(trimmedText);

    // Write to cache file for instant repeated playback & HTTP Range support
    const tempFilePath = path.join(CACHE_DIR, `${cacheKey}.tmp`);
    const writeStream = fs.createWriteStream(tempFilePath);

    audioStream.pipe(writeStream);

    writeStream.on('finish', () => {
      try {
        fs.renameSync(tempFilePath, cachedFilePath);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
        res.sendFile(cachedFilePath);
      } catch (e) {
        // In case of rename contention, fallback to sending temp file
        res.setHeader('Content-Type', 'audio/mpeg');
        res.sendFile(tempFilePath);
      }
    });

    writeStream.on('error', (err) => {
      console.error('File write stream error:', err);
      // Fallback: direct streaming to client
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-cache');
        audioStream.pipe(res);
      }
    });

    audioStream.on('error', (err) => {
      console.error('TTS stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to synthesize TTS audio', details: err.message });
      }
    });
  } catch (error) {
    console.error('TTS handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'TTS synthesis error', details: error.message });
    }
  }
};

app.get('/api/tts', handleTTS);
app.post('/api/tts', handleTTS);

app.listen(PORT, () => {
  console.log(`[tour-tts-backend] Server running on http://localhost:${PORT}`);
  console.log(`[tour-tts-backend] Supported Neural Voices:`);
  console.log(`  - Bosnian (bs): ${DEFAULT_VOICES.bs}`);
  console.log(`  - English (en): ${DEFAULT_VOICES.en}`);
  console.log(`  - German  (de): ${DEFAULT_VOICES.de}`);
  console.log(`  - Turkish (tr): ${DEFAULT_VOICES.tr}`);
});
