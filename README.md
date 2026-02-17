# 👻 Ghost Writer: Local-First AI Research Engine

**A privacy-centric Chrome Extension that turns your browser into a semantic knowledge base.**

<!-- > **Live Demo:** [Insert Link to YouTube Video Here]   -->
> **Status:** MVP Complete / Production Ready

---

## ⚡ The Engineering Challenge

Most "AI Wrappers" are just API calls to OpenAI. They are easy to build but suffer from three critical flaws:
1.  **Privacy:** User data is sent to a third-party cloud.
2.  **Latency:** Every interaction waits for a network round-trip.
3.  **Cost:** Scaling requires paying per-token API fees.

### The Solution
**Ghost Writer runs entirely on the client.** It downloads a quantized Neural Network (BERT/MiniLM) into the browser's cache and executes vector mathematics locally using WebAssembly (WASM).

| Feature | Cloud AI (Standard) | Ghost Writer (Local) |
| :--- | :--- | :--- |
| **Privacy** | ❌ Data leaves device | ✅ **Zero Data Exfiltration** |
| **Latency** | ❌ Network dependent | ✅ **Instant (In-Memory)** |
| **Cost** | ❌ $$$ / month | ✅ **$0.00 (Run on Edge)** |
| **Offline** | ❌ Impossible | ✅ **Full Offline Support** |

---

## 🛠️ Technical Architecture

This project pushes the limits of the **Chrome Extension Manifest V3** environment.

### 1. The "Stealth" UI (Shadow DOM)
Unlike standard content scripts that break when a website uses Tailwind or Bootstrap, Ghost Writer injects a `ShadowRoot`. This creates a hermetic CSS environment, ensuring the HUD looks perfect on *any* website (Wikipedia, Notion, Docs) without style bleeding.

### 2. The Semantic Brain (Transformers.js)
* **Model:** `Xenova/all-MiniLM-L6-v2` (Quantized to ~30MB).
* **Execution:** Runs in a **Web Worker** to prevent blocking the UI/Main Thread.
* **Vector Search:** Calculates **Cosine Similarity** between the current page's embedding and stored vectors to find related notes instantly (e.g., connecting "Felis Catus" to a previous note about "Tigers" without sharing keywords).

### 3. The Persistence Layer (IndexedDB + Dexie)
* `localStorage` (5MB limit) was insufficient for storing vector arrays.
* Implemented **IndexedDB** to store thousands of high-dimensional vectors and full-text content.
* Engineered a persistent, offline-first database that survives browser restarts.

### 4. The Data Pipeline (ETL)
* **Extract:** DOM Scraping via `@mozilla/readability`.
* **Transform:** Sanitization and Vector Embedding generation.
* **Load:** Saves to DB.
* **Export:** On-demand generation of **Markdown (.md)** files with YAML frontmatter, zipped via `JSZip` for interoperability with **Obsidian**, **Notion**, or **GitHub**.

---

## 🚀 How to Build & Run

### Prerequisites
* Node.js (v18+)
* npm

### Installation
1.  **Clone the repo:**
    ```bash
    git clone https://github.com/Bructi/ghost-writer.git
    cd ghost-writer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the extension:**
    ```bash
    npm run build
    ```
    *Note: This uses a custom **Vite + Terser** pipeline to handle WASM binary encoding issues.*

4.  **Load into Chrome:**
    * Open `chrome://extensions`
    * Enable **Developer Mode** (top right).
    * Click **Load Unpacked**.
    * Select the `dist/` folder.

---

## 🎮 Usage Guide

1.  **Scan:** Visit any article (e.g., Wikipedia). Click "Scan Context". The AI will read the page and generate a vector embedding.
2.  **Save:** Click "Save to Brain" to persist the data.
3.  **Recall:** Visit a *new* page. If it is semantically related to a saved note, the HUD will automatically alert you with a "Related Memory."
4.  **Export:** Go to the "Library" tab and click "Export to Markdown" to download your second brain.

---

## 🏗️ Tech Stack

* **Core:** React 18, Vite
* **AI/ML:** Transformers.js, ONNX Runtime (WASM)
* **Storage:** Dexie.js (IndexedDB wrapper)
* **Styling:** CSS Modules (Injected via Shadow DOM)
* **Minification:** Terser (ASCII-only mode for binary safety)

---

**License:** MIT  
**Author:** [Aniket Dhoke]