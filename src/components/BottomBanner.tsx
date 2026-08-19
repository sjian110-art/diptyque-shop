import React from 'react';

export const BottomBanner: React.FC = () => {
  return (
    <section style={styles.container}>
      <div style={styles.overlay}>
        <h2 style={styles.text}>
          L'ART DU
          <br />
          PARFUM
        </h2>
      </div>
    </section>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    aspectRatio: '390 / 468',
    backgroundImage: 'url("/assets_1/Home_Banner_Overlay.png"), url("/assets_1/Home_Banner_2.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.15)',
    paddingBottom: '40px', // Shifts the text slightly above the center
  },
  text: {
    fontFamily: 'var(--font-serif)',
    fontSize: '28px',
    fontWeight: 400,
    letterSpacing: '4px',
    lineHeight: '1.25', // Spacing between the two lines
    color: '#ffffff',
    textAlign: 'center',
    textShadow: '0 2px 15px rgba(0, 0, 0, 0.6)',
  },
};
