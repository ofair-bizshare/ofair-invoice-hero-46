
import React, { useEffect, useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../InvoiceForm';

interface ProfessionalDetailsProps {
  form: UseFormReturn<FormValues>;
  phoneFromUrl: string | null;
}

const ProfessionalDetails: React.FC<ProfessionalDetailsProps> = ({ form, phoneFromUrl }) => {
  const [isPhoneFromUrl, setIsPhoneFromUrl] = useState<boolean>(false);
  
  useEffect(() => {
    if (phoneFromUrl) {
      setIsPhoneFromUrl(true);
      
      // After 3 seconds, remove the highlight effect
      const timer = setTimeout(() => {
        setIsPhoneFromUrl(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [phoneFromUrl]);

  return (
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
                <div className="relative">
                  <Input 
                    type="tel" 
                    placeholder="הזן את מספר הטלפון שלך" 
                    className={isPhoneFromUrl ? "border-ofair bg-ofair/10 transition-all" : ""}
                    {...field} 
                  />
                  {isPhoneFromUrl && (
                    <div className="absolute -top-6 right-0 text-xs text-ofair font-medium animate-fade-in">
                      ✓ מספר טלפון התמלא אוטומטית מהקישור
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ProfessionalDetails;
