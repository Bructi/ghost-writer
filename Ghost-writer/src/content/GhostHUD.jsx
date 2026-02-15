import { useState, useEffect } from 'react';
import { extractPageContent } from '../utils/scraper';
import { saveSnippet, getSnippetCount, getRecentSnippets, deleteSnippet, findSimilarSnippets } from '../utils/db';
import { useEmbedder } from '../hooks/useEmbedder'; // <--- New Hook
import { exportBrain } from '../utils/exporter';
export default function GhostHud() {
  const [isOpen, setIsOpen] = useState(true);
  const [view, setView] = useState('scanner');

  // AI State
  const { isReady, generateEmbedding } = useEmbedder();
  const [similarNotes, setSimilarNotes] = useState([]);
  const [processingAI, setProcessingAI] = useState(false);

  // Scanner State
  const [scanData, setScanData] = useState(null);
  const [embedding, setEmbedding] = useState(null); // Store current vector
  const [isScanning, setIsScanning] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  // Library State
  const [libraryItems, setLibraryItems] = useState([]);

  useEffect(() => {
    getSnippetCount().then(setSavedCount);
  }, []);

  useEffect(() => {
    if (view === 'library') {
      getRecentSnippets().then(setLibraryItems);
    }
  }, [view]);

  const handleScan = async () => {
    setIsScanning(true);
    setSimilarNotes([]); // Clear previous results

    // 1. Scrape Text
    setTimeout(async () => {
      const result = extractPageContent();
      setScanData(result);
      setIsScanning(false);

      // 2. Trigger AI (if text is found)
      if (result && result.text && isReady) {
        setProcessingAI(true);
        try {
          console.log("Generating Embedding...");
          const vector = await generateEmbedding(result.text);
          setEmbedding(vector); // Save vector to state

          // 3. Find Similar Notes
          const matches = await findSimilarSnippets(vector);
          setSimilarNotes(matches);

        } catch (err) {
          console.error("AI Error:", err);
        } finally {
          setProcessingAI(false);
        }
      }
    }, 500);
  };

  const handleSave = async () => {
    if (!scanData) return;
    // Pass the embedding to the save function
    await saveSnippet(scanData, embedding);
    setIsSaved(true);
    setSavedCount(await getSnippetCount());
  };

  const handleDelete = async (id) => {
    await deleteSnippet(id);
    setLibraryItems(prev => prev.filter(item => item.id !== id));
    setSavedCount(await getSnippetCount());
  };

  if (!isOpen) return (
    <div className="ghost-hud-container" style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button className="ghost-btn" onClick={() => setIsOpen(true)} style={{ fontSize: '20px' }}>👻</button>
    </div>
  );

  return (
    <div className="ghost-hud-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Ghost Writer</h3>
          <span style={{ fontSize: '10px', background: '#333', padding: '2px 6px', borderRadius: '10px' }}>{savedCount}</span>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={() => setView('scanner')} style={{ opacity: view === 'scanner' ? 1 : 0.5, background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>🔍</button>
          <button onClick={() => setView('library')} style={{ opacity: view === 'library' ? 1 : 0.5, background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>📚</button>
          <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer', marginLeft: '5px' }}>✕</button>
        </div>
      </div>

      {/* Scanner View */}
      {view === 'scanner' && (
        <>
          {!scanData ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <button className="ghost-btn" onClick={handleScan} disabled={isScanning || !isReady} style={{ width: '100%' }}>
                {isScanning ? 'Extracting...' : !isReady ? 'Loading Neural Net...' : 'Scan Context'}
              </button>
            </div>
          ) : (
            <div className="ghost-results">
              <div style={{ background: '#333', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                <strong style={{ display: 'block', color: '#646cff', fontSize: '12px' }}>DETECTED TITLE</strong>
                <span style={{ fontSize: '14px' }}>{scanData.title}</span>
              </div>

              {/* AI INSIGHTS AREA */}
              {processingAI && <div style={{ fontSize: '11px', color: '#888', marginBottom: '10px' }}>🧠 Analyzing semantic connections...</div>}

              {similarNotes.length > 0 && (
                <div style={{ marginBottom: '15px', borderLeft: '3px solid #10b981', paddingLeft: '10px' }}>
                  <strong style={{ color: '#10b981', fontSize: '12px' }}>RELATED MEMORIES</strong>
                  {similarNotes.map(note => (
                    <div key={note.id} style={{ fontSize: '11px', marginTop: '5px', color: '#ccc' }}>
                      "{note.title}" ({(note.score * 100).toFixed(0)}% match)
                    </div>
                  ))}
                </div>
              )}

              {!isSaved ? (
                <button className="ghost-btn" onClick={handleSave} style={{ width: '100%', background: '#10b981', marginBottom: '10px' }}>
                  Save to Brain
                </button>
              ) : (
                <div style={{ padding: '10px', textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>
                  ✓ Saved to Memory
                </div>
              )}

              <button className="ghost-btn" onClick={() => { setScanData(null); setIsSaved(false); setSimilarNotes([]); }} style={{ background: '#444', width: '100%', fontSize: '12px' }}>
                Clear & Rescan
              </button>
            </div>
          )}
        </>
      )}

      {/* Library View */}
      {view === 'library' && (
        <div className="ghost-library-view">

          {/* EXPORT BUTTON - Only show if we have items */}
          {libraryItems.length > 0 && (
            <button
              onClick={exportBrain}
              className="ghost-btn"
              style={{
                background: '#333',
                border: '1px solid #555',
                marginBottom: '10px',
                width: '100%',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              📥 Export All as Markdown
            </button>
          )}

          {libraryItems.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', fontSize: '12px' }}>Brain is empty.</p>
          ) : (
            <div className="ghost-library-list">
              {/* ... existing list code ... */}
              {libraryItems.map((item) => (
                <div key={item.id} className="ghost-card">
                  {/* ... existing card code ... */}
                  <h4>{item.title.substring(0, 40)}{item.title.length > 40 ? '...' : ''}</h4>
                  <div className="ghost-card-meta">
                    <span>{item.siteName}</span>
                    {item.embedding && <span title="AI Vector Ready">🧠</span>}
                  </div>
                  <button className="ghost-delete-btn" onClick={() => handleDelete(item.id)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}