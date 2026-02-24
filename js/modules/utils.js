
import DOMPurify from 'dompurify';

/**
 * Utility Functions for Lyra the Wise
 */

export function calculateModifier(score) {
    return Math.floor((score - 10) / 2);
}

export function formatModifier(val) {
    const mod = calculateModifier(val);
    return mod >= 0 ? `+${mod}` : mod;
}

export async function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            // Calculate new dimensions (square crop)
            const size = Math.min(img.width, img.height);
            const sx = (img.width - size) / 2;
            const sy = (img.height - size) / 2;

            canvas.width = maxWidth;
            canvas.height = maxHeight;

            // Draw cropped and resized image
            ctx.drawImage(img, sx, sy, size, size, 0, 0, maxWidth, maxHeight);

            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Falha ao processar imagem'));
            }, 'image/jpeg', 0.7);
        };

        img.onerror = () => reject(new Error('Falha ao carregar imagem'));
        img.src = URL.createObjectURL(file);
    });
}

export function getNestedValue(obj, path) {
    if (!path) return undefined;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
        if (current === undefined || current === null) return undefined;
        current = current[part];
    }
    return current;
}

export function setNestedValue(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
}


export function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export const sanitizeHTML = escapeHTML;

export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function parseMarkdown(text) {
    if (!text) return '';
    // SECURITY: escapeHTML() first, then format. DOMPurify as final safety net.
    let html = escapeHTML(text); // Sanitize first

    // Blockquotes
    html = html.replace(/^\s*&gt;\s+(.*)/gim, '<blockquote>$1</blockquote>');

    // Headers
    html = html.replace(/^###\s+(.*)/gim, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.*)/gim, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.*)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Inline Code
    html = html.replace(/`(.*?)`/gim, '<code>$1</code>');

    // Lists (simple conversion)
    html = html.replace(/^\s*[\-\*]\s+(.*)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>'); // Note: This is a very simple list conversion, might need refinement for nested lists

    // Fix multiple ULs
    html = html.replace(/<\/ul>\s*<ul>/gim, '');

    // Newlines (only if not already converted to block elements)
    html = html.replace(/\n/g, '<br>');

    // Clean up empty lines or double breaks
    html = html.replace(/<br><br>/g, '<br>');

    // SECURITY: DOMPurify como camada final de proteção
    html = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'strong', 'em', 'code', 'blockquote', 'ul', 'li', 'br', 'p'],
        ALLOWED_ATTR: []
    });

    return html;
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function translateFirebaseError(error) {
    const code = error.code || error.message || '';

    if (code.includes('permission-denied')) {
        return 'Os anais arcanos barram seu acesso. Permissão negada.';
    }
    if (code.includes('network-request-failed')) {
        return 'A conexão com a Trama foi interrompida. Verifique seu sinal.';
    }
    if (code.includes('user-not-found') || code.includes('wrong-password')) {
        return 'Identidade não reconhecida ou senha incorreta.';
    }
    if (code.includes('email-already-in-use')) {
        return 'Este elo de alma (e-mail) já está vinculado a outro ser.';
    }
    if (code.includes('resource-exhausted')) {
        return 'Muitas petições enviadas em pouco tempo. Aguarde a Trama se estabilizar.';
    }

    return `Um erro arcano ocorreu: ${error.message}`;
}
