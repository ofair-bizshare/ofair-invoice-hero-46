
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
import CertificateEntryForm from './invoiceForm/CertificateEntryForm';
import CertificateEntry from './invoiceForm/CertificateEntry';
import SuccessModal from './invoiceForm/SuccessModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Schema definitions - ensure these match our component interfaces
const clientEntrySchema = z.object({
  clientName: z.string().optional(),
  clientPhone: z.string().regex(/^0[2-9]\d{7,8}$/, { 
    message: "מספר טלפון לא תקין, יש להזין מספר טלפון ישראלי תקין" 
  }).optional(),
  invoice: z.instanceof(FileList)
});

const certificateEntrySchema = z.object({
  certificateName: z.string().min(2, { message: "יש להזין שם תעודה" }),
  issueDate: z.string().optional(),
  certificate: z.instanceof(FileList)
});

const formSchema = z.object({
  professionalName: z.string().min(2, { message: "יש להזין את שם בעל המקצוע" }),
  professionalPhone: z.string().regex(/^0[2-9]\d{7,8}$/, { 
    message: "מספר טלפון לא תקין, יש להזין מספר טלפון ישראלי תקין" 
  }),
});

// Define consistent types that match the schema definitions
export type ClientEntryType = {
  clientName?: string;
  clientPhone?: string;
  invoice: FileList;
};

export type CertificateEntryType = {
  certificateName: string;
  issueDate?: string;
  certificate: FileList;
};

export type FormValues = z.infer<typeof formSchema>;

type DocumentType = 'invoices' | 'certificates';

const InvoiceForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientEntries, setClientEntries] = useState<ClientEntryType[]>([]);
  const [certificateEntries, setCertificateEntries] = useState<CertificateEntryType[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState<DocumentType>('invoices');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      professionalName: "",
      professionalPhone: "",
    },
  });

  const handleAddClientEntry = (entry: ClientEntryType) => {
    setClientEntries([...clientEntries, entry]);
  };

  const handleRemoveClientEntry = (index: number) => {
    const updatedEntries = [...clientEntries];
    updatedEntries.splice(index, 1);
    setClientEntries(updatedEntries);
  };

  const handleAddCertificateEntry = (entry: CertificateEntryType) => {
    setCertificateEntries([...certificateEntries, entry]);
  };

  const handleRemoveCertificateEntry = (index: number) => {
    const updatedEntries = [...certificateEntries];
    updatedEntries.splice(index, 1);
    setCertificateEntries(updatedEntries);
  };

  const validateSubmission = (): boolean => {
    if (activeTab === 'invoices' && clientEntries.length === 0) {
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
      return false;
    }
    
    if (activeTab === 'certificates' && certificateEntries.length === 0) {
      toast({
        title: "אין תעודות לשליחה",
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>יש להוסיף לפחות תעודה מקצועית אחת</span>
          </div>
        ),
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const onSubmit = async (data: FormValues) => {
    if (!validateSubmission()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      formData.append('professionalName', data.professionalName);
      formData.append('professionalPhone', data.professionalPhone);
      formData.append('documentType', activeTab); // Add the document type parameter
      
      if (activeTab === 'invoices') {
        // Send clientsData as a nested structure
        clientEntries.forEach((entry, index) => {
          formData.append(`clientsData[${index}][clientName]`, entry.clientName || "");
          formData.append(`clientsData[${index}][clientPhone]`, entry.clientPhone || "");
          formData.append(`invoices`, entry.invoice[0]);
        });
      } else {
        // Send certificatesData with a similar structure to clientsData
        certificateEntries.forEach((entry, index) => {
          formData.append(`certificatesData[${index}][certificateName]`, entry.certificateName);
          formData.append(`certificatesData[${index}][issueDate]`, entry.issueDate || "");
          formData.append(`certificates`, entry.certificate[0]);
        });
      }
      
      const response = await fetch('https://hook.eu2.make.com/pe4x8bw7zt813js84ln78r4lwfh2gb99', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('שגיאה בשליחת הנתונים');

      setShowSuccessModal(true);
      
      // Reset the form and entries
      if (activeTab === 'invoices') {
        setClientEntries([]);
      } else {
        setCertificateEntries([]);
      }
      
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

            <Tabs 
              defaultValue="invoices" 
              className="w-full"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as DocumentType)}
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="invoices" className="text-base py-3">העלאת חשבוניות</TabsTrigger>
                <TabsTrigger value="certificates" className="text-base py-3">העלאת תעודות מקצועיות</TabsTrigger>
              </TabsList>
              
              <TabsContent value="invoices" className="space-y-8">
                <div className="border-t border-gray-200 pt-8">
                  <h2 className="text-xl font-bold mb-6">העלאת חשבוניות</h2>
                  <p className="text-gray-600 mb-6">באזור זה ניתן להעלות חשבוניות שביצעתם עבור לקוחות. ניתן להוסיף מספר חשבוניות בו-זמנית.</p>
                  
                  {clientEntries.length > 0 && (
                    <div className="space-y-4 mb-8">
                      <h3 className="text-lg font-medium">חשבוניות שהתווספו ({clientEntries.length})</h3>
                      <div className="space-y-3">
                        {clientEntries.map((entry, index) => (
                          <ClientEntry 
                            key={index} 
                            entry={entry} 
                            index={index} 
                            onRemove={handleRemoveClientEntry} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <ClientEntryForm onAddEntry={handleAddClientEntry} />
                </div>
              </TabsContent>
              
              <TabsContent value="certificates" className="space-y-8">
                <div className="border-t border-gray-200 pt-8">
                  <h2 className="text-xl font-bold mb-6">העלאת תעודות מקצועיות</h2>
                  <p className="text-gray-600 mb-6">באזור זה ניתן להעלות תעודות הסמכה מקצועיות ורישיונות. העלאת התעודות תסייע בתהליך האימות והרישום במערכת.</p>
                  
                  {certificateEntries.length > 0 && (
                    <div className="space-y-4 mb-8">
                      <h3 className="text-lg font-medium">תעודות שהתווספו ({certificateEntries.length})</h3>
                      <div className="space-y-3">
                        {certificateEntries.map((entry, index) => (
                          <CertificateEntry 
                            key={index} 
                            entry={entry} 
                            index={index} 
                            onRemove={handleRemoveCertificateEntry} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <CertificateEntryForm onAddEntry={handleAddCertificateEntry} />
                </div>
              </TabsContent>
            </Tabs>
            
            <Button 
              type="submit" 
              className="w-full bg-ofair hover:bg-ofair-dark transition-colors text-base py-6" 
              disabled={isSubmitting || (activeTab === 'invoices' ? clientEntries.length === 0 : certificateEntries.length === 0)}
            >
              {isSubmitting ? "שולח..." : activeTab === 'invoices' 
                ? `שלח ${clientEntries.length} חשבוניות`
                : `שלח ${certificateEntries.length} תעודות מקצועיות`
              }
            </Button>
          </form>
        </Form>
      </div>

      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
      />
    </>
  );
};

export default InvoiceForm;
