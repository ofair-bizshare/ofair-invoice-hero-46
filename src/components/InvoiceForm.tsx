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

type DocumentType = 'invoices' | 'certificates' | 'both';

const InvoiceForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientEntries, setClientEntries] = useState<ClientEntryType[]>([]);
  const [certificateEntries, setCertificateEntries] = useState<CertificateEntryType[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState<DocumentType>('invoices');
  
  const [hasInvoices, setHasInvoices] = useState(false);
  const [hasCertificates, setHasCertificates] = useState(false);
  const [successDocumentType, setSuccessDocumentType] = useState<DocumentType>('invoices');

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
      if (hasInvoices && hasCertificates) {
        setSuccessDocumentType('both');
      } else if (hasInvoices) {
        setSuccessDocumentType('invoices');
      } else {
        setSuccessDocumentType('certificates');
      }

      const formData = new FormData();
      
      formData.append('professionalName', data.professionalName);
      formData.append('professionalPhone', data.professionalPhone);
      
      if (hasInvoices) {
        const clientsData = clientEntries.map(entry => ({
          clientName: entry.clientName || "",
          clientPhone: entry.clientPhone || ""
        }));
        
        formData.append('documentType', 'invoices');
        formData.append('clientsData', JSON.stringify(clientsData));
        
        clientEntries.forEach((entry) => {
          formData.append(`invoices`, entry.invoice[0]);
        });
      }
      
      if (hasCertificates) {
        const certificatesData = certificateEntries.map(entry => ({
          certificateName: entry.certificateName,
          issueDate: entry.issueDate || ""
        }));
        
        if (!hasInvoices) {
          formData.append('documentType', 'certificates');
        }
        
        formData.append('certificatesData', JSON.stringify(certificatesData));
        
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
                  <li>מסמכים מקצועיים מוכיחים את ההכשרה וה
