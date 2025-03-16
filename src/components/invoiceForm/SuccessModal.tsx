
import React from 'react';
import { X, CheckCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType?: 'invoices' | 'certificates' | 'both';
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, documentType = 'invoices' }) => {
  if (!isOpen) return null;

  const getSuccessTitle = () => {
    switch (documentType) {
      case 'invoices':
        return 'החשבוניות נשלחו בהצלחה!';
      case 'certificates':
        return 'התעודות המקצועיות נשלחו בהצלחה!';
      case 'both':
        return 'המסמכים נשלחו בהצלחה!';
      default:
        return 'המסמכים נשלחו בהצלחה!';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div 
        className={cn(
          "bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4 relative",
          "animate-in fade-in duration-300"
        )}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
        
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <div className="rounded-full bg-green-100 p-3 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {getSuccessTitle()}
          </h3>
          
          <p className="text-gray-600">
            הנתונים התקבלו במערכת ויטופלו בהקדם.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
