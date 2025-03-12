
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from 'react-hook-form';

// Updated interface to match the form schema in InvoiceForm.tsx
interface FormValues {
  professionalName: string;
  professionalPhone: string;
}

interface ProfessionalDetailsProps {
  form: UseFormReturn<FormValues>;
}

const ProfessionalDetails: React.FC<ProfessionalDetailsProps> = ({ form }) => {
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
                <Input type="tel" placeholder="הזן את מספר הטלפון שלך" {...field} />
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
