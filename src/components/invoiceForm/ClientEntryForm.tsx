
import React, { useState } from 'react';
import { z } from 'zod';
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Plus } from 'lucide-react';
import { ClientEntryType } from '../InvoiceForm';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const clientEntrySchema = z.object({
  clientName: z.string().optional(),
  clientPhone: z.string().regex(/^0[2-9]\d{7,8}$/, { 
    message: "מספר טלפון לא תקין, יש להזין מספר טלפון ישראלי תקין" 
  }).optional(),
  invoice: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, { message: "נדרש להעלות חשבונית" })
    .refine((files) => files[0].size <= MAX_FILE_SIZE, { message: `גודל הקובץ חייב להיות קטן מ-5MB` })
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files[0].type),
      { message: "רק קבצים מסוג PDF, JPG או PNG מותרים" }
    ),
});

interface ClientEntryFormProps {
  onAddEntry: (entry: ClientEntryType) => void;
}

const ClientEntryForm: React.FC<ClientEntryFormProps> = ({ onAddEntry }) => {
  const [currentEntry, setCurrentEntry] = useState<{
    clientName: string;
    clientPhone: string;
    invoice: FileList | null;
    fileName: string | null;
  }>({
    clientName: "",
    clientPhone: "",
    invoice: null,
    fileName: null
  });
  
  const [entryErrors, setEntryErrors] = useState<{
    clientName?: string;
    clientPhone?: string;
    invoice?: string;
  }>({});

  const validateCurrentEntry = () => {
    try {
      clientEntrySchema.parse({
        clientName: currentEntry.clientName,
        clientPhone: currentEntry.clientPhone,
        invoice: currentEntry.invoice
      });
      setEntryErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          formattedErrors[path] = err.message;
        });
        setEntryErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleAddEntry = () => {
    if (validateCurrentEntry() && currentEntry.invoice) {
      onAddEntry({
        clientName: currentEntry.clientName,
        clientPhone: currentEntry.clientPhone,
        invoice: currentEntry.invoice
      });
      
      setCurrentEntry({
        clientName: "",
        clientPhone: "",
        invoice: null,
        fileName: null
      });
    }
  };

  const handleEntryChange = (field: keyof typeof currentEntry, value: string) => {
    setCurrentEntry({
      ...currentEntry,
      [field]: value
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setCurrentEntry({
        ...currentEntry,
        invoice: files,
        fileName: files[0].name
      });
    } else {
      setCurrentEntry({
        ...currentEntry,
        invoice: null,
        fileName: null
      });
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">הוספת רשומה חדשה</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <FormLabel htmlFor="clientName">שם הלקוח</FormLabel>
          <Input 
            id="clientName"
            placeholder="הזן את שם הלקוח" 
            value={currentEntry.clientName}
            onChange={(e) => handleEntryChange('clientName', e.target.value)}
          />
          {entryErrors.clientName && (
            <p className="text-sm font-medium text-destructive mt-1">{entryErrors.clientName}</p>
          )}
        </div>

        <div>
          <FormLabel htmlFor="clientPhone">טלפון הלקוח</FormLabel>
          <Input 
            id="clientPhone"
            type="tel" 
            placeholder="הזן מספר טלפון" 
            value={currentEntry.clientPhone}
            onChange={(e) => handleEntryChange('clientPhone', e.target.value)}
          />
          {entryErrors.clientPhone && (
            <p className="text-sm font-medium text-destructive mt-1">{entryErrors.clientPhone}</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <FormLabel htmlFor="invoice">העלאת חשבונית</FormLabel>
        <div className="flex flex-col items-center">
          <label 
            className="w-full cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors hover:border-ofair hover:bg-ofair/5 flex flex-col items-center justify-center gap-2"
          >
            <Upload className="h-8 w-8 text-ofair" />
            <div className="text-center">
              <p className="font-medium text-gray-700">לחץ להעלאת קובץ</p>
              <p className="text-xs text-gray-500">PDF, JPG, PNG עד 5MB</p>
            </div>
            {currentEntry.fileName && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-ofair bg-ofair/10 px-3 py-1 rounded-full max-w-full overflow-hidden">
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="truncate" title={currentEntry.fileName}>{currentEntry.fileName}</span>
              </div>
            )}
            <Input 
              id="invoice"
              type="file" 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
          </label>
        </div>
        {entryErrors.invoice && (
          <p className="text-sm font-medium text-destructive mt-2">{entryErrors.invoice}</p>
        )}
      </div>

      <Button 
        type="button" 
        onClick={handleAddEntry}
        className="w-full bg-ofair/80 hover:bg-ofair transition-colors"
      >
        <Plus className="h-4 w-4 mr-2" />
        הוסף רשומה
      </Button>
    </div>
  );
};

export default ClientEntryForm;
