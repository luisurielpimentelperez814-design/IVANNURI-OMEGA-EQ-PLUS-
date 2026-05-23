/**
 * TIDAL Service — PKCE OAuth 2.0 Direct (no BFF)
 */

const TIDAL_API_BASE = 'https://openapi.tidal.com/v2';
const TIDAL_AUTH_URL = 'https://login.tidal.com/oauth2/authorize';
const TIDAL_TOKEN_URL = 'https://auth.tidal.com/v1/oauth2/token';

export interface TidalTrack {
  id: number;
  title: string;
  artist: { name: string; id: number };
  album: { id: number; title: string; cover: string };
  duration: number;
  quality: 'HI_RES' | 'LOSSLESS' | 'HIGH' | 'LOW';
  isrc?: string;
  releaseDate?: string;
  copyright?: string;
}

function base64urlEncode(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generatePKCE() {
  const verifier = base64urlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = base64urlEncode(digest);
  return { verifier, challenge };
}

export class TidalService {
  private clientId: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(clientId: string) {
    this.clientId = clientId || localStorage.getItem('tidal_client_id') || '';
    this.accessToken = localStorage.getItem('tidal_access_token');
    this.refreshToken = localStorage.getItem('tidal_refresh_token');
  }

  setClientId(id: string) {
    this.clientId = id;
    localStorage.setItem('tidal_client_id', id);
  }

  getClientId() { return this.clientId; }
  getClientSecret() { return ''; } // PKCE doesn't use secret
  getAccessToken() { return this.accessToken; }
  isAuthenticated() { return !!this.accessToken && this.accessToken.length > 20; }

  setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('tidal_access_token', token);
  }

  async login() {
    if (!this.clientId) {
      alert('Primero ingresa tu Client ID en la pestaña de configuración TIDAL');
      return;
    }
    const { verifier, challenge } = await generatePKCE();
    sessionStorage.setItem('pkce_verifier', verifier);
    const redirectUri = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: 'r_usr w_usr',
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });
    window.location.href = `${TIDAL_AUTH_URL}?${params}`;
  }

  async handleCallback(code: string): Promise<boolean> {
    const verifier = sessionStorage.getItem('pkce_verifier');
    if (!verifier) return false;
    const redirectUri = window.location.origin + window.location.pathname;
    try {
      const resp = await fetch(TIDAL_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          code,
          redirect_uri: redirectUri,
          code_verifier: verifier,
        }),
      });
      const data = await resp.json();
      if (data.access_token) {
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        localStorage.setItem('tidal_access_token', data.access_token);
        if (data.refresh_token) localStorage.setItem('tidal_refresh_token', data.refresh_token);
        sessionStorage.removeItem('pkce_verifier');
        return true;
      }
    } catch (e) { console.error('Token exchange failed:', e); }
    return false;
  }

  async refreshAccessToken(): Promise<boolean> {
    const rt = this.refreshToken || localStorage.getItem('tidal_refresh_token');
    if (!rt) return false;
    try {
      const resp = await fetch(TIDAL_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'refresh_token', client_id: this.clientId, refresh_token: rt }),
      });
      const data = await resp.json();
      if (data.access_token) { this.setAccessToken(data.access_token); return true; }
    } catch { }
    return false;
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('tidal_access_token');
    localStorage.removeItem('tidal_refresh_token');
  }

  async search(query: string, limit = 20): Promise<TidalTrack[]> {
    if (!this.isAuthenticated()) return this.getDemoTracks();
    try {
      const resp = await fetch(
        `${TIDAL_API_BASE}/searchresults/${encodeURIComponent(query)}?countryCode=US&include=tracks&limit=${limit}`,
        { headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/vnd.tidal.v1+json' } }
      );
      if (resp.status === 401) {
        const refreshed = await this.refreshAccessToken();
        if (!refreshed) { this.logout(); return this.getDemoTracks(); }
        return this.search(query, limit);
      }
      if (!resp.ok) return this.getDemoTracks();
      const data = await resp.json();
      const items = data.tracks?.items || data.data || [];
      return items.map((item: any) => ({
        id: item.id,
        title: item.title,
        artist: { name: item.artists?.[0]?.name || item.artist?.name || 'Unknown', id: item.artists?.[0]?.id || 0 },
        album: {
          id: item.album?.id || 0, title: item.album?.title || '', 
          cover: item.album?.imageCover?.[0]?.url || `https://resources.tidal.com/images/${(item.album?.cover||'').replace(/-/g,'/')}/640x640.jpg`
        },
        duration: item.duration || 0,
        quality: item.audioQuality || 'HIGH',
        isrc: item.isrc,
      }));
    } catch { return this.getDemoTracks(); }
  }

  authenticateClientCredentials() { return this.login(); }
  setClientSecret(_s: string) {}
  getClientSecret_() { return ''; }

  private getDemoTracks(): TidalTrack[] {
    return [
      { id: 101, title: 'Get Lucky', artist: { name: 'Daft Punk', id: 1 }, album: { id: 1, title: 'Random Access Memories', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400' }, duration: 248, quality: 'LOSSLESS' },
      { id: 102, title: 'Starboy', artist: { name: 'The Weeknd', id: 2 }, album: { id: 2, title: 'Starboy', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400' }, duration: 230, quality: 'HI_RES' },
      { id: 103, title: 'Blinding Lights', artist: { name: 'The Weeknd', id: 2 }, album: { id: 3, title: 'After Hours', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400' }, duration: 200, quality: 'HI_RES' },
      { id: 104, title: 'One More Time', artist: { name: 'Daft Punk', id: 1 }, album: { id: 4, title: 'Discovery', cover: 'https://images.unsplash.com/photo-1459749411177-042180ceea72?w=400&h=400' }, duration: 320, quality: 'LOSSLESS' },
      { id: 105, title: 'Instant Crush', artist: { name: 'Daft Punk', id: 1 }, album: { id: 1, title: 'Random Access Memories', cover: 'https://images.unsplash.com/photo-1514525253344-f85653b7419f?w=400&h=400' }, duration: 337, quality: 'LOSSLESS' },
      { id: 106, title: 'Levitating', artist: { name: 'Dua Lipa', id: 3 }, album: { id: 5, title: 'Future Nostalgia', cover: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400' }, duration: 203, quality: 'HI_RES' },
      { id: 107, title: 'Circles', artist: { name: 'Post Malone', id: 4 }, album: { id: 6, title: "Hollywood's Bleeding", cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400' }, duration: 215, quality: 'HIGH' },
      { id: 108, title: 'bad guy', artist: { name: 'Billie Eilish', id: 5 }, album: { id: 7, title: 'WHEN WE ALL FALL ASLEEP', cover: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=400' }, duration: 194, quality: 'LOSSLESS' },
    ];
  }
}
