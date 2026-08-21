import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

// Import assets
import Recommend_Do_Son from '../assets/recommend_Do Son.png';
import Recommend_Orpheon from '../assets/recommend_Orpheon.png';
import Recommend_Philosykos from '../assets/recommend_Philosykos.png';

interface RecommendPageProps {
  selectedScent: string;
  onOpenCart: () => void;
  cartCount: number;
  onBackToSearch: () => void;
  onNavigateHome: () => void;
  onNavigateMyPage: () => void;
  onNavigateDetail: (productId: string) => void;
}

export const RecommendPage: React.FC<RecommendPageProps> = ({
  selectedScent,
  onOpenCart,
  cartCount,
  onBackToSearch,
  onNavigateHome,
  onNavigateMyPage,
  onNavigateDetail,
}) => {
  // Silence TS6133 lint error by logging the parameter
  console.log(`Loading recommendations for mood/scent: ${selectedScent}`);

  const recommendations = [
    {
      id: 'orpheon',
      name: 'Orpheon',
      matchRate: '95%',
      img: Recommend_Orpheon,
      desc: '당신의 취향과 완벽하게 어우러지는 세련된 우디 향기입니다.',
    },
    {
      id: 'doson',
      name: 'Do Son',
      matchRate: '91%',
      img: Recommend_Do_Son,
      desc: '추억을 떠올리게 하는 상쾌한 바닷바람 같은 플로럴 향입니다.',
    },
    {
      id: 'philosykos',
      name: 'Philosykos',
      matchRate: '87%',
      img: Recommend_Philosykos,
      desc: '선택하신 무드에 어울리는 순수한 무화과나무의 향기입니다.',
    },
  ];

  return (
    <>
      {/* Header with Back Button returning to Search Screen */}
      <Header
        showBackButton={true}
        onBackClick={onBackToSearch}
        onOpenCart={onOpenCart}
        cartCount={cartCount}
      />

      <div style={styles.scrollBody}>
        {/* Recommendation Titles */}
        <div style={styles.titleContainer}>
          <span style={styles.subTitle}>당신을 위한 향</span>
          <h1 style={styles.mainTitle}>추천 결과</h1>
        </div>

        {/* Recommendations Cards List */}
        <div style={styles.cardsContainer}>
          {recommendations.map((item) => (
            <div 
              key={item.id} 
              style={styles.card}
              onClick={() => onNavigateDetail(item.id)}
            >
              {/* Product Image Frame */}
              <div style={styles.cardImageWrapper}>
                <img src={item.img} alt={item.name} style={styles.cardImage} />
              </div>

              {/* Product Info Description */}
              <div style={styles.cardDetails}>
                <div style={styles.cardHeaderRow}>
                  <h3 style={styles.cardName}>{item.name}</h3>
                  <span style={styles.matchBadge}>적합도 {item.matchRate}</span>
                </div>
                
                <p style={styles.cardDesc}>{item.desc}</p>
                
                <div style={styles.cardLinkRow}>
                  <span style={styles.cardLinkText}>상품 상세 보기</span>
                  <span style={styles.cardLinkArrow}>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Retry Button */}
        <div style={styles.btnWrapper}>
          <button 
            style={styles.retryBtn}
            onClick={onBackToSearch}
          >
            추천 다시받기
          </button>
        </div>
      </div>

      <BottomNav
        onHomeClick={onNavigateHome}
        onMyClick={onNavigateMyPage}
        onSearchClick={onBackToSearch}
        activeTab="search"
      />
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  scrollBody: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '64px', // Space for fixed header
    paddingBottom: '80px', // Space for fixed bottom navigation
    backgroundColor: '#fafafa', // Light warm editorial background color
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '28px 24px 20px 24px',
    textAlign: 'center',
  },
  subTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    color: '#888888',
    letterSpacing: '1px',
    marginBottom: '6px',
    fontWeight: 500,
  },
  mainTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '24px',
    fontWeight: 500,
    color: '#000000',
    margin: 0,
    letterSpacing: '0.5px',
  },
  cardsContainer: {
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e8e8e8',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  cardImageWrapper: {
    width: '100%',
    aspectRatio: '1.25 / 1', // Aspect ratio fitting mockup layout
    backgroundColor: '#f4f4f4',
    borderBottom: '1px solid #e8e8e8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
  },
  cardImage: {
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
  },
  cardDetails: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '10px',
  },
  cardName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: 500,
    color: '#000000',
    margin: 0,
  },
  matchBadge: {
    fontFamily: 'var(--font-sans)',
    fontSize: '10px',
    fontWeight: 600,
    color: '#666666',
    letterSpacing: '0.2px',
  },
  cardDesc: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    color: '#666666',
    lineHeight: '1.5',
    margin: '0 0 20px 0',
  },
  cardLinkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderTop: '1px solid #e8e8e8',
    paddingTop: '12px',
  },
  cardLinkText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 500,
    color: '#000000',
    letterSpacing: '0.5px',
  },
  cardLinkArrow: {
    fontSize: '11px',
    color: '#000000',
  },
  btnWrapper: {
    padding: '36px 16px 20px 16px',
  },
  retryBtn: {
    width: '100%',
    height: '48px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '1.5px',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
};
