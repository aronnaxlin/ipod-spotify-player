import React from 'react';

export function WindowFrame({ children, title, onClose }: any) {
  return (
    <div className="window-frame h-full w-full relative">
      {/* Controls hidden for authentic look */}
      {children}
    </div>
  );
}
