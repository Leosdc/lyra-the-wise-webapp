import DOMPurify from 'dompurify';

export const ChangelogModule = {

    async loadChangelog() {
        try {
            // Add cache buster
            const response = await fetch(`/changelog.md?v=${Date.now()}`);
            if (!response.ok) throw new Error(`Status HTTP: ${response.status}`);
            const text = await response.text();
            const html = this.parseChangelog(text);

            const container = document.querySelector('.changelog-list');
            if (container) {
                container.innerHTML = DOMPurify.sanitize(html);
            }
        } catch (error) {
            console.error("Erro no Changelog:", error);
            const container = document.querySelector('.changelog-list');
            if (container) {
                container.innerHTML = `<div class="changelog-item">
                    <p>Não foi possível ler os pergaminhos antigos...</p>
                    <small style="color:red; display:block; margin-top:0.5rem;">${error.message}</small>
                </div>`;
            }
        }
    },

    parseChangelog(markdown) {
        // Split by version headers (e.g. ## [2.3.0])
        const versions = markdown.split(/^## /gm).slice(1); // Skip preamble
        let html = '';

        // Show only the latest version (first one)
        if (versions.length > 0) {
            const versionBlock = versions[0];
            const lines = versionBlock.trim().split('\n');
            const headerLine = lines[0]; // "[2.3.0] - DATE"

            // Extract version and title if present
            // Expected format: [2.3.0] - 2026-01-23 OR [2.3.0] - 2026-01-23 \n ### Title

            // Allow for a sub-header line (### Title)
            let title = '';
            let contentLines = lines.slice(1);

            // Check if second line is a sub-header (### Title)
            if (contentLines.length > 0 && contentLines[0].startsWith('### ')) {
                title = contentLines[0].replace('### ', '').trim();
                contentLines = contentLines.slice(1);
            }

            // Extract version number for display
            const versionMatch = headerLine.match(/\[(.*?)\]/);
            const versionNum = versionMatch ? `v${versionMatch[1]}` : 'Versão Antiga';

            // Build Item HTML
            html += `<div class="changelog-container">`;
            html += `<div class="changelog-header-thematic">
                        <span class="version-tag">${versionNum}</span>
                        <h3 class="changelog-title">${title || 'Crônicas do Verso'}</h3>
                    </div>`;
            html += `<div class="changelog-content-body">`;
            html += `<ul class="changelog-features-list">`;

            contentLines.forEach(line => {
                line = line.trim();
                if (line.startsWith('- ')) {
                    // Split feature and description
                    const parts = line.substring(2).split(':');
                    let feature = parts[0] ? parts[0].trim() : '';
                    let desc = parts[1] ? parts[1].trim() : '';

                    // Parse bold (**text**) in feature and description
                    feature = feature.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    let finalText = desc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                    html += `<li>
                                <div class="feature-line">
                                    <i class="fa-solid fa-bolt-lightning feature-icon"></i>
                                    <span class="feature-name">${feature}</span>
                                    <span class="feature-sep">${desc ? ':' : ''}</span>
                                    <span class="feature-desc">${finalText}</span>
                                </div>
                             </li>`;
                }
            });

            html += `</ul></div></div>`;
        } // End if versions > 0

        return html;
    }
};
