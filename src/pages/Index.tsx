
import React from 'react';
import Logo from '@/components/Logo';
import InvoiceForm from '@/components/InvoiceForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-ofair/5">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center animate-fade-in">
        <header className="w-full flex justify-between items-center mb-8">
          <Logo />
        </header>
        
        <main className="w-full max-w-4xl mx-auto flex flex-col items-center">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              העלאת מסמכים ל-oFair
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              ברוכים הבאים למערכת המסמכים של oFair! כאן תוכלו להעלות חשבוניות ותעודות מקצועיות בקלות ובמהירות. המערכת מאפשרת ניהול יעיל של המסמכים שלכם לצורך שיפור תהליכי העבודה.
            </p>
          </div>
          
          <div className="w-full bg-white shadow-lg rounded-xl p-6 md:p-8 border border-gray-100">
            <InvoiceForm />
          </div>
        </main>
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} oFair. כל הזכויות שמורות.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
