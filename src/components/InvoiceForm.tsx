
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type DocumentType = 'invoices' | 'certificates';

const InvoiceForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientEntries, setClientEntries] = useState<ClientEntryType[]>([]);
  const [certificateEntries, setCertificateEntries] = useState<CertificateEntryType[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState<DocumentType>('invoices');
  
  // Boolean flags to track what's being sent
  const [hasInvoices, setHasInvoices] = useState(false);
  const [hasCertificates, setHasCertificates] = useState(false);
  const [successDocumentType, setSuccessDocumentType] = useState<DocumentType>('invoices');

  // Update the flags when entries change
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

  const validateSubmission = (): boolean => {
    // Check if either type of document is present
    if (!hasInvoices && !hasCertificates) {
      toast({
        title: "אין מסמכים לשליחה",
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>יש להוסיף לפחות מסמך אחד לשליחה (חשבונית או תעודה מקצועית)</span>
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
      // Set the success document type based on what's being sent
      if (hasInvoices && hasCertificates) {
        setSuccessDocumentType('both');
      } else if (hasInvoices) {
        setSuccessDocumentType('invoices');
      } else {
        setSuccessDocumentType('certificates');
      }

      // Create the FormData object
      const formData = new FormData();
      
      // Add professional details as separate fields
      formData.append('professionalName', data.professionalName);
      formData.append('professionalPhone', data.professionalPhone);
      
      // Add data for invoices if present
      if (hasInvoices) {
        // Create a JSON array of clients
        const clientsData = clientEntries.map(entry => ({
          clientName: entry.clientName || "",
          clientPhone: entry.clientPhone || ""
        }));
        
        formData.append('documentType', 'invoices');
        formData.append('clientsData', JSON.stringify(clientsData));
        
        // Add all invoice files
        clientEntries.forEach((entry) => {
          formData.append(`invoices`, entry.invoice[0]);
        });
      }
      
      // Add data for certificates if present
      if (hasCertificates) {
        // Create a JSON array of certificates
        const certificatesData = certificateEntries.map(entry => ({
          certificateName: entry.certificateName,
          issueDate: entry.issueDate || ""
        }));
        
        // If both are present, we're already adding invoices document type
        if (!hasInvoices) {
          formData.append('documentType', 'certificates');
        }
        
        formData.append('certificatesData', JSON.stringify(certificatesData));
        
        // Add all certificate files
        certificateEntries.forEach((entry) => {
          formData.append(`certificates`, entry.certificate[0]);
        });
      }
        
      const response = await fetch('https://hook.eu2.make.com/pe4x8bw7zt813js84ln78r4lwfh2gb99', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('שגיאה בשליחת הנתונים');

      setShowSuccessModal(true);
      
      // Reset the relevant form entries based on what was sent
      if (hasInvoices) setClientEntries([]);
      if (hasCertificates) setCertificateEntries([]);
      
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

  // Dynamically determine button text based on available documents
  const getSubmitButtonText = () => {
    if (isSubmitting) return "שולח...";
    
    if (hasInvoices && hasCertificates) {
      return `שלח ${clientEntries.length} חשבוניות ו-${certificateEntries.length} תעודות מקצועיות`;
    } else if (hasInvoices) {
      return `שלח ${clientEntries.length} חשבוניות`;
    } else if (hasCertificates) {
      return `שלח ${certificateEntries.length} תעודות מקצועיות`;
    }
    
    return "שלח מסמכים";
  };

  return (
    <>
      <div className="space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  <li>מסמכים מקצועיים מוכיחים את ההכשרה והמומחיות שלך</li>
                  <li>חשבוניות עבר מעידות על ניסיונך וסוג העבודות שביצעת</li>
                  <li>כל המידע מאובטח ומשמש רק לצורכי דירוג במערכת</li>
                </ul>
                <div className="flex items-center text-sm text-ofair mt-4">
                  <FileText className="h-4 w-4 mr-1" />
                  <Link to="/terms" className="underline hover:text-ofair-dark">
                    תקנון ותנאי שימוש
                  </Link>
                </div>
              </div>
            </div>

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
            
            <div className="pt-4">
              <p className="text-sm text-gray-500 mb-4">
                בלחיצה על כפתור השליחה, הנך מאשר/ת כי קראת והסכמת ל<Link to="/terms" className="underline hover:text-ofair">תקנון ותנאי השימוש</Link> של פלטפורמת oFair.
              </p>
              <Button 
                type="submit" 
                className="w-full bg-ofair hover:bg-ofair-dark transition-colors text-base py-6" 
                disabled={isSubmitting || (!hasInvoices && !hasCertificates)}
              >
                <Send className="h-5 w-5 ml-2" />
                {getSubmitButtonText()}
              </Button>
              
              {/* Show summary of documents ready to be sent */}
              {(hasInvoices || hasCertificates) && (
                <div className="mt-4 flex flex-col gap-2">
                  {hasInvoices && (
                    <div className="flex items-center text-sm text-green-600">
                      <Check className="h-4 w-4 mr-1" />
                      <span>{clientEntries.length} חשבוניות מוכנות לשליחה</span>
                    </div>
                  )}
                  {hasCertificates && (
                    <div className="flex items-center text-sm text-green-600">
                      <Check className="h-4 w-4 mr-1" />
                      <span>{certificateEntries.length} תעודות מקצועיות מוכנות לשליחה</span>
                    </div>
                  )}
                </div>
              )}
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
