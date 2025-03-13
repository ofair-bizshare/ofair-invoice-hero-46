
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, X } from 'lucide-react';
import { CertificateEntryType } from '../InvoiceForm';

interface CertificateEntryProps {
  entry: CertificateEntryType;
  index: number;
  onRemove: (index: number) => void;
}

const CertificateEntry: React.FC<CertificateEntryProps> = ({ entry, index, onRemove }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center">
      <div className="flex items-start gap-3">
        <div className="bg-ofair/10 p-2 rounded-full">
          <FileText className="h-5 w-5 text-ofair" />
        </div>
        <div>
          <h4 className="font-medium">{entry.certificateName}</h4>
          {entry.issueDate && (
            <p className="text-xs text-gray-500">תאריך הנפקה: {entry.issueDate}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {entry.certificate[0].name}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(index)}
        className="text-gray-500 hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CertificateEntry;
