import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, ChevronDown, Minus, Plus } from 'lucide-react';
import type { CompareItem } from './MyPage';

interface ProductDetailPageProps {
  onBack: () => void;
  onAddToCart: (volume: string, quantity: number) => void;
  onOpenCart: () => void;
  cartCount: number;
  compareList?: CompareItem[];
  onToggleCompare?: (item: CompareItem) => void;
}

const ACCORDION_DATA = [
  {
    title: '원료 및 특징',
    content: '주요 원료: 튜베로즈, 오렌지 블로썸, 자스민, 마린 어코드.\n\n도 손 오 드 퍼퓸은 싱그럽고 관능적인 튜베로즈 향에 상큼하고 달콤한 오렌지 블로썸과 자스민이 어우러져 깊고 풍부한 플로럴 잔향을 선사합니다. 마린 어코드가 더해져 바닷바람처럼 맑고 시원한 느낌을 더해줍니다.',
  },
  {
    title: '향수 이야기',
    content: '도 손(Do Son)은 디프티크의 창립자 중 한 명인 이브 쿠에랑의 어린 시절 추억에서 영감을 받았습니다. 베트남 하롱베이 해변가의 도 손이라는 작은 마을에서 보낸 시원하고 상쾌한 바닷바람과 어머니가 사랑하셨던 튜베로즈의 향기로운 기억이 섬세하게 묘사되어 있습니다.',
  },
  {
    title: '사용 방법',
    content: '맥박이 뛰는 부위(손목, 귀 뒤, 목덜미 등)에 1-2회 가볍게 스프레이 하십시오. 옷 안감이나 머리카락 끝부분에 뿌리면 향이 더욱 은은하고 오래 지속됩니다. 마찰을 피하고 자연스럽게 흡수되도록 둡니다.',
  },
  {
    title: '배송 및 반품',
    content: '배송 기간: 결제 완료 후 2~4 영업일 이내 순차 배송 (주말/공휴일 제외)\n배송비: 무료 배송\n반품/교환: 상품 수령 후 7일 이내에 개봉하지 않은 새 상품에 한해 가능합니다. 단순 변심 반품의 경우 왕복 배송비가 부과될 수 있습니다.',
  },
];

const FragranceTag: React.FC<{ label: string }> = ({ label }) => {
  return (
    <button className="fragrance-tag-btn">
      {label}
    </button>
  );
};

const AccordionItem: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={styles.accordionWrapper}>
      <button 
        style={styles.accordionHeader} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span style={styles.accordionTitle}>{title}</span>
        <ChevronDown 
          size={16} 
          strokeWidth={1.5} 
          style={{
            ...styles.accordionIcon,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }} 
        />
      </button>
      <div 
        style={{
          ...styles.accordionContent,
          maxHeight: isOpen ? '240px' : '0px',
          opacity: isOpen ? 1 : 0,
          paddingTop: isOpen ? '16px' : '0px',
          paddingBottom: isOpen ? '20px' : '0px',
        }}
      >
        <p style={styles.accordionText}>{content}</p>
      </div>
    </div>
  );
};

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  onBack,
  onAddToCart,
  onOpenCart,
  cartCount,
  compareList = [],
  onToggleCompare,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState('75ML');
  const [quantity, setQuantity] = useState(1);

  // 페이지 진입 시 항상 최상단으로 즉시 이동
  // - history.scrollRestoration='manual': 브라우저의 자동 스크롤 복원 비활성화
  // - double RAF: 첫 번째 프레임(DOM 배치) + 두 번째 프레임(레이아웃 완성) 이후 실행
  // - 50ms 폴백: 이미지 로딩 등으로 인한 리플로우가 스크롤을 밀어내는 경우 차단
  useEffect(() => {
    const prevScrollRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';

    let raf1: number;
    let raf2: number;
    let timer: ReturnType<typeof setTimeout>;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        // 폴백: 이미지 로딩으로 인한 리플로우 이후에도 최상단 유지
        timer = setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }, 50);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(timer);
      history.scrollRestoration = prevScrollRestoration;
    };
  }, []);

  // Current product info for compare
  const THIS_PRODUCT: CompareItem = {
    id: 'doson',
    name: 'Do Son',
    image: '/assets_1/DoSon.png',
    volume: selectedVolume,
  };
  const isInCompare = compareList.some((c) => c.id === THIS_PRODUCT.id);
  const compareCount = compareList.length;

  const [btnState, setBtnState] = useState<'normal' | 'added'>('normal');
  const [isBouncing, setIsBouncing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Toggle favorite helper
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Toggle comparison item count (loops 0 -> 1 -> 0 or increments up to 3)
  const handleCompareClick = () => {
    if (onToggleCompare) {
      onToggleCompare(THIS_PRODUCT);
    }
  };

  // Add to cart click feedback handler
  const handleAddToCartClick = () => {
    onAddToCart(selectedVolume, quantity);

    setBtnState('added');
    setTimeout(() => {
      setBtnState('normal');
    }, 1000);

    setIsBouncing(true);
    setTimeout(() => {
      setIsBouncing(false);
    }, 250);

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  return (
    <div style={styles.pageContainer} className="animate-fade-in">
      {/* Self-contained CSS for high-performance hover states on white backgrounds */}
      <style>{`
        /* Fragrance tag outline hover styles */
        .fragrance-tag-btn {
          background-color: transparent;
          border: 1px solid #e2e2e2;
          color: #000000;
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 1px;
          padding: 8px 16px;
          cursor: pointer;
          transition: background-color 250ms ease, color 250ms ease, border-color 250ms ease;
        }
        
        .fragrance-tag-btn:hover {
          background-color: #000000;
          color: #ffffff;
          border-color: #000000;
        }

        /* Note detail link hover underline */
        .note-link {
          font-family: var(--font-serif);
          font-size: 12px;
          color: #555555;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding-bottom: 2px;
          position: relative;
          cursor: pointer;
        }

        .note-link::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 1px;
          bottom: 0;
          left: 0;
          background-color: #000000;
          transform-origin: bottom right;
          transition: transform 0.25s ease-out;
        }

        .note-link:hover {
          color: #000000;
        }

        .note-link:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }

        /* Cart counter buttons */
        .qty-counter-btn {
          border: none;
          background: transparent;
          cursor: pointer;
          width: 48px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888888;
          transition: color 0.15s ease;
        }

        .qty-counter-btn:hover {
          color: #000000;
        }

        /* Add to cart filled button */
        .add-cart-btn {
          width: 100%;
          height: 50px;
          background-color: #000000;
          color: #ffffff;
          border: none;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          cursor: pointer;
          margin-bottom: 12px;
          transition: background-color 200ms ease;
        }

        .add-cart-btn:hover {
          background-color: #222222;
        }

        /* Compare outline button */
        .compare-outline-btn {
          width: 100%;
          height: 50px;
          background-color: transparent;
          color: #000000;
          border: 1px solid #000000;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          cursor: pointer;
          margin-bottom: 24px;
          transition: background-color 200ms ease;
        }

        .compare-outline-btn:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }

        /* Heart floating button */
        .fav-heart-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #ffffff;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 10;
        }

        .fav-heart-btn:active {
          transform: scale(0.85);
        }

        /* Cart Bounce keyframes */
        @keyframes cartBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .animate-bounce-cart {
          animation: cartBounce 250ms ease-out;
        }

        /* Bottom Toast animations and positioning */
        @keyframes toastFadeInOut {
          0% {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          15% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          85% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -10px);
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

      {/* Header top-bar */}
      <header style={styles.header}>
        <button style={styles.headerBtn} onClick={onBack} aria-label="Go Back">
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

        <button 
          style={styles.headerBtn} 
          onClick={onOpenCart} 
          aria-label="Open Cart"
          className={isBouncing ? 'animate-bounce-cart' : ''}
        >
          <img 
            src="/assets_1/Cart.png" 
            alt="Cart" 
            style={styles.cartIcon}
          />
          {cartCount > 0 && (
            <span style={styles.cartBadge}>{cartCount}</span>
          )}
        </button>
      </header>

      {/* Scrollable Main body */}
      <div style={styles.scrollBody}>
        {/* Rounded card image container */}
        <div style={styles.imageCardContainer}>
          <button 
            className="fav-heart-btn"
            onClick={handleFavoriteClick}
            aria-label="Add to favorites"
          >
            <Heart 
              size={18} 
              strokeWidth={1.5}
              fill={isFavorite ? '#000000' : 'transparent'} 
              color="#000000" 
            />
          </button>

          <img 
            src="/assets_1/DoSon.png" 
            alt="Do Son" 
            style={styles.productImage} 
          />
        </div>

        {/* Product details info panel */}
        <div style={styles.detailsPanel}>
          <span style={styles.subCategory}>오 드 퍼퓸</span>
          <h1 style={styles.productName}>Do Son</h1>
          <p style={styles.productDesc}>
            튜베로즈의 섬세하고 관능적인 향기, 바닷바람에 실려 온 추억을 담은 플로럴 향수.
          </p>
          <span style={styles.productPrice}>₩269,000</span>

          <hr style={styles.divider} />

          {/* Fragrance tags */}
          <div style={styles.tagsContainer}>
            <span style={styles.sectionLabel}>향 계열</span>
            <div style={styles.tagsList}>
              <FragranceTag label="TUBEROSE" />
              <FragranceTag label="ORANGE BLOSSOM" />
              <FragranceTag label="JASMINE" />
            </div>
          </div>

          {/* Note detail link */}
          <div style={{ marginBottom: '28px' }}>
            <a href="#notes" className="note-link">
              향 노트 상세보기 →
            </a>
          </div>

          <hr style={styles.divider} />

          {/* Volume selectors */}
          <div style={styles.volumeContainer}>
            <span style={styles.sectionLabel}>용량</span>
            <div style={styles.volumeOptions}>
              {['50ML', '75ML', '100ML'].map((vol) => {
                const isEnabled = vol === '75ML';
                const isActive = vol === selectedVolume;
                return (
                  <button
                    key={vol}
                    style={{
                      ...styles.volBtn,
                      fontWeight: isActive ? 600 : 400,
                      borderBottom: isActive ? '2px solid #000000' : '2px solid transparent',
                      opacity: isEnabled ? 1 : 0.25,
                      color: isEnabled ? '#000000' : '#888888',
                      cursor: isEnabled ? 'pointer' : 'default',
                      pointerEvents: isEnabled ? 'auto' : 'none',
                    }}
                    onClick={() => isEnabled && setSelectedVolume(vol)}
                    disabled={!isEnabled}
                  >
                    {vol}
                  </button>
                );
              })}
            </div>
          </div>

          <hr style={styles.divider} />

          {/* Quantity Selector */}
          <div style={styles.qtyContainer}>
            <button 
              className="qty-counter-btn"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              aria-label="Decrease quantity"
            >
              <Minus size={12} strokeWidth={2} />
            </button>
            
            <span style={styles.qtyVal}>{quantity}</span>
            
            <button 
              className="qty-counter-btn"
              onClick={() => setQuantity((prev) => prev + 1)}
              aria-label="Increase quantity"
            >
              <Plus size={12} strokeWidth={2} />
            </button>
          </div>

          {/* Action Buttons */}
          <button 
            className="add-cart-btn"
            onClick={handleAddToCartClick}
          >
            {btnState === 'added' ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                ✓ 장바구니에 담았습니다
              </span>
            ) : (
              '장바구니 담기'
            )}
          </button>

          <button 
            className="compare-outline-btn"
            onClick={handleCompareClick}
            style={isInCompare ? { borderColor: 'rgba(255,255,255,0.6)', color: '#ffffff' } : {}}
          >
            {isInCompare ? '✓ 비교 목록에 추가됨' : `향 비교하기 (${compareCount}/2)`}
          </button>

          {/* Accordion list */}
          <div style={styles.accordionContainer}>
            {ACCORDION_DATA.map((acc, idx) => (
              <AccordionItem key={idx} title={acc.title} content={acc.content} />
            ))}
          </div>
        </div>
      </div>
      {showToast && (
        <div style={styles.toast} className="animate-toast">
          상품이 장바구니에 담겼습니다.
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
    backgroundColor: '#ffffff', // Clean white background below header
    minHeight: '100vh',
    position: 'relative',
    paddingBottom: '40px',
  },
  header: {
    position: 'sticky',
    top: 0,
    left: 0,
    width: '100%',
    height: '64px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 16px',
    zIndex: 100,
    backgroundColor: '#000000', // Black header top bar
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  headerBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
  },
  cartIcon: {
    width: '16px',
    height: '18px',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1)', // Makes cart white
  },
  cartBadge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    width: '14px',
    height: '14px',
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
  scrollBody: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  imageCardContainer: {
    width: 'calc(100% - 32px)',
    margin: '16px 16px 28px 16px',
    aspectRatio: '1 / 1',
    backgroundColor: '#F4F0EB', // Cream background card
    borderRadius: '12px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
  },
  productImage: {
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
    mixBlendMode: 'multiply',
  },
  detailsPanel: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0 20px',
  },
  subCategory: {
    fontFamily: 'var(--font-serif)',
    fontSize: '13px',
    color: '#888888',
    marginBottom: '6px',
    letterSpacing: '0.5px',
  },
  productName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '38px',
    fontWeight: 600,
    color: '#000000',
    marginBottom: '16px',
    letterSpacing: '-0.01em',
  },
  productDesc: {
    fontFamily: 'var(--font-serif)',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#555555',
    marginBottom: '20px',
  },
  productPrice: {
    fontFamily: 'var(--font-sans)',
    fontSize: '18px',
    fontWeight: 600,
    color: '#000000',
    marginBottom: '20px',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #f0f0f0',
    margin: '0 0 24px 0',
    width: '100%',
  },
  sectionLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 500,
    color: '#888888',
    letterSpacing: '1px',
    marginBottom: '12px',
    display: 'block',
  },
  tagsContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '20px',
  },
  tagsList: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  volumeContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '12px',
  },
  volumeOptions: {
    display: 'flex',
    gap: '24px',
  },
  volBtn: {
    border: 'none',
    background: 'transparent',
    padding: '4px 0 6px 0',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    letterSpacing: '1px',
    cursor: 'pointer',
    color: '#000000',
    transition: 'border-color 0.2s ease',
  },
  qtyContainer: {
    width: '100%',
    height: '48px',
    border: '1px solid #e2e2e2',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  qtyVal: {
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    fontWeight: 500,
    color: '#000000',
  },
  accordionContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid #e8e8e8',
    marginTop: '12px',
  },
  accordionWrapper: {
    borderBottom: '1px solid #e8e8e8',
    width: '100%',
  },
  accordionHeader: {
    width: '100%',
    padding: '20px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#000000',
  },
  accordionTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
  accordionIcon: {
    transition: 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
    color: '#555555',
  },
  accordionContent: {
    width: '100%',
    overflow: 'hidden',
    transition: 'max-height 300ms cubic-bezier(0.25, 1, 0.5, 1), opacity 300ms cubic-bezier(0.25, 1, 0.5, 1), padding 300ms cubic-bezier(0.25, 1, 0.5, 1)',
  },
  accordionText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#666666',
    whiteSpace: 'pre-line', // Respects line breaks in detail copy
  },
  toast: {
    position: 'fixed',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#000000',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '24px',
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.5px',
    zIndex: 2000,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
    pointerEvents: 'none',
  },
};
