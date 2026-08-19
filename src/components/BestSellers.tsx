import React from 'react';

interface Product {
  id: string;
  name: string;
  subName: string;
  price: string;
  image: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'doson',
    name: 'Do Son',
    subName: '오 드 퍼퓸',
    price: '₩269,000',
    image: '/assets_1/DoSon.png',
  },
  {
    id: 'philosykos',
    name: 'Philosykos',
    subName: '오 드 퍼퓸',
    price: '₩269,000',
    image: '/assets_1/Philosykos.png',
  },
];

interface BestSellersProps {
  onProductClick?: (productId: string) => void;
}

export const BestSellers: React.FC<BestSellersProps> = ({ onProductClick }) => {
  return (
    <section style={styles.container}>
      <h2 style={styles.sectionTitle}>BEST SELLER</h2>
      
      <div style={styles.grid}>
        {PRODUCTS.map((product) => (
          <div 
            key={product.id} 
            style={styles.card}
            onClick={() => onProductClick?.(product.id)}
          >
            <div style={styles.imageWrapper}>
              <img 
                src={product.image} 
                alt={product.name} 
                style={styles.image} 
              />
            </div>
            
            <div style={styles.infoWrapper}>
              <h3 style={styles.productName}>{product.name}</h3>
              <span style={styles.productSub}>{product.subName}</span>
              <span style={styles.productPrice}>{product.price}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    padding: '40px 16px 60px 16px',
    backgroundColor: '#000000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    fontWeight: 400,
    color: '#ffffff',
    letterSpacing: '3px',
    marginBottom: '32px',
    textAlign: 'center',
  },
  grid: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: 'var(--cream-bg)',
    borderRadius: '0px',
    padding: '30px 12px 24px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '290px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    cursor: 'pointer',
  },
  imageWrapper: {
    height: '110px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  image: {
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
    mixBlendMode: 'multiply', // Blends image background seamlessly with cream card
  },
  infoWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
  },
  productName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '15px',
    fontWeight: 500,
    color: 'var(--cream-text)',
    marginBottom: '4px',
  },
  productSub: {
    fontFamily: 'var(--font-sans)',
    fontSize: '10px',
    fontWeight: 300,
    color: '#888888',
    marginBottom: '10px',
    letterSpacing: '1px',
  },
  productPrice: {
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--cream-text)',
  },
};
