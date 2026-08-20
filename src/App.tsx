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
import type { CartItemType } from './components/CartDrawer';
import type { CompareItem } from './components/MyPage';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { initKakao, getStoredKakaoUser, kakaoLogout } from './kakaoAuth';
import type { KakaoUserProfile } from './kakaoAuth';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'detail' | 'checkout' | 'complete' | 'mypage'>('home');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [kakaoUser, setKakaoUser] = useState<KakaoUserProfile | null>(null);

  // 토스 결제창 새 탭 실행 로딩 제어 상태
  const [isTossPaying, setIsTossPaying] = useState(false);

  // Navigation stack memory for returning to cart drawer on correct screen
  const [backToCart, setBackToCart] = useState(false);
  const [preCartPage, setPreCartPage] = useState<'home' | 'login' | 'detail' | 'checkout' | 'complete' | 'mypage'>('home');

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

      // 1. 토스 결제 라이브러리 스크립트 동적 로드
      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v1/payment';
      script.async = true;
      script.onload = () => {
        // 스크립트 로드 완료 후 즉각 결제창 발사
        try {
          const cachedRecipient = localStorage.getItem('pending_order_recipient') || '홍길동';
          const cachedCart = localStorage.getItem('pending_order_cart');

          if (!cachedCart) {
            alert('결제할 장바구니 정보가 소실되었습니다.');
            window.close();
            return;
          }

          const parsedCart = JSON.parse(cachedCart) as CartItemType[];
          const subtotal = parsedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const totalPayment = subtotal; // 배송비 및 할인 0원 가정

          const tossPayments = (window as any).TossPayments('test_ck_vZnjEJeQVxPeEkJ25KyDVPmOoBN0');
          const orderId = `order_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
          const orderName = parsedCart.length > 0
            ? `${parsedCart[0].name} ${parsedCart[0].volume}${parsedCart.length > 1 ? ` 외 ${parsedCart.length - 1}건` : ''}`
            : '디프티크 향수';

          tossPayments.requestPayment('카드', {
            amount: totalPayment,
            orderId: orderId,
            orderName: orderName,
            customerName: cachedRecipient,
            successUrl: `${window.location.origin}/?tossSuccess=true`,
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

  // 토스 페이먼츠 결제 승인 콜백 및 백업 정보 복원 감지
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tossSuccess = params.get('tossSuccess');
    const tossFail = params.get('tossFail');
    const paymentKey = params.get('paymentKey');

    if (tossSuccess && paymentKey) {
      // 1. 배송 정보 복원
      const cachedRecipient = localStorage.getItem('pending_order_recipient') || '홍길동';
      const cachedAddress = localStorage.getItem('pending_order_address') || '서울시 도산대로 178';
      const cachedCart = localStorage.getItem('pending_order_cart');

      if (cachedCart) {
        try {
          const parsedCart = JSON.parse(cachedCart) as CartItemType[];
          // 장바구니 품목을 임시 복원하여 결제 성공 데이터 합산 계산이 되도록 합니다.
          setCartItems(parsedCart);
          
          // 2. 결제 완료 데이터 적용
          setRecipientName(cachedRecipient);
          setShippingAddress(cachedAddress);
          
          const subtotal = parsedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
          setOrderTotal(subtotal);
          
          const totalQty = parsedCart.reduce((sum, item) => sum + item.quantity, 0);
          setOrderCount(totalQty);
          
          if (parsedCart.length > 0) {
            const firstItem = parsedCart[0];
            const summaryText = parsedCart.length === 1
              ? `${firstItem.name} ${firstItem.volume}`
              : `${firstItem.name} ${firstItem.volume} 외 ${parsedCart.length - 1}건`;
            setOrderSummaryText(summaryText);
          }
          
          // 3. 결제 완료 완료 토스트 및 페이지 이동 후 장바구니 비우기
          setShowSuccessToast(true);
          setTimeout(() => {
            setShowSuccessToast(false);
            setCurrentPage('complete');
            setCartItems([]); // 결제 완료되었으므로 장바구니 비움
          }, 2000);

        } catch (e) {
          console.error('Failed to restore cached cart:', e);
        }
      }

      // 4. 로컬스토리지 임시 데이터 정리
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
  
  // Pre-populate cart with Do Son 75ML to match Figma mockup initial render
  const [cartItems, setCartItems] = useState<CartItemType[]>([
    {
      id: 'doson-75ml',
      name: 'Do Son',
      subName: '오 드 퍼퓸',
      volume: '75ML',
      price: 269000,
      quantity: 1,
      image: '/assets_1/DoSon.png',
    }
  ]);

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
      window.scrollTo({ top: 0, behavior: 'instant' });
      setCurrentPage('detail');
    }
  };

  // Navigate back from detail page (checking if we need to reopen Cart Drawer)
  const handleDetailBack = () => {
    if (backToCart) {
      setBackToCart(false);
      setCartDrawerOpen(true);
      setCurrentPage(preCartPage);
    } else {
      setCurrentPage('home');
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
      />
    );
  }

  // Render My Page Full-screen
  if (currentPage === 'mypage') {
    return (
      <>
        <MyPage
          currentUser={currentUser}
          kakaoUser={kakaoUser}
          cartItems={cartItems}
          cartCount={totalCartCount}
          compareList={compareList}
          onOpenCart={() => setCartDrawerOpen(true)}
          onNavigateHome={() => { setCurrentPage('home'); window.scrollTo(0, 0); }}
          onNavigateDetail={() => { setCurrentPage('detail'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
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
      <OrderCompletePage 
        recipient={recipientName}
        address={shippingAddress}
        totalAmount={orderTotal}
        itemCount={orderCount}
        itemSummaryText={orderSummaryText}
        onContinueShopping={handleContinueShopping}
      />
    );
  }

  // Render Standard Home Page
  return (
    <>
      <Header 
        onOpenCart={() => setCartDrawerOpen(true)} 
        cartCount={totalCartCount} 
        onLogoClick={() => {
          setCurrentPage('home');
          window.scrollTo(0, 0);
        }} 
      />
      <main style={styles.main}>
        <HeroSection />
        <CategorySection />
        <BestSellers onProductClick={(id) => {
          if (id === 'doson') {
            window.scrollTo({ top: 0, behavior: 'instant' });
            setCurrentPage('detail');
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
