import React, { useState, useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { auth, db } from '../firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { kakaoLogin } from '../kakaoAuth';
import type { KakaoUserProfile } from '../kakaoAuth';

// Import icons as ES modules
import kakaoIconImg from '../../assets_1/Kakao_Login.png';
import googleIconImg from '../../assets_1/Google_Login.png';
import mailIconImg from '../../assets_1/Mail_Login.png';

interface LoginPageProps {
  onBack: () => void;
  currentUser: User | null;
  kakaoUser?: KakaoUserProfile | null;
  onKakaoLogin?: (user: KakaoUserProfile) => void;
  onNavigateMyPage?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBack,
  currentUser,
  kakaoUser,
  onKakaoLogin,
  onNavigateMyPage,
}) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Firestore user profile save/merge logic
  const saveUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
        });
      } else {
        await setDoc(userRef, {
          displayName: user.displayName || docSnap.data()?.displayName || '',
          photoURL: user.photoURL || docSnap.data()?.photoURL || '',
        }, { merge: true });
      }
    } catch (err) {
      console.error('Failed to save user profile in Firestore:', err);
    }
  };

  // ── Kakao login handler ─────────────────────────────────────────────────
  const handleKakaoSignIn = async () => {
    try {
      const user = await kakaoLogin();
      // Also save to Firestore using Kakao uid
      try {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email || '',
            photoURL: user.photoURL || '',
            provider: 'kakao',
            createdAt: serverTimestamp(),
          });
        }
      } catch (fsErr) {
        console.warn('[Kakao] Firestore save failed (non-critical):', fsErr);
      }
      if (onKakaoLogin) onKakaoLogin(user);
    } catch (err: any) {
      console.error('[Kakao] sign-in failed:', err);
      alert(`카카오 로그인 실패: ${err?.message ?? String(err)}`);
    }
  };

  // ── Google OAuth sign-in flow ───────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    console.log('Google Sign-In button clicked');
    try {
      const provider = new GoogleAuthProvider();
      console.log('Firebase auth instance:', auth);
      console.log('Firebase provider instance:', provider);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google login success:', user);
      await saveUserProfile(user);
      alert(`로그인 성공: ${user.displayName || user.email}`);
      onBack(); // Return home on success
    } catch (error: any) {
      console.error('Google login failed error:', error);
      alert(`로그인 실패: ${error.code || error.message}`);
    }
  };

  // Handle Email/Password sign-in and sign-up flows
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email Sign-In form submitted:', email);
    try {
      let user: User;
      if (isRegisterMode) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        user = result.user;
        alert(`회원가입 및 로그인 성공: ${user.email}`);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        user = result.user;
        alert(`로그인 성공: ${user.email}`);
      }
      await saveUserProfile(user);
      setShowEmailModal(false);
      onBack(); // Return home on success
    } catch (error: any) {
      console.error('Email authentication failed error:', error);
      alert(`인증 실패: ${error.code || error.message}`);
    }
  };

  // Handle Sign Out flow
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('로그아웃 되었습니다.');
    } catch (err: any) {
      console.error('Logout failed:', err);
      alert(`로그아웃 실패: ${err.message}`);
    }
  };

  // Auto-redirect: logged in via Kakao
  useEffect(() => {
    if (kakaoUser && onNavigateMyPage) {
      onNavigateMyPage();
    }
  }, [kakaoUser, onNavigateMyPage]);

  // Auto-redirect to MyPage after 5 seconds on welcome screen (Firebase)
  useEffect(() => {
    if (currentUser && onNavigateMyPage) {
      const timer = setTimeout(() => {
        onNavigateMyPage();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, onNavigateMyPage]);

  // 1. If user is logged in, show Welcome screen (auto-redirects to MyPage after 5s)
  if (currentUser) {
    return (
      <div style={styles.pageContainer} className="animate-fade-in">
        <style>{`
          .logout-btn {
            width: 100%;
            height: 50px;
            background-color: transparent;
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #ffffff;
            font-family: var(--font-sans);
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 1.5px;
            cursor: pointer;
            transition: all 250ms ease;
            margin-top: 32px;
          }
          
          .logout-btn:hover {
            background-color: #ffffff;
            color: #000000;
            border-color: #ffffff;
          }

          .header-logo-btn {
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            background: transparent;
            border: none;
            padding: 0;
            transition: opacity 0.2s ease;
          }
          
          .header-logo-btn:hover span {
            color: #EAEAEA !important;
          }
        `}</style>

        {/* Header */}
        <header style={styles.header}>
          <button style={styles.backButton} aria-label="Go Back" onClick={onBack}>
            <ArrowLeft size={20} strokeWidth={1.2} color="#ffffff" />
          </button>
          <button 
            style={styles.logoContainer} 
            onClick={onBack}
            className="header-logo-btn"
            aria-label="Diptyque Home"
          >
            <span style={styles.logoText}>DIPTYQUE</span>
          </button>
        </header>

        {/* Profile Card Info */}
        <div style={styles.profileMain}>
          <h1 style={styles.profileWelcome}>
            Welcome, {currentUser.displayName || 'Diptyque Member'}
          </h1>
          
          <div style={styles.avatarContainer}>
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'D'}
              </div>
            )}
          </div>

          <div style={styles.profileDetails}>
            <span style={styles.profileLabel}>EMAIL ADDRESS</span>
            <span style={styles.profileVal}>{currentUser.email || 'N/A'}</span>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        </div>

        <footer style={styles.footer}>
          <span style={styles.footerText}>© DIPTYQUE 2026</span>
        </footer>
      </div>
    );
  }

  // 2. If user is logged out, render the login buttons
  return (
    <div style={styles.pageContainer} className="animate-fade-in">
      {/* Self-contained CSS for high-performance hover states */}
      <style>{`
        .login-btn {
          width: 100%;
          height: 56px;
          background-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: background-color 280ms ease-in-out, border-color 280ms ease-in-out;
          margin-bottom: 12px;
        }

        .login-btn:hover {
          background-color: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .login-btn-icon {
          width: 18px;
          height: 18px;
          object-fit: contain;
        }

        .login-link {
          font-family: var(--font-serif);
          font-size: 13px;
          color: #b0b0b0;
          text-decoration: none;
          transition: color 250ms ease;
          margin-top: 24px;
          display: inline-block;
        }

        .login-link-highlight {
          color: #ffffff;
          transition: color 250ms ease;
          cursor: pointer;
        }

        .login-link-highlight:hover {
          color: #f5f1e8 !important;
        }

        .guest-link {
          font-family: var(--font-serif);
          font-size: 13px;
          color: #ffffff;
          text-decoration: none;
          margin-top: 16px;
          display: inline-block;
          opacity: 0.85;
          transition: opacity 250ms ease, color 250ms ease;
        }

        .guest-link:hover {
          opacity: 1;
          color: #f5f1e8;
        }

        .header-logo-btn {
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          background: transparent;
          border: none;
          padding: 0;
          transition: opacity 0.2s ease;
        }
        
        .header-logo-btn:hover span {
          color: #EAEAEA !important;
        }

        /* Modal focus state */
        .modal-input-field:focus {
          border-color: #000000 !important;
          outline: none;
        }
      `}</style>

      {/* Header (Fixed at top of page) */}
      <header style={styles.header}>
        <button style={styles.backButton} aria-label="Go Back" onClick={onBack}>
          <ArrowLeft size={20} strokeWidth={1.2} color="#ffffff" />
        </button>
        <button 
          style={styles.logoContainer} 
          onClick={onBack}
          className="header-logo-btn"
          aria-label="Diptyque Home"
        >
          <span style={styles.logoText}>DIPTYQUE</span>
        </button>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        {/* Dark Opaque Overlay (35% opacity) */}
        <div style={styles.overlay} />
        
        {/* Centered Texts */}
        <div style={styles.heroTextContainer}>
          <h1 style={styles.title}>
            Enter the World
            <br />
            of Diptyque
          </h1>
          <p style={styles.subTitle}>
            A timeless journey through fragrance and light.
          </p>
        </div>
      </section>

      {/* Action Buttons Section */}
      <section style={styles.actionsSection}>
        {/* Kakao Login */}
        <button 
          className="login-btn" 
          onClick={handleKakaoSignIn}
        >
          <img 
            src={kakaoIconImg} 
            alt="Kakao" 
            className="login-btn-icon" 
          />
          카카오로 시작하기
        </button>

        {/* Google Login */}
        <button 
          className="login-btn" 
          onClick={handleGoogleSignIn}
        >
          <img 
            src={googleIconImg} 
            alt="Google" 
            className="login-btn-icon" 
          />
          구글로 시작하기
        </button>

        {/* Email Login */}
        <button 
          className="login-btn" 
          onClick={() => setShowEmailModal(true)}
        >
          <img 
            src={mailIconImg} 
            alt="Email" 
            className="login-btn-icon" 
            style={{ width: '16px', height: '14px' }}
          />
          CONTINUE WITH EMAIL
        </button>

        {/* Links */}
        <div style={styles.linksContainer}>
          <span className="login-link">
            Already have an account?{' '}
            <span className="login-link-highlight" onClick={() => {
              setIsRegisterMode(false);
              setShowEmailModal(true);
            }}>
              Log in.
            </span>
          </span>
          
          <span className="guest-link" onClick={onBack} style={{ cursor: 'pointer' }}>
            Guest Checkout
          </span>
        </div>
      </section>

      {/* Footer bar */}
      <footer style={styles.footer}>
        <span style={styles.footerText}>© DIPTYQUE 2026</span>
      </footer>

      {/* Email Authentication Modal Overlay */}
      {showEmailModal && (
        <div style={styles.modalOverlay} onClick={() => setShowEmailModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isRegisterMode ? 'CREATE AN ACCOUNT' : 'LOGIN WITH EMAIL'}
              </h3>
              <button 
                style={styles.modalCloseBtn} 
                onClick={() => setShowEmailModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form style={styles.modalForm} onSubmit={handleEmailAuthSubmit}>
              <div style={styles.modalInputGroup}>
                <label style={styles.modalLabel}>EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  className="modal-input-field"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.modalInput}
                  placeholder="name@example.com"
                />
              </div>

              <div style={styles.modalInputGroup}>
                <label style={styles.modalLabel}>PASSWORD</label>
                <input 
                  type="password" 
                  className="modal-input-field"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.modalInput}
                  placeholder="******"
                />
              </div>

              <button type="submit" style={styles.modalSubmitBtn}>
                {isRegisterMode ? 'SIGN UP' : 'SIGN IN'}
              </button>

              <p style={styles.modalToggleText}>
                {isRegisterMode ? 'Already have an account?' : "Don't have an account yet?"}
                <span 
                  style={styles.modalToggleLink}
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                >
                  {isRegisterMode ? 'Sign In' : 'Sign Up'}
                </span>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#000000',
    minHeight: '100vh',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '64px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 16px',
    zIndex: 10,
    backgroundColor: '#000000',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8px',
    background: 'transparent',
    cursor: 'pointer',
    zIndex: 11,
  },
  logoContainer: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    fontWeight: 300,
    letterSpacing: '3px',
    color: '#ffffff',
    userSelect: 'none',
    transition: 'color 200ms ease',
  },
  heroSection: {
    width: '100%',
    height: '530px',
    paddingTop: '64px',
    backgroundImage: 'url("/assets_1/Login_Overlay.png"), url("/assets_1/Login_background.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: '20px',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    opacity: 0.38,
    zIndex: 1,
  },
  heroTextContainer: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '28px',
    fontWeight: 400,
    lineHeight: '1.25',
    color: '#ffffff',
    marginBottom: '8px',
  },
  subTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 300,
    lineHeight: '1.5',
    color: '#cccccc',
    letterSpacing: '0.5px',
    maxWidth: '260px',
  },
  actionsSection: {
    width: '100%',
    padding: '54px 24px 20px 24px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#000000',
  },
  linksContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '8px',
  },
  footer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px 0',
    backgroundColor: '#000000',
    marginTop: 'auto',
  },
  footerText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '9px',
    fontWeight: 300,
    color: '#666666',
    letterSpacing: '2px',
  },
  profileMain: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 24px 40px 24px',
    backgroundColor: '#000000',
    color: '#ffffff',
  },
  profileWelcome: {
    fontFamily: 'var(--font-serif)',
    fontSize: '22px',
    fontWeight: 400,
    color: '#ffffff',
    marginBottom: '32px',
    textAlign: 'center',
  },
  avatarContainer: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '32px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    fontSize: '36px',
    fontFamily: 'var(--font-serif)',
    color: '#ffffff',
    fontWeight: 300,
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    width: '100%',
  },
  profileLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '10px',
    fontWeight: 600,
    color: '#888888',
    letterSpacing: '1px',
  },
  profileVal: {
    fontFamily: 'var(--font-serif)',
    fontSize: '15px',
    color: '#f5f1e8',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(3px)',
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 'calc(100% - 40px)',
    maxWidth: '340px',
    backgroundColor: '#ffffff',
    padding: '28px 24px',
    borderRadius: '0px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    color: '#000000',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modalTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  modalCloseBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalInputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  modalLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '9px',
    fontWeight: 600,
    color: '#888888',
    letterSpacing: '0.5px',
  },
  modalInput: {
    height: '42px',
    border: '1px solid #e2e2e2',
    padding: '0 12px',
    fontSize: '12px',
    color: '#000000',
    backgroundColor: '#ffffff',
    borderRadius: '0px',
    transition: 'border-color 0.2s ease',
  },
  modalSubmitBtn: {
    height: '46px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '1.5px',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'opacity 0.25s ease',
  },
  modalToggleText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '12px',
    color: '#666666',
  },
  modalToggleLink: {
    color: '#000000',
    textDecoration: 'underline',
    cursor: 'pointer',
    marginLeft: '4px',
  },
};
