import React from 'react';

interface HeaderProps {
  onOpenCart?: () => void;
  cartCount?: number;
  onLogoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart, cartCount = 0, onLogoClick }) => {
  return (
    <header style={styles.header}>
      {/* Self-contained branding styles for the logo button */}
      <style>{`
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

      {/* CSS-based minimal hamburger menu */}
      <button style={styles.hamburgerButton} aria-label="Menu" onClick={() => console.log('Menu clicked')}>
        <div style={styles.hamburgerLine} />
        <div style={styles.hamburgerLine} />
        <div style={styles.hamburgerLine} />
      </button>
      
      {/* DIPTYQUE Logo */}
      <button 
        style={styles.logoContainer} 
        onClick={onLogoClick}
        className="header-logo-btn"
        aria-label="Diptyque Home"
      >
        <span style={styles.logoText}>DIPTYQUE</span>
      </button>

      {/* Header Icons */}
      <div style={styles.rightIcons}>
        <button style={styles.iconButton} aria-label="Search" onClick={() => console.log('Search clicked')}>
          <img 
            src="/assets_1/Nav_search.png" 
            alt="Search" 
            style={styles.iconImage} 
          />
        </button>
        <button style={styles.iconButton} aria-label="Cart" onClick={onOpenCart}>
          <img 
            src="/assets_1/Cart.png" 
            alt="Cart" 
            style={{ ...styles.iconImage, width: '13px', height: '17px' }} 
          />
          {cartCount > 0 && (
            <span style={styles.cartBadge}>{cartCount}</span>
          )}
        </button>
      </div>
    </header>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
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
    zIndex: 100,
    background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%)',
  },
  hamburgerButton: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '18px',
    height: '12px',
    background: 'transparent',
    padding: 0,
    border: 'none',
  },
  hamburgerLine: {
    width: '100%',
    height: '1.2px',
    backgroundColor: '#ffffff',
    borderRadius: '1px',
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
    letterSpacing: '3px', // Reduced letter spacing from 5px to 3px to match real Diptyque proportions
    color: '#ffffff',
    userSelect: 'none',
    transition: 'color 200ms ease',
  },
  rightIcons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  iconButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '6px',
    background: 'transparent',
    position: 'relative',
  },
  iconImage: {
    width: '16px',
    height: '16px',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1)', // Convert black PNG to white
  },
  cartBadge: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    width: '13px',
    height: '13px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: '8px',
    fontWeight: 700,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
};
