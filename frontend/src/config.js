// One origin for desktop, tablet and HTTPS reverse proxies.
export const API_BASE = import.meta.env.VITE_API_URL || '/api';
export const SERVER_BASE = API_BASE.replace(/\/api\/?$/, '');
export const WS_URL = import.meta.env.VITE_WS_URL || `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws`;
