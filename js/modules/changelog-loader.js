
/**
 * Changelog Loader Module
 * Fetches changelog.md and renders it into the modal.
 */

export const ChangelogModule = {

    async loadChangelog() {
        try {
            // Add cache buster
            const response = await fetch(`changelog.md?v=${Date.now()}`);
            if (!response.ok) throw new Error(`Status HTTP: ${response.status}`);
            const text = await response.text();
            const html = this.parseChangelog(text);

            const container = document.querySelector('.changelog-list');
            if (container) {
                container.innerHTML = html;
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
            html += `<div class="changelog-item">`;
            html += `<h3>${versionNum} ${title ? '- ' + title : ''}</h3>`;
            html += `<ul>`;

            contentLines.forEach(line => {
                line = line.trim();
                if (line.startsWith('- ')) {
                    // Parse bold (**text**)
                    let text = line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    html += `<li><i class="fas fa-check"></i> ${text}</li>`;
                }
            });

            html += `</ul></div>`;
        } // End if versions > 0

        return html;
    }
};
