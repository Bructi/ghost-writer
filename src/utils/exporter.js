import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { db } from './db';

export async function exportBrain() {
    const zip = new JSZip();
    const snippets = await db.snippets.toArray();

    if (snippets.length === 0) {
        alert("Brain is empty. Go scan something first.");
        return;
    }

    // Create a folder inside the zip
    const folder = zip.folder("GhostWriter_Brain");

    snippets.forEach((note) => {
        // 1. Sanitize Filename (Remove illegal chars like / : * ? " < > |)
        const safeTitle = note.title.replace(/[/\\?%*:|"<>]/g, '-').substring(0, 50);
        const filename = `${safeTitle}.md`;

        // 2. Format Content (Markdown with YAML Frontmatter)
        const content = `---
title: "${note.title.replace(/"/g, '\\"')}"
source: "${note.url}"
site: "${note.siteName}"
date: ${new Date(note.timestamp).toISOString()}
---

# ${note.title}

> Source: [${note.siteName}](${note.url})

${note.text}
`;

        // 3. Add to Zip
        folder.file(filename, content);
    });

    // 4. Generate and Download
    const blob = await zip.generateAsync({ type: "blob" });
    const dateStr = new Date().toISOString().slice(0, 10);
    saveAs(blob, `GhostWriter_Backup_${dateStr}.zip`);
}