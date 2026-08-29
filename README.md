<h1 align="center">
  <br>
  <img src="https://tauri.app/meta/tauri_logo_light.svg" alt="Tauri Logo" width="100">
  <br>
  Neon Video Downloader
  <br>
</h1>

<h4 align="center">A high-performance, visually stunning desktop video downloader built with <a href="https://tauri.app/" target="_blank">Tauri</a>, <a href="https://www.rust-lang.org/" target="_blank">Rust</a>, and <a href="https://react.dev/" target="_blank">React</a>.</h4>

<p align="center">
  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/YOUR_GITHUB_USERNAME/video-downloader?color=E34F26">
  <img alt="Tauri" src="https://img.shields.io/badge/Tauri-v2-FFC131?logo=tauri&logoColor=white">
  <img alt="Rust" src="https://img.shields.io/badge/Rust-Backend-000000?logo=rust&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black">
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#development-setup">Development Setup</a>
</p>

<div align="center">
  <!-- Add your screenshot inside the /assets folder and link it here -->
  <img src="https://via.placeholder.com/800x450.png?text=Add+Your+App+Screenshot+Here" alt="App Screenshot" width="100%">
</div>

## Key Features

* **High Performance Backend:** Powered by Rust and Tauri, ensuring lightning-fast execution and minimal RAM usage.
* **Dual Format Download:** 
  * 🎬 **Video (MP4):** Automatically fetches the absolute best video and audio streams available and merges them losslessly.
  * 🎵 **Audio (MP3):** Extracts and converts media directly to high-quality MP3 format.
* **Stunning UI/UX:** Built with React and TypeScript, featuring a dark-themed Glassmorphism UI, neon highlights, and custom Google Typography (*Monoton*).
* **Real-time Feedback:** Live terminal logs and a real-time progress bar powered by asynchronous IPC (Inter-Process Communication) events from Rust to React.
* **Native OS Integration:** Native directory selection dialogs and OS-level window rendering.

## Architecture

This application acts as a sleek graphical wrapper over industry-standard media tools. It utilizes Tauri's **Sidecar** feature to securely bundle and execute external binaries:
* `yt-dlp`: For media extraction and downloading.
* `ffmpeg`: For audio/video merging and format conversion.

The Rust backend spawns these processes safely, reads their standard output (`stdout`), processes the text, and emits real-time progress events to the React frontend.

## How to Use

1. Go to the [Releases](../../releases) page of this repository.
2. Download the latest Windows installer (`.exe` or `.msi`).
3. Install and run the application.
4. Paste a video URL, select your destination folder, and click Download!

---

## Development Setup

If you want to clone this repository and run the app in development mode, follow these steps:

### Prerequisites

You will need to have the following installed on your machine:
- [Node.js](https://nodejs.org/)
- [Rust & Cargo](https://www.rust-lang.org/tools/install)
- [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (for Windows compilation)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/video-downloader.git
cd video-downloader
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Sidecar Binaries
Because the `.exe` sidecars are heavy, they are excluded from the source code repository. You need to download them manually before running the app:
1. Create a folder named `bin` inside `src-tauri` (`src-tauri/bin`).
2. Download the latest Windows `.exe` for [yt-dlp](https://github.com/yt-dlp/yt-dlp/releases) and [ffmpeg](https://github.com/BtbN/FFmpeg-Builds/releases).
3. Rename the files exactly to:
   - `yt-dlp-x86_64-pc-windows-msvc.exe`
   - `ffmpeg-x86_64-pc-windows-msvc.exe`
4. Place both inside the `src-tauri/bin/` folder.

### 4. Run in Development Mode
```bash
npm run tauri dev
```

### 5. Build for Production
```bash
npm run tauri build
```

---

> **Note:** Replace `YOUR_GITHUB_USERNAME` in the URLs with your actual GitHub username and replace the placeholder image with a real screenshot of the app!
