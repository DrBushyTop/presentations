# Sounds for the hit-marker slide

`npm run sounds:hill-climb` downloads the clips after asking, and `dev:hill-climb` and `start:hill-climb` offer to when they're missing. You can also drop your own here. Both names are gitignored, so they stay out of this public repo.

- `hit.mp3`: played for each pin, up to about 24 times a second, so keep it under 150 ms.
- `ending.mp3`: played once when the last pin lands.

`.wav` and `.ogg` also work. Without them the slide uses a synthesised tick and `ending-tts.mp3`, a macOS text-to-speech line.
