import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

// Import assets
import Search_DO_SON from '../assets/Search_DO SON.png';
import Search_PHILOSYKOS from '../assets/Search_PHILOSYKOS.png';
import Search_LOmbre_dans_lEau from "../assets/Search_L'Ombre dans l'Eau.png";
import Search_Icon from '../assets/Search_Icon.png';


interface SearchPageProps {
  onOpenCart: () => void;
  cartCount: number;
  onNavigateHome: () => void;
  onNavigateMyPage: () => void;
  onNavigateDetail: (productId: string) => void;
  onNavigateRecommend: (selectedScent: string) => void;
  onNavigateShop?: () => void;
  onMenuClick?: () => void;
  sideMenuOpen?: boolean;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  onOpenCart,
  cartCount,
  onNavigateHome,
  onNavigateMyPage,
  onNavigateDetail,
  onNavigateRecommend,
  onNavigateShop,
  onMenuClick,
  sideMenuOpen = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScentPill, setSelectedScentPill] = useState<string | null>(null);
  const [selectedMemoryPill, setSelectedMemoryPill] = useState<string | null>(null);
  const [showSearchAlert, setShowSearchAlert] = useState(false);

  const scentBtnRef = useRef<HTMLButtonElement | null>(null);
  const memoryBtnRef = useRef<HTMLButtonElement | null>(null);
  const searchInputWrapperRef = useRef<HTMLDivElement | null>(null);
  const shakeAnimRef = useRef<Animation | null>(null);

  useEffect(() => {
    return () => {
      if (shakeAnimRef.current) {
        shakeAnimRef.current.cancel();
      }
    };
  }, []);

  const handleScentPillClick = (pill: string) => {
    setSelectedScentPill(selectedScentPill === pill ? null : pill);
    setSelectedMemoryPill(null); // Clear memory pill when picking a scent pill
  };

  const handleMemoryPillClick = (pill: string) => {
    setSelectedMemoryPill(selectedMemoryPill === pill ? null : pill);
    setSelectedScentPill(null); // Clear scent pill when picking a memory pill
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setShowSearchAlert(true);
    } else {
      const wrapper = searchInputWrapperRef.current;
      if (wrapper) {
        // Cancel active animations
        if (shakeAnimRef.current) {
          shakeAnimRef.current.cancel();
          shakeAnimRef.current = null;
        }

        // Apply same shake keyframes from landing page
        shakeAnimRef.current = wrapper.animate(
          [
            { transform: "translateX(0)",     offset: 0 },
            { transform: "translateX(-12px)", offset: 0.11 },
            { transform: "translateX(12px)",  offset: 0.22 },
            { transform: "translateX(-10px)", offset: 0.33 },
            { transform: "translateX(10px)",  offset: 0.44 },
            { transform: "translateX(-8px)",  offset: 0.55 },
            { transform: "translateX(8px)",   offset: 0.66 },
            { transform: "translateX(-4px)",  offset: 0.77 },
            { transform: "translateX(4px)",   offset: 0.88 },
            { transform: "translateX(0)",     offset: 1 },
          ],
          {
            duration: 600,
            easing: "ease-in-out",
            fill: "none",
          }
        );

        shakeAnimRef.current.onfinish = () => {
          shakeAnimRef.current = null;
        };
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleRecommendClick = (section: 'scent' | 'memory') => {
    const isScent = section === 'scent';
    const selected = isScent ? selectedScentPill : selectedMemoryPill;

    if (!selected) {
      const btn = isScent ? scentBtnRef.current : memoryBtnRef.current;
      if (btn) {
        // Cancel active animations
        if (shakeAnimRef.current) {
          shakeAnimRef.current.cancel();
          shakeAnimRef.current = null;
        }

        // Apply same shake keyframes from landing page
        shakeAnimRef.current = btn.animate(
          [
            { transform: "translateX(0)",     offset: 0 },
            { transform: "translateX(-12px)", offset: 0.11 },
            { transform: "translateX(12px)",  offset: 0.22 },
            { transform: "translateX(-10px)", offset: 0.33 },
            { transform: "translateX(10px)",  offset: 0.44 },
            { transform: "translateX(-8px)",  offset: 0.55 },
            { transform: "translateX(8px)",   offset: 0.66 },
            { transform: "translateX(-4px)",  offset: 0.77 },
            { transform: "translateX(4px)",   offset: 0.88 },
            { transform: "translateX(0)",     offset: 1 },
          ],
          {
            duration: 600,
            easing: "ease-in-out",
            fill: "none",
          }
        );

        shakeAnimRef.current.onfinish = () => {
          shakeAnimRef.current = null;
        };
      }
      return;
    }

    onNavigateRecommend(selected);
  };

  const handleTrendingClick = (perfumeId: string) => {
    if (perfumeId === 'doson') {
      onNavigateDetail('doson');
    } else {
      setSearchQuery(perfumeId.toUpperCase());
    }
  };

  return (
    <>
      {!sideMenuOpen && (
        <Header 
          onOpenCart={onOpenCart} 
          cartCount={cartCount} 
          onLogoClick={onNavigateHome} 
          onMenuClick={onMenuClick}
        />
      )}

      <div style={styles.scrollBody}>
        {/* Search Bar Input Container */}
        <div style={styles.searchBarContainer}>
          <div ref={searchInputWrapperRef} style={styles.searchInputWrapper}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="향 이름 또는 분위기를 검색하세요"
              style={styles.searchInput}
            />
            <button 
              type="button"
              style={styles.searchIconBtn}
              onClick={handleSearchSubmit}
            >
              <img src={Search_Icon} alt="Search" style={styles.searchIcon} />
            </button>
          </div>
        </div>

        {/* FIND YOUR SCENT Section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionSubtitle}>FIND YOUR SCENT</span>
            <h2 style={styles.sectionTitle}>
              <span style={styles.highlightBlue}>나만의 향</span>을 발견해보세요
            </h2>
          </div>

          <div style={styles.pillsGrid}>
            {['플로럴', '우디', '시트러스', '앰버', '무화과', '로즈'].map((pill) => {
              const isSelected = selectedScentPill === pill;
              return (
                <button
                  key={pill}
                  onClick={() => handleScentPillClick(pill)}
                  style={{
                    ...styles.pillBtn,
                    backgroundColor: isSelected ? '#000000' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#000000',
                    borderColor: isSelected ? '#000000' : '#e2e2e2',
                  }}
                >
                  {pill}
                </button>
              );
            })}
          </div>

          <button 
            ref={scentBtnRef}
            style={styles.submitBtn}
            onClick={() => handleRecommendClick('scent')}
          >
            향 추천받기
          </button>
        </section>

        <div style={styles.divider} />

        {/* SCENT OF MEMORIES Section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionSubtitle}>SCENT OF MEMORIES</span>
            <h2 style={styles.sectionTitle}>
              <span style={styles.highlightPink}>기억 속 향</span>을 떠올려보세요
            </h2>
          </div>

          <div style={styles.pillsGrid}>
            {['첫사랑', '벚꽃길', '새벽', '겨울 바다', '오래된 서재', '비 오는 날'].map((pill) => {
              const isSelected = selectedMemoryPill === pill;
              return (
                <button
                  key={pill}
                  onClick={() => handleMemoryPillClick(pill)}
                  style={{
                    ...styles.pillBtn,
                    backgroundColor: isSelected ? '#000000' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#000000',
                    borderColor: isSelected ? '#000000' : '#e2e2e2',
                  }}
                >
                  {pill}
                </button>
              );
            })}
          </div>

          <button 
            ref={memoryBtnRef}
            style={styles.submitBtn}
            onClick={() => handleRecommendClick('memory')}
          >
            향 추천받기
          </button>
        </section>

        <div style={styles.divider} />

        {/* Trending Searches (인기 검색어) Section */}
        <section style={styles.trendingSection}>
          <h3 style={styles.trendingTitle}>인기 검색어</h3>
          
          <div style={styles.trendingGrid}>
            <div style={styles.trendingItem} onClick={() => handleTrendingClick('doson')}>
              <div style={styles.trendingImgWrapper}>
                <img src={Search_DO_SON} alt="DO SON" style={styles.trendingImg} />
              </div>
              <span style={styles.trendingLabel}>DO SON</span>
            </div>

            <div style={styles.trendingItem} onClick={() => handleTrendingClick('philosykos')}>
              <div style={styles.trendingImgWrapper}>
                <img src={Search_PHILOSYKOS} alt="PHILOSYKOS" style={styles.trendingImg} />
              </div>
              <span style={styles.trendingLabel}>PHILOSYKOS</span>
            </div>

            <div style={styles.trendingItem} onClick={() => handleTrendingClick("l'ombre dans l'eau")}>
              <div style={styles.trendingImgWrapper}>
                <img src={Search_LOmbre_dans_lEau} alt="L'OMBRE DANS L'EAU" style={styles.trendingImg} />
              </div>
              <span style={styles.trendingLabel}>L'OMBRE DANS L'EAU</span>
            </div>
          </div>
        </section>
      </div>
      <BottomNav
        onHomeClick={onNavigateHome}
        onMyClick={onNavigateMyPage}
        onSearchClick={() => {}}
        onShopClick={onNavigateShop}
        activeTab="search"
      />

      {/* CSS keyframes for search alert modal */}
      <style>{`
        @keyframes searchModalFadeInScale {
          0% { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-search-modal {
          animation: searchModalFadeInScale 220ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .search-modal-confirm-btn:hover {
          opacity: 0.9;
        }
      `}</style>

      {/* Search feature ready alert modal */}
      {showSearchAlert && createPortal(
        <>
          {/* Backdrop Overlay */}
          <div 
            style={styles.modalOverlay} 
            onClick={() => setShowSearchAlert(false)} 
          />
          
          {/* Modal Panel Container */}
          <div className="animate-search-modal" style={styles.modalPanel}>
            <h3 style={styles.modalTitle}>검색 기능은 현재 준비 중입니다.</h3>
            <p style={styles.modalSubtitle}>곧 더 편리한 검색 기능으로 찾아뵙겠습니다.</p>
            <button 
              className="search-modal-confirm-btn"
              style={styles.modalConfirmBtn}
              onClick={() => setShowSearchAlert(false)}
            >
              확인
            </button>
          </div>
        </>,
        document.body
      )}
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
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  searchBarContainer: {
    padding: '24px 24px 16px 24px',
    width: '100%',
    boxSizing: 'border-box',
  },
  searchInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    borderBottom: '1px solid #d2d2d2',
    willChange: 'transform',
  },
  searchInput: {
    width: '100%',
    border: 'none',
    outline: 'none',
    padding: '12px 36px 12px 4px',
    fontSize: '14px',
    fontFamily: 'var(--font-sans)',
    color: '#000000',
    backgroundColor: 'transparent',
    letterSpacing: '-0.2px',
  },
  searchIconBtn: {
    position: 'absolute',
    right: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
  },
  searchIcon: {
    width: '18px',
    height: '18px',
    objectFit: 'contain',
  },
  section: {
    padding: '24px 24px 28px 24px',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '20px',
  },
  sectionSubtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '10px',
    letterSpacing: '1.5px',
    color: '#888888',
    fontWeight: 500,
  },
  sectionTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '17px',
    fontWeight: 500,
    color: '#000000',
    margin: 0,
    lineHeight: '1.4',
  },
  highlightBlue: {
    backgroundImage: 'linear-gradient(120deg, rgba(220, 235, 255, 0.7) 0%, rgba(220, 235, 255, 0.7) 100%)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 40%',
    backgroundPosition: '0 80%',
    padding: '0 2px',
  },
  highlightPink: {
    backgroundImage: 'linear-gradient(120deg, rgba(255, 225, 225, 0.7) 0%, rgba(255, 225, 225, 0.7) 100%)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 40%',
    backgroundPosition: '0 80%',
    padding: '0 2px',
  },

  pillsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px 8px',
    marginBottom: '24px',
  },
  pillBtn: {
    flex: '1 1 calc(50% - 6px)',
    minWidth: '130px',
    height: '42px',
    borderRadius: '21px',
    border: '1px solid #e2e2e2',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 400,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    width: '100%',
    height: '48px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e8e8e8',
    margin: '0 24px',
  },
  trendingSection: {
    padding: '32px 24px 28px 24px',
    boxSizing: 'border-box',
  },
  trendingTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    fontWeight: 500,
    color: '#000000',
    marginTop: 0,
    marginBottom: '20px',
  },
  trendingGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },
  trendingItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
  },
  trendingImgWrapper: {
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  trendingImg: {
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
  },
  trendingLabel: {
    fontFamily: 'var(--font-serif)',
    fontSize: '10px',
    fontWeight: 500,
    color: '#000000',
    textAlign: 'center',
    letterSpacing: '0.3px',
    lineHeight: '1.2',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(1.5px)',
    WebkitBackdropFilter: 'blur(1.5px)',
    zIndex: 999999,
  },
  modalPanel: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 'auto',
    width: 'calc(100% - 40px)',
    maxWidth: '320px',
    height: 'fit-content',
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
    zIndex: 1000000,
    padding: '24px',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  modalTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '15px',
    fontWeight: 500,
    color: '#000000',
    margin: '0 0 8px 0',
  },
  modalSubtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    color: '#666666',
    margin: '0 0 20px 0',
    lineHeight: '1.4',
  },
  modalConfirmBtn: {
    width: '100%',
    height: '40px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
};
