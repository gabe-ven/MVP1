export default function AnimatedTrucks() {
  return (
    <>
      {/* Truck 1 - Flow above "Analyze" text */}
      <div className="absolute -top-4 left-0 w-full overflow-hidden pointer-events-none opacity-50 z-20" style={{
        transformStyle: 'preserve-3d',
        perspective: '1200px',
        perspectiveOrigin: 'center top',
      }}>
        <div className="animate-[slide_18s_linear_infinite]" style={{
          transform: 'rotateX(75deg) rotateZ(0deg) translateZ(0px)',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center top',
        }}>
          <svg width="140" height="70" viewBox="0 0 140 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange-500" style={{
            transform: 'scaleY(0.7)',
          }}>
            <rect x="15" y="22" width="60" height="20" fill="currentColor" opacity="0.9" rx="2"/>
            <rect x="75" y="18" width="35" height="24" fill="currentColor" rx="2"/>
            <path d="M 75 30 L 85 18 L 110 18 L 110 30 Z" fill="currentColor" opacity="0.85"/>
            <rect x="80" y="20" width="12" height="8" fill="rgba(255,255,255,0.3)" rx="1"/>
            <rect x="95" y="20" width="12" height="8" fill="rgba(255,255,255,0.3)" rx="1"/>
            <circle cx="32" cy="43" r="5" fill="#1a1a1f" stroke="currentColor" strokeWidth="2"/>
            <circle cx="58" cy="43" r="5" fill="#1a1a1f" stroke="currentColor" strokeWidth="2"/>
            <circle cx="90" cy="43" r="5" fill="#1a1a1f" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      </div>

      {/* Truck 2 - Flow above "Analyze" text (reverse) */}
      <div className="absolute top-2 left-0 w-full overflow-hidden pointer-events-none opacity-50 z-20" style={{
        transformStyle: 'preserve-3d',
        perspective: '1200px',
        perspectiveOrigin: 'center top',
      }}>
        <div className="animate-[slideReverse_22s_linear_infinite]" style={{
          transform: 'rotateX(75deg) rotateZ(0deg) translateZ(0px)',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center top',
        }}>
          <svg width="130" height="65" viewBox="0 0 130 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-500" style={{
            transform: 'scaleY(0.7)',
          }}>
            <rect x="40" y="22" width="58" height="20" fill="currentColor" opacity="0.9" rx="2"/>
            <rect x="10" y="18" width="32" height="24" fill="currentColor" rx="2"/>
            <path d="M 40 30 L 32 18 L 10 18 L 10 30 Z" fill="currentColor" opacity="0.85"/>
            <rect x="14" y="20" width="11" height="8" fill="rgba(255,255,255,0.3)" rx="1"/>
            <rect x="27" y="20" width="11" height="8" fill="rgba(255,255,255,0.3)" rx="1"/>
            <circle cx="24" cy="43" r="5" fill="#1a1a1f" stroke="currentColor" strokeWidth="2"/>
            <circle cx="55" cy="43" r="5" fill="#1a1a1f" stroke="currentColor" strokeWidth="2"/>
            <circle cx="82" cy="43" r="5" fill="#1a1a1f" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      </div>

      {/* Truck 3 - Flow above "Analyze" text */}
      <div className="absolute top-8 left-0 w-full overflow-hidden pointer-events-none opacity-50 z-20" style={{
        transformStyle: 'preserve-3d',
        perspective: '1200px',
        perspectiveOrigin: 'center top',
      }}>
        <div className="animate-[slide_20s_linear_infinite]" style={{
          transform: 'rotateX(75deg) rotateZ(0deg) translateZ(0px)',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center top',
        }}>
          <svg width="135" height="68" viewBox="0 0 135 68" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange-400" style={{
            transform: 'scaleY(0.7)',
          }}>
            <rect x="14" y="22" width="55" height="19" fill="currentColor" opacity="0.9" rx="2"/>
            <rect x="69" y="18" width="32" height="23" fill="currentColor" rx="2"/>
            <path d="M 69 29 L 78 18 L 101 18 L 101 29 Z" fill="currentColor" opacity="0.85"/>
            <rect x="73" y="20" width="11" height="7" fill="rgba(255,255,255,0.3)" rx="1"/>
            <rect x="87" y="20" width="11" height="7" fill="rgba(255,255,255,0.3)" rx="1"/>
            <circle cx="30" cy="42" r="5" fill="#1a1a1f" stroke="currentColor" strokeWidth="2"/>
            <circle cx="54" cy="42" r="5" fill="#1a1a1f" stroke="currentColor" strokeWidth="2"/>
            <circle cx="85" cy="42" r="5" fill="#1a1a1f" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      </div>

      {/* Truck 4 - Flow above "Analyze" text (reverse) */}
      <div className="absolute top-14 left-0 w-full overflow-hidden pointer-events-none opacity-50 z-20" style={{
        transformStyle: 'preserve-3d',
        perspective: '1200px',
        perspectiveOrigin: 'center top',
      }}>
        <div className="animate-[slideReverse_24s_linear_infinite]" style={{
          transform: 'rotateX(75deg) rotateZ(0deg) translateZ(0px)',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center top',
        }}>
          <svg width="125" height="63" viewBox="0 0 125 63" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-400" style={{
            transform: 'scaleY(0.7)',
          }}>
            <rect x="38" y="21" width="54" height="19" fill="currentColor" opacity="0.9" rx="2"/>
            <rect x="12" y="17" width="28" height="23" fill="currentColor" rx="2"/>
            <path d="M 38 28 L 30 17 L 12 17 L 12 28 Z" fill="currentColor" opacity="0.85"/>
            <rect x="16" y="19" width="10" height="7" fill="rgba(255,255,255,0.3)" rx="1"/>
            <rect x="28" y="19" width="9" height="7" fill="rgba(255,255,255,0.3)" rx="1"/>
            <circle cx="26" cy="41" r="5" fill="#1a1a1f" stroke="currentColor" strokeWidth="2"/>
            <circle cx="52" cy="41" r="5" fill="#1a1a1f" stroke="currentColor" strokeWidth="2"/>
            <circle cx="76" cy="41" r="5" fill="#1a1a1f" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      </div>
    </>
  );
}

