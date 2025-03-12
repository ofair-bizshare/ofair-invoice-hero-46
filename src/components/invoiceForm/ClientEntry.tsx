
import React from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ClientEntryProps {
  entry: {
    clientName: string;
    clientPhone: string;
    invoice: FileList;
  };
  index: number;
  onRemove: (index: number) => void;
}

const ClientEntry: React.FC<ClientEntryProps> = ({ entry, index, onRemove }) => {
  return (
    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
      <div className="flex-1 overflow-hidden">
        <p className="font-medium">{entry.clientName || "לקוח ללא שם"}</p>
        <p className="text-sm text-gray-600">{entry.clientPhone || "ללא מספר טלפון"}</p>
        <div className="flex items-center gap-1.5 text-xs text-ofair mt-1 w-full">
          <FileText className="h-3 w-3 flex-shrink-0" />
          <span className="truncate max-w-[200px] md:max-w-[300px] block" title={entry.invoice[0].name}>
            {entry.invoice[0].name}
          </span>
        </div>
      </div>
      <Button 
        type="button"
        variant="ghost" 
        size="sm"
        onClick={() => onRemove(index)}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
};

export default ClientEntry;
