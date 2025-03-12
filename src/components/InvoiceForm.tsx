
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { AlertCircle } from 'lucide-react';
import ProfessionalDetails from './invoiceForm/ProfessionalDetails';
import ClientEntryForm from './invoiceForm/ClientEntryForm';
import ClientEntry from './invoiceForm/ClientEntry';
import SuccessModal from './invoiceForm/SuccessModal';

// Schema definitions - ensure these match our component interfaces
const clientEntrySchema = z.object({
  clientName: z.string().optional(),
  clientPhone: z.string().regex(/^0[2-9]\d{7,8}$/, { 
    message: "מספר טלפון לא תקין, יש להזין מספר טלפון ישראלי תקין" 
  }).optional(),
  invoice: z.instanceof(FileList)
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      professionalName: "",
      professionalPhone: "",
    },
  });

  const handleAddEntry = (entry: ClientEntry) => {
    setClientEntries([...clientEntries, entry]);
  };

  const handleRemoveEntry = (index: number) => {
    const updatedEntries = [...clientEntries];
    updatedEntries.splice(index, 1);
    setClientEntries(updatedEntries);
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
      // Create FormData with the structure requested
      const formData = new FormData();
      
      // Add professional data
      formData.append('professionalName', data.professionalName);
      formData.append('professionalPhone', data.professionalPhone);
      
      // Add clientsData as a JSON array
      formData.append('clientsData', JSON.stringify(
        clientEntries.map(entry => ({
          clientName: entry.clientName || "",
          clientPhone: entry.clientPhone || "",
        }))
      ));
      
      // Create invoices array with the format requested
      const invoicesData = clientEntries.map(entry => ({
        name: entry.invoice[0].name,
        mime: entry.invoice[0].type,
        data: entry.invoice[0]
      }));
      
      // Add each invoice file
      clientEntries.forEach((entry, index) => {
        formData.append(`invoices`, entry.invoice[0]);
      });
      
      const response = await fetch('https://hook.eu2.make.com/pe4x8bw7zt813js84ln78r4lwfh2gb99', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('שגיאה בשליחת הנתונים');

      // Show success modal
      setShowSuccessModal(true);
      
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
    <>
      <div className="space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <ProfessionalDetails form={form} />

            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-bold mb-6">רשומות לקוחות וחשבוניות</h2>
              
              {/* List of added client entries */}
              {clientEntries.length > 0 && (
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-medium">רשומות שהתווספו ({clientEntries.length})</h3>
                  <div className="space-y-3">
                    {clientEntries.map((entry, index) => (
                      <ClientEntry 
                        key={index} 
                        entry={entry} 
                        index={index} 
                        onRemove={handleRemoveEntry} 
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add new client entry form */}
              <ClientEntryForm onAddEntry={handleAddEntry} />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-ofair hover:bg-ofair-dark transition-colors text-base" 
              disabled={isSubmitting || clientEntries.length === 0}
            >
              {isSubmitting ? "שולח..." : `שלח ${clientEntries.length} חשבוניות`}
            </Button>
          </form>
        </Form>
      </div>

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
      />
    </>
  );
};

export default InvoiceForm;
