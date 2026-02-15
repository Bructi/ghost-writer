import React from 'react';
import ReactDOM from 'react-dom/client';
import GhostHud from './GhostHud';
import styles from '../content.css?inline'; 

const rootId = 'ghost-writer-root';

if (!document.getElementById(rootId)) {
  
  
  const host = document.createElement('div');
  host.id = rootId;
  document.body.appendChild(host);

  
  const shadowRoot = host.attachShadow({ mode: 'open' });

  const styleTag = document.createElement('style');
  styleTag.textContent = styles;
  shadowRoot.appendChild(styleTag);

  const renderRoot = document.createElement('div');
  shadowRoot.appendChild(renderRoot);
  
  ReactDOM.createRoot(renderRoot).render(
    <React.StrictMode>
      <GhostHud />
    </React.StrictMode>
  );
}