import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategorySection } from './components/CategorySection';
import { BestSellers } from './components/BestSellers';
import { BottomBanner } from './components/BottomBanner';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { LoginPage } from './components/LoginPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderCompletePage } from './components/OrderCompletePage';
import { CartDrawer } from './components/CartDrawer';
import { MyPage } from './components/MyPage';
import { SearchPage } from './components/SearchPage';
import { RecommendPage } from './components/RecommendPage';
import { SideMenu } from './components/SideMenu';
import { CollectionsPage } from './components/CollectionsPage';
import { ShopPage } from './components/ShopPage';
import type { CartItemType } from './components/CartDrawer';
import type { CompareItem } from './components/MyPage';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { initKakao, getStoredKakaoUser, kakaoLogout } from './kakaoAuth';
import type { KakaoUserProfile } from './kakaoAuth';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'detail' | 'checkout' | 'complete' | 'mypage' | 'search' | 'recommend' | 'collections' | 'shop'>('home');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [kakaoUser, setKakaoUser] = useState<KakaoUserProfile | null>(null);

  // 토스 결제창 새 탭 실행 로딩 제어 상태
  const [isTossPaying, setIsTossPaying] = useState(false);

  // Navigation stack memory for returning to cart drawer on correct screen
  const [backToCart, setBackToCart] = useState(false);
  const [preCartPage, setPreCartPage] = useState<'home' | 'login' | 'detail' | 'checkout' | 'complete' | 'mypage' | 'search' | 'recommend' | 'collections' | 'shop'>('home');

  // Selected scent parameter passed to recommendation result page
  const [selectedScent, setSelectedScent] = useState('전체');

  // Sidebar Menu visibility state
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  // Navigation memory for returning from collections page
  const [preCollectionsPage, setPreCollectionsPage] = useState<'home' | 'login' | 'detail' | 'checkout' | 'complete' | 'mypage' | 'search' | 'recommend' | 'collections' | 'shop'>('home');
  const [preCollectionsSideMenuOpen, setPreCollectionsSideMenuOpen] = useState(false);

  // Navigation memory for returning from detail page
  const [preDetailPage, setPreDetailPage] = useState<'home' | 'login' | 'detail' | 'checkout' | 'complete' | 'mypage' | 'search' | 'recommend' | 'collections' | 'shop'>('home');

  const navigateToDetail = (fromPage: typeof currentPage = currentPage) => {
    setPreDetailPage(fromPage);
    setCurrentPage('detail');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Active tab state inside Shop Page
  const [activeShopTab, setActiveShopTab] = useState<'parfum' | 'toilette' | 'solid'>('parfum');

  const handleSideMenuNavigate = (
    page: 'home' | 'login' | 'detail' | 'checkout' | 'complete' | 'mypage' | 'search' | 'recommend' | 'collections' | 'shop',
    tab?: 'parfum' | 'toilette' | 'solid'
  ) => {
    if (page === 'collections') {
      setPreCollectionsPage(currentPage);
      setPreCollectionsSideMenuOpen(true);
    }
    if (page === 'shop') {
      setActiveShopTab(tab || 'parfum');
    }
    setCurrentPage(page);
  };

  // Forward mouse events to the parent window for the custom cursor effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      window.parent.postMessage({
        type: 'IFRAME_MOUSEMOVE',
        clientX: e.clientX,
        clientY: e.clientY
      }, '*');
    };

    const handleMouseClick = (e: MouseEvent) => {
      window.parent.postMessage({
        type: 'IFRAME_CLICK',
        clientX: e.clientX,
        clientY: e.clientY
      }, '*');
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleMouseClick, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseClick);
    };
  }, []);

  // Compare list shared across product detail & mypage
  const [compareList, setCompareList] = useState<CompareItem[]>([]);

  // Initialise Kakao SDK and restore any stored session
  useEffect(() => {
    initKakao();
    const stored = getStoredKakaoUser();
    if (stored) setKakaoUser(stored);
  }, []);

  // Set up Firebase Auth state tracking
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 새 탭 결제창 이동 파라미터 감지 및 결제 모듈 즉각 기동
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tossPayRedirect = params.get('tossPayRedirect');

    if (tossPayRedirect === 'true') {
      setIsTossPaying(true);

      // URL 파라미터로부터 결제 데이터 추출
      const amount = Number(params.get('amount') || '0');
      const recipient = params.get('recipient') || '홍길동';
      const address = params.get('address') || '';
      const orderName = params.get('orderName') || '디프티크 상품';
      const orderCount = Number(params.get('orderCount') || '1');

      if (!amount || amount <= 0) {
        alert('올바르지 않은 결제 금액입니다.');
        window.close();
        return;
      }

      // 1. 토스 결제 라이브러리 스크립트 동적 로드
      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v1/payment';
      script.async = true;
      script.onload = () => {
        try {
          const tossPayments = (window as any).TossPayments('test_ck_vZnjEJeQVxPeEkJ25KyDVPmOoBN0');
          const orderId = `order_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;

          // 토스 페이먼츠 카드 결제창 활성화
          tossPayments.requestPayment('카드', {
            amount: amount,
            orderId: orderId,
            orderName: orderName,
            customerName: recipient,
            // 리다이렉트되어 돌아올 때 데이터를 유실하지 않도록 successUrl에 관련 메타데이터 파라미터를 그대로 매달아 전송
            successUrl: `${window.location.origin}/?tossSuccess=true` +
              `&amount=${amount}` +
              `&recipient=${encodeURIComponent(recipient)}` +
              `&address=${encodeURIComponent(address)}` +
              `&orderName=${encodeURIComponent(orderName)}` +
              `&orderCount=${orderCount}`,
            failUrl: `${window.location.origin}/?tossFail=true`,
          });
        } catch (err: any) {
          console.error('Toss redirect payment fail:', err);
          alert(`결제창 로딩 실패: ${err.message || err}`);
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  // 토스 페이먼츠 결제 승인 콜백 및 백업 정보 복원 감지 (URL 파라미터 기반)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tossSuccess = params.get('tossSuccess');
    const tossFail = params.get('tossFail');
    const paymentKey = params.get('paymentKey');

    if (tossSuccess && paymentKey) {
      try {
        // 1. URL 파라미터로부터 직접 데이터 복구 (로컬스토리지 의존 제거)
        const recipientNameVal = params.get('recipient') || '홍길동';
        const shippingAddressVal = params.get('address') || '서울시 도산대로 178';
        const orderNameVal = params.get('orderName') || '디프티크 향수';
        const orderCountVal = Number(params.get('orderCount') || '1');
        const amountVal = Number(params.get('amount') || '0');

        // 2. 결제 완료 데이터 적용
        setRecipientName(recipientNameVal);
        setShippingAddress(shippingAddressVal);
        setOrderTotal(amountVal);
        setOrderCount(orderCountVal);
        setOrderSummaryText(orderNameVal);
        
        // 3. 결제 완료 토스트 출력 및 페이지 이동 후 장바구니 비우기
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
          setCurrentPage('complete');
          setCartItems([]); // 결제 완료되었으므로 장바구니 비움
        }, 2000);

      } catch (e) {
        console.error('Failed to restore order parameters from URL:', e);
      }

      // 4. 안전장치용 로컬스토리지 임시 데이터 정리
      localStorage.removeItem('pending_order_recipient');
      localStorage.removeItem('pending_order_address');
      localStorage.removeItem('pending_order_cart');

      // 5. 브라우저 URL 쿼리 파라미터 클리닝 (깔끔한 UI 유지)
      window.history.replaceState({}, '', window.location.origin);
    } else if (tossFail) {
      const code = params.get('code');
      const message = params.get('message') || '결제가 실패했습니다.';
      alert(`결제 실패 [${code}]: ${message}`);
      
      // 결제 페이지(checkout)로 강제 이동하여 재시도 가능하게 설정
      setCurrentPage('checkout');
      window.history.replaceState({}, '', window.location.origin);
    }
  }, []);

  // True when either Firebase or Kakao user is signed in
  const isLoggedIn = !!currentUser || !!kakaoUser;

  // States to persist complete order details for success screen
  const [recipientName, setRecipientName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [orderSummaryText, setOrderSummaryText] = useState('');
  
  // Pre-populate cart with Do Son 75ML to match Figma mockup initial render (Modified to start empty as requested)
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);

  // Handle Add to Cart event from ProductDetailPage
  const handleAddToCart = (volume: string, quantity: number) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.volume === volume);
      if (existingIdx > -1) {
        return prev.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `doson-${volume.toLowerCase()}`,
          name: 'Do Son',
          subName: '오 드 퍼퓸',
          volume,
          price: 269000,
          quantity,
          image: '/assets_1/DoSon.png',
        },
      ];
    });
  };

  // Handle CartDrawer Quantity Increments/Decrements
  const handleUpdateQuantity = (id: string, qty: number) => {
    setCartItems((prev) => {
      if (qty < 1) {
        return prev.filter((item) => item.id !== id);
      }
      return prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item));
    });
  };

  // Toggle compare item for a product
  const handleToggleCompare = (item: CompareItem) => {
    setCompareList((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists) {
        return prev.filter((c) => c.id !== item.id);
      }
      if (prev.length >= 2) {
        // Replace oldest
        return [prev[1], item];
      }
      return [...prev, item];
    });
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Navigate to MY page (if logged in → mypage, else → login)
  const handleMyClick = () => {
    if (isLoggedIn) {
      setCurrentPage('mypage');
    } else {
      setCurrentPage('login');
    }
  };

  // Navigate from Cart Drawer card to product details
  const handleCartProductClick = (productId: string) => {
    if (productId === 'doson') {
      setPreCartPage(currentPage);
      setBackToCart(true);
      setCartDrawerOpen(false);
      navigateToDetail(currentPage);
    }
  };

  // Navigate back from detail page (checking if we need to reopen Cart Drawer)
  const handleDetailBack = () => {
    if (backToCart) {
      setBackToCart(false);
      setCartDrawerOpen(true);
      setCurrentPage(preCartPage);
    } else {
      setCurrentPage(preDetailPage);
    }
  };

  // Triggered on checkout confirmation modal submit
  const handlePaymentSuccess = (recipient: string, address: string) => {
    setRecipientName(recipient);
    setShippingAddress(address);
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setOrderTotal(subtotal);
    setOrderCount(totalCartCount);
    
    if (cartItems.length > 0) {
      const firstItem = cartItems[0];
      const summaryText = cartItems.length === 1
        ? `${firstItem.name} ${firstItem.volume}`
        : `${firstItem.name} ${firstItem.volume} 외 ${cartItems.length - 1}건`;
      setOrderSummaryText(summaryText);
    }

    // Show transition toast and navigate to Complete screen after 2 seconds
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      setCurrentPage('complete');
    }, 2000);
  };

  // Shopping resumption callback - clears cart
  const handleContinueShopping = () => {
    setCartItems([]);
    setCurrentPage('home');
    window.scrollTo(0, 0);
  };

  // 토스 결제창 이동 로딩 화면 전체화면 렌더링
  if (isTossPaying) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#ffffff',
        fontFamily: 'var(--font-serif)',
        textAlign: 'center',
        padding: '24px',
        boxSizing: 'border-box'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '4px', marginBottom: '16px' }}>DIPTYQUE PARIS</h1>
        <div style={{ width: '24px', height: '24px', border: '1px solid rgba(255, 255, 255, 0.2)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '24px' }} />
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '1px', opacity: 0.6 }}>안전한 토스 페이먼츠 결제창으로 이동하고 있습니다.</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Render Login Page Full-screen
  if (currentPage === 'login') {
    return (
      <LoginPage
        onBack={() => setCurrentPage('home')}
        currentUser={currentUser}
        kakaoUser={kakaoUser}
        onKakaoLogin={(user) => {
          setKakaoUser(user);
          setCurrentPage('mypage');
        }}
        onNavigateMyPage={() => setCurrentPage('mypage')}
        onSearchClick={() => { setCurrentPage('search'); window.scrollTo(0, 0); }}
      />
    );
  }

  // Render My Page Full-screen
  if (currentPage === 'mypage') {
    return (
      <>
        {!sideMenuOpen && (
          <Header
            onOpenCart={() => setCartDrawerOpen(true)}
            cartCount={totalCartCount}
            onLogoClick={() => { setCurrentPage('home'); window.scrollTo(0, 0); }}
            onSearchClick={() => { setCurrentPage('search'); window.scrollTo(0, 0); }}
            onMenuClick={() => setSideMenuOpen(true)}
          />
        )}
        <MyPage
          currentUser={currentUser}
          kakaoUser={kakaoUser}
          cartItems={cartItems}
          compareList={compareList}
          onNavigateHome={() => { setCurrentPage('home'); window.scrollTo(0, 0); }}
          onNavigateDetail={() => navigateToDetail()}
          onNavigateSearch={() => { setCurrentPage('search'); window.scrollTo(0, 0); }}
          onNavigateShop={() => { setCurrentPage('shop'); setActiveShopTab('parfum'); window.scrollTo(0, 0); }}
          onLogout={async () => {
            await kakaoLogout();
            setKakaoUser(null);
            setCurrentPage('home');
          }}
        />
        <CartDrawer
          isOpen={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckoutClick={() => {
            setCartDrawerOpen(false);
            setCurrentPage('checkout');
          }}
          onProductClick={handleCartProductClick}
        />
        <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} onNavigate={handleSideMenuNavigate} />
      </>
    );
  }

  // Render Product Detail Page Full-screen
  if (currentPage === 'detail') {
    return (
      <>
        <ProductDetailPage 
          onBack={handleDetailBack}
          onAddToCart={handleAddToCart}
          onOpenCart={() => setCartDrawerOpen(true)}
          cartCount={totalCartCount}
          compareList={compareList}
          onToggleCompare={handleToggleCompare}
          onSearchClick={() => { setCurrentPage('search'); window.scrollTo(0, 0); }}
        />
        <CartDrawer 
          isOpen={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckoutClick={() => {
            setCartDrawerOpen(false);
            setCurrentPage('checkout');
          }}
          onProductClick={handleCartProductClick}
        />
      </>
    );
  }

  // Render Checkout Page Full-screen
  if (currentPage === 'checkout') {
    return (
      <>
        {/* CSS Keyframes for success toast */}
        <style>{`
          @keyframes toastFadeInOutComplete {
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
          }
          .animate-toast-complete {
            animation: toastFadeInOutComplete 2s ease-in-out forwards;
          }
        `}</style>

        <CheckoutPage 
          onBack={() => setCurrentPage('home')}
          cartItems={cartItems}
          onOpenCart={() => setCartDrawerOpen(true)}
          cartCount={totalCartCount}
          onPaymentSuccess={handlePaymentSuccess}
          currentUser={currentUser}
          onSearchClick={() => { setCurrentPage('search'); window.scrollTo(0, 0); }}
          onMenuClick={() => setSideMenuOpen(true)}
          sideMenuOpen={sideMenuOpen}
        />
        <CartDrawer 
          isOpen={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckoutClick={() => {
            setCartDrawerOpen(false);
            setCurrentPage('checkout');
          }}
          onProductClick={handleCartProductClick}
        />
        <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} onNavigate={handleSideMenuNavigate} />
        {showSuccessToast && (
          <div style={styles.toast} className="animate-toast-complete">
            주문이 완료되었습니다.
          </div>
        )}
      </>
    );
  }

  // Render Order Complete Success Page
  if (currentPage === 'complete') {
    return (
      <>
        <OrderCompletePage 
          recipient={recipientName}
          address={shippingAddress}
          totalAmount={orderTotal}
          itemCount={orderCount}
          itemSummaryText={orderSummaryText}
          onContinueShopping={handleContinueShopping}
          onSearchClick={() => { setCurrentPage('search'); window.scrollTo(0, 0); }}
          onMenuClick={() => setSideMenuOpen(true)}
          sideMenuOpen={sideMenuOpen}
        />
        <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} onNavigate={handleSideMenuNavigate} />
      </>
    );
  }

  // Render Search Page
  if (currentPage === 'search') {
    return (
      <>
        <SearchPage
          onOpenCart={() => setCartDrawerOpen(true)}
          cartCount={totalCartCount}
          onNavigateHome={() => { setCurrentPage('home'); window.scrollTo(0, 0); }}
          onNavigateMyPage={handleMyClick}
          onNavigateDetail={(id) => {
            if (id === 'doson') {
              navigateToDetail();
            } else {
              console.log(`Product clicked: ${id}`);
            }
          }}
          onNavigateRecommend={(scent) => {
            setSelectedScent(scent);
            setCurrentPage('recommend');
            window.scrollTo(0, 0);
          }}
          onNavigateShop={() => { setCurrentPage('shop'); setActiveShopTab('parfum'); window.scrollTo(0, 0); }}
          onMenuClick={() => setSideMenuOpen(true)}
          sideMenuOpen={sideMenuOpen}
        />
        <CartDrawer
          isOpen={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckoutClick={() => {
            setCartDrawerOpen(false);
            setCurrentPage('checkout');
          }}
          onProductClick={handleCartProductClick}
        />
        <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} onNavigate={handleSideMenuNavigate} />
      </>
    );
  }

  // Render Recommend Result Page
  if (currentPage === 'recommend') {
    return (
      <>
        <RecommendPage
          selectedScent={selectedScent}
          onOpenCart={() => setCartDrawerOpen(true)}
          cartCount={totalCartCount}
          onBackToSearch={() => { setCurrentPage('search'); window.scrollTo(0, 0); }}
          onNavigateHome={() => { setCurrentPage('home'); window.scrollTo(0, 0); }}
          onNavigateMyPage={handleMyClick}
          onNavigateDetail={(id) => {
            if (id === 'doson') {
              navigateToDetail();
            } else {
              console.log(`Product clicked: ${id}`);
            }
          }}
          onNavigateShop={() => { setCurrentPage('shop'); setActiveShopTab('parfum'); window.scrollTo(0, 0); }}
          onSearchClick={() => { setCurrentPage('search'); window.scrollTo(0, 0); }}
        />
        <CartDrawer
          isOpen={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckoutClick={() => {
            setCartDrawerOpen(false);
            setCurrentPage('checkout');
          }}
          onProductClick={handleCartProductClick}
        />
      </>
    );
  }

  // Render Collections Page
  if (currentPage === 'collections') {
    return (
      <>
        <CollectionsPage
          onBack={() => {
            setCurrentPage(preCollectionsPage);
            setSideMenuOpen(preCollectionsSideMenuOpen);
          }}
          onOpenCart={() => setCartDrawerOpen(true)}
          cartCount={totalCartCount}
          onSearchClick={() => { setCurrentPage('search'); window.scrollTo(0, 0); }}
          onNavigateHome={() => { setCurrentPage('home'); window.scrollTo(0, 0); }}
          onNavigateMyPage={handleMyClick}
          onNavigateShop={() => { setCurrentPage('shop'); setActiveShopTab('parfum'); window.scrollTo(0, 0); }}
          onMenuClick={() => setSideMenuOpen(true)}
        />
        <CartDrawer
          isOpen={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckoutClick={() => {
            setCartDrawerOpen(false);
            setCurrentPage('checkout');
          }}
          onProductClick={handleCartProductClick}
        />
        <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} onNavigate={handleSideMenuNavigate} />
      </>
    );
  }

  // Render Shop Page
  if (currentPage === 'shop') {
    return (
      <>
        <ShopPage
          activeTab={activeShopTab}
          onChangeTab={setActiveShopTab}
          onOpenCart={() => setCartDrawerOpen(true)}
          cartCount={totalCartCount}
          onNavigateHome={() => { setCurrentPage('home'); window.scrollTo(0, 0); }}
          onNavigateMyPage={handleMyClick}
          onNavigateDetail={() => navigateToDetail()}
          onSearchClick={() => { setCurrentPage('search'); window.scrollTo(0, 0); }}
          onMenuClick={() => setSideMenuOpen(true)}
        />
        <CartDrawer
          isOpen={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckoutClick={() => {
            setCartDrawerOpen(false);
            setCurrentPage('checkout');
          }}
          onProductClick={handleCartProductClick}
        />
        <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} onNavigate={handleSideMenuNavigate} />
      </>
    );
  }

  // Render Standard Home Page
  return (
    <>
      {!sideMenuOpen && (
        <Header 
          onOpenCart={() => setCartDrawerOpen(true)} 
          cartCount={totalCartCount} 
          onLogoClick={() => {
            setCurrentPage('home');
            window.scrollTo(0, 0);
          }} 
          onSearchClick={() => {
            setCurrentPage('search');
            window.scrollTo(0, 0);
          }} 
          onMenuClick={() => setSideMenuOpen(true)}
        />
      )}
      <main style={styles.main}>
        <HeroSection />
        <CategorySection />
        <BestSellers onProductClick={(id) => {
          if (id === 'doson') {
            navigateToDetail();
          } else {
            console.log(`Product clicked: ${id}`);
          }
        }} />
        <BottomBanner />
        <Footer />
      </main>
      <BottomNav
        onMyClick={handleMyClick}
        onHomeClick={() => {
          setCurrentPage('home');
          window.scrollTo(0, 0);
        }}
        onSearchClick={() => {
          setCurrentPage('search');
          window.scrollTo(0, 0);
        }}
        onShopClick={() => {
          setCurrentPage('shop');
          setActiveShopTab('parfum');
          window.scrollTo(0, 0);
        }}
        activeTab="home"
      />
      <CartDrawer 
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckoutClick={() => {
          setCartDrawerOpen(false);
          setCurrentPage('checkout');
        }}
        onProductClick={handleCartProductClick}
      />
      <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} onNavigate={handleSideMenuNavigate} />
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  toast: {
    position: 'fixed',
    bottom: '90px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#000000',
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '28px',
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.5px',
    zIndex: 3000,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
    pointerEvents: 'none',
  },
};

export default App;
