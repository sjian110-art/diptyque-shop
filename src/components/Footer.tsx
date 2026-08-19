import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={styles.container}>
      <div style={styles.logoContainer}>
        <span style={styles.logoText}>DIPTYQUE</span>
      </div>
      
      <div style={styles.linksContainer}>
        <a href="#sustainability" style={styles.link}>Sustainability</a>
        <a href="#shipping" style={styles.link}>Shipping</a>
        <a href="#contact" style={styles.link}>Contact</a>
        <a href="#boutiques" style={styles.link}>Boutiques</a>
      </div>
      
      <div style={styles.copyrightContainer}>
        <span style={styles.copyrightText}>© 2024 DIPTYQUE PARIS</span>
      </div>
    </footer>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#0e0e0e',
    width: '100%',
    padding: '48px 24px 60px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  logoContainer: {
    marginBottom: '28px',
  },
  logoText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: 300,
    letterSpacing: '4px',
    color: '#ffffff',
  },
  linksContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '16px 20px',
    maxWidth: '280px',
    marginBottom: '36px',
  },
  link: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 300,
    color: '#b0b0b0',
    letterSpacing: '1px',
    textTransform: 'capitalize',
  },
  copyrightContainer: {
    width: '100%',
    textAlign: 'center',
  },
  copyrightText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '9px',
    fontWeight: 300,
    color: 'var(--text-muted)',
    letterSpacing: '2px',
  },
};
