# Applying Alpha 0.6.0 Miner Core

This archive is a complete project snapshot. Replace the local project contents with this version, while keeping the local `.git` directory.

## Android / Termux

1. Back up the current project or commit any uncommitted work.
2. Extract the archive into `/storage/emulated/0/MycoVerse` and allow replacement of existing files.
3. Do not delete the hidden `.git` directory.
4. Test `index.html` through a local web server rather than opening it as a saved browser page:

```bash
cd /storage/emulated/0/MycoVerse
python -m http.server 8080
```

Then open `http://127.0.0.1:8080` in the browser.

## Commit

```bash
git add .
git commit -m "Alpha 0.6.0 - Integrate Miner Core"
git push origin mycoverse-dev
```
