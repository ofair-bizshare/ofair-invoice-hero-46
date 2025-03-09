
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/5272fae7-177a-41c5-a37a-9158ee6a9863.png" 
          alt="oFair Logo" 
          className="h-10"
        />
      </div>
      <span className="text-gray-600 font-medium">פלטפורמה לבעלי מקצוע</span>
    </div>
  );
};

export default Logo;
