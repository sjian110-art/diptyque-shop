import React, { useState, useEffect, useRef } from 'react';
import Home_Hero2_Background from '../assets/Home_Hero2_Background.png';
import Home_Hero3_Background from '../assets/Home_Hero3_Background.png';
import App_Home_Banner1_New from '../assets/App_Home_Banner1_New.png';
import App_Home_Banner1_Overlay_New from '../assets/App_Home_Banner1_Overlay_New.png';

interface Slide {
  bg: string;
  overlayImg?: string; // Optional image overlay layered above the dark tint
  subTitle: string;
  title: string;
  linkText: string;
}

const SLIDES: Slide[] = [
  {
    bg: App_Home_Banner1_New,
    overlayImg: App_Home_Banner1_Overlay_New,
    subTitle: 'DIPTYQUE PARIS',
    title: '시간을 담은 향기',
    linkText: '자세히 보기',
  },
  {
    bg: Home_Hero2_Background,
    overlayImg: App_Home_Banner1_Overlay_New,
    subTitle: '오 드 뚜왈렛',
    title: '가볍고 경쾌한 터치',
    linkText: '자세히 보기',
  },
  {
    bg: Home_Hero3_Background,
    overlayImg: App_Home_Banner1_Overlay_New,
    subTitle: '오 드 퍼퓸',
    title: '깊고 풍부한 잔향',
    linkText: '자세히 보기',
  },
];

interface HeroSectionProps {
  onLearnMoreClick?: (slideIndex: number) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onLearnMoreClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Interaction and AutoPlay state refs
  const autoPlayIntervalRef = useRef<any>(null);
  const resumeTimeoutRef = useRef<any>(null);
  
  // Dragging gesture state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  // Helper to start automatic slide changes (every 12 seconds for a highly premium, editorial tempo)
  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayIntervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 12000);
  };

  // Helper to clear timers
  const stopAutoPlay = () => {
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  // Schedule autoplay resumption after 12 seconds of no activity (matching the 12s interval)
  const handleInteractionEnd = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      startAutoPlay();
    }, 12000);
  };

  // Touch & Mouse Gesture Handlers
  const handleDragStart = (clientX: number) => {
    isDraggingRef.current = true;
    startXRef.current = clientX;
    currentXRef.current = clientX;
    stopAutoPlay(); // Stop autoplay immediately on touch/drag start
  };

  const handleDragMove = (clientX: number) => {
    if (!isDraggingRef.current) return;
    currentXRef.current = clientX;
  };

  const handleDragEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    
    const diffX = currentXRef.current - startXRef.current;
    
    // Swipe left (next) or swipe right (prev) with a threshold of 50px
    if (diffX < -50) {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    } else if (diffX > 50) {
      setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    }
    
    // Resume autoplay after 5 seconds
    handleInteractionEnd();
  };

  // Init/Cleanup AutoPlay
  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  return (
    <section 
      style={styles.container}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
      onTouchEnd={handleDragEnd}
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onMouseMove={(e) => handleDragMove(e.clientX)}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* Slides Container */}
      <div style={styles.slidesWrapper}>
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div 
              key={idx} 
              style={{
                ...styles.slide,
                backgroundImage: `url("${slide.bg}")`,
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'translateX(0px)' : idx < currentIndex ? 'translateX(-20px)' : 'translateX(20px)',
              }}
            >
              {/* Opaque black layer (30% - 40% opacity overlay to keep typography readable) */}
              <div style={styles.overlay} />

              {/* Optional image overlay (e.g. texture or branded graphic) */}
              {slide.overlayImg && (
                <img
                  src={slide.overlayImg}
                  alt=""
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 1,
                    pointerEvents: 'none',
                    // Slide 2 has a visible hard edge at the bottom — apply a gradient mask
                    // that fades the overlay out before it reaches the bottom edge
                    ...(idx === 1 && {
                      WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                      maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                    }),
                  }}
                />
              )}
              
              {/* Slide content texts overlay */}
              <div style={styles.textContainer}>
                <span style={styles.subTitle}>{slide.subTitle}</span>
                <h1 style={styles.title}>{slide.title}</h1>
                <a 
                  href="#details" 
                  style={styles.link}
                  onClick={(e) => {
                    e.preventDefault();
                    if (onLearnMoreClick) {
                      onLearnMoreClick(idx);
                    }
                  }}
                >
                  {slide.linkText}
                  <span style={styles.arrow}>→</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Circular Pagination Indicators */}
      <div style={styles.pagination}>
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            style={{
              ...styles.dot,
              backgroundColor: idx === currentIndex ? '#ffffff' : 'transparent',
              border: '1.5px solid #ffffff',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
              stopAutoPlay();
              handleInteractionEnd();
            }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    height: '540px',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'grab',
    userSelect: 'none',
  },
  slidesWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  slide: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center 35%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: '80px',
    transition: 'opacity 1200ms cubic-bezier(0.25, 1, 0.3, 1), transform 1200ms cubic-bezier(0.25, 1, 0.3, 1)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    opacity: 0.35, // Balanced opacity between 30% and 40% for text contrast
    zIndex: 1,
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    color: '#ffffff',
    zIndex: 2,
  },
  subTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '11px',
    fontWeight: 300,
    letterSpacing: '3px',
    color: '#dddddd',
    marginBottom: '8px',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '32px',
    fontWeight: 400,
    letterSpacing: '1px',
    marginBottom: '16px',
  },
  link: {
    fontFamily: 'var(--font-serif)',
    fontSize: '11px',
    fontWeight: 300,
    letterSpacing: '2px',
    color: '#ffffff',
    borderBottom: '1px solid #ffffff',
    paddingBottom: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  arrow: {
    fontSize: '11px',
  },
  pagination: {
    position: 'absolute',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
    zIndex: 3,
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    cursor: 'pointer',
    padding: 0,
    transition: 'background-color 0.2s ease',
  },
};
