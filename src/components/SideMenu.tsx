import React, { useEffect, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: 'home' | 'login' | 'detail' | 'checkout' | 'complete' | 'mypage' | 'search' | 'recommend' | 'collections') => void;
}

const COUNTRIES = [
  "AFGHANISTAN", "ALBANIA", "ALGERIA", "ANDORRA", "ANGOLA", "ARGENTINA", "ARMENIA", "AUSTRALIA", "AUSTRIA", "AZERBAIJAN",
  "BAHAMAS", "BAHRAIN", "BANGLADESH", "BARBADOS", "BELARUS", "BELGIUM", "BELIZE", "BENIN", "BHUTAN", "BOLIVIA",
  "BOSNIA & HERZEGOVINA", "BOTSWANA", "BRAZIL", "BRUNEI", "BULGARIA", "CAMBODIA", "CAMEROON", "CANADA", "CHILE", "CHINA",
  "COLOMBIA", "CONGO", "COSTA RICA", "CROATIA", "CUBA", "CYPRUS", "CZECH REPUBLIC", "DENMARK", "DOMINICAN REPUBLIC", "ECUADOR",
  "EGYPT", "EL SALVADOR", "ESTONIA", "ETHIOPIA", "FIJI", "FINLAND", "FRANCE", "GEORGIA", "GERMANY", "GHANA",
  "GREECE", "GUATEMALA", "HONDURAS", "HUNGARY", "ICELAND", "INDIA", "INDONESIA", "IRAN", "IRAQ", "IRELAND",
  "ISRAEL", "ITALY", "JAMAICA", "JAPAN", "JORDAN", "KAZAKHSTAN", "KENYA", "KUWAIT", "LATVIA", "LEBANON",
  "LIBYA", "LIECHTENSTEIN", "LITHUANIA", "LUXEMBOURG", "MADAGASCAR", "MALAYSIA", "MALDIVES", "MALTA", "MEXICO", "MONACO",
  "MONGOLIA", "MOROCCO", "MYANMAR", "NEPAL", "NETHERLANDS", "NEW ZEALAND", "NICARAGUA", "NIGERIA", "NORTH KOREA", "NORWAY",
  "OMAN", "PAKISTAN", "PANAMA", "PARAGUAY", "PERU", "PHILIPPINES", "POLAND", "PORTUGAL", "QATAR", "ROMANIA",
  "RUSSIA", "SAUDI ARABIA", "SENEGAL", "SERBIA", "SINGAPORE", "SLOVAKIA", "SLOVENIA", "SOUTH AFRICA", "SOUTH KOREA", "SPAIN",
  "SRI LANKA", "SUDAN", "SWEDEN", "SWITZERLAND", "SYRIA", "TAIWAN", "THAILAND", "TUNISIA", "TURKEY", "UGANDA",
  "UKRAINE", "UNITED ARAB EMIRATES", "UNITED KINGDOM", "UNITED STATES", "URUGUAY", "UZBEKISTAN", "VENEZUELA", "VIETNAM", "YEMEN", "ZIMBABWE"
];

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animateClose, setAnimateClose] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("SOUTH KOREA");
  const [showCountryAlert, setShowCountryAlert] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setAnimateClose(false);
      setDropdownOpen(false);
      setSelectedCountry("SOUTH KOREA");
      setShowCountryAlert(false);
    } else if (shouldRender) {
      setAnimateClose(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Wait for transition animation (300ms)
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCountrySelect = (_countryName: string) => {
    // Show alert popup immediately
    setShowCountryAlert(true);
    // Keep internal selection to South Korea or reset back
    setSelectedCountry("SOUTH KOREA");
    // Close dropdown
    setDropdownOpen(false);
  };

  if (!shouldRender) return null;

  const isVisible = isOpen && !animateClose;

  return (
    <div style={styles.menuContainer}>
      {/* Dimmed Backdrop */}
      <div 
        style={{
          ...styles.backdrop,
          opacity: isVisible ? 1 : 0,
        }}
        onClick={onClose}
      />

      {/* Slide-out Menu Panel */}
      <div 
        style={{
          ...styles.panel,
          transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Header Row */}
        <div style={styles.header}>
          <button 
            type="button" 
            onClick={onClose} 
            style={styles.closeBtn}
            aria-label="Close menu"
          >
            <X size={20} color="#ffffff" strokeWidth={1.5} />
          </button>
          <div style={styles.logoWrapper}>
            <span style={styles.logoText}>DIPTYQUE</span>
          </div>
        </div>

        {/* Scrollable container for menu contents */}
        <div className="side-menu-scroll-content" style={styles.scrollContent}>
          {/* Main Menu List */}
          <div style={styles.mainMenuList}>
            {['EAU DE PARFUM', 'EAU DE TOILETTE', 'FIND YOUR SCENT', 'COLLECTIONS', 'MAISON'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="side-menu-main-item"
                style={styles.mainMenuItem}
                onClick={(e) => {
                  e.preventDefault();
                  if (item === 'COLLECTIONS' && onNavigate) {
                    onNavigate('collections');
                    onClose();
                  } else if (item === 'FIND YOUR SCENT' && onNavigate) {
                    onNavigate('search');
                    onClose();
                  }
                }}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Sub Menu List */}
          <div style={styles.subMenuList}>
            {['로그인 / 회원가입', '주문조회', '향수 비교하기', '위시리스트', '고객 서비스'].map((item) => (
              <a 
                key={item} 
                href="#link"
                className="side-menu-sub-item"
                style={styles.subMenuItem}
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                {item}
              </a>
            ))}
            
            {/* Country Selection Container */}
            <div style={styles.countryRowContainer}>
              <div 
                style={styles.countryRow} 
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span style={styles.countryLabel}>국가: </span>
                <span style={styles.countryValue}>
                  {selectedCountry}
                  <ChevronDown 
                    size={11} 
                    style={{
                      ...styles.chevron,
                      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 200ms ease',
                    }} 
                  />
                </span>
              </div>

              {/* Dropdown Scrollable Country List */}
              <div 
                className="country-dropdown-scrollbar"
                style={{
                  ...styles.dropdownList,
                  maxHeight: dropdownOpen ? '150px' : '0px',
                  opacity: dropdownOpen ? 1 : 0,
                  pointerEvents: dropdownOpen ? 'auto' : 'none',
                }}
              >
                {COUNTRIES.map((country) => {
                  const isSelected = country === "SOUTH KOREA";
                  return (
                    <div 
                      key={country}
                      className={`country-item ${isSelected ? 'active' : ''}`}
                      onClick={() => handleCountrySelect(country)}
                      style={styles.dropdownItem}
                    >
                      <span style={{ flex: 1 }}>{country}</span>
                      {isSelected && <span style={styles.checkMark}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Country Service Warning Alert Popup Modal */}
      {showCountryAlert && (
        <div style={styles.alertOverlay}>
          <div className="animate-alert-modal" style={styles.alertPanel}>
            <h3 style={styles.alertTitle}>국가 변경 준비 중</h3>
            <p style={styles.alertSubtitle}>
              국가별 서비스는 현재 준비 중입니다.<br/>
              추후 업데이트를 통해 지원될 예정입니다.
            </p>
            <button 
              type="button"
              className="alert-confirm-btn"
              style={styles.alertConfirmBtn}
              onClick={() => setShowCountryAlert(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* CSS stylesheet for hover, scrollbars and active transitions */}
      <style>{`
        /* Main menu item spring bounce on hover */
        .side-menu-main-item {
          display: block;
          transform: translateX(0);
          transition: transform 320ms cubic-bezier(0.25, 1, 0.5, 1.25) !important;
        }
        .side-menu-main-item:hover {
          transform: translateX(12px) !important;
        }

        /* Hide scrollbars for side menu scroll content */
        .side-menu-scroll-content::-webkit-scrollbar {
          display: none !important;
        }
        .side-menu-scroll-content {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        .side-menu-sub-item {
          color: #cccccc !important;
          transition: color 180ms ease !important;
        }
        .side-menu-sub-item:hover,
        .side-menu-sub-item:active {
          color: #ffffff !important;
        }

        /* Country dropdown item hover & active states */
        .country-item {
          color: #888888 !important;
          transition: color 150ms ease, background-color 150ms ease !important;
        }
        .country-item:hover {
          color: #ffffff !important;
          background-color: rgba(255, 255, 255, 0.05) !important;
        }
        .country-item.active {
          color: #ffffff !important;
          font-weight: 500 !important;
        }

        /* Webkit scrollbar for country dropdown */
        .country-dropdown-scrollbar::-webkit-scrollbar {
          width: 4px !important;
        }
        .country-dropdown-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02) !important;
        }
        .country-dropdown-scrollbar::-webkit-scrollbar-thumb {
          background: #333333 !important;
          border-radius: 2px !important;
        }
        .country-dropdown-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555555 !important;
        }

        /* Country Alert Modal Pop-up Spring Scale-in */
        @keyframes sideMenuAlertFadeIn {
          0% { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-alert-modal {
          animation: sideMenuAlertFadeIn 220ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .alert-confirm-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  menuContainer: {
    position: 'fixed',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '390px',
    height: 'calc(100% - 60px)', // Exclude bottom nav bar
    zIndex: 95, // Below BottomNav (100)
    overflow: 'hidden',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    transition: 'opacity 300ms cubic-bezier(0.25, 1, 0.5, 1)',
    cursor: 'none !important',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '82%',
    height: '100%',
    backgroundColor: '#121212',
    color: '#ffffff',
    padding: '24px 20px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.4)',
    cursor: 'none !important',
  },
  scrollContent: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    marginRight: '-4px',
    paddingRight: '4px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    height: '32px',
    marginBottom: '42px',
  },
  closeBtn: {
    position: 'absolute',
    left: 0,
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'none !important',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logoWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    fontWeight: 400,
    color: '#ffffff',
    letterSpacing: '2px',
    pointerEvents: 'none',
  },
  mainMenuList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '26px',
    paddingLeft: '4px',
  },
  mainMenuItem: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    fontWeight: 400,
    color: '#ffffff',
    textDecoration: 'none',
    letterSpacing: '1px',
    cursor: 'none !important',
    display: 'block',
    transition: 'opacity 0.2s ease',
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    margin: '38px 4px 28px 4px',
  },
  subMenuList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingLeft: '4px',
  },
  subMenuItem: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 300,
    color: '#cccccc',
    textDecoration: 'none',
    letterSpacing: '0.5px',
    cursor: 'none !important',
    display: 'block',
    transition: 'opacity 0.2s ease',
  },
  countryRowContainer: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  countryRow: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    color: '#cccccc',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'none !important',
  },
  countryLabel: {
    color: '#888888',
    marginRight: '6px',
    pointerEvents: 'none',
  },
  countryValue: {
    color: '#ffffff',
    fontWeight: 400,
    borderBottom: '1px solid #ffffff',
    paddingBottom: '2px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'none !important',
  },
  chevron: {
    marginLeft: '3px',
    pointerEvents: 'none',
  },
  dropdownList: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    backgroundColor: '#1c1c1c',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '4px',
    marginTop: '8px',
    overflowY: 'auto',
    boxSizing: 'border-box',
    transition: 'max-height 250ms cubic-bezier(0.25, 1, 0.5, 1), opacity 250ms ease',
  },
  dropdownItem: {
    fontFamily: 'var(--font-sans)',
    fontSize: '10.5px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'none !important',
    boxSizing: 'border-box',
  },
  checkMark: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '11px',
    marginLeft: '6px',
  },
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(1.5px)',
    WebkitBackdropFilter: 'blur(1.5px)',
    zIndex: 110,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'none !important',
  },
  alertPanel: {
    width: '85%',
    maxWidth: '280px',
    backgroundColor: '#ffffff',
    color: '#000000',
    padding: '24px 20px',
    boxSizing: 'border-box',
    borderRadius: '0px', // clean box shape like Checkout/Search modals
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
    cursor: 'none !important',
  },
  alertTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '15px',
    fontWeight: 500,
    color: '#000000',
    margin: '0 0 10px 0',
  },
  alertSubtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    color: '#666666',
    margin: '0 0 20px 0',
    lineHeight: '1.55',
  },
  alertConfirmBtn: {
    width: '100%',
    height: '38px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '1px',
    cursor: 'none !important',
    transition: 'opacity 0.2s ease',
  },
};
