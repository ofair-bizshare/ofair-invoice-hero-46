
import React from 'react';
import Logo from '@/components/Logo';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-ofair/5">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center animate-fade-in">
        <header className="w-full flex justify-between items-center mb-8">
          <Logo />
          <Button variant="outline" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              חזרה לדף הראשי
            </Link>
          </Button>
        </header>
        
        <main className="w-full max-w-4xl mx-auto flex flex-col items-center">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-ofair" />
              תקנון ותנאי שימוש
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              העלאת חשבוניות ומסמכים מקצועיים בפלטפורמת oFair
            </p>
            <p className="text-gray-500 text-sm mt-2">
              תאריך עדכון: 20.02.2025
            </p>
          </div>
          
          <div className="w-full bg-white shadow-lg rounded-xl p-6 md:p-8 border border-gray-100">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4">1. כללי</h2>
                <p className="text-gray-700 leading-relaxed">
                  ברוכים הבאים ל-oFair! הפלטפורמה שמטרתה לחבר בין בעלי מקצוע לצרכנים באמצעות מערכת דירוגים מתקדמת. כדי להבטיח רמת שירות גבוהה, נדרש מבעלי המקצוע להעלות חשבוניות של לקוחות עבר וכן מסמכים מקצועיים המעידים על הכשרתם.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-bold mb-4">2. הגדרות</h2>
                <ul className="space-y-2 text-gray-700 leading-relaxed list-disc list-inside">
                  <li>"הפלטפורמה" – אתר oFair וכל שירותיו הדיגיטליים.</li>
                  <li>"בעל מקצוע" – משתמש הרשום בפלטפורמה ומציע שירותים ללקוחות.</li>
                  <li>"מסמכים מקצועיים" – כל אישור, רישיון, הסמכה, או תעודה רשמית המעידה על הכשרה מקצועית בתחום העיסוק של בעל המקצוע.</li>
                  <li>"חשבוניות לקוחות עבר" – מסמכים פיננסיים המוכיחים ביצוע עבודות קודמות על ידי בעל המקצוע.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-bold mb-4">3. מטרת העלאת המסמכים</h2>
                <ul className="space-y-2 text-gray-700 leading-relaxed list-disc list-inside">
                  <li>וידוא אמינות ואיכות השירות – הפלטפורמה מיועדת לבעלי מקצוע מהשורה הראשונה בלבד.</li>
                  <li>שיפור חוויית הלקוחות – יצירת מאגר של אנשי מקצוע מומלצים בעלי רקורד מוכח.</li>
                  <li>קביעת דירוג איכות ראשוני – ציון איכות ראשוני מחושב על בסיס המסמכים שהועלו ונתוני העבר של בעל המקצוע.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-bold mb-4">4. העלאת חשבוניות ומסמכים מקצועיים</h2>
                <ul className="space-y-2 text-gray-700 leading-relaxed list-disc list-inside">
                  <li>בעל מקצוע נדרש להעלות לפחות 5 חשבוניות של עבודות קודמות (ככל שיותר, כך דירוג האיכות הראשוני יהיה גבוה יותר).</li>
                  <li>מומלץ להעלות תעודות הסמכה ורישיונות מקצועיים כדי לשפר את ציון האיכות.</li>
                  <li>כל המסמכים צריכים להיות ברורים, קריאים ומעודכנים.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-bold mb-4">5. פרטיות ואבטחת מידע</h2>
                <ul className="space-y-2 text-gray-700 leading-relaxed list-disc list-inside">
                  <li>כל המידע המועלה נשמר בצורה מאובטחת ואינו נחשף לצרכנים או לצדדים שלישיים.</li>
                  <li>המסמכים ישמשו אך ורק לצורך בדיקת התאמה לפלטפורמה ולשיפור חוויית המשתמשים.</li>
                  <li>בעל מקצוע רשאי לבקש את מחיקת המסמכים בכל עת, בכפוף למדיניות הפלטפורמה.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-bold mb-4">6. תהליך בדיקת המסמכים</h2>
                <ul className="space-y-2 text-gray-700 leading-relaxed list-disc list-inside">
                  <li>צוות oFair יבצע בדיקה של כל המסמכים תוך עד 7 ימי עסקים.</li>
                  <li>לאחר האישור, בעל המקצוע יקבל ציון איכות ראשוני אשר יופיע בפרופיל שלו.</li>
                  <li>בעלי מקצוע שיקבלו ציון של 4.2 ומעלה יהיו זכאים להנחה מיוחדת לנרשמים הראשונים לפני ההשקה – 315₪ + מע"מ במקום 630₪ + מע"מ וכן הדרכה אישית על המערכת.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-bold mb-4">7. שימוש בנתונים וקביעת הדירוג</h2>
                <p className="text-gray-700 mb-2 leading-relaxed">הציון הראשוני של בעל המקצוע מבוסס על:</p>
                <ul className="space-y-2 text-gray-700 leading-relaxed list-disc list-inside">
                  <li>היקף ואיכות החשבוניות – כמות וסוג העבודות שבוצעו.</li>
                  <li>תעודות מקצועיות – האם קיימות הסמכות פורמליות.</li>
                  <li>משוב לקוחות קודמים (אם קיים).</li>
                  <li>הפלטפורמה רשאית לעדכן את הציון לאורך זמן בהתאם לביקורות ולפרויקטים חדשים.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-bold mb-4">8. תנאי אחריות והגבלת חבות</h2>
                <ul className="space-y-2 text-gray-700 leading-relaxed list-disc list-inside">
                  <li>הפלטפורמה אינה אחראית על נכונות המסמכים שהועלו – האחריות חלה על בעל המקצוע בלבד.</li>
                  <li>העלאת מסמכים מזויפים או מסולפים עלולה לגרור חסימת חשבון לצמיתות.</li>
                  <li>oFair אינה מתחייבת לקבל כל בעל מקצוע – ההחלטה נתונה לשיקול דעת המערכת בלבד.</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-bold mb-4">9. יצירת קשר</h2>
                <p className="text-gray-700 leading-relaxed">
                  לשאלות ובירורים ניתן לפנות לשירות הלקוחות שלנו בכתובת: info@ofair.com או דרך טופס יצירת הקשר באתר.
                </p>
                <p className="text-gray-700 font-bold mt-4">
                  oFair – רק בעלי המקצוע הטובים ביותר! 🚀
                </p>
              </section>
            </div>
          </div>
        </main>
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} oFair. כל הזכויות שמורות.</p>
        </footer>
      </div>
    </div>
  );
};

export default TermsOfService;
