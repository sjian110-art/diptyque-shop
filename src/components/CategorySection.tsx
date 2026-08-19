import React, { useState, useRef, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = ['FLORAL', 'WOODY', 'AMBER', 'FRUITY', 'CITRUS'];

interface RippleInstance {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface CategoryItemProps {
  category: string;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category }) => {
  const [ripples, setRipples] = useState<RippleInstance[]>([]);
  const textRef = useRef<HTMLSpanElement>(null);
  const nextId = useRef(0);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!textRef.current) return;

    const rect = textRef.current.getBoundingClientRect();

    // Click position relative to the text element
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Ripple needs to cover the entire text element
    const maxDim = Math.max(rect.width, rect.height);
    const size = maxDim * 2.4;

    const id = nextId.current++;
    setRipples((prev) => [...prev, { id, x, y, size }]);

    // Remove this ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 900);
  }, []);

  return (
    <div style={styles.itemWrapper}>
      <a
        href={`#category-${category.toLowerCase()}`}
        style={styles.item}
        onClick={handleClick}
        className="category-link"
      >
        <span
          ref={textRef}
          style={styles.textContainer}
          className="category-text"
        >
          {/* Ripple container — clipped to text bounds */}
          <span style={styles.rippleHost} aria-hidden="true">
            {ripples.map((r) => (
              <span
                key={r.id}
                className="ink-ripple"
                style={{
                  width: r.size,
                  height: r.size,
                  left: r.x - r.size / 2,
                  top: r.y - r.size / 2,
                }}
              />
            ))}
          </span>
          {category}
        </span>

        <ArrowRight
          size={16}
          strokeWidth={1.2}
          className="category-arrow"
          style={styles.arrow}
        />
      </a>
    </div>
  );
};

export const CategorySection: React.FC = () => {
  return (
    <section style={styles.container}>
      <style>{`
        /* ── Base text ── */
        .category-text {
          color: #ffffff;
          transition: color 270ms ease;
          cursor: pointer;
          display: inline-block;
          position: relative;
        }

        /* ── Hover: ivory colour only on the text itself ── */
        .category-text:hover {
          color: #f5f1e8;
        }

        /* ── Arrow follows text hover ── */
        .category-text:hover ~ .category-arrow,
        .category-link:has(.category-text:hover) .category-arrow {
          transform: translateX(6px) !important;
          color: #f5f1e8 !important;
        }

        /* ── Ink ripple keyframe ── */
        @keyframes inkSpread {
          0% {
            transform: scale(0);
            opacity: 0.55;
          }
          60% {
            opacity: 0.18;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        /* ── Ripple element ── */
        .ink-ripple {
          position: absolute;
          border-radius: 50%;
          background: #f5f1e8;
          pointer-events: none;
          animation: inkSpread 900ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
          will-change: transform, opacity;
        }
      `}</style>

      <h2 style={styles.title}>나에게 맞는 향 찾기</h2>

      <div style={styles.listContainer}>
        {CATEGORIES.map((category) => (
          <CategoryItem key={category} category={category} />
        ))}
      </div>
    </section>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    padding: '60px 24px',
    backgroundColor: '#000000',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: 400,
    color: '#ffffff',
    marginBottom: '32px',
    letterSpacing: '0.5px',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1.5px solid rgba(255, 255, 255, 0.12)',
  },
  itemWrapper: {
    borderBottom: '1.5px solid rgba(255, 255, 255, 0.12)',
    width: '100%',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 0',
    width: '100%',
    color: '#ffffff',
    position: 'relative',
    textDecoration: 'none',
  },
  textContainer: {
    fontFamily: 'var(--font-serif)',
    fontSize: '22px',
    fontWeight: 400,
    letterSpacing: '1px',
    position: 'relative',
    display: 'inline-block',
    // Clip ripple strictly within text bounds
    overflow: 'hidden',
  },
  rippleHost: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    borderRadius: '2px',
  },
  arrow: {
    color: '#ffffff',
    opacity: 0.8,
    transition: 'transform 350ms ease-in-out, color 350ms ease-in-out',
  },
};
