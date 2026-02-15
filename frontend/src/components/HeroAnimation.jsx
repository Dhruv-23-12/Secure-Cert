export default function HeroAnimation() {
    return (
        <div className="relative w-full flex items-center justify-center overflow-visible" style={{ minHeight: 460 }}>
            <style>{`
        @keyframes scanLine {
          0% { transform: translateY(-110px); opacity: 0; }
          8% { opacity: 1; }
          92% { opacity: 1; }
          100% { transform: translateY(230px); opacity: 0; }
        }
        @keyframes floatCert {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes checkPop {
          0%, 30% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.15); opacity: 1; }
          65% { transform: scale(0.92); }
          80% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes badgeFade {
          0%, 40% { opacity: 0; transform: translateY(10px); }
          60% { opacity: 1; transform: translateY(0); }
          100% { opacity: 1; }
        }
        @keyframes cornerPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-200%) skewX(-20deg); }
          100% { transform: translateX(400%) skewX(-20deg); }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.12; }
          50% { transform: scale(1.05); opacity: 0.06; }
        }
        .hero-float { animation: floatCert 5s ease-in-out infinite; }
        .scan-line { animation: scanLine 2.8s ease-in-out infinite; }
        .check-pop { transform-origin: center; animation: checkPop 3.2s ease-out infinite; }
        .badge-fade { animation: badgeFade 3.2s ease-out infinite; }
        .corner-pulse { animation: cornerPulse 2.8s ease-in-out infinite; }
        .ring-pulse { animation: ringPulse 4s ease-in-out infinite; transform-origin: center; }
      `}</style>

            <div className="relative w-full" style={{ maxWidth: 540, minHeight: 460 }}>

                {/* Background rings */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 540 460">
                    <circle cx="230" cy="230" r="190" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.08" className="ring-pulse" />
                    <circle cx="230" cy="230" r="225" fill="none" stroke="#818cf8" strokeWidth="0.7" opacity="0.05" className="ring-pulse" style={{ animationDelay: '1.5s' }} />
                </svg>

                {/* ====== MAIN CERTIFICATE ====== */}
                <svg
                    className="absolute hero-float"
                    style={{ left: 20, top: 10, width: 380, height: 440 }}
                    viewBox="0 0 280 340"
                >
                    <defs>
                        <linearGradient id="headerG" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                        <linearGradient id="scanG" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                            <stop offset="30%" stopColor="#6366f1" stopOpacity="0.8" />
                            <stop offset="50%" stopColor="#4f46e5" stopOpacity="1" />
                            <stop offset="70%" stopColor="#6366f1" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                        <filter id="cardDrop">
                            <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#1e1b4b" floodOpacity="0.18" />
                        </filter>
                        <filter id="scanGlow">
                            <feGaussianBlur stdDeviation="3" />
                        </filter>
                        <clipPath id="cardClip">
                            <rect x="15" y="15" width="250" height="310" rx="14" />
                        </clipPath>
                    </defs>

                    {/* Card shadow */}
                    <rect x="18" y="22" width="250" height="310" rx="14" fill="#312e81" opacity="0.08" />

                    {/* Card body — SOLID WHITE for visibility */}
                    <rect x="15" y="15" width="250" height="310" rx="14" fill="white" filter="url(#cardDrop)" stroke="#c7d2fe" strokeWidth="1.2" />

                    {/* Header */}
                    <rect x="15" y="15" width="250" height="58" rx="14" fill="url(#headerG)" />
                    <rect x="15" y="45" width="250" height="28" fill="url(#headerG)" />

                    {/* Header content */}
                    <text x="30" y="42" fontSize="14" fontWeight="800" fill="white" fontFamily="Inter, system-ui, sans-serif" letterSpacing="1">CERTIFICATE</text>
                    <text x="30" y="58" fontSize="8.5" fill="white" fontFamily="Inter, system-ui, sans-serif" opacity="0.65" letterSpacing="0.5">OF ACHIEVEMENT</text>

                    {/* Ribbon badge in header */}
                    <circle cx="235" cy="44" r="15" fill="rgba(255,255,255,0.18)" />
                    <circle cx="235" cy="44" r="10" fill="rgba(255,255,255,0.25)" />
                    <path d="M230 44l3.5 3.5 7-7" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Name placeholder */}
                    <rect x="30" y="88" width="150" height="9" rx="4.5" fill="#4f46e5" opacity="0.12" />

                    {/* Body text lines — dark enough to see */}
                    <rect x="30" y="110" width="218" height="5" rx="2.5" fill="#94a3b8" opacity="0.35" />
                    <rect x="30" y="122" width="185" height="5" rx="2.5" fill="#94a3b8" opacity="0.3" />
                    <rect x="30" y="134" width="200" height="5" rx="2.5" fill="#94a3b8" opacity="0.3" />
                    <rect x="30" y="146" width="130" height="5" rx="2.5" fill="#94a3b8" opacity="0.25" />

                    {/* Divider */}
                    <line x1="30" y1="162" x2="248" y2="162" stroke="#e2e8f0" strokeWidth="1" />
                    <circle cx="139" cy="162" r="3.5" fill="white" stroke="#c7d2fe" strokeWidth="1" />
                    <circle cx="139" cy="162" r="1.5" fill="#6366f1" />

                    {/* More text */}
                    <rect x="30" y="174" width="218" height="4" rx="2" fill="#94a3b8" opacity="0.25" />
                    <rect x="30" y="184" width="165" height="4" rx="2" fill="#94a3b8" opacity="0.2" />

                    {/* ---- QR Code ---- */}
                    <rect x="30" y="202" width="72" height="72" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                    <g fill="#312e81">
                        {/* Top-left finder */}
                        <rect x="36" y="208" width="18" height="18" rx="2" />
                        <rect x="40" y="212" width="10" height="10" rx="1" fill="white" />
                        <rect x="43.5" y="215.5" width="3" height="3" fill="#312e81" />
                        {/* Top-right finder */}
                        <rect x="76" y="208" width="18" height="18" rx="2" />
                        <rect x="80" y="212" width="10" height="10" rx="1" fill="white" />
                        <rect x="83.5" y="215.5" width="3" height="3" fill="#312e81" />
                        {/* Bottom-left finder */}
                        <rect x="36" y="248" width="18" height="18" rx="2" />
                        <rect x="40" y="252" width="10" height="10" rx="1" fill="white" />
                        <rect x="43.5" y="255.5" width="3" height="3" fill="#312e81" />
                        {/* Data modules */}
                        <rect x="58" y="210" width="3" height="3" />
                        <rect x="64" y="210" width="3" height="3" />
                        <rect x="70" y="210" width="3" height="3" />
                        <rect x="58" y="216" width="3" height="3" />
                        <rect x="64" y="220" width="3" height="3" />
                        <rect x="70" y="216" width="3" height="3" />
                        <rect x="36" y="230" width="3" height="3" />
                        <rect x="42" y="230" width="3" height="3" />
                        <rect x="48" y="230" width="3" height="3" />
                        <rect x="54" y="230" width="3" height="3" />
                        <rect x="60" y="230" width="3" height="3" />
                        <rect x="66" y="230" width="3" height="3" />
                        <rect x="72" y="230" width="3" height="3" />
                        <rect x="78" y="230" width="3" height="3" />
                        <rect x="84" y="230" width="3" height="3" />
                        <rect x="90" y="230" width="3" height="3" />
                        <rect x="36" y="236" width="3" height="3" />
                        <rect x="48" y="236" width="3" height="3" />
                        <rect x="60" y="236" width="3" height="3" />
                        <rect x="72" y="236" width="3" height="3" />
                        <rect x="84" y="236" width="3" height="3" />
                        <rect x="36" y="242" width="3" height="3" />
                        <rect x="42" y="242" width="3" height="3" />
                        <rect x="54" y="242" width="3" height="3" />
                        <rect x="66" y="242" width="3" height="3" />
                        <rect x="78" y="242" width="3" height="3" />
                        <rect x="90" y="242" width="3" height="3" />
                        <rect x="58" y="248" width="3" height="3" />
                        <rect x="64" y="248" width="3" height="3" />
                        <rect x="70" y="254" width="3" height="3" />
                        <rect x="76" y="248" width="3" height="3" />
                        <rect x="58" y="254" width="3" height="3" />
                        <rect x="64" y="260" width="3" height="3" />
                        <rect x="76" y="260" width="3" height="3" />
                        <rect x="82" y="254" width="3" height="3" />
                        <rect x="88" y="260" width="3" height="3" />
                        <rect x="58" y="266" width="3" height="3" />
                        <rect x="70" y="266" width="3" height="3" />
                        <rect x="82" y="266" width="3" height="3" />
                    </g>

                    {/* Signature area */}
                    <rect x="116" y="225" width="138" height="49" rx="6" fill="#fafafe" stroke="#e2e8f0" strokeWidth="0.8" />
                    <path d="M128 254 C136 238, 144 262, 154 247 C162 234, 172 258, 184 244 C192 234, 202 252, 216 240 C224 234, 232 248, 244 242"
                        stroke="#7c3aed" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.3" />
                    <line x1="128" y1="262" x2="244" y2="262" stroke="#e2e8f0" strokeWidth="0.8" />
                    <text x="155" y="270" fontSize="6.5" fill="#94a3b8" fontFamily="Inter, system-ui, sans-serif">Authorized Signature</text>

                    {/* Seal watermark */}
                    <circle cx="218" cy="205" r="16" fill="none" stroke="#6366f1" strokeWidth="1.5" opacity="0.07" strokeDasharray="3 2" />
                    <circle cx="218" cy="205" r="11" fill="none" stroke="#6366f1" strokeWidth="0.8" opacity="0.05" />

                    {/* ====== SCANNING LINE ====== */}
                    <g clipPath="url(#cardClip)">
                        <g className="scan-line">
                            <rect x="15" y="158" width="250" height="4" rx="2" fill="url(#scanG)" />
                            <rect x="15" y="157" width="250" height="6" rx="3" fill="url(#scanG)" filter="url(#scanGlow)" opacity="0.5" />
                        </g>
                    </g>

                    {/* ====== SCANNER BRACKETS ====== */}
                    <g fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" className="corner-pulse">
                        <path d="M10,40 L10,15 Q10,10 15,10 L40,10" />
                        <path d="M270,40 L270,15 Q270,10 265,10 L240,10" />
                        <path d="M10,300 L10,325 Q10,330 15,330 L40,330" />
                        <path d="M270,300 L270,325 Q270,330 265,330 L240,330" />
                    </g>

                    {/* Shimmer */}
                    <g clipPath="url(#cardClip)" opacity="0.04">
                        <rect x="0" y="15" width="60" height="310" fill="white" style={{ animation: 'shimmer 5s ease-in-out infinite' }} />
                    </g>
                </svg>

                {/* ====== SHIELD + CHECK ====== */}
                <svg
                    className="absolute"
                    style={{ right: 15, top: 55, width: 140, height: 160 }}
                    viewBox="0 0 110 130"
                    overflow="visible"
                >
                    <defs>
                        <linearGradient id="shieldG" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="50%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                        <filter id="shieldDrop">
                            <feDropShadow dx="0" dy="4" stdDeviation="10" floodColor="#4f46e5" floodOpacity="0.3" />
                        </filter>
                    </defs>

                    <g className="check-pop" filter="url(#shieldDrop)" style={{ transformOrigin: '55px 48px' }}>
                        {/* Shield */}
                        <path d="M55,6 L96,22 L96,52 C96,80 55,100 55,100 C55,100 14,80 14,52 L14,22 Z"
                            fill="url(#shieldG)" />
                        {/* Inner border */}
                        <path d="M55,14 L88,27 L88,50 C88,74 55,91 55,91 C55,91 22,74 22,50 L22,27 Z"
                            fill="none" stroke="white" strokeWidth="1.5" opacity="0.2" />
                        {/* Check */}
                        <path d="M38,50 L50,62 L73,37"
                            stroke="white" strokeWidth="5.5" fill="none"
                            strokeLinecap="round" strokeLinejoin="round"
                            strokeDasharray="55" strokeDashoffset="55"
                            style={{ animation: 'checkPop 3.2s ease-out infinite', animationName: 'none' }} />
                        {/* Redraw check with proper animation */}
                        <path d="M38,50 L50,62 L73,37"
                            stroke="white" strokeWidth="5.5" fill="none"
                            strokeLinecap="round" strokeLinejoin="round" />
                        {/* Highlight */}
                        <ellipse cx="42" cy="35" rx="14" ry="9" fill="white" opacity="0.08" transform="rotate(-20 42 35)" />
                    </g>

                    {/* Verified badge */}
                    <g className="badge-fade" transform="translate(55, 115)">
                        <rect x="-40" y="-13" width="80" height="26" rx="13" fill="white" stroke="#34d399" strokeWidth="1.5" />
                        <circle cx="-22" cy="0" r="6" fill="#10b981" />
                        <path d="M-25,0 L-22,3 L-18,-2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        <text x="-9" y="4.5" fontSize="11" fill="#059669" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">Verified</text>
                    </g>
                </svg>

                {/* ====== DATA FLOW PARTICLES ====== */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 540 460" overflow="visible">
                    {[
                        { dur: '2s', path: 'M320,200 Q380,150 430,110', r: 3.5, color: '#6366f1', delay: '0s' },
                        { dur: '2.3s', path: 'M320,230 Q375,180 425,135', r: 2.5, color: '#818cf8', delay: '0.7s' },
                        { dur: '1.8s', path: 'M320,260 Q370,200 425,150', r: 3, color: '#4f46e5', delay: '1.3s' },
                    ].map((p, i) => (
                        <circle key={i} r={p.r} fill={p.color}>
                            <animateMotion dur={p.dur} repeatCount="indefinite" path={p.path} begin={p.delay} />
                            <animate attributeName="opacity" values="0;0.9;0.9;0" dur={p.dur} repeatCount="indefinite" begin={p.delay} />
                        </circle>
                    ))}
                </svg>

                {/* ====== DECORATIVE ELEMENTS ====== */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 540 460">
                    {/* Dots */}
                    <circle cx="495" cy="260" r="4" fill="#6366f1" opacity="0.15">
                        <animate attributeName="opacity" values="0.15;0.4;0.15" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="510" cy="320" r="2.5" fill="#818cf8" opacity="0.12">
                        <animate attributeName="opacity" values="0.12;0.35;0.12" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
                    </circle>
                    <circle cx="505" cy="200" r="2" fill="#a5b4fc" opacity="0.15">
                        <animate attributeName="opacity" values="0.15;0.4;0.15" dur="2s" repeatCount="indefinite" begin="1s" />
                    </circle>
                    <circle cx="10" cy="120" r="3" fill="#a5b4fc" opacity="0.12">
                        <animate attributeName="opacity" values="0.12;0.3;0.12" dur="3.5s" repeatCount="indefinite" begin="0.3s" />
                    </circle>
                    <circle cx="8" cy="340" r="2" fill="#818cf8" opacity="0.1">
                        <animate attributeName="opacity" values="0.1;0.25;0.1" dur="2.8s" repeatCount="indefinite" begin="0.8s" />
                    </circle>

                    {/* Lock */}
                    <g transform="translate(25, 420)" opacity="0.2">
                        <rect x="-7" y="-2" width="14" height="11" rx="2.5" fill="#4f46e5" />
                        <path d="M-3.5,-2 L-3.5,-6 C-3.5,-9.5 3.5,-9.5 3.5,-6 L3.5,-2" stroke="#4f46e5" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                        <circle cx="0" cy="3.5" r="1.8" fill="white" />
                    </g>

                    {/* Key */}
                    <g transform="translate(510, 85)" opacity="0.15">
                        <circle cx="0" cy="0" r="5.5" fill="none" stroke="#6366f1" strokeWidth="2" />
                        <line x1="5.5" y1="0" x2="16" y2="0" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
                        <line x1="13" y1="0" x2="13" y2="4.5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
                        <line x1="16" y1="0" x2="16" y2="3.5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
                    </g>
                </svg>
            </div>
        </div>
    );
}
