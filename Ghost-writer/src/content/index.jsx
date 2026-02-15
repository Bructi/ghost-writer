import React from 'react';
import ReactDOM from 'react-dom/client';
import GhostHud from './GhostHud';
import styles from '../content.css?inline'; // VITE MAGIC: Import CSS as a string

const rootId = 'ghost-writer-root';

// 1. Check if we already injected (prevent duplicates)
if (!document.getElementById(rootId)) {
  
  // 2. Create the Host Element
  const host = document.createElement('div');
  host.id = rootId;
  document.body.appendChild(host);

  // 3. Attach Shadow DOM (Open mode allows us to inspect it)
  const shadowRoot = host.attachShadow({ mode: 'open' });

  // 4. Inject Styles INSIDE the Shadow DOM
  const styleTag = document.createElement('style');
  styleTag.textContent = styles;
  shadowRoot.appendChild(styleTag);

  // 5. Mount React
  // We render into a div INSIDE the shadow root, not the shadow root itself
  const renderRoot = document.createElement('div');
  shadowRoot.appendChild(renderRoot);
  
  ReactDOM.createRoot(renderRoot).render(
    <React.StrictMode>
      <GhostHud />
    </React.StrictMode>
  );
}