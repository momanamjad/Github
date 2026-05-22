// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const WS_URL = import.meta.env.VITE_WS_URL || 
  (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//localhost:3001';

// Session Management
export const SESSION_KEY = "terminal_session_lines";
export const MAX_SESSION_LINES = 200;
export const THEME_KEY = "terminal_selected_theme";

// Terminal Configuration
export const RECONNECT_TIMEOUT = 3000;
export const INITIAL_FONT_SIZE = 14;
export const MIN_FONT_SIZE = 8;
export const MAX_FONT_SIZE = 28;

// Dashboard update timing
export const DASHBOARD_UPDATE_DURATION = 1000; // 1 second spinner
