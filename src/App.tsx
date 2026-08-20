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
