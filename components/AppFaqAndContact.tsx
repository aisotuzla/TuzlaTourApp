import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Mail,
  Send,
  Copy,
  Check,
  Bell,
  Sparkles,
  ShieldCheck,
  Compass,
  QrCode,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Language } from '../types';
import { getStoredPushToken } from '../utils/pushNotifications';
import { LocalNotifications } from '@capacitor/local-notifications';

interface AppFaqAndContactProps {
  lang: Language;
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  icon: React.ReactNode;
  category: string;
}

export const AppFaqAndContact: React.FC<AppFaqAndContactProps> = ({ lang }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0); // First one open by default
  const [senderName, setSenderName] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  const contactEmail = 'aiso_tuzla@gmail.com';

  useEffect(() => {
    const token = getStoredPushToken();
    if (token) setFcmToken(token);
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCopyToken = () => {
    if (!fcmToken) return;
    navigator.clipboard.writeText(fcmToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const handleSendTestLocalNotification = async () => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Date.now() % 2_147_483_647),
            title: lang === 'bs' ? 'Tuzla Tour Guide - Test Notifikacija' : 'Tuzla Tour Guide - Test Notification',
            body:
              lang === 'bs'
                ? 'Obavijesti rade uspješno! Vaš uređaj je spreman za geofencing i Tuzla Quest popuste.'
                : 'Notifications are working! Your device is ready for geofencing and Tuzla Quest discounts.',
            schedule: { at: new Date(Date.now() + 500) },
            sound: 'beep.wav',
          },
        ],
      });
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 4000);
    } catch (err) {
      console.error('Failed to trigger test notification:', err);
    }
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const subject = encodeURIComponent(
      `[Tuzla Tour Guide App] Question from ${senderName.trim() || 'Tourist'}`
    );
    const body = encodeURIComponent(
      `Name: ${senderName.trim() || 'Tourist'}\n` +
      `Language: ${lang}\n\n` +
      `Question / Inquirer Message:\n${questionText.trim()}\n\n` +
      `Sent via Tuzla Tour Guide App`
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  const faqData: FaqItem[] = [
    {
      id: 1,
      category: 'Tuzla Quest',
      icon: <Sparkles className="h-5 w-5 text-amber-500" />,
      question:
        lang === 'bs'
          ? 'Šta je Tuzla Tour App i kako funkcionišu Tuzla Quest nagrade?'
          : lang === 'de'
            ? 'Was ist die Tuzla Tour App und wie funktionieren die Tuzla Quest Belohnungen?'
            : lang === 'tr'
              ? 'Tuzla Tour Uygulaması nedir ve Tuzla Quest ödülleri nasıl çalışır?'
              : 'What is Tuzla Tour App & how does the Tuzla Quest reward system work?',
      answer:
        lang === 'bs'
          ? 'Tuzla Tour App je interaktivni turistički vodič sa 3D GPS navigacijom, kamerom sa AR vodičem i nagradnom igrom Tuzla Quest. Šetnjom kroz grad otkrivate kulturne znamenitosti i partnerske lokale (restorane, kafiće, hotele). Skeniranjem QR koda na licu mjesta ostvarujete garantovanih 20% popusta na račun, otključavate naredne faze i osvajate digitalne bedževe do Velikog Finala!'
          : lang === 'de'
            ? 'Die Tuzla Tour App ist ein interaktiver Reiseführer mit 3D-GPS-Navigation, AR-Kamera-Führung und dem Abenteuerspiel Tuzla Quest. Beim Erkunden historischer Orte und Partnerlokale (Restaurants, Hotels, Geschäfte) scannen Sie vor Ort QR-Codes und erhalten sofort 20 % Rabatt auf Ihre Rechnung sowie digitale Belohnungen.'
            : lang === 'tr'
              ? 'Tuzla Tour App, 3D GPS navigasyonu, artırılmış gerçeklik (AR) rehberi ve Tuzla Quest oyununu birleştiren kapsamlı bir turizm uygulamasıdır. Tarihi noktaları ve ortak işletmeleri ziyaret edip QR kodu okutarak hesabınızda anında %20 indirim kazanabilir ve dijital ödüllerin kilidini açabilirsiniz.'
              : 'Tuzla Tour App is an interactive tourism companion featuring 3D GPS navigation, camera AR guides, and the citywide Tuzla Quest game. By exploring historical landmarks and local partner businesses (restaurants, boutiques, hotels) and scanning physical QR codes on site, you unlock immediate 20% order discounts and digital rewards on your journey to the Grand Finale.',
    },
    {
      id: 2,
      category: '3D GPS & Geofencing',
      icon: <Compass className="h-5 w-5 text-blue-500" />,
      question:
        lang === 'bs'
          ? 'Kako funkcioniše 3D GPS navigacija i geofencing obavijesti na 25 metara?'
          : lang === 'de'
            ? 'Wie funktionieren die 3D-GPS-Navigation und Geofencing-Benachrichtigungen bei 25 m?'
            : lang === 'tr'
              ? '3D GPS navigasyonu ve 25 metre geofencing bildirimleri nasıl çalışır?'
              : 'How does 3D GPS Navigation & 25-meter Geofencing work?',
      answer:
        lang === 'bs'
          ? 'Aplikacija u realnom vremenu prati vašu GPS lokaciju u odnosu na atrakcije. Čim se približite na 25 metara od zadate tačke (POI) ili partnerskog lokala, sistem šalje pametnu push obavijest koja vas poziva da uključite AR kameru i direktno pratite stazu do ulaza.'
          : lang === 'de'
            ? 'Die App überwacht in Echtzeit Ihre GPS-Position relativ zu Sehenswürdigkeiten. Sobald Sie sich innerhalb von 25 Metern zu einem Ziel oder Partner befinden, erhalten Sie eine Geofence-Benachrichtigung, um die AR-Führung direkt zum Eingang zu starten.'
            : lang === 'tr'
              ? 'Uygulama, GPS konumunuzu Tuzla\'nın ilgi çekici noktalarına göre gerçek zamanlı izler. Bir hedefe veya ortak işletmeye 25 metre yaklaştığınızda, akıllı bir bildirim alarak AR kamera rehberini açabilir ve hedefinize doğrudan yönlendirilebilirsiniz.'
              : 'The app monitors your real-time distance relative to attractions. Once you enter a 25-meter radius around any Point of Interest (POI) or partner shop, an intelligent geofence notification alerts you to activate the camera AR Guide to lead you directly to the entrance.',
    },
    {
      id: 3,
      category: 'AR Camera Guide',
      icon: <MapPin className="h-5 w-5 text-emerald-500" />,
      question:
        lang === 'bs'
          ? 'Šta je AR vodič sa kamerom i zaključavanje cilja na 5 metara?'
          : lang === 'de'
            ? 'Was ist die AR-Kamera-Führung und die 5-Meter-Zielfixierung?'
            : lang === 'tr'
              ? 'AR Kamera Rehberi ve 5 metre hedef kilitleme nedir?'
              : 'What is the Camera AR Guide & 5-meter High-Accuracy Target Lock?',
      answer:
        lang === 'bs'
          ? 'Kada se nađete na 5 metara od partnera, uključuje se Augmented Reality (AR) pogled kamere. Kroz prikaz kamere vidite 3D holografske strelice i markere sa tačnom udaljenošću koji vas navode ravno do vrata, pulta ili stola lokalnog partnera, garantujući da nikad ne zalutate.'
          : lang === 'de'
            ? 'Innerhalb von 5 Metern vor dem Ziel schaltet die App die Augmented-Reality-Kamera ein. Holografische Richtungspfeile und Distanz-Marker blenden sich in das Live-Kamerabild ein und führen Sie präzise zum Eingang oder Tresen des Partners.'
            : lang === 'tr'
              ? 'Hedefe 5 metre kala Artırılmış Gerçeklik (AR) kamera modu devreye girer. Gerçek dünya kamera görüntüsü üzerinde 3D holografik yön okları ve mesafe göstergeleri belirerek sizi doğrudan işletmenin kapısına ve kasasına ulaştırır.'
              : 'When within 5 meters of your destination, the Augmented Reality (AR) camera view overlays 3D holographic directional arrows and distance beacons over your live camera feed, pinpointing the partner’s entrance and counter with maximum accuracy.',
    },
    {
      id: 4,
      category: 'QR Scanner & Discounts',
      icon: <QrCode className="h-5 w-5 text-indigo-500" />,
      question:
        lang === 'bs'
          ? 'Kako skenirati QR kodove i preuzeti popuste u radnjama?'
          : lang === 'de'
            ? 'Wie scanne ich QR-Codes und erhalte Rabatte in Geschäften?'
            : lang === 'tr'
              ? 'QR kodları nasıl taratıp işletmelerde indirim kazanırım?'
              : 'How do I scan QR codes and redeem partner discounts?',
      answer:
        lang === 'bs'
          ? 'U aplikaciji otvorite tab "QR Scan" sa laserskim nišanom. Usmjerite kameru prema službenom Tuzla Tour Guide QR kodu postavljenom na šanku ili ulazu lokala. Aplikacija bilježi "Proof-of-Footprint" (dokaz posjete), prikazuje vam digitalni vaučer za 20% popusta pri plaćanju i otključava sljedeću etapu grada!'
          : lang === 'de'
            ? 'Öffnen Sie den Reiter "QR Scan" mit dem leuchtenden Laser. Richten Sie die Kamera auf den offiziellen QR-Code am Tresen des Partnerlokals. Der Besuch wird verifiziert ("Proof-of-Footprint"), Ihr 20%-Rabattgutschein wird freigeschaltet und die nächste Stufe beginnt!'
            : lang === 'tr'
              ? 'Uygulamanın alt veya yan menüsünden "QR Scan" sekmesini açın ve kameranızı işletmedeki Tuzla Tour Guide QR koduna tutun. Ziyaretiniz doğrulanır (Proof-of-Footprint), hesabı öderken geçerli %20 indirim kuponunuz açılır ve sıradaki aşama aktifleşir!'
              : 'Open the dedicated "QR Scan" tab with the neon laser scanner. Point your camera at the official Tuzla Tour Guide QR placard at the partner venue. The app confirms your physical presence (Proof-of-Footprint), reveals your 20% order discount voucher for the staff, and unlocks the next stage of your tour!',
    },
    {
      id: 5,
      category: 'Offline Capability',
      icon: <ShieldCheck className="h-5 w-5 text-cyan-500" />,
      question:
        lang === 'bs'
          ? 'Mogu li koristiti aplikaciju i mape offline bez interneta?'
          : lang === 'de'
            ? 'Kann ich die App und Karten offline ohne Internet nutzen?'
            : lang === 'tr'
              ? 'Uygulamayı ve haritaları internet olmadan çevrimdışı kullanabilir miyim?'
              : 'Can I use the app and maps offline without internet or roaming?',
      answer:
        lang === 'bs'
          ? 'Da! Tuzla Tour App koristi napredne vektorske PMTiles offline mape i lokalno keširanje. Sve bilješke, planovi puta, evidencija troškova, zvučni vodiči i važne turističke informacije rade u potpunosti offline bez trošenja roaming podataka.'
          : lang === 'de'
            ? 'Ja! Die Tuzla Tour App verwendet moderne PMTiles-Vektorkarten und lokales Caching. Alle Notizen, Reisepläne, Ausgabenprotokolle und Offline-Reiseführer funktionieren auch ohne mobile Daten oder Roaming.'
            : lang === 'tr'
              ? 'Evet! Tuzla Tour App yüksek performanslı PMTiles çevrimdışı vektör haritalarını ve yerel önbelleği kullanır. Not defteriniz, seyahat planınız, harcama kayıtlarınız ve sesli rehberler internet veya dolaşım verisi olmadan çalışır.'
              : 'Yes! Tuzla Tour App utilizes high-performance PMTiles vector mapping and offline caching. Your sticker notes, itinerary, expense ledger, and key guide details remain accessible even with zero cellular signal or mobile data roaming.',
    },
    {
      id: 6,
      category: 'Privacy & Storage',
      icon: <ShieldCheck className="h-5 w-5 text-purple-500" />,
      question:
        lang === 'bs'
          ? 'Gdje se čuvaju moje bilješke, plan puta i lični podaci?'
          : lang === 'de'
            ? 'Wo werden meine Notizen, Reisepläne und persönlichen Daten gespeichert?'
            : lang === 'tr'
              ? 'Notlarım, seyahat planım ve kişisel verilerim nerede saklanıyor?'
              : 'Where are my notes, itinerary, and personal data stored?',
      answer:
        lang === 'bs'
          ? '100% Privacy by Design: sve vaše bilješke, crteži na platnu, to-do stavke, evidencija troškova i quest napredak pohranjeni su isključivo lokalno u memoriji vašeg telefona. Podaci se ne šalju na vanjske servere niti se prate vaše privatne zabilješke.'
          : lang === 'de'
            ? '100 % Datenschutz durch Technikgestaltung: Alle Ihre handschriftlichen Notizen, Zeichnungen, To-Do-Punkte und Ausgaben werden ausschließlich lokal auf Ihrem Gerät gespeichert. Es findet kein Tracking oder Server-Upload Ihrer persönlichen Einträge statt.'
            : lang === 'tr'
              ? '%100 Gizlilik Odaklı Tasarım: Çizimleriniz, yapışkan notlarınız, görev listeleriniz ve harcamalarınız yalnızca telefonunuzun yerel hafızasında saklanır. Kişisel verileriniz harici sunuculara iletilmez veya izlenmez.'
              : '100% Privacy by Design: All your sticky notes, canvas pen sketches, to-do checklists, expense logs, and quest achievements are saved strictly on your local device storage. No personal notes or financial details are transmitted to external servers or third parties.',
    },
  ];

  return (
    <div className="mt-12 space-y-10">
      {/* FAQ Header & Accordion List */}
      <section className="rounded-2xl sm:rounded-4xl border border-blue-100 bg-white p-5 sm:p-8 shadow-[0_16px_40px_rgba(37,99,235,0.08)]">
        <div className="flex items-center gap-3 pb-3 border-b border-blue-50">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {lang === 'bs'
                ? 'Često postavljana pitanja (FAQ)'
                : lang === 'de'
                  ? 'Häufig gestellte Fragen (FAQ)'
                  : lang === 'tr'
                    ? 'Sıkça Sorulan Sorular (SSS)'
                    : 'Frequently Asked Questions (FAQ)'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {lang === 'bs'
                ? 'Sve o funkcijama aplikacije, Tuzla Quest igri, popustima i navigaciji'
                : lang === 'de'
                  ? 'Alles über App-Funktionen, Tuzla Quest, Rabatte und Navigation'
                  : lang === 'tr'
                    ? 'Uygulama özellikleri, Tuzla Quest oyunu, indirimler ve navigasyon hakkında'
                    : 'Everything about app features, Tuzla Quest, merchant discounts & navigation'}
            </p>
          </div>
        </div>

        {/* Accordion Questions */}
        <div className="mt-6 space-y-3">
          {faqData.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={item.id}
                className={`overflow-hidden rounded-2xl border transition-all ${isOpen
                    ? 'border-blue-300 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200/80 bg-white hover:border-blue-200'
                  }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-4 sm:p-5 text-left min-h-13"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 rounded-xl bg-white p-2 shadow-2xs border border-slate-100">
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                        {item.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                        {item.question}
                      </h3>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 pt-1 text-xs sm:text-sm leading-relaxed text-slate-600 border-t border-blue-100/60">
                    <p className="mt-2">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Notification Diagnostic Bar */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-900">
                  {lang === 'bs' ? 'Status Push Notifikacija' : 'Push Notification Status'}
                </div>
                <div className="text-xs text-slate-500">
                  {fcmToken
                    ? (lang === 'bs' ? 'Uređaj je registrovan za FCM obavijesti.' : 'Device registered for FCM push.')
                    : (lang === 'bs' ? 'Čeka se dozvola ili registracija uređaja.' : 'Waiting for permission or registration.')}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {fcmToken && (
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100"
                >
                  {copiedToken ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedToken ? (lang === 'bs' ? 'Kopiran token!' : 'Token Copied!') : (lang === 'bs' ? 'Kopiraj FCM Token' : 'Copy FCM Token')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSendTestLocalNotification}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-black text-white shadow-xs hover:bg-blue-700"
              >
                {testNotificationSent ? <CheckCircle2 className="h-3.5 w-3.5 text-white" /> : <Bell className="h-3.5 w-3.5" />}
                <span>
                  {testNotificationSent
                    ? (lang === 'bs' ? 'Poslano!' : 'Sent!')
                    : (lang === 'bs' ? 'Pošalji Test Zvuk' : 'Send Test Notification')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Card at very bottom */}
      <section className="rounded-2xl sm:rounded-4xl border border-blue-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] p-5 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
              <Mail className="h-4 w-4" />
              {lang === 'bs' ? 'Kontakt & Pitanja' : 'Contact & Support'}
            </div>
            <h3 className="mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight">
              {lang === 'bs' ? 'Pošaljite nam poruku' : 'Ask Us Anything'}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              {lang === 'bs'
                ? 'Imate prijedlog za turistički vodič, partnersku lokaciju ili pitanje?'
                : 'Have feedback, a partnership inquiry, or a question about Tuzla?'}
            </p>
          </div>

          {/* Contact email pill with copy button */}
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-2 sm:px-4 sm:py-2.5 backdrop-blur-md border border-white/10">
            <Mail className="h-4 w-4 text-cyan-300 shrink-0" />
            <a
              href={`mailto:${contactEmail}`}
              className="text-xs sm:text-sm font-black text-cyan-200 hover:underline truncate"
            >
              {contactEmail}
            </a>
            <button
              type="button"
              onClick={handleCopyEmail}
              title="Copy Email"
              className="ml-1 rounded-lg bg-white/20 p-1.5 text-white hover:bg-white/30 transition-colors"
            >
              {copiedEmail ? <Check className="h-3.5 w-3.5 text-green-300" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmitQuestion} className="mt-6 space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {lang === 'bs' ? 'Vaše Ime' : 'Your Name'}
              </label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder={lang === 'bs' ? 'npr. Mirza ili Sarah' : 'e.g. Sarah Jenkins'}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white placeholder:text-slate-400 outline-none focus:border-cyan-400 focus:bg-white/15 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {lang === 'bs' ? 'Email za kontakt' : 'Contact Destination'}
              </label>
              <input
                type="text"
                readOnly
                value={contactEmail}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-cyan-300 outline-none cursor-default"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              {lang === 'bs' ? 'Vaše Pitanje / Poruka' : 'Your Question / Message'}
            </label>
            <textarea
              required
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder={
                lang === 'bs'
                  ? 'Napišite pitanje u vezi Tuzla Quest nagradne igre, preporuke lokala ili rada aplikacije...'
                  : 'Write your question regarding Tuzla Quest rewards, POI recommendations, or app features...'
              }
              className="w-full resize-none rounded-xl border border-white/20 bg-white/10 p-4 text-sm font-medium text-white placeholder:text-slate-400 outline-none focus:border-cyan-400 focus:bg-white/15 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <span className="text-xs text-slate-400">
              {lang === 'bs'
                ? 'Klikom na dugme otvara se vaša email aplikacija sa pripremljenim upitom.'
                : 'Clicking Send opens your default email client with your message pre-filled.'}
            </span>

            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:bg-cyan-400 active:scale-95"
            >
              <Send className="h-4 w-4" />
              <span>{lang === 'bs' ? 'Pošalji Upit' : 'Send Question'}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

