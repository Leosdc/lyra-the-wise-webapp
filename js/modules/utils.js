
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
