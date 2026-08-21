import React, { useEffect, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animateClose, setAnimateClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setAnimateClose(false);
    } else if (shouldRender) {
      setAnimateClose(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Wait for transition animation (300ms)
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const isVisible = isOpen && !animateClose;

  return (
    <div style={styles.menuContainer}>
      {/* Dimmed Backdrop */}
      <div 
        style={{
          ...styles.backdrop,
          opacity: isVisible ? 1 : 0,
        }}
        onClick={onClose}
      />

      {/* Slide-out Menu Panel */}
      <div 
        style={{
          ...styles.panel,
          transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Header Row */}
        <div style={styles.header}>
          <button 
            type="button" 
            onClick={onClose} 
            style={styles.closeBtn}
            aria-label="Close menu"
          >
            <X size={20} color="#ffffff" strokeWidth={1.5} />
          </button>
          <div style={styles.logoWrapper}>
            <span style={styles.logoText}>DIPTYQUE</span>
          </div>
        </div>

        {/* Main Menu List */}
        <div style={styles.mainMenuList}>
          {['EAU DE PARFUM', 'EAU DE TOILETTE', 'FIND YOUR SCENT', 'COLLECTIONS', 'MAISON'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              style={styles.mainMenuItem}
              onClick={(e) => {
                e.preventDefault();
                const target = e.currentTarget;
                // Bouncy horizontal spring transition
                target.animate(
                  [
                    { transform: 'translateX(0)',     offset: 0 },
                    { transform: 'translateX(14px)',  offset: 0.35 },
                    { transform: 'translateX(-3px)',  offset: 0.7 },
                    { transform: 'translateX(0)',     offset: 1 },
                  ],
                  {
                    duration: 380,
                    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
                    fill: 'none',
                  }
                );
              }}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Sub Menu List */}
        <div style={styles.subMenuList}>
          {['로그인 / 회원가입', '주문조회', '향수 비교하기', '위시리스트', '고객 서비스'].map((item) => (
            <a 
              key={item} 
              href="#link"
              className="side-menu-sub-item"
              style={styles.subMenuItem}
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              {item}
            </a>
          ))}
          
          {/* Country Selection */}
          <div style={styles.countryRow}>
            <span style={styles.countryLabel}>국가: </span>
            <span style={styles.countryValue}>
              SOUTH KOREA
              <ChevronDown size={11} style={styles.chevron} />
            </span>
          </div>
        </div>
      </div>

      {/* CSS stylesheet for hover and active transitions on sub items */}
      <style>{`
        .side-menu-sub-item {
          color: #cccccc !important;
          transition: color 180ms ease !important;
        }
        .side-menu-sub-item:hover,
        .side-menu-sub-item:active {
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  menuContainer: {
    position: 'fixed',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '390px',
    height: 'calc(100% - 60px)', // Exclude bottom nav bar
    zIndex: 95, // Below BottomNav (100)
    overflow: 'hidden',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    transition: 'opacity 300ms cubic-bezier(0.25, 1, 0.5, 1)',
    cursor: 'none !important',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '82%',
    height: '100%',
    backgroundColor: '#121212',
    color: '#ffffff',
    padding: '24px 20px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.4)',
    cursor: 'none !important',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    height: '32px',
    marginBottom: '42px',
  },
  closeBtn: {
    position: 'absolute',
    left: 0,
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'none !important',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logoWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: 400,
    color: '#ffffff',
    letterSpacing: '2px',
    pointerEvents: 'none',
  },
  mainMenuList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '26px',
    paddingLeft: '4px',
  },
  mainMenuItem: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    fontWeight: 400,
    color: '#ffffff',
    textDecoration: 'none',
    letterSpacing: '1px',
    cursor: 'none !important',
    display: 'block',
    transition: 'opacity 0.2s ease',
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    margin: '38px 4px 28px 4px',
  },
  subMenuList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingLeft: '4px',
  },
  subMenuItem: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 300,
    color: '#cccccc',
    textDecoration: 'none',
    letterSpacing: '0.5px',
    cursor: 'none !important',
    display: 'block',
    transition: 'opacity 0.2s ease',
  },
  countryRow: {
    marginTop: '12px',
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    color: '#cccccc',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
  },
  countryLabel: {
    color: '#888888',
    marginRight: '6px',
  },
  countryValue: {
    color: '#ffffff',
    fontWeight: 400,
    borderBottom: '1px solid #ffffff',
    paddingBottom: '2px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'none !important',
  },
  chevron: {
    marginLeft: '3px',
  },
};
