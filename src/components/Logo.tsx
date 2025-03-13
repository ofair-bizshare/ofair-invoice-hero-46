
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/2f980871-f00d-4893-ab7d-1f94cfda4b96.png" 
          alt="oFair Logo" 
          className="h-24" // Increased size for better visibility
        />
      </div>
    </div>
  );
};

export default Logo;
