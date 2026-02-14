import { createBrowserClient } from '@supabase/ssr'

/**
 * 🚨 CRITICAL AUTH SANITIZATION LAYER 🚨
 * 
 * This block intercepts and purges corrupted Supabase session data (truncated JSON or double-stringified tokens)
 * before the Gotrue client attempts to initialize. This specifically fixes the:
 * 'TypeError: Cannot create property user on string' crash.
 */
if (typeof window !== 'undefined') {
  try {
    const isCorrupted = (val: string | null) => {
      if (!val) return false;
      try {
        const p = JSON.parse(val);
        // If it parses to a string instead of an object, it's double-encoded or truncated
        if (typeof p !== 'object' || p === null) return true;
        // If it's an object but doesn't look like a Supabase session, it's suspect
        if (!p.access_token && !p.user && !p.refresh_token) return true;
        return false;
      } catch (e) {
        // If it fails to parse but looks like it should be JSON, it's truncated/corrupted
        return val.trim().startsWith('{');
      }
    };

    // 1. Sanitize Local Storage
    const storageKeys = Object.keys(localStorage);
    storageKeys.forEach(key => {
      if (key.includes('-auth-token')) {
        if (isCorrupted(localStorage.getItem(key))) {
          console.warn('🗑️ Purging corrupted localStorage key:', key);
          localStorage.removeItem(key);
        }
      }
    });

    // 2. Sanitize Cookies (Handles chunked cookies: sb-id-auth-token.0, .1 etc)
    const cookies = document.cookie.split(';');
    const clearPaths = ['/', '/login', '/dashboard', '/profile'];
    
    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name.includes('-auth-token')) {
        const value = decodeURIComponent(cookie.split('=')[1] || '');
        if (isCorrupted(value)) {
          console.warn('🗑️ Detected corrupted auth cookie:', name);
          
          // If it's a chunked cookie (e.g., sb-xyz-auth-token.0), find the base name
          const baseName = name.includes('.') ? name.split('.').slice(0, -1).join('.') : name;
          
          // Purge all related chunks and the base cookie
          cookies.forEach(c => {
            const [cName] = c.trim().split('=');
            if (cName.startsWith(baseName)) {
              clearPaths.forEach(path => {
                document.cookie = `${cName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
                document.cookie = `${cName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${window.location.hostname};`;
              });
              console.warn('   - Purged:', cName);
            }
          });
        }
      }
    });

  } catch (err) {
    console.error('Auth sanitization exception:', err);
  }
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
