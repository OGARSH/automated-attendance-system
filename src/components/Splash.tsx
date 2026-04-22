import React from 'react';

const PlantIcon = () => (
  <svg viewBox="0 0 100 100" className="w-32 h-32">
    {/* Plant stem and branches */}
    <g fill="#8CB369">
      {/* Main stem */}
      <rect x="46" y="25" width="8" height="45" rx="4" />
      
      {/* Top leaf */}
      <ellipse cx="50" cy="15" rx="6" ry="12" />
      
      {/* Left branch */}
      <rect x="35" y="35" width="15" height="6" rx="3" transform="rotate(-30 42.5 38)" />
      {/* Left leaves */}
      <ellipse cx="28" cy="32" rx="8" ry="6" transform="rotate(-30 28 32)" />
      <ellipse cx="32" cy="40" rx="6" ry="4" transform="rotate(-30 32 40)" />
      
      {/* Right branch */}
      <rect x="50" y="45" width="18" height="6" rx="3" transform="rotate(25 59 48)" />
      {/* Right leaves */}
      <ellipse cx="68" cy="40" rx="10" ry="8" transform="rotate(25 68 40)" />
      <ellipse cx="62" cy="50" rx="7" ry="5" transform="rotate(25 62 50)" />
      <ellipse cx="70" cy="52" rx="5" ry="4" transform="rotate(25 70 52)" />
      
      {/* Small side branches */}
      <ellipse cx="38" cy="55" rx="6" ry="4" transform="rotate(-45 38 55)" />
      <ellipse cx="62" cy="60" rx="5" ry="3" transform="rotate(45 62 60)" />
    </g>
    
    {/* Base/pot */}
    <ellipse cx="50" cy="75" rx="12" ry="5" fill="#5A9BD4" />
  </svg>
);

export function Splash() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-secondary to-accent">
      <div className="text-center text-card-foreground space-y-8 animate-pulse bg-card/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-border">
        <div className="flex justify-center">
          <div className="relative">
            <PlantIcon />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">✓</span>
            </div>
          </div>
        </div>
        
        <div>
          <h1 className="text-7xl font-bold mb-3 text-card-foreground">QMA</h1>
          <h2 className="text-3xl font-semibold mb-2 text-muted-foreground">Quickmark Attendance</h2>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-xl text-muted-foreground">Empowering Education</p>
        </div>
      </div>
    </div>
  );
}