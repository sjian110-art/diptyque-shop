import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

// Import shop perfume bottle assets
import Shop_Do_Son from '../assets/Shop_Do Son.png';
import Shop_Eau_des_Sens from '../assets/Shop_Eau des Sens.png';
import Shop_Eau_Rose from '../assets/Shop_Eau Rose.png';
import Shop_Fleur_de_Peau from '../assets/Shop_Fleur de Peau.png';
import Shop_LOmbre_dans_LEau from "../assets/Shop_L'Ombre dans L'Eau.png";
import Shop_Orpheon from '../assets/Shop_Orpheon.png';
import Shop_Philosykos from '../assets/Shop_Philosykos.png';
import Shop_Tam_Dao from '../assets/Shop_Tam Dao.png';

interface ShopPageProps {
  activeTab: 'parfum' | 'toilette' | 'solid';
  onChangeTab: (tab: 'parfum' | 'toilette' | 'solid') => void;
  onOpenCart: () => void;
  cartCount: number;
  onNavigateHome: () => void;
  onNavigateMyPage: () => void;
  onNavigateDetail: (productId: string) => void;
  onSearchClick: () => void;
  onMenuClick: () => void;
}

interface ProductItem {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  img: string;
}

const PARFUM_PRODUCTS: ProductItem[] = [
  {
    id: 'fleurdepeau',
    name: 'Fleur de Peau',
    subtitle: '오 드 퍼퓸 · 75ML',
    price: '₩328,000원',
    img: Shop_Fleur_de_Peau,
  },
  {
    id: 'orpheon',
    name: 'Orphéon',
    subtitle: '오 드 퍼퓸 · 75ML',
    price: '₩328,000원',
    img: Shop_Orpheon,
  },
  {
    id: 'doson',
    name: 'Do Son',
    subtitle: '오 드 퍼퓸 · 75ML',
    price: '₩328,000원',
    img: Shop_Do_Son,
  },
  {
    id: 'tamdao',
    name: 'Tam Dao',
    subtitle: '오 드 퍼퓸 · 75ML',
    price: '₩328,000원',
    img: Shop_Tam_Dao,
  },
];

const TOILETTE_PRODUCTS: ProductItem[] = [
  {
    id: 'philosykos',
    name: 'Philosykos',
    subtitle: '오 드 퍼퓸 · 100 ML',
    price: '₩282,000원',
    img: Shop_Philosykos,
  },
  {
    id: 'eaurose',
    name: 'Eau Rose',
    subtitle: '오 드 퍼퓸 · 100ML',
    price: '₩282,000원',
    img: Shop_Eau_Rose,
  },
  {
    id: 'eaudessens',
    name: 'Eau des Sens',
    subtitle: '오 드 퍼퓸 · 100ML',
    price: '₩282,000원',
    img: Shop_Eau_des_Sens,
  },
  {
    id: 'lombredansleau',
    name: "L'Ombre dans L'Eau",
    subtitle: '오 드 퍼퓸 · 100ML',
    price: '₩282,000원',
    img: Shop_LOmbre_dans_LEau,
  },
];

export const ShopPage: React.FC<ShopPageProps> = ({
  activeTab,
  onChangeTab,
  onOpenCart,
  cartCount,
  onNavigateHome,
  onNavigateMyPage,
  onNavigateDetail,
  onSearchClick,
  onMenuClick,
}) => {
  const currentProducts = activeTab === 'parfum' ? PARFUM_PRODUCTS : TOILETTE_PRODUCTS;

  return (
    <div style={styles.container}>
      {/* Sticky Header with Hamburger Menu and Shopping Bag */}
      <Header
        onOpenCart={onOpenCart}
        cartCount={cartCount}
        onLogoClick={onNavigateHome}
        onSearchClick={onSearchClick}
        onMenuClick={onMenuClick}
      />

      {/* Sticky Tabs below Header */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => onChangeTab('parfum')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'parfum' ? styles.activeTabBtn : {}),
          }}
        >
          오 드 퍼퓸
          {activeTab === 'parfum' && <span style={styles.activeUnderline} />}
        </button>

        <button
          onClick={() => onChangeTab('toilette')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'toilette' ? styles.activeTabBtn : {}),
          }}
        >
          오 드 뚜왈렛
          {activeTab === 'toilette' && <span style={styles.activeUnderline} />}
        </button>

        <button
          onClick={() => onChangeTab('solid')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'solid' ? styles.activeTabBtn : {}),
          }}
        >
          솔리드 퍼퓸
          {activeTab === 'solid' && <span style={styles.activeUnderline} />}
        </button>
      </div>

      {/* Scrollable grid content */}
      <div style={styles.scrollArea} className="shop-scroll-pane">
        {activeTab === 'solid' ? (
          <div style={styles.comingSoonContainer}>
            <span style={styles.comingSoonText}>준비 중</span>
          </div>
        ) : (
          <div style={styles.grid}>
            {currentProducts.map((product) => (
              <a
                key={product.id}
                href={`#product-${product.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  // 상품 클릭 시 상세 페이지로 이동 (Do Son 전용 상세 페이지 활용)
                  onNavigateDetail('doson');
                }}
                style={styles.card}
              >
                <div style={styles.cardImageWrapper}>
                  <img src={product.img} alt={product.name} style={styles.cardImage} />
                </div>
                <h3 style={styles.cardName}>{product.name}</h3>
                <span style={styles.cardSubtitle}>{product.subtitle}</span>
                <span style={styles.cardPrice}>{product.price}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <BottomNav
        activeTab="shop"
        onHomeClick={onNavigateHome}
        onSearchClick={onSearchClick}
        onMyClick={onNavigateMyPage}
        onShopClick={() => onChangeTab('parfum')}
      />

      <style>{`
        .shop-scroll-pane::-webkit-scrollbar {
          display: none !important;
        }
        .shop-scroll-pane {
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
  tabsContainer: {
    position: 'sticky',
    top: '64px',
    backgroundColor: '#000000',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '48px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
    zIndex: 90,
    width: '100%',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    fontWeight: 400,
    letterSpacing: '1px',
    height: '100%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'none !important',
    padding: '0 16px',
    transition: 'color 0.2s ease',
  },
  activeTabBtn: {
    color: '#ffffff',
    fontWeight: 500,
  },
  activeUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '16px',
    right: '16px',
    height: '2.5px',
    backgroundColor: '#ffffff',
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '80px', // Space for BottomNav
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
    padding: '32px 16px',
    gap: '36px 16px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 'calc(50% - 8px)',
    textDecoration: 'none',
    cursor: 'none !important',
  },
  cardImageWrapper: {
    width: '100%',
    aspectRatio: '0.85',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  cardImage: {
    height: '100%',
    maxHeight: '165px',
    objectFit: 'contain',
    pointerEvents: 'none',
  },
  cardName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '17px',
    fontWeight: 400,
    color: '#ffffff',
    marginTop: '16px',
    textAlign: 'center',
    letterSpacing: '0.5px',
  },
  cardSubtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: '6px',
    textAlign: 'center',
    letterSpacing: '0.5px',
  },
  cardPrice: {
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    fontWeight: 400,
    color: '#ffffff',
    marginTop: '12px',
    textAlign: 'center',
    letterSpacing: '0.5px',
  },
  comingSoonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '280px',
    width: '100%',
  },
  comingSoonText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '2px',
  },
};
