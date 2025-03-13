
import React, { useState } from 'react';
import { z } from 'zod';
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Plus } from 'lucide-react';
import { CertificateEntryType } from '../InvoiceForm';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const certificateEntrySchema = z.object({
  certificateName: z.string().min(2, { message: "יש להזין שם תעודה" }),
  issueDate: z.string().optional(),
  certificate: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, { message: "נדרש להעלות תעודה" })
    .refine((files) => files[0].size <= MAX_FILE_SIZE, { message: `גודל הקובץ חייב להיות קטן מ-5MB` })
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files[0].type),
      { message: "רק קבצים מסוג PDF, JPG או PNG מותרים" }
    ),
});

interface CertificateEntryFormProps {
  onAddEntry: (entry: CertificateEntryType) => void;
}

const CertificateEntryForm: React.FC<CertificateEntryFormProps> = ({ onAddEntry }) => {
  const [currentEntry, setCurrentEntry] = useState<{
    certificateName: string;
    issueDate: string;
    certificate: FileList | null;
    fileName: string | null;
  }>({
    certificateName: "",
    issueDate: "",
    certificate: null,
    fileName: null
  });
  
  const [entryErrors, setEntryErrors] = useState<{
    certificateName?: string;
    issueDate?: string;
    certificate?: string;
  }>({});

  const validateCurrentEntry = () => {
    try {
      certificateEntrySchema.parse({
        certificateName: currentEntry.certificateName,
        issueDate: currentEntry.issueDate,
        certificate: currentEntry.certificate
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
    if (validateCurrentEntry() && currentEntry.certificate) {
      onAddEntry({
        certificateName: currentEntry.certificateName,
        issueDate: currentEntry.issueDate,
        certificate: currentEntry.certificate
      });
      
      setCurrentEntry({
        certificateName: "",
        issueDate: "",
        certificate: null,
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
        certificate: files,
        fileName: files[0].name
      });
    } else {
      setCurrentEntry({
        ...currentEntry,
        certificate: null,
        fileName: null
      });
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">הוספת תעודה חדשה</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <FormLabel htmlFor="certificateName">שם התעודה</FormLabel>
          <Input 
            id="certificateName"
            placeholder="הזן את שם התעודה" 
            value={currentEntry.certificateName}
            onChange={(e) => handleEntryChange('certificateName', e.target.value)}
          />
          {entryErrors.certificateName && (
            <p className="text-sm font-medium text-destructive mt-1">{entryErrors.certificateName}</p>
          )}
        </div>

        <div>
          <FormLabel htmlFor="issueDate">תאריך הנפקה</FormLabel>
          <Input 
            id="issueDate"
            type="date" 
            value={currentEntry.issueDate}
            onChange={(e) => handleEntryChange('issueDate', e.target.value)}
          />
          {entryErrors.issueDate && (
            <p className="text-sm font-medium text-destructive mt-1">{entryErrors.issueDate}</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <FormLabel htmlFor="certificate">העלאת תעודה</FormLabel>
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
              id="certificate"
              type="file" 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
          </label>
        </div>
        {entryErrors.certificate && (
          <p className="text-sm font-medium text-destructive mt-2">{entryErrors.certificate}</p>
        )}
      </div>

      <Button 
        type="button" 
        onClick={handleAddEntry}
        className="w-full bg-ofair/80 hover:bg-ofair transition-colors"
      >
        <Plus className="h-4 w-4 mr-2" />
        הוסף תעודה
      </Button>
    </div>
  );
};

export default CertificateEntryForm;
