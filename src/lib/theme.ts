import { Theme, ThemeColors } from '../type/bubble';

export const themes: Record<Theme, ThemeColors> = {
 light: {
 primary: '#ffffff',
 secondary: '#f5f5f5',
 accent: '#e0e0e0'
 },
 dark: {
 primary: '#2d3748',
 secondary: '#1a202c',
 accent: '#4a5568'
 },
 gradient: {
 primary: '#ff9a9e',
 secondary: '#fecfef',
 accent: '#a8edea'
 },
 purple: {
 primary: '#667eea',
 secondary: '#764ba2',
 accent: '#f093fb'
 },
 orange: {
 primary: '#ffecd2',
 secondary: '#fcb69f',
 accent: '#ff8a80'
 },
 mint: {
 primary: '#a8edea',
 secondary: '#fed6e3',
 accent: '#d299c2'
 },
 neon: {
 primary: '#00d4ff',
 secondary: '#1a1a2e',
 accent: '#ff006e'
 },
 pastel: {
 primary: '#d299c2',
 secondary: '#fef9d7',
 accent: '#b8e6d2'
 }
};