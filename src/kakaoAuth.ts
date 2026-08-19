/**
 * Kakao JavaScript SDK utility module
 * Handles initialization and login/logout flows
 */

// Kakao global is injected via index.html SDK script
declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Auth: {
        login: (options: {
          success: (authObj: { access_token: string }) => void;
          fail: (err: unknown) => void;
        }) => void;
        logout: (callback?: () => void) => void;
        getStatusInfo: (callback: (statusObj: { status: string; user?: unknown }) => void) => void;
      };
      API: {
        request: (options: {
          url: string;
          success: (res: KakaoUserResponse) => void;
          fail: (err: unknown) => void;
        }) => void;
      };
    };
  }
}

export interface KakaoUserProfile {
  uid: string;           // "kakao_{id}"
  kakaoId: number;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  provider: 'kakao';
}

interface KakaoUserResponse {
  id: number;
  kakao_account?: {
    email?: string;
    email_needs_agreement?: boolean;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
  };
}

// ── Initialise SDK (idempotent) ──────────────────────────────────────────────
export function initKakao(): void {
  const key = import.meta.env.VITE_KAKAO_JS_KEY as string;
  if (!key) {
    console.warn('[Kakao] VITE_KAKAO_JS_KEY is not defined in .env');
    return;
  }
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(key);
    console.log('[Kakao] SDK initialized');
  }
}

// ── Login (popup) ────────────────────────────────────────────────────────────
export function kakaoLogin(): Promise<KakaoUserProfile> {
  return new Promise((resolve, reject) => {
    if (!window.Kakao?.Auth) {
      reject(new Error('Kakao SDK not loaded'));
      return;
    }

    window.Kakao.Auth.login({
      success: () => {
        // Fetch user profile after token is obtained
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (res: KakaoUserResponse) => {
            const profile = res.kakao_account?.profile;
            const user: KakaoUserProfile = {
              uid: `kakao_${res.id}`,
              kakaoId: res.id,
              displayName: profile?.nickname || '카카오 사용자',
              email: res.kakao_account?.email || null,
              photoURL: profile?.profile_image_url || null,
              provider: 'kakao',
            };
            // Persist to sessionStorage so page refresh keeps state
            sessionStorage.setItem('kakaoUser', JSON.stringify(user));
            resolve(user);
          },
          fail: (err) => {
            console.error('[Kakao] /v2/user/me failed', err);
            reject(err);
          },
        });
      },
      fail: (err) => {
        console.error('[Kakao] login failed', err);
        reject(err);
      },
    });
  });
}

// ── Logout ───────────────────────────────────────────────────────────────────
export function kakaoLogout(): Promise<void> {
  return new Promise((resolve) => {
    sessionStorage.removeItem('kakaoUser');
    if (window.Kakao?.Auth) {
      window.Kakao.Auth.logout(() => {
        console.log('[Kakao] logged out');
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// ── Restore session from sessionStorage ──────────────────────────────────────
export function getStoredKakaoUser(): KakaoUserProfile | null {
  try {
    const raw = sessionStorage.getItem('kakaoUser');
    return raw ? (JSON.parse(raw) as KakaoUserProfile) : null;
  } catch {
    return null;
  }
}
