
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/986d6c1f-6af5-4633-b79e-1972689332e9.png" 
          alt="oFair Logo" 
          className="h-20" // Increased from h-12 to h-20
        />
      </div>
    </div>
  );
};

export default Logo;
