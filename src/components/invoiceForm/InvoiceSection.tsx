
import React from 'react';
import { Button } from "@/components/ui/button";
import { Send } from 'lucide-react';
import ClientEntryForm from './ClientEntryForm';
import ClientEntry from './ClientEntry';
import { ClientEntryType, FormValues } from '../InvoiceForm';

interface InvoiceSectionProps {
  clientEntries: ClientEntryType[];
  onAddClientEntry: (entry: ClientEntryType) => void;
  onRemoveClientEntry: (index: number) => void;
  onSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
  formData: FormValues;
}

const InvoiceSection: React.FC<InvoiceSectionProps> = ({
  clientEntries,
  onAddClientEntry,
  onRemoveClientEntry,
  onSubmit,
  isSubmitting,
  formData
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-6">חשבוניות</h2>
        <p className="text-gray-600 mb-6">
          העלאת חשבוניות תאפשר לנו לבדוק את איכות השירות שלך. 
          אנא העלה בין 2-5 חשבוניות אחרונות שהוצאת ללקוחות.
        </p>
        
        {clientEntries.length > 0 && (
          <div className="space-y-3 mb-6">
            <h3 className="text-lg font-medium">חשבוניות שהועלו</h3>
            <div className="space-y-2">
              {clientEntries.map((entry, index) => (
                <ClientEntry 
                  key={index} 
                  entry={entry} 
                  index={index} 
                  onRemove={onRemoveClientEntry} 
                />
              ))}
            </div>
          </div>
        )}
        
        <ClientEntryForm onAddEntry={onAddClientEntry} />
      </div>
      
      <div className="flex justify-center">
        <Button 
          type="button"
          onClick={() => onSubmit(formData)}
          disabled={isSubmitting || clientEntries.length === 0}
          className="px-8 bg-ofair hover:bg-ofair/90"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? 'שולח חשבוניות...' : 'שלח חשבוניות'}
        </Button>
      </div>
    </div>
  );
};

export default InvoiceSection;
