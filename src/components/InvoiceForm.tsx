import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Upload, FileText, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const clientEntrySchema = z.object({
  clientName: z.string().min(2, { message: "שם הלקוח חייב להכיל לפח��ת 2 תווים" }),
  clientPhone: z.string().regex(/^0[2-9]\d{7,8}$/, { 
    message: "מספר טלפון לא תקין, יש להזין מספר טלפון ישראלי תקין" 
  }),
  invoice: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, { message: "נדרש להעלות חשבונית" })
    .refine((files) => files[0].size <= MAX_FILE_SIZE, { message: `גודל הקובץ חייב להיות קטן מ-5MB` })
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files[0].type),
      { message: "רק קבצים מסוג PDF, JPG או PNG מותרים" }
    ),
});

const formSchema = z.object({
  professionalName: z.string().min(2, { message: "יש להזין את שם בעל המקצוע" }),
  professionalPhone: z.string().regex(/^0[2-9]\d{7,8}$/, { 
    message: "מספר טלפון לא תקין, יש להזין מספר טלפון ישראלי תקין" 
  }),
});

type ClientEntry = z.infer<typeof clientEntrySchema>;
type FormValues = z.infer<typeof formSchema>;

const InvoiceForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientEntries, setClientEntries] = useState<ClientEntry[]>([]);
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      professionalName: "",
      professionalPhone: "",
    },
  });

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
      setClientEntries([...clientEntries, {
        clientName: currentEntry.clientName,
        clientPhone: currentEntry.clientPhone,
        invoice: currentEntry.invoice
      }]);
      
      // Reset current entry
      setCurrentEntry({
        clientName: "",
        clientPhone: "",
        invoice: null,
        fileName: null
      });
    }
  };

  const handleRemoveEntry = (index: number) => {
    const updatedEntries = [...clientEntries];
    updatedEntries.splice(index, 1);
    setClientEntries(updatedEntries);
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

  const onSubmit = async (data: FormValues) => {
    if (clientEntries.length === 0) {
      toast({
        title: "אין רשומות לשליחה",
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>יש להוסיף לפחות רשומת לקוח אחת</span>
          </div>
        ),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the data for submission
      const submissionData = {
        professionalName: data.professionalName,
        professionalPhone: data.professionalPhone,
        clients: clientEntries.map(entry => ({
          clientName: entry.clientName,
          clientPhone: entry.clientPhone,
          fileName: entry.invoice[0].name,
          fileSize: entry.invoice[0].size,
          fileType: entry.invoice[0].type
        }))
      };

      // For demonstration, we're just logging the data
      console.log('Submitting to webhook:', submissionData);

      // In a real implementation, you would replace this with your webhook URL
      // and append all files to the FormData
      const formData = new FormData();
      formData.append('professionalData', JSON.stringify({
        professionalName: data.professionalName,
        professionalPhone: data.professionalPhone,
        clients: clientEntries.map(entry => ({
          clientName: entry.clientName,
          clientPhone: entry.clientPhone,
        }))
      }));
      
      clientEntries.forEach((entry, index) => {
        formData.append(`invoice_${index}`, entry.invoice[0]);
      });
      
      const response = await fetch('https://hook.eu2.make.com/pe4x8bw7zt813js84ln78r4lwfh2gb99', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('שגיאה בשליחת הנתונים');

      // Success case
      toast({
        title: "החשבוניות נשלחו בהצלחה!",
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>הנתונים התקבלו במערכת</span>
          </div>
        ),
      });
      
      // Reset form and entries
      form.reset();
      setClientEntries([]);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "שגיאה בשליחה",
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>אנא נסו שוב מאוחר יותר</span>
          </div>
        ),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-ofair/5 rounded-lg p-6 border border-ofair/20">
            <h2 className="text-xl font-bold mb-4">פרטי בעל המקצוע</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="professionalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם בעל המקצוע</FormLabel>
                    <FormControl>
                      <Input placeholder="הזן את שמך" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professionalPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>טלפון בעל המקצוע</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="הזן את מספר הטלפון שלך" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold mb-6">רשומות לקוחות וחשבוניות</h2>
            
            {/* List of added client entries */}
            {clientEntries.length > 0 && (
              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-medium">רשומות שהתווספו ({clientEntries.length})</h3>
                <div className="space-y-3">
                  {clientEntries.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div className="flex-1">
                        <p className="font-medium">{entry.clientName}</p>
                        <p className="text-sm text-gray-600">{entry.clientPhone}</p>
                        <div className="flex items-center gap-1.5 text-xs text-ofair mt-1">
                          <FileText className="h-3 w-3" />
                          <span>{entry.invoice[0].name}</span>
                        </div>
                      </div>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveEntry(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add new client entry form */}
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
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-ofair bg-ofair/10 px-3 py-1 rounded-full">
                        <FileText className="h-4 w-4" />
                        <span>{currentEntry.fileName}</span>
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
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-ofair hover:bg-ofair-dark transition-colors" 
            disabled={isSubmitting || clientEntries.length === 0}
          >
            {isSubmitting ? "שולח..." : `שלח ${clientEntries.length} חשבוניות`}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default InvoiceForm;
