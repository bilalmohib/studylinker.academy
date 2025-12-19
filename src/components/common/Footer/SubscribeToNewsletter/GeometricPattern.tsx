interface GeometricPatternProps {
  className?: string;
  opacity?: number;
}

const GeometricPattern = ({ className = "", opacity = 0.15 }: GeometricPatternProps) => {
  return (
    <div className={`absolute inset-0 ${className}`} style={{ opacity }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="geometric-bg-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            {/* Large rectangles/squares */}
            <rect x="0" y="0" width="80" height="80" fill="white" opacity="0.4"/>
            <rect x="120" y="20" width="60" height="60" fill="white" opacity="0.3"/>
            <rect x="160" y="120" width="40" height="80" fill="white" opacity="0.35"/>
            <rect x="20" y="140" width="70" height="50" fill="white" opacity="0.25"/>
            
            {/* Large circles */}
            <circle cx="150" cy="50" r="35" fill="white" opacity="0.3"/>
            <circle cx="50" cy="160" r="25" fill="white" opacity="0.4"/>
            <circle cx="180" cy="180" r="20" fill="white" opacity="0.35"/>
            
            {/* Large triangles */}
            <polygon points="100,10 140,80 60,80" fill="white" opacity="0.3"/>
            <polygon points="10,100 50,100 30,140" fill="white" opacity="0.25"/>
            <polygon points="140,140 180,140 160,180" fill="white" opacity="0.4"/>
            
            {/* Large hexagons */}
            <polygon points="100,120 130,140 130,180 100,200 70,180 70,140" fill="white" opacity="0.35"/>
            <polygon points="180,20 200,35 200,65 180,80 160,65 160,35" fill="white" opacity="0.3"/>
            
            {/* Overlapping shapes for depth */}
            <rect x="80" y="60" width="50" height="50" fill="white" opacity="0.2" transform="rotate(45 105 85)"/>
            <circle cx="40" cy="40" r="30" fill="white" opacity="0.2"/>
            
            {/* Some connecting lines */}
            <line x1="50" y1="50" x2="150" y2="150" stroke="white" strokeWidth="2" opacity="0.2"/>
            <line x1="0" y1="100" x2="200" y2="100" stroke="white" strokeWidth="1" opacity="0.15"/>
            <line x1="100" y1="0" x2="100" y2="200" stroke="white" strokeWidth="1" opacity="0.15"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#geometric-bg-pattern)"/>
      </svg>
    </div>
  );
};

export default GeometricPattern;
