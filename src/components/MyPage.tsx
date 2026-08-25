import React, { useEffect } from 'react';
import { ArrowRight, ChevronRight, LogOut, Clock, Package, Truck, CheckCircle } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import type { CartItemType } from './CartDrawer';
import type { KakaoUserProfile } from '../kakaoAuth';

export interface CompareItem {
  id: string;
  name: string;
  image: string;
  volume: string;
}

interface MyPageProps {
  currentUser: User | null;
  kakaoUser?: KakaoUserProfile | null;
  cartItems: CartItemType[];
  compareList: CompareItem[];
  onNavigateHome: () => void;
  onNavigateDetail: () => void;
  onNavigateSearch: () => void;
  onNavigateShop?: () => void;
  onLogout: () => void;
}

const DUMMY_ORDERS = [
  { id: 'ORD-001', status: 'completed' as const, name: 'Do Son 75ML', date: '2026.08.01' },
];

const MENU_ITEMS = [
  { label: 'ORDER HISTORY', badge: null },
  { label: 'WISHLIST', badge: '3' },
  { label: 'ADDRESS BOOK', badge: null },
  { label: 'COUPONS', badge: null },
  { label: 'REVIEWS', badge: null },
  { label: 'PERSONAL INFO', badge: null },
];

const FOOTER_LINKS = ['SUSTAINABILITY', 'SHIPPING', 'CONTACT', 'BOUTIQUES'];

export const MyPage: React.FC<MyPageProps> = ({
  currentUser,
  kakaoUser,
  compareList,
  onNavigateHome,
  onNavigateDetail,
  onNavigateSearch,
  onNavigateShop,
  onLogout,
}) => {
  const handleLogout = async () => {
    try {
      // Firebase logout if signed in via Firebase
      if (currentUser) await signOut(auth);
      onLogout(); // App.tsx handles Kakao logout too
    } catch (err) {
      console.error('Logout failed:', err);
      onLogout();
    }
  };

  // Derive display info from whichever auth provider is active
  const displayName =
    currentUser?.displayName ||
    kakaoUser?.displayName ||
    'Diptyque Member';
  const photoURL =
    currentUser?.photoURL ||
    kakaoUser?.photoURL ||
    null;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div style={styles.pageContainer} className="animate-fade-in">
      <style>{`
        .mypage-menu-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 17px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: background-color 200ms ease;
          background: transparent;
          border-left: none;
          border-right: none;
          border-top: none;
          width: 100%;
          text-align: left;
        }
        .mypage-menu-item:hover {
          background-color: rgba(255, 255, 255, 0.04);
        }
        .order-status-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex: 1;
        }
        .status-icon-wrap {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .status-icon-wrap svg {
          color: #ffffff;
          opacity: 0.85; /* Same visual weight and brightness */
          transition: opacity 0.2s ease;
        }
        .status-icon-wrap.active svg {
          opacity: 1;
        }
        .compare-slot {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .compare-image-wrap {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2.2px solid rgba(255, 255, 255, 0.65); /* Thicker border and higher opacity */
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 255, 255, 0.05);
          overflow: hidden;
        }
        .compare-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .compare-question {
          font-size: 32px;
          color: rgba(255, 255, 255, 0.9); /* Brighter question mark */
          font-weight: 500; /* Thicker font weight */
          font-family: var(--font-serif);
        }
        .compare-action-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-family: var(--font-sans);
          font-size: 11px;
          letter-spacing: 0.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          transition: color 200ms ease;
          margin-top: 16px;
        }
        .compare-action-btn:hover {
          color: #f5f1e8;
        }
        .logout-link {
          background: none;
          border: none;
          font-family: var(--font-sans);
          font-size: 10px;
          letter-spacing: 1px;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 200ms ease;
          padding: 0;
        }
        .logout-link:hover {
          color: rgba(255, 255, 255, 0.8);
        }
        .header-logo-btn {
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          background: transparent;
          border: none;
          padding: 0;
        }
        .header-logo-btn:hover span {
          color: #EAEAEA !important;
        }
      `}</style>

      {/* ─── Profile Section ─── */}
      <section style={styles.profileSection}>
        <p style={styles.myDiptyqueLabel}>MY DIPTYQUE</p>

        <div style={styles.profileRow}>
          {photoURL ? (
            <img src={photoURL} alt="Profile" style={styles.profileAvatar} />
          ) : (
            <div style={styles.profileInitial}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={styles.profileInfo}>
            <h1 style={styles.profileName}>{displayName}</h1>
            <div style={styles.memberRow}>
              <span style={styles.memberBadge}>GOLD MEMBER</span>
              <span style={styles.pointsText}>2,450 Pts</span>
            </div>
          </div>
          <button className="logout-link" onClick={handleLogout}>
            <LogOut size={12} strokeWidth={1.5} />
          </button>
        </div>
      </section>

      <div style={styles.divider} />

      {/* ─── Fragrance Archive (Compare) ─── */}
      <section style={styles.compareSection}>
        <p style={styles.editorialLabel}>EDITORIAL ARCHIVE</p>
        <h2 style={styles.compareTitle}>선택한 향수 비교</h2>

        <div style={styles.compareRow}>
          {/* Left slot */}
          <div className="compare-slot">
            <div className="compare-image-wrap">
              {compareList[0] ? (
                <img src={compareList[0].image} alt={compareList[0].name} />
              ) : (
                <span className="compare-question">?</span>
              )}
            </div>
            {compareList[0] && (
              <span style={styles.compareItemName}>{compareList[0].name.toUpperCase()}</span>
            )}
          </div>

          {/* VS center */}
          <div style={styles.vsContainer}>
            <span style={styles.vsText}>VS</span>
          </div>

          {/* Right slot */}
          <div className="compare-slot">
            <div className="compare-image-wrap">
              {compareList[1] ? (
                <img src={compareList[1].image} alt={compareList[1].name} />
              ) : (
                <span className="compare-question">?</span>
              )}
            </div>
            {compareList[1] && (
              <span style={styles.compareItemName}>{compareList[1].name.toUpperCase()}</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        {compareList.length === 0 ? (
          <button className="compare-action-btn" onClick={() => onNavigateShop?.()}>
            향 담으러가기 <ArrowRight size={12} strokeWidth={1.5} />
          </button>
        ) : compareList.length === 1 ? (
          <button className="compare-action-btn" onClick={() => onNavigateShop?.()}>
            향 더 담으러가기 <ArrowRight size={12} strokeWidth={1.5} />
          </button>
        ) : (
          <button className="compare-action-btn" onClick={onNavigateDetail}>
            향 비교하기 <ArrowRight size={12} strokeWidth={1.5} />
          </button>
        )}
      </section>

      <div style={styles.divider} />

      {/* ─── Order Status ─── */}
      <section style={styles.orderStatusSection}>
        {(['pending', 'preparing', 'shipping', 'completed'] as const).map((status) => (
          <div key={status} className="order-status-step">
            <div className={`status-icon-wrap ${DUMMY_ORDERS[0]?.status === status ? 'active' : ''}`}>
              {status === 'pending' && <Clock size={24} strokeWidth={1.6} />}
              {status === 'preparing' && <Package size={24} strokeWidth={1.6} />}
              {status === 'shipping' && <Truck size={24} strokeWidth={1.6} />}
              {status === 'completed' && <CheckCircle size={24} strokeWidth={1.6} />}
            </div>
            <span style={styles.statusLabel}>{status.toUpperCase()}</span>
          </div>
        ))}
      </section>

      <div style={styles.divider} />

      {/* ─── Menu Items ─── */}
      <nav style={styles.menuSection}>
        {MENU_ITEMS.map((item) => (
          <button
            key={item.label}
            className="mypage-menu-item"
            onClick={() => alert(`${item.label} - 준비 중입니다.`)}
          >
            <span style={styles.menuLabel}>
              {item.label}
              {item.badge && <span style={styles.menuBadge}> ({item.badge})</span>}
            </span>
            <ChevronRight size={14} strokeWidth={1.2} color="rgba(255,255,255,0.4)" />
          </button>
        ))}
      </nav>

      <div style={styles.divider} />

      {/* ─── Footer links ─── */}
      <div style={styles.footerLinksSection}>
        {FOOTER_LINKS.map((link) => (
          <button
            key={link}
            style={styles.footerLink}
            onClick={() => alert(`${link} - 준비 중입니다.`)}
          >
            {link}
          </button>
        ))}
        <p style={styles.copyright}>© 2024 DIPTYQUE PARIS</p>
      </div>

      </div>
      <BottomNav
        onHomeClick={onNavigateHome}
        onSearchClick={onNavigateSearch}
        onShopClick={onNavigateShop}
        activeTab="my"
      />
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#000000',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '80px',
  },
  profileSection: {
    padding: '28px 24px 24px',
    paddingTop: '92px', // 64px fixed header + 28px original top spacing
    backgroundColor: '#000000',
  },
  myDiptyqueLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '10px',
    letterSpacing: '2px',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: '14px',
    textAlign: 'center' as const,
  },
  profileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  profileAvatar: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    flexShrink: 0,
  },
  profileInitial: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    color: '#ffffff',
    flexShrink: 0,
  },
  profileInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  profileName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '22px',
    fontWeight: 400,
    color: '#ffffff',
    letterSpacing: '0.3px',
    margin: 0,
  },
  memberRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  memberBadge: {
    fontFamily: 'var(--font-sans)',
    fontSize: '9px',
    letterSpacing: '1.2px',
    color: '#b8966a',
    border: '1px solid #b8966a',
    padding: '2px 7px',
    borderRadius: '2px',
  },
  pointsText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: '0.3px',
  },
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  compareSection: {
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  editorialLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '9px',
    letterSpacing: '2.5px',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '6px',
    textAlign: 'center' as const,
  },
  compareTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '16px',
    fontWeight: 400,
    color: '#ffffff',
    letterSpacing: '0.5px',
    marginBottom: '24px',
    textAlign: 'center' as const,
    margin: '0 0 24px',
  },
  compareRow: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: '0px',
  },
  vsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '48px',
  },
  vsText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    letterSpacing: '2px',
    color: 'rgba(255,255,255,0.5)',
  },
  compareItemName: {
    fontFamily: 'var(--font-sans)',
    fontSize: '9px',
    letterSpacing: '1.5px',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center' as const,
    marginTop: '4px',
  },
  orderStatusSection: {
    display: 'flex',
    padding: '20px 16px',
    gap: '4px',
  },
  statusLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '8px',
    letterSpacing: '1px',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center' as const,
  },
  menuSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100%',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  menuLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    letterSpacing: '1.5px',
    color: 'rgba(255,255,255,0.85)',
  },
  menuBadge: {
    color: 'rgba(255,255,255,0.5)',
  },
  footerLinksSection: {
    padding: '32px 24px 40px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '14px',
  },
  footerLink: {
    background: 'none',
    border: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '10px',
    letterSpacing: '1.5px',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    padding: '0',
    textDecoration: 'underline',
    transition: 'color 200ms ease',
  },
  copyright: {
    fontFamily: 'var(--font-sans)',
    fontSize: '9px',
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: '0.5px',
    marginTop: '6px',
  },
};

