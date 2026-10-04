export type Theme = 'light' | 'dark' | 'auto';

export const THEME_STORAGE_KEY = 'vf_theme';

/** Runs before first paint (inlined in the layout) so the saved theme never flashes. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}})()`;
