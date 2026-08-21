import React from 'react';
import { Header } from './Header';

interface OrderCompletePageProps {
  recipient: string;
  address: string;
  totalAmount: number;
  itemCount?: number;
  itemSummaryText: string;
  onContinueShopping: () => void;
  onSearchClick?: () => void;
  onMenuClick?: () => void;
}

export const OrderCompletePage: React.FC<OrderCompletePageProps> = ({
  recipient,
  address,
  totalAmount,
  itemSummaryText,
  onContinueShopping,
  onSearchClick,
  onMenuClick,
}) => {
  const formatPrice = (value: number) => {
    return `₩ ${value.toLocaleString()}`;
  };

  return (
    <div style={styles.pageContainer} className="animate-fade-in">
      {/* Self-contained CSS for high-performance hover states */}
      <style>{`
        .continue-btn {
          width: 100%;
          height: 50px;
          background-color: #000000;
          color: #ffffff;
          border: none;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: background-color 250ms ease;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 32px;
        }

        .continue-btn:hover {
          background-color: #222222;
        }

      `}</style>
      <Header onLogoClick={onContinueShopping} showBackButton={false} onSearchClick={onSearchClick} onMenuClick={onMenuClick} />

      {/* Complete info panel */}
      <main style={styles.main}>
        {/* Completed PNG Icon from assets */}
        <div style={styles.iconContainer}>
          <img 
            src="/assets_1/Completed.png" 
            alt="Success" 
            style={styles.completedIcon} 
          />
        </div>

        <h1 style={styles.title}>주문이 완료되었습니다.</h1>
        <p style={styles.subTitle}>
          디프티크를 선택해주셔서 감사합니다.
          <br />
          주문하신 상품이 안전하게 배송될 예정입니다.
        </p>

        {/* Order Details box */}
        <div style={styles.detailsBox}>
          <h2 style={styles.detailsHeader}>주문 내역</h2>
          
          <div style={styles.detailRow}>
            <span style={styles.label}>주문 상품</span>
            <span style={styles.val}>{itemSummaryText}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.label}>결제 금액</span>
            <span style={{ ...styles.val, fontWeight: 700 }}>{formatPrice(totalAmount)}</span>
          </div>

          <hr style={styles.divider} />

          <h2 style={styles.detailsHeader}>배송 정보</h2>
          
          <div style={styles.detailRow}>
            <span style={styles.label}>수령인</span>
            <span style={styles.val}>{recipient}</span>
          </div>

          <div style={styles.detailRowAddr}>
            <span style={styles.label}>배송지</span>
            <span style={styles.valAddress}>{address}</span>
          </div>
        </div>

        {/* Resume Shopping button */}
        <button className="continue-btn" onClick={onContinueShopping}>
          쇼핑 계속하기
        </button>
      </main>
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
    color: '#000000',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '124px 24px 60px 24px', // Increased top padding for fixed header clearance
    backgroundColor: '#ffffff',
  },
  iconContainer: {
    width: '56px',
    height: '56px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '28px',
  },
  completedIcon: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '24px',
    fontWeight: 500,
    color: '#000000',
    marginBottom: '12px',
    textAlign: 'center',
  },
  subTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '13px',
    color: '#666666',
    textAlign: 'center',
    lineHeight: '1.6',
    marginBottom: '40px',
  },
  detailsBox: {
    width: '100%',
    backgroundColor: '#fafafa',
    border: '1px solid #f0f0f0',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
  },
  detailsHeader: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 600,
    color: '#888888',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    alignItems: 'center',
  },
  detailRowAddr: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  label: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    color: '#666666',
  },
  val: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    color: '#000000',
    fontWeight: 500,
  },
  valAddress: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    color: '#000000',
    fontWeight: 500,
    maxWidth: '200px',
    textAlign: 'right',
    lineHeight: '1.4',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e8e8e8',
    margin: '12px 0 20px 0',
  },
};
