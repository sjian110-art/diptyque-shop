import React from 'react';

interface BottomNavProps {
  onMyClick?: () => void;
  onHomeClick?: () => void;
  activeTab?: 'home' | 'shop' | 'search' | 'my';
}

export const BottomNav: React.FC<BottomNavProps> = ({ onMyClick, onHomeClick, activeTab = 'home' }) => {
  const getItemStyle = (tab: string) => ({
    ...styles.navItem,
    ...(activeTab === tab ? styles.activeNavItem : {}),
  });

  const getIconStyle = (tab: string, w: string, h: string) => ({
    ...styles.icon,
    width: w,
    height: h,
    opacity: activeTab === tab ? 1 : 0.5,
  });

  return (
    <nav style={styles.navContainer}>
      <a
        href="#home"
        style={getItemStyle('home')}
        onClick={(e) => {
          e.preventDefault();
          if (onHomeClick) onHomeClick();
        }}
      >
        <img
          src="/assets_1/Nav_home.png"
          alt="Home"
          style={getIconStyle('home', '14px', '16px')}
        />
        <span style={styles.navText}>HOME</span>
      </a>

      <a
        href="#shop"
        style={getItemStyle('shop')}
        onClick={(e) => {
          e.preventDefault();
          console.log('Shop tab clicked');
        }}
      >
        <img
          src="/assets_1/Nav_shop.png"
          alt="Shop"
          style={getIconStyle('shop', '14px', '18px')}
        />
        <span style={styles.navText}>SHOP</span>
      </a>

      <a
        href="#search"
        style={getItemStyle('search')}
        onClick={(e) => {
          e.preventDefault();
          console.log('Search tab clicked');
        }}
      >
        <img
          src="/assets_1/Nav_search.png"
          alt="Search"
          style={getIconStyle('search', '17px', '17px')}
        />
        <span style={styles.navText}>SEARCH</span>
      </a>

      <a
        href="#my"
        style={getItemStyle('my')}
        onClick={(e) => {
          e.preventDefault();
          if (onMyClick) onMyClick();
        }}
      >
        <img
          src="/assets_1/Nav_my.png"
          alt="My"
          style={getIconStyle('my', '14px', '14px')}
        />
        <span style={styles.navText}>MY</span>
      </a>
    </nav>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  navContainer: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '390px',
    height: '60px',
    backgroundColor: '#000000',
    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 100,
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
  },
  navItem: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#8e8e93',
    gap: '6px',
    position: 'relative',
    transition: 'color 0.2s ease',
    textDecoration: 'none',
  },
  activeNavItem: {
    color: '#ffffff',
    borderTop: '2px solid #ffffff',
    marginTop: '-1px',
  },
  icon: {
    filter: 'brightness(0) invert(1)',
    transition: 'opacity 0.2s ease',
  },
  navText: {
    fontSize: '9px',
    fontWeight: 500,
    letterSpacing: '1px',
  },
};
