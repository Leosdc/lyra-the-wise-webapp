/**
 * Lyra the Wise - Centralized Logger
 * Handles logging based on environment and provides a consistent interface.
 */

const isDev = import.meta.env.DEV;
const SILENCE_ALL = true; // Set to true to suppress all debug/info logs during review

export const logger = {
    /**
     * Standard debug logs - only visible in Dev mode
     */
    debug: (...args) => {
        if (isDev && !SILENCE_ALL) {
            console.log('%c[Lyra:DEBUG]', 'color: #3498db; font-weight: bold;', ...args);
        }
    },

    /**
     * Information logs - visible in Dev mode
     */
    info: (...args) => {
        if (isDev && !SILENCE_ALL) {
            console.info('%c[Lyra:INFO]', 'color: #27ae60; font-weight: bold;', ...args);
        }
    },

    /**
     * Warning logs - always visible, but formatted
     */
    warn: (...args) => {
        console.warn('%c[Lyra:WARN]', 'color: #f39c12; font-weight: bold;', ...args);
    },

    /**
     * Error logs - always visible, formatted
     */
    error: (...args) => {
        console.error('%c[Lyra:ERROR]', 'color: #c0392b; font-weight: bold;', ...args);
    }
};

export default logger;
