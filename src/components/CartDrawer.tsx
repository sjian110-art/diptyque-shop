import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';

export interface CartItemType {
  id: string;
  name: string;
  subName: string;
  volume: string;
  price: number; // numeric value for math calculations (e.g. 269000)
  quantity: number;
  image: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItemType[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onCheckoutClick?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onCheckoutClick,
}) => {
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Handle ESC keypress to close drawer
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

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

  // Handle quantity decrement and animated removal
  const handleDecrement = (item: CartItemType) => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    } else {
      handleDeleteItem(item);
    }
  };

  // Handle individual delete icon button clicks
  const handleDeleteItem = (item: CartItemType) => {
    setDeletingItemId(item.id);
    setTimeout(() => {
      onUpdateQuantity(item.id, 0); // Sets quantity to 0 which filters it out in App.tsx
      setDeletingItemId(null);
    }, 280);
  };

  return (
    <>
      {/* Self-contained CSS transitions and keyframes */}
      <style>{`
        .drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(2px);
          z-index: 1000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 350ms cubic-bezier(0.25, 1, 0.5, 1);
        }
        
        .drawer-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        .drawer-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          max-width: 360px; /* Aligns with standard mobile screen width proportions */
          height: 100vh;
          background-color: #ffffff;
          box-shadow: -6px 0 24px rgba(0, 0, 0, 0.15);
          z-index: 1001;
          transform: translateX(100%);
          transition: transform 350ms cubic-bezier(0.25, 1, 0.5, 1);
          display: flex;
          flex-direction: column;
          color: #000000;
        }

        .drawer-panel.open {
          transform: translateX(0);
        }

        .cart-close-btn {
          cursor: pointer;
          background: transparent;
          border: none;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000000;
          transition: transform 0.2s ease;
        }

        .cart-close-btn:hover {
          transform: scale(1.15);
        }

        .checkout-btn {
          width: 100%;
          height: 48px;
          background-color: #000000;
          color: #ffffff;
          border: none;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: background-color 200ms ease, opacity 200ms ease;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .checkout-btn:hover:not(:disabled) {
          background-color: #222222;
        }

        .checkout-btn:disabled {
          background-color: #000000;
          opacity: 0.4;
          cursor: not-allowed;
        }

        .counter-btn {
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #777777;
          transition: color 0.15s ease;
        }

        .counter-btn:hover {
          color: #000000;
        }

        .item-delete-btn {
          border: none;
          background: transparent;
          cursor: pointer;
          color: #888888;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease, transform 0.2s ease;
          align-self: flex-start;
        }

        .item-delete-btn:hover {
          color: #000000;
          transform: scale(1.15);
        }

        /* Fade-out removal keyframes */
        @keyframes fadeOutItem {
          0% {
            opacity: 1;
            transform: scale(1);
            max-height: 80px;
            margin-bottom: 0px;
          }
          100% {
            opacity: 0;
            transform: scale(0.9);
            max-height: 0px;
            margin-bottom: -20px;
          }
        }
        .fade-out-item {
          animation: fadeOutItem 280ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
          overflow: hidden;
        }
      `}</style>

      {/* Backdrop overlay */}
      <div 
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose} 
      />

      {/* Panel Container */}
      <div className={`drawer-panel ${isOpen ? 'open' : ''}`}>
        {/* Drawer Header (Close X is on the LEFT, Title is CENTERED) */}
        <header style={styles.header}>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close Cart" style={styles.closeButtonLeft}>
            <X size={20} strokeWidth={1.5} />
          </button>
          <h2 style={styles.headerTitleCentered}>장바구니 ({totalItemsCount})</h2>
        </header>

        {/* Drawer Items Scroll Container */}
        <div style={styles.itemsScrollContainer}>
          {cartItems.length === 0 ? (
            <div style={styles.emptyContainer}>
              <p style={styles.emptyText}>장바구니가 비어 있습니다.</p>
              <p style={styles.emptySubText}>
                원하는 향을 담아
                <br />
                나만의 컬렉션을 시작해보세요.
              </p>
            </div>
          ) : (
            <div style={styles.itemsList}>
              {cartItems.map((item) => {
                // Map '오 드 퍼퓸' subtitle details to English standard 'Eau de Parfum' requested by prompt
                const displayKind = item.subName === '오 드 퍼퓸' ? 'Eau de Parfum' : item.subName;
                return (
                  <div 
                    key={item.id} 
                    style={styles.itemCard}
                    className={deletingItemId === item.id ? 'fade-out-item' : ''}
                  >
                    {/* Item Image Card */}
                    <div style={styles.imageCard}>
                      <img src={item.image} alt={item.name} style={styles.itemImage} />
                    </div>

                    {/* Item Info Detail */}
                    <div style={styles.itemInfo}>
                      <div style={styles.itemDetails}>
                        <h3 style={styles.itemName}>{item.name}</h3>
                        <span style={styles.itemMeta}>
                          {displayKind} {item.volume}
                        </span>
                      </div>

                      {/* Quantity counter and Price */}
                      <div style={styles.itemRow}>
                        <div style={styles.counter}>
                          <button 
                            className="counter-btn"
                            onClick={() => handleDecrement(item)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={10} strokeWidth={2} />
                          </button>
                          <span style={styles.counterVal}>{item.quantity}</span>
                          <button 
                            className="counter-btn"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={10} strokeWidth={2} />
                          </button>
                        </div>
                        
                        <span style={styles.itemPrice}>
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Far right individual delete (X) button */}
                    <button 
                      className="item-delete-btn"
                      onClick={() => handleDeleteItem(item)}
                      aria-label="Delete item"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary Details (Always Visible) */}
        <div style={styles.summaryContainer}>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>상품 금액</span>
            <span style={styles.summaryValue}>{formatPrice(subtotal)}</span>
          </div>
          
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>배송비</span>
            <span style={styles.summaryValue}>{formatPrice(shippingFee)}</span>
          </div>
          
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>할인</span>
            <span style={styles.summaryValue}>-{formatPrice(discount)}</span>
          </div>

          <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
            <span style={styles.totalLabel}>총 결제 금액</span>
            <span style={styles.totalValue}>{formatPrice(totalPayment)}</span>
          </div>

          <button 
            className="checkout-btn"
            disabled={cartItems.length === 0}
            onClick={() => {
              if (onCheckoutClick) {
                onCheckoutClick();
              }
            }}
          >
            결제하기
          </button>
        </div>
      </div>
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    padding: '24px 20px',
    display: 'flex',
    justifyContent: 'center', // Center title
    alignItems: 'center',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
    position: 'relative',
  },
  closeButtonLeft: {
    position: 'absolute',
    left: '16px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
  },
  headerTitleCentered: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: 400,
    color: '#000000',
    letterSpacing: '0.5px',
  },
  itemsScrollContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
  },
  emptyContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#888888',
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '15px',
    color: '#000000',
    marginBottom: '8px',
  },
  emptySubText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '12px',
    color: '#888888',
    lineHeight: '1.6',
    maxWidth: '240px',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  itemCard: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    width: '100%',
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
  itemInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflow: 'hidden',
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  itemName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '14px',
    fontWeight: 500,
    color: '#000000',
  },
  itemMeta: {
    fontFamily: 'var(--font-sans)',
    fontSize: '10px',
    color: '#888888',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counter: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    padding: '2px',
  },
  counterVal: {
    fontSize: '11px',
    fontWeight: 500,
    minWidth: '24px',
    textAlign: 'center',
  },
  itemPrice: {
    fontFamily: 'var(--font-sans)',
    fontSize: '13px',
    fontWeight: 600,
    color: '#000000',
  },
  summaryContainer: {
    padding: '24px 20px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  summaryLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    color: '#555555',
  },
  summaryValue: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    color: '#000000',
  },
  totalRow: {
    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
    paddingTop: '16px',
    marginBottom: '20px',
  },
  totalLabel: {
    fontFamily: 'var(--font-serif)',
    fontSize: '14px',
    fontWeight: 600,
    color: '#000000',
  },
  totalValue: {
    fontFamily: 'var(--font-sans)',
    fontSize: '16px',
    fontWeight: 700,
    color: '#000000',
  },
};
