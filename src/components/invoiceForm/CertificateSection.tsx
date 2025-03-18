
import React from 'react';
import { Button } from "@/components/ui/button";
import { Send } from 'lucide-react';
import CertificateEntryForm from './CertificateEntryForm';
import CertificateEntry from './CertificateEntry';
import { CertificateEntryType, FormValues } from '../InvoiceForm';

interface CertificateSectionProps {
  certificateEntries: CertificateEntryType[];
  onAddCertificateEntry: (entry: CertificateEntryType) => void;
  onRemoveCertificateEntry: (index: number) => void;
  onSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
  formData: FormValues;
}

const CertificateSection: React.FC<CertificateSectionProps> = ({
  certificateEntries,
  onAddCertificateEntry,
  onRemoveCertificateEntry,
  onSubmit,
  isSubmitting,
  formData
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-6">תעודות והסמכות</h2>
        <p className="text-gray-600 mb-6">
          העלאת תעודות מקצועיות והסמכות תאפשר לנו להציג ללקוחות את הכישורים והידע המקצועי שלך.
        </p>
        
        {certificateEntries.length > 0 && (
          <div className="space-y-3 mb-6">
            <h3 className="text-lg font-medium">תעודות שהועלו</h3>
            <div className="space-y-2">
              {certificateEntries.map((entry, index) => (
                <CertificateEntry 
                  key={index} 
                  entry={entry} 
                  index={index} 
                  onRemove={onRemoveCertificateEntry} 
                />
              ))}
            </div>
          </div>
        )}
        
        <CertificateEntryForm onAddEntry={onAddCertificateEntry} />
      </div>
      
      <div className="flex justify-center">
        <Button 
          type="button"
          onClick={() => onSubmit(formData)}
          disabled={isSubmitting || certificateEntries.length === 0}
          className="px-8 bg-ofair hover:bg-ofair/90"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? 'שולח תעודות...' : 'שלח תעודות'}
        </Button>
      </div>
    </div>
  );
};

export default CertificateSection;
