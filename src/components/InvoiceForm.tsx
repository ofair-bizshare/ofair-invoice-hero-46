
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const formSchema = z.object({
  clientName: z.string().min(2, { message: "שם הלקוח חייב להכיל לפחות 2 תווים" }),
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

type FormValues = z.infer<typeof formSchema>;

const InvoiceForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const file = data.invoice[0];
      const formData = new FormData();
      formData.append('clientName', data.clientName);
      formData.append('clientPhone', data.clientPhone);
      formData.append('invoice', file);

      // For demonstration, we're just logging the data
      // In a real implementation, you would replace this with your webhook URL
      console.log('Submitting to webhook:', {
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Simulating API call to webhook
      // In a real implementation, replace this with your actual webhook URL
      // const response = await fetch('https://your-webhook-url.com/api/invoices', {
      //   method: 'POST',
      //   body: formData,
      // });
      
      // if (!response.ok) throw new Error('שגיאה בשליחת הנתונים');

      // Success case
      toast({
        title: "החשבונית נשלחה בהצלחה!",
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>הנתונים התקבלו במערכת</span>
          </div>
        ),
      });
      
      // Reset form
      form.reset();
      setFileName(null);
      
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
      form.setValue("invoice", files);
    } else {
      setFileName(null);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-md">
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם הלקוח</FormLabel>
              <FormControl>
                <Input placeholder="הזן את שם הלקוח" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>טלפון הלקוח</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="הזן מספר טלפון" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoice"
          render={() => (
            <FormItem>
              <FormLabel>העלאת חשבונית</FormLabel>
              <FormControl>
                <div className="flex flex-col items-center">
                  <label 
                    className="w-full cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors hover:border-ofair hover:bg-ofair/5 flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-ofair" />
                    <div className="text-center">
                      <p className="font-medium text-gray-700">לחץ להעלאת קובץ</p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG עד 5MB</p>
                    </div>
                    {fileName && (
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-ofair bg-ofair/10 px-3 py-1 rounded-full">
                        <FileText className="h-4 w-4" />
                        <span>{fileName}</span>
                      </div>
                    )}
                    <Input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </FormControl>
              {form.formState.errors.invoice && (
                <FormMessage>{form.formState.errors.invoice.message}</FormMessage>
              )}
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-ofair hover:bg-ofair-dark transition-colors" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "שולח..." : "שלח חשבונית"}
        </Button>
      </form>
    </Form>
  );
};

export default InvoiceForm;
