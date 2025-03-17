
import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { AlertCircle, FileText, Send, Check } from 'lucide-react';
import ProfessionalDetails from './invoiceForm/ProfessionalDetails';
import ClientEntryForm from './invoiceForm/ClientEntryForm';
import ClientEntry from './invoiceForm/ClientEntry';
import CertificateEntryForm from './invoiceForm/CertificateEntryForm';
import CertificateEntry from './invoiceForm/CertificateEntry';
import SuccessModal from './invoiceForm/SuccessModal';
import { Link } from 'react-router-dom';

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

type DocumentType = 'invoices' | 'certificates' | 'both';

const InvoiceForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientEntries, setClientEntries] = useState<ClientEntryType[]>([]);
  const [certificateEntries, setCertificateEntries] = useState<CertificateEntryType[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDocumentType, setSuccessDocumentType] = useState<DocumentType>('invoices');
  
  const [hasInvoices, setHasInvoices] = useState(false);
  const [hasCertificates, setHasCertificates] = useState(false);

  useEffect(() => {
    setHasInvoices(clientEntries.length > 0);
    setHasCertificates(certificateEntries.length > 0);
  }, [clientEntries, certificateEntries]);

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

  const validateSubmission = (type: 'invoices' | 'certificates'): boolean => {
    if (type === 'invoices' && !hasInvoices) {
      toast({
        title: "אין חשבוניות לשליחה",
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>יש להוסיף לפחות חשבונית אחת לשליחה</span>
          </div>
        ),
        variant: "destructive",
      });
      return false;
    } else if (type === 'certificates' && !hasCertificates) {
      toast({
        title: "אין תעודות לשליחה",
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>יש להוסיף לפחות תעודה אחת לשליחה</span>
          </div>
        ),
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const onSubmitInvoices = async (data: FormValues) => {
    if (!validateSubmission('invoices')) return;

    setIsSubmitting(true);

    try {
      setSuccessDocumentType('invoices');
      const formData = new FormData();
      
      formData.append('professionalName', data.professionalName);
      formData.append('professionalPhone', data.professionalPhone);
      
      const clientsData = clientEntries.map(entry => ({
        clientName: entry.clientName || "",
        clientPhone: entry.clientPhone || ""
      }));
      
      formData.append('documentType', 'invoices');
      formData.append('clientsData', JSON.stringify(clientsData));
      
      clientEntries.forEach((entry) => {
        formData.append(`invoices`, entry.invoice[0]);
      });
        
      const response = await fetch('https://hook.eu2.make.com/pe4x8bw7zt813js84ln78r4lwfh2gb99', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('שגיאה בשליחת הנתונים');

      setShowSuccessModal(true);
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

  const onSubmitCertificates = async (data: FormValues) => {
    if (!validateSubmission('certificates')) return;

    setIsSubmitting(true);

    try {
      setSuccessDocumentType('certificates');
      const formData = new FormData();
      
      formData.append('professionalName', data.professionalName);
      formData.append('professionalPhone', data.professionalPhone);
      
      const certificatesData = certificateEntries.map(entry => ({
        certificateName: entry.certificateName,
        issueDate: entry.issueDate || ""
      }));
      
      formData.append('documentType', 'certificates');
      formData.append('certificatesData', JSON.stringify(certificatesData));
      
      certificateEntries.forEach((entry) => {
        formData.append(`certificates`, entry.certificate[0]);
      });
        
      const response = await fetch('https://hook.eu2.make.com/pe4x8bw7zt813js84ln78r4lwfh2gb99', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('שגיאה בשליחת הנתונים');

      setShowSuccessModal(true);
      setCertificateEntries([]);
      
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
      <div className="space-y-8 text-right">
        <Form {...form}>
          <form className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <ProfessionalDetails form={form} />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-3">על השירות</h3>
                <p className="text-sm text-gray-600 mb-4">
                  העלאת מסמכים לפלטפורמת oFair מאפשרת לנו לבדוק את איכות השירות שלך ולהעניק לך דירוג ראשוני במערכת.
                </p>
                <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside mb-4">
                  <li>מסמכים מקצועיים מוכיחים את ההכשרה והמומחיות שלך בתחומך</li>
                  <li>חשבוניות מעידות על ניסיון וביצוע עבודות קודמות</li>
                  <li>הדירוג הראשוני נקבע על סמך איכות וכמות המסמכים שהועלו</li>
                </ul>
                <p className="text-sm text-gray-600">
                  על ידי העלאת מסמכים אתה מסכים <Link to="/terms" className="text-blue-600 hover:underline">לתנאי השימוש</Link> של הפלטפורמה.
                </p>
              </div>
            </div>

            {/* חשבוניות */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2 font-medium">
                  <FileText className="h-5 w-5 text-ofair" />
                  <h3>חשבוניות</h3>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <ClientEntryForm onAddEntry={handleAddClientEntry} />
                
                {clientEntries.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-md font-medium">חשבוניות שהועלו</h3>
                    {clientEntries.map((entry, index) => (
                      <ClientEntry
                        key={index}
                        entry={entry}
                        index={index}
                        onRemove={() => handleRemoveClientEntry(index)}
                      />
                    ))}
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <Button 
                    type="button" 
                    onClick={() => form.handleSubmit(onSubmitInvoices)()}
                    disabled={isSubmitting || !hasInvoices}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        <span>שולח...</span>
                      </div>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>{`שלח ${clientEntries.length} חשבוניות`}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* תעודות מקצועיות */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-8">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2 font-medium">
                  <Check className="h-5 w-5 text-ofair" />
                  <h3>תעודות מקצועיות</h3>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <CertificateEntryForm onAddEntry={handleAddCertificateEntry} />
                
                {certificateEntries.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-md font-medium">תעודות שהועלו</h3>
                    {certificateEntries.map((entry, index) => (
                      <CertificateEntry
                        key={index}
                        entry={entry}
                        index={index}
                        onRemove={() => handleRemoveCertificateEntry(index)}
                      />
                    ))}
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <Button 
                    type="button" 
                    onClick={() => form.handleSubmit(onSubmitCertificates)()}
                    disabled={isSubmitting || !hasCertificates}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        <span>שולח...</span>
                      </div>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>{`שלח ${certificateEntries.length} תעודות מקצועיות`}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
      
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        documentType={successDocumentType}
      />
    </>
  );
};

export default InvoiceForm;
