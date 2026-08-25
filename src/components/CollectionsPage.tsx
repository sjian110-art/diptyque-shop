import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

// Import collection background images
import Collections_floral from '../assets/Collections_floral.png';
import Collections_woody from '../assets/Collections_woody.png';
import Collections_citrus from '../assets/Collections_citrus.png';
import Collections_amber from '../assets/Collections_amber.png';
import Collections_green from '../assets/Collections_green.png';
import Collections_musk from '../assets/Collections_musk.png';
import Collections_spicy from '../assets/Collections_spicy.png';
import Collections_powdery from '../assets/Collections_powdery.png';
import Collections_Overlay_all from '../assets/Collections_Overlay_all.png';

interface CollectionsPageProps {
  onBack: () => void;
  onOpenCart: () => void;
  cartCount: number;
  onSearchClick: () => void;
  onNavigateHome: () => void;
  onNavigateMyPage: () => void;
  onNavigateShop: () => void;
  onMenuClick: () => void;
}

const COLLECTIONS_DATA = [
  { name: 'FLORAL', bg: Collections_floral },
  { name: 'WOODY', bg: Collections_woody },
  { name: 'CITRUS', bg: Collections_citrus },
  { name: 'AMBER', bg: Collections_amber },
  { name: 'GREEN', bg: Collections_green },
  { name: 'MUSK', bg: Collections_musk },
  { name: 'SPICY', bg: Collections_spicy },
  { name: 'POWDERY', bg: Collections_powdery },
];

export const CollectionsPage: React.FC<CollectionsPageProps> = ({
  onBack,
  onOpenCart,
  cartCount,
  onSearchClick,
  onNavigateHome,
  onNavigateMyPage,
  onNavigateShop,
  onMenuClick,
}) => {
  return (
    <div style={styles.container}>
      <Header
        showBackButton={true}
        onBackClick={onBack}
        onOpenCart={onOpenCart}
        cartCount={cartCount}
        onSearchClick={onSearchClick}
        onLogoClick={onNavigateHome}
        onMenuClick={onMenuClick}
        backgroundColor="#000000"
      />

      <div style={styles.scrollArea} className="collections-scroll-pane">
        <div style={styles.grid}>
          {COLLECTIONS_DATA.map((item, idx) => {
            const isLeft = idx % 2 === 0;
            return (
              <a
                key={item.name}
                href={`#collection-${item.name.toLowerCase()}`}
                onClick={(e) => {
                  e.preventDefault();
                  console.log(`Collection clicked: ${item.name}`);
                }}
                style={{
                  ...styles.card,
                  borderRight: isLeft ? '0.5px solid rgba(255, 255, 255, 0.15)' : 'none',
                  borderLeft: !isLeft ? '0.5px solid rgba(255, 255, 255, 0.15)' : 'none',
                }}
              >
                {/* 1. Background image */}
                <img src={item.bg} alt={item.name} style={styles.cardBg} />
                
                {/* 2. Overlay Layer */}
                <img src={Collections_Overlay_all} alt="" style={styles.cardOverlay} />
                
                {/* 3. Centered Text */}
                <span style={styles.cardText}>{item.name}</span>
              </a>
            );
          })}
        </div>
      </div>

      <BottomNav
        activeTab="shop"
        onHomeClick={onNavigateHome}
        onSearchClick={onSearchClick}
        onMyClick={onNavigateMyPage}
        onShopClick={onNavigateShop}
      />

      <style>{`
        .collections-scroll-pane::-webkit-scrollbar {
          display: none !important;
        }
        .collections-scroll-pane {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    paddingTop: '64px', // Header height
    paddingBottom: '60px', // BottomNav height
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
  },
  card: {
    position: 'relative',
    width: '50%',
    aspectRatio: '1', // Perfect square ratio matching the reference
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    textDecoration: 'none',
    cursor: 'none !important', // matches current app custom cursor pattern
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
    boxSizing: 'border-box',
  },
  cardBg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardOverlay: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    pointerEvents: 'none',
  },
  cardText: {
    position: 'absolute',
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: 400,
    color: '#ffffff',
    letterSpacing: '2px',
    textAlign: 'center',
    zIndex: 2,
    pointerEvents: 'none',
    textTransform: 'uppercase',
  },
};
