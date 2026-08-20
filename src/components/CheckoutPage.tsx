import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import type { CartItemType } from './CartDrawer';
import { ChevronDown, Search } from 'lucide-react';

import type { User } from 'firebase/auth';

interface CheckoutPageProps {
  onBack?: () => void;
  cartItems: CartItemType[];
  onOpenCart: () => void;
  cartCount: number;
  onPaymentSuccess: (recipient: string, address: string) => void;
  currentUser: User | null;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBack,
  cartItems,
  onOpenCart,
  cartCount,
  onPaymentSuccess,
  currentUser,
}) => {
  // TS6133 미사용 변수 컴파일 에러 방지 우회용 더미
  if (onPaymentSuccess && false) {
    onPaymentSuccess('', '');
  }

  // 토스 페이먼츠 SDK 동적 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      // 컴포넌트가 언마운트되거나 뒤로 가더라도 헤더 클리닝
      const existing = document.querySelector('script[src="https://js.tosspayments.com/v1/payment"]');
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    };
  }, []);
  // 1. Orderer state (Firebase Auth User details or Dummy fallback data)
  const ordererName = currentUser?.displayName || '홍길동';
  const ordererEmail = currentUser?.email || 'hong@example.com';
  const ordererPhone = '010-1234-5678';

  // 2. Shipping states
  const [isSameAsOrderer, setIsSameAsOrderer] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [deliveryMemoOption, setDeliveryMemoOption] = useState('배송 전 연락 바랍니다.');
  const [customMemo, setCustomMemo] = useState('');

  // 3. Coupon / Promo state
  const [promoCode, setPromoCode] = useState('');

  // 4. Payment Method states
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'naver' | 'kakao' | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  // 5. Terms state
  const [agreeTerms, setAgreeTerms] = useState(false);

  // 6. Confirmation Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Copy orderer information to shipping when checkbox changes
  useEffect(() => {
    if (isSameAsOrderer) {
      setRecipient(ordererName);
      setZipCode('06000');
      setAddress('서울 강남구 도산대로 178');
    } else {
      setRecipient('');
      setZipCode('');
      setAddress('');
      setDetailAddress('');
    }
  }, [isSameAsOrderer]);

  // Format price helper
  const formatPrice = (value: number) => {
    return `₩ ${value.toLocaleString()}`;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = 0;
  const discount = 0;
  const totalPayment = subtotal + shippingFee - discount;
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Form Validations to activate checkout
  const isFormValid = 
    cartItems.length > 0 &&
    agreeTerms &&
    recipient.trim() !== '' &&
    zipCode.trim() !== '' &&
    address.trim() !== '' &&
    paymentMethod !== null &&
    (paymentMethod !== 'card' || (cardNumber.trim() !== '' && expiry.trim() !== '' && cvc.trim() !== ''));

  // Trigger modal launch
  const handleCheckoutClick = () => {
    if (isFormValid) {
      setShowConfirmModal(true);
    }
  };

  // Close modal helper
  const closeModal = () => {
    setShowConfirmModal(false);
  };

  // 토스 페이먼츠 결제창 실행 및 백업 핸들러
  const handleTossPayment = () => {
    if (!(window as any).TossPayments) {
      alert('토스 페이먼츠 결제 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 눌러주세요.');
      return;
    }

    try {
      // 1. 페이지 전환 전 상태 소실 방지를 위한 로컬스토리지 백업
      localStorage.setItem('pending_order_recipient', recipient);
      localStorage.setItem('pending_order_address', `${address} ${detailAddress}`.trim());
      localStorage.setItem('pending_order_cart', JSON.stringify(cartItems));

      // 2. 토스 SDK 인스턴스화
      const tossPayments = (window as any).TossPayments('test_ck_vZnjEJeQVxPeEkJ25KyDVPmOoBN0');

      // 주문 ID 생성 (고유 키)
      const orderId = `order_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      
      // 상품 대표명 요약
      const orderName = cartItems.length > 0
        ? `${cartItems[0].name} ${cartItems[0].volume}${cartItems.length > 1 ? ` 외 ${cartItems.length - 1}건` : ''}`
        : '디프티크 향수';

      // 3. 결제창 요청 (가장 기본적이고 테스트가 원활한 '카드' 결제창)
      tossPayments.requestPayment('카드', {
        amount: totalPayment,
        orderId: orderId,
        orderName: orderName,
        customerName: recipient || ordererName,
        successUrl: `${window.location.origin}/?tossSuccess=true`,
        failUrl: `${window.location.origin}/?tossFail=true`,
      }).catch((err: any) => {
        console.error('Toss Payments request error:', err);
        alert(`결제 요청 실패: ${err.message || err}`);
      });
    } catch (error: any) {
      console.error('Toss Payments initialization failed:', error);
      alert(`토스 연동 에러: ${error.message || error}`);
    }
  };

  // Handle ESC keypress to close confirmation modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showConfirmModal) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showConfirmModal]);

  return (
    <div style={styles.pageContainer} className="animate-fade-in">
      {/* Self-contained CSS for high-performance form styling, animation, and transitions */}
      <style>{`
        /* Focus input border changes to solid black */
        .checkout-input:focus {
          border-color: #000000 !important;
          outline: none;
        }

        .checkout-select:focus {
          border-color: #000000 !important;
          outline: none;
        }

        /* Hover button opacity */
        .hover-btn {
          cursor: pointer;
          transition: opacity 250ms ease, background-color 250ms ease;
        }
        
        .hover-btn:hover {
          opacity: 0.9;
        }

        /* Payment toggles */
        .payment-toggle-btn {
          flex: 1;
          height: 44px;
          border-radius: 0px;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 250ms ease;
        }

        .payment-toggle-btn.active {
          background-color: #000000;
          color: #ffffff;
          border: 1px solid #000000;
        }

        .payment-toggle-btn.inactive {
          background-color: #ffffff;
          color: #000000;
          border: 1px solid #e2e2e2;
        }

        .payment-toggle-btn.inactive:hover {
          border-color: #000000;
        }

        /* Modal animations */
        @keyframes modalFadeInScale {
          0% {
            opacity: 0;
            transform: translate(-50%, -48%) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .animate-modal {
          animation: modalFadeInScale 220ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(1.5px);
          z-index: 2000;
        }

        .modal-panel {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% - 40px);
          max-width: 320px;
          background-color: #ffffff;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          z-index: 2001;
          color: #000000;
          padding: 24px;
        }
      `}</style>

      {/* Header bar wrapper to clear absolute layout */}
      <div style={{ position: 'relative', height: '64px', width: '100%', backgroundColor: '#000000', flexShrink: 0 }}>
        <Header onOpenCart={onOpenCart} cartCount={cartCount} onLogoClick={onBack} />
      </div>

      {/* Main Form Scroll Container */}
      <div style={styles.scrollBody}>
        <div style={styles.pageTitleContainer}>
          <h1 style={styles.pageTitle}>CHECKOUT</h1>
        </div>

        {/* 01 주문 상품 (Order Items) */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeader}>
            <span style={styles.sectionNumber}>01</span> 주문 상품
          </h2>
          
          <div style={styles.itemsList}>
            {cartItems.map((item) => (
              <div key={item.id} style={styles.itemRow}>
                <div style={styles.imageCard}>
                  <img src={item.image} alt={item.name} style={styles.itemImage} />
                </div>
                <div style={styles.itemDetails}>
                  <span style={styles.itemKind}>Eau de Parfum</span>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <span style={styles.itemVolume}>{item.volume}</span>
                  <div style={styles.itemPriceQty}>
                    <span style={styles.itemQty}>QTY {item.quantity}</span>
                    <span style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 02 주문자 정보 (Orderer Info) */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeader}>
            <span style={styles.sectionNumber}>02</span> 주문자 정보
          </h2>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>NAME</label>
            <input 
              type="text" 
              readOnly 
              value={ordererName} 
              style={styles.readonlyInput} 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>EMAIL</label>
            <input 
              type="text" 
              readOnly 
              value={ordererEmail} 
              style={styles.readonlyInput} 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>PHONE</label>
            <input 
              type="text" 
              readOnly 
              value={ordererPhone} 
              style={styles.readonlyInput} 
            />
          </div>
        </section>

        {/* 03 배송 정보 (Shipping Info) */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeader}>
            <span style={styles.sectionNumber}>03</span> 배송 정보
          </h2>
          
          {/* Copy from orderer checkbox */}
          <div style={styles.checkboxContainer}>
            <input 
              type="checkbox" 
              id="copy-orderer" 
              checked={isSameAsOrderer}
              onChange={(e) => setIsSameAsOrderer(e.target.checked)}
              style={styles.checkbox}
            />
            <label htmlFor="copy-orderer" style={styles.checkboxLabel}>
              주문자 정보와 동일
            </label>
          </div>

          {/* Recipient */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>RECIPIENT</label>
            <input 
              type="text" 
              className="checkout-input"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={styles.input}
              placeholder="수령인 성명"
            />
          </div>

          {/* Zip Code */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>ZIP CODE</label>
            <div style={styles.zipRow}>
              <input 
                type="text" 
                className="checkout-input"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                style={{ ...styles.input, flex: 1, marginBottom: 0 }}
                placeholder="우편번호"
              />
              <button 
                className="hover-btn" 
                style={styles.searchBtn}
                onClick={() => alert('주소 검색 기능 준비 중')}
              >
                <Search size={14} style={{ marginRight: '6px' }} />
                SEARCH
              </button>
            </div>
          </div>

          {/* Address */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>ADDRESS</label>
            <input 
              type="text" 
              className="checkout-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={styles.input}
              placeholder="기본 주소"
            />
          </div>

          {/* Detail Address */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>DETAIL ADDRESS</label>
            <input 
              type="text" 
              className="checkout-input"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              style={styles.input}
              placeholder="상세주소 입력"
            />
          </div>

          {/* Delivery Memo Dropdown */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>DELIVERY MEMO</label>
            <div style={styles.selectWrapper}>
              <select 
                className="checkout-select"
                value={deliveryMemoOption}
                onChange={(e) => setDeliveryMemoOption(e.target.value)}
                style={styles.select}
              >
                <option value="배송 전 연락 바랍니다.">배송 전 연락 바랍니다.</option>
                <option value="부재 시 문 앞에 놓아주세요.">부재 시 문 앞에 놓아주세요.</option>
                <option value="직접 입력">직접 입력</option>
              </select>
              <ChevronDown size={14} style={styles.selectArrow} />
            </div>

            {/* Custom memo input when "직접 입력" is selected */}
            {deliveryMemoOption === '직접 입력' && (
              <input 
                type="text"
                className="checkout-input"
                value={customMemo}
                onChange={(e) => setCustomMemo(e.target.value)}
                style={{ ...styles.input, marginTop: '8px' }}
                placeholder="배송 요청 사항을 입력해주세요."
              />
            )}
          </div>
        </section>

        {/* 04 할인 / 쿠폰 (Discount / Coupon) */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeader}>
            <span style={styles.sectionNumber}>04</span> 할인 / 쿠폰
          </h2>
          
          <div style={styles.promoRow}>
            <input 
              type="text" 
              className="checkout-input"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              style={{ ...styles.input, flex: 1, marginBottom: 0 }}
              placeholder="프로모션 코드 입력"
            />
            <button 
              className="hover-btn" 
              style={styles.applyBtn}
              onClick={() => console.log('Apply coupon clicked')}
            >
              APPLY
            </button>
          </div>
        </section>

        {/* 05 결제 수단 (Payment Method) */}
        <section style={styles.section}>
          <h2 style={styles.sectionHeader}>
            <span style={styles.sectionNumber}>05</span> 결제 수단
          </h2>
          
          {/* Method buttons toggle */}
          <div style={styles.paymentMethodsGrid}>
            <button 
              className={`payment-toggle-btn ${paymentMethod === 'card' ? 'active' : 'inactive'}`}
              onClick={() => setPaymentMethod('card')}
            >
              CREDIT CARD
            </button>
            <button 
              className={`payment-toggle-btn ${paymentMethod === 'naver' ? 'active' : 'inactive'}`}
              onClick={() => setPaymentMethod('naver')}
            >
              NAVER PAY
            </button>
            <button 
              className={`payment-toggle-btn ${paymentMethod === 'kakao' ? 'active' : 'inactive'}`}
              onClick={() => setPaymentMethod('kakao')}
            >
              KAKAO PAY
            </button>
          </div>

          {/* Conditional Credit Card inputs */}
          <div style={{
            opacity: paymentMethod === 'card' ? 1 : 0.4,
            pointerEvents: paymentMethod === 'card' ? 'auto' : 'none',
            transition: 'opacity 250ms ease',
          }}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>CARD NUMBER</label>
              <input 
                type="text" 
                className="checkout-input"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                style={styles.input}
                placeholder="0000 0000 0000 0000"
                disabled={paymentMethod !== 'card'}
              />
            </div>
            
            <div style={styles.cardDoubleRow}>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>EXPIRY</label>
                <input 
                  type="text" 
                  className="checkout-input"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  style={styles.input}
                  placeholder="MM/YY"
                  disabled={paymentMethod !== 'card'}
                />
              </div>
              
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>CVC</label>
                <input 
                  type="password" 
                  className="checkout-input"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  style={styles.input}
                  placeholder="***"
                  maxLength={3}
                  disabled={paymentMethod !== 'card'}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 06 최종 결제 (Final Payment) */}
        <section style={{ ...styles.section, borderBottom: 'none', paddingBottom: '40px' }}>
          <h2 style={styles.sectionHeader}>
            <span style={styles.sectionNumber}>06</span> 최종 결제
          </h2>
          
          <div style={styles.summaryBox}>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>SUBTOTAL</span>
              <span style={styles.summaryVal}>{formatPrice(subtotal)}</span>
            </div>
            
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>SHIPPING</span>
              <span style={styles.summaryVal}>{formatPrice(shippingFee)}</span>
            </div>
            
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>DISCOUNT</span>
              <span style={styles.summaryVal}>-{formatPrice(discount)}</span>
            </div>

            <hr style={styles.summaryDivider} />

            <div style={{ ...styles.summaryRow, marginBottom: '24px' }}>
              <span style={styles.totalLabel}>TOTAL</span>
              <span style={styles.totalVal}>{formatPrice(totalPayment)}</span>
            </div>

            {/* Terms checkbox */}
            <div style={{ ...styles.checkboxContainer, alignItems: 'flex-start' }}>
              <input 
                type="checkbox" 
                id="agree-terms" 
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ ...styles.checkbox, marginTop: '3px' }}
              />
              <label htmlFor="agree-terms" style={styles.termsLabel}>
                서비스 이용약관 및 개인정보 처리방침에 동의하며, 위의 주문 내용을 확인합니다.
              </label>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Bottom Bar */}
      <div style={styles.stickyFooter}>
        <div style={styles.footerSummary}>
          <span style={styles.footerLabel}>TOTAL AMOUNT</span>
          <span style={styles.footerPrice}>{formatPrice(totalPayment)}</span>
        </div>
        
        <button 
          className="hover-btn"
          style={{
            ...styles.checkoutSubmitBtn,
            backgroundColor: isFormValid ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
            color: isFormValid ? '#000000' : 'rgba(255, 255, 255, 0.4)',
            cursor: isFormValid ? 'pointer' : 'not-allowed',
          }}
          disabled={!isFormValid}
          onClick={handleCheckoutClick}
        >
          결제하기
        </button>
      </div>

      {/* Order Confirmation Modal */}
      {showConfirmModal && (
        <>
          {/* Overlay backdrop */}
          <div className="modal-overlay" onClick={closeModal} />
          
          {/* Panel */}
          <div className="modal-panel animate-modal">
            <h3 style={styles.modalTitle}>주문을 진행하시겠습니까?</h3>
            
            <div style={styles.modalBody}>
              <div style={styles.modalItemRow}>
                <span style={styles.modalLabel}>주문 상품</span>
                <span style={styles.modalVal}>{totalItemsCount}개</span>
              </div>
              
              <div style={styles.modalItemRow}>
                <span style={styles.modalLabel}>결제 금액</span>
                <span style={styles.modalValPrice}>{formatPrice(totalPayment)}</span>
              </div>
              
              <div style={styles.modalItemRowAddr}>
                <span style={styles.modalLabel}>배송지</span>
                <div style={styles.modalAddressDetails}>
                  <span style={styles.modalRecipientText}>{recipient}</span>
                  <span style={styles.modalAddressText}>{address} {detailAddress}</span>
                </div>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button 
                className="hover-btn" 
                style={styles.modalCancelBtn} 
                onClick={closeModal}
              >
                취소
              </button>
              <button 
                className="hover-btn" 
                style={styles.modalSubmitBtn}
                onClick={() => {
                  closeModal();
                  handleTossPayment();
                }}
              >
                결제하기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    position: 'relative',
    paddingBottom: '96px', // Spacing for sticky bottom footer (Safe Area)
  },
  scrollBody: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    backgroundColor: '#ffffff',
    paddingBottom: '96px', // Clear footer spacing
  },
  pageTitleContainer: {
    width: '100%',
    padding: '32px 24px 22px 24px', // 32px top margin (between header and title) and 22px bottom margin (between title and divider!)
    borderBottom: '1px solid #f0f0f0',
  },
  pageTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '24px',
    fontWeight: 400,
    color: '#000000',
    letterSpacing: '1px',
    textAlign: 'center',
  },
  section: {
    padding: '40px 24px', // Increased padding to 40px for clean spacing editorial look
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    flexDirection: 'column',
  },
  sectionHeader: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: 500,
    color: '#000000',
    marginBottom: '24px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  sectionNumber: {
    fontSize: '11px',
    fontFamily: 'var(--font-sans)',
    color: '#888888',
    letterSpacing: '0.5px',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  itemRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  imageCard: {
    width: '64px',
    height: '64px',
    backgroundColor: '#F4F0EB',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '4px',
    flexShrink: 0,
  },
  itemImage: {
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
    mixBlendMode: 'multiply',
  },
  itemDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  itemKind: {
    fontFamily: 'var(--font-sans)',
    fontSize: '9px',
    color: '#888888',
    letterSpacing: '0.5px',
  },
  itemName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '14px',
    fontWeight: 500,
    color: '#000000',
  },
  itemVolume: {
    fontFamily: 'var(--font-sans)',
    fontSize: '10px',
    color: '#888888',
  },
  itemPriceQty: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
  },
  itemQty: {
    fontFamily: 'var(--font-sans)',
    fontSize: '10px',
    fontWeight: 500,
    color: '#666666',
  },
  itemPrice: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 600,
    color: '#000000',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '16px',
  },
  label: {
    fontFamily: 'var(--font-sans)',
    fontSize: '10px',
    fontWeight: 600,
    color: '#888888',
    letterSpacing: '1px',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    height: '42px',
    border: '1px solid #e2e2e2',
    padding: '0 12px',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    color: '#000000',
    transition: 'border-color 0.2s ease',
  },
  readonlyInput: {
    width: '100%',
    height: '42px',
    border: 'none',
    borderBottom: '1px solid #f0f0f0',
    padding: '0 4px',
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    width: '15px',
    height: '15px',
    border: '1px solid #c0c0c0',
    borderRadius: '0px',
    accentColor: '#000000',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 500,
    color: '#000000',
    cursor: 'pointer',
  },
  zipRow: {
    display: 'flex',
    gap: '8px',
    width: '100%',
  },
  searchBtn: {
    height: '42px',
    padding: '0 16px',
    border: '1px solid #000000',
    backgroundColor: '#ffffff',
    color: '#000000',
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectWrapper: {
    position: 'relative',
    width: '100%',
  },
  select: {
    width: '100%',
    height: '42px',
    border: '1px solid #e2e2e2',
    padding: '0 30px 0 12px',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    color: '#000000',
    backgroundColor: '#ffffff',
    borderRadius: '0px',
    appearance: 'none',
    transition: 'border-color 0.2s ease',
    cursor: 'pointer',
  },
  selectArrow: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#888888',
    pointerEvents: 'none',
  },
  promoRow: {
    display: 'flex',
    gap: '8px',
    width: '100%',
  },
  applyBtn: {
    height: '42px',
    padding: '0 20px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '1px',
  },
  paymentMethodsGrid: {
    display: 'flex',
    gap: '8px',
    width: '100%',
    marginBottom: '20px',
  },
  cardDoubleRow: {
    display: 'flex',
    gap: '12px',
    width: '100%',
  },
  summaryBox: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fafafa',
    padding: '20px',
    border: '1px solid #f0f0f0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  summaryLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    color: '#666666',
  },
  summaryVal: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    color: '#000000',
    fontWeight: 500,
  },
  summaryDivider: {
    border: 'none',
    borderTop: '1px solid #e8e8e8',
    margin: '8px 0 16px 0',
  },
  totalLabel: {
    fontFamily: 'var(--font-serif)',
    fontSize: '14px',
    fontWeight: 600,
    color: '#000000',
  },
  totalVal: {
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 700,
    color: '#000000',
  },
  termsLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    color: '#666666',
    lineHeight: '1.5',
    cursor: 'pointer',
  },
  stickyFooter: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '390px',
    height: '84px', // Increased height to 84px to support Safe Area
    backgroundColor: '#000000',
    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px 24px 20px', // Extra bottom padding for Safe Area
    zIndex: 100,
    boxShadow: '0 -4px 15px rgba(0, 0, 0, 0.3)',
  },
  footerSummary: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  footerLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '8px',
    color: '#888888',
    letterSpacing: '0.5px',
  },
  footerPrice: {
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    fontWeight: 700,
    color: '#ffffff',
  },
  checkoutSubmitBtn: {
    height: '42px',
    padding: '0 28px',
    border: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '1px',
    transition: 'all 250ms ease',
  },
  modalTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '16px',
    fontWeight: 500,
    textAlign: 'center',
    marginBottom: '20px',
    color: '#000000',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
    borderTop: '1px solid #f0f0f0',
    borderBottom: '1px solid #f0f0f0',
    padding: '16px 0',
  },
  modalItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemRowAddr: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    color: '#888888',
  },
  modalVal: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 500,
    color: '#000000',
  },
  modalValPrice: {
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    fontWeight: 600,
    color: '#000000',
  },
  modalAddressDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    textAlign: 'right',
    maxWidth: '180px',
  },
  modalRecipientText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 600,
    color: '#000000',
  },
  modalAddressText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    color: '#666666',
    marginTop: '2px',
    lineHeight: '1.4',
  },
  modalActions: {
    display: 'flex',
    gap: '8px',
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    height: '42px',
    backgroundColor: '#ffffff',
    color: '#000000',
    border: '1px solid #e2e2e2',
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
  modalSubmitBtn: {
    flex: 1,
    height: '42px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
};
