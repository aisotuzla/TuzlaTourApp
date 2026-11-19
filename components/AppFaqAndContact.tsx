import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  ChevronDown,
  Copy,
  Check,
  Bell,
  Globe,
  ShieldCheck,
  Compass,
  QrCode,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Language } from '../types';
import {
  DEFAULT_NOTIFICATION_CHANNEL_ID,
  getStoredPushToken,
} from '../utils/pushNotifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { requestPushToken } from '../utils/firebase';

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
  const [copiedToken, setCopiedToken] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [testNotificationScheduled, setTestNotificationScheduled] = useState(false);
  const [testNotificationError, setTestNotificationError] = useState<string | null>(null);
  const [pushRegistrationError, setPushRegistrationError] = useState<string | null>(null);
  const [pushRegistrationPending, setPushRegistrationPending] = useState(false);
  const [pushRegistrationMessage, setPushRegistrationMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getStoredPushToken();
    if (token) setFcmToken(token);

    const handleToken = (event: Event) => {
      const tokenEvent = event as CustomEvent<string>;
      if (tokenEvent.detail) {
        setFcmToken(tokenEvent.detail);
        setPushRegistrationError(null);
        setPushRegistrationMessage(null);
      }
    };
    const handleRegistrationError = (event: Event) => {
      const errorEvent = event as CustomEvent<string>;
      setPushRegistrationError(errorEvent.detail || 'FCM registration failed.');
      setPushRegistrationPending(false);
    };
    window.addEventListener('tuzla-fcm-token', handleToken);
    window.addEventListener('tuzla-push-registration-error', handleRegistrationError);

    return () => {
      window.removeEventListener('tuzla-fcm-token', handleToken);
      window.removeEventListener('tuzla-push-registration-error', handleRegistrationError);
    };
  }, []);

  const handleCopyToken = () => {
    if (!fcmToken) return;
    navigator.clipboard.writeText(fcmToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const handleSendTestLocalNotification = async () => {
    setTestNotificationError(null);
    try {
      const title = lang === 'bs'
        ? 'Tuzla Tour Guide - Test obavijest'
        : 'Tuzla Tour Guide - Test Notification';
      const body = lang === 'bs'
        ? 'Ako vidite ovu obavijest, lokalne notifikacije rade.'
        : 'If you can see this notification, local notifications are working.';

      if (!Capacitor.isNativePlatform()) {
        if (!('Notification' in window)) {
          throw new Error('Notifications are not supported in this browser.');
        }
        let permission = Notification.permission;
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }
        if (permission !== 'granted') {
          throw new Error('Notification permission was not granted.');
        }

        const registration = 'serviceWorker' in navigator
          ? await navigator.serviceWorker.getRegistration('/')
          : undefined;
        if (registration) {
          await registration.showNotification(title, { body });
        } else {
          new Notification(title, { body });
        }
      } else {
        let permission = await LocalNotifications.checkPermissions();
        if (permission.display !== 'granted') {
          permission = await LocalNotifications.requestPermissions();
        }
        if (permission.display !== 'granted') {
          throw new Error('Notification permission was not granted.');
        }

        if (Capacitor.getPlatform() === 'android') {
          await LocalNotifications.createChannel({
            id: DEFAULT_NOTIFICATION_CHANNEL_ID,
            name: 'Tuzla Tour Notifications',
            description: 'General notifications and quest updates for Tuzla Tour Guide',
            importance: 5,
            visibility: 1,
            vibration: true,
          });
        }

        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Date.now() % 2_147_483_647),
              title,
              body,
              channelId: DEFAULT_NOTIFICATION_CHANNEL_ID,
              schedule: { at: new Date(Date.now() + 1000) },
            },
          ],
        });
      }

      setTestNotificationScheduled(true);
      setTimeout(() => setTestNotificationScheduled(false), 4000);
    } catch (error) {
      console.error('Failed to schedule test notification:', error);
      setTestNotificationError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleRegisterPush = async () => {
    setPushRegistrationPending(true);
    setPushRegistrationError(null);
    setPushRegistrationMessage(null);
    try {
      if (Capacitor.isNativePlatform()) {
        let permission = await PushNotifications.checkPermissions();
        if (permission.receive !== 'granted') {
          permission = await PushNotifications.requestPermissions();
        }
        if (permission.receive !== 'granted') {
          throw new Error('Push notification permission was not granted.');
        }
        await PushNotifications.register();
        setPushRegistrationMessage(
          lang === 'bs'
            ? 'Registracija zatražena; čeka se FCM token.'
            : 'Registration requested; waiting for the FCM token.'
        );
      } else {
        const token = await requestPushToken();
        if (!token) {
          throw new Error(
            'Notification' in window && Notification.permission === 'denied'
              ? 'Notification permission is blocked in browser settings.'
              : 'No FCM token was returned. Check browser support and Firebase web configuration.'
          );
        }
        setFcmToken(token);
      }
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      setPushRegistrationError(error instanceof Error ? error.message : String(error));
    } finally {
      setPushRegistrationPending(false);
    }
  };

  const faqData: FaqItem[] = [
    {
      id: 1,
      category: 'Tuzla Quest',
      icon: <Globe className="h-5 w-5 text-amber-500" />,
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
          ? 'Tuzla Tour App je interaktivni turistički vodič sa 3D GPS navigacijom, kamerom sa AR vodičem i nagradnom igrom Tuzla Quest. Šetnjom kroz grad, uz preciznu navigaciju, otkrivate kulturne znamenitosti i lokalne objekte (restorane, kafiće i hotele) kroz Tuzla Quest. Dolaskom na zadatu lokaciju i skeniranjem QR koda na licu mjesta otključavate naredne faze, sadržaje i popuste te napredujete do finala Tuzla Questa!'
          : lang === 'de'
            ? 'Die Tuzla Tour App ist ein interaktiver Reiseführer mit 3D-GPS-Navigation, einem AR-Kameraguide und dem Gewinnspiel Tuzla Quest. Bei einem Spaziergang durch die Stadt entdecken Sie dank präziser Navigation kulturelle Sehenswürdigkeiten und lokale Betriebe (Restaurants, Cafés und Hotels) im Rahmen von Tuzla Quest. Wenn Sie einen festgelegten Ort erreichen und den dortigen QR-Code scannen, schalten Sie die nächsten Etappen, Inhalte und Rabatte frei und kommen dem Finale von Tuzla Quest näher!'
            : lang === 'tr'
              ? 'Tuzla Tour App, 3D GPS navigasyonu, AR kamera rehberi ve ödüllü Tuzla Quest oyununu içeren interaktif bir turist rehberidir. Şehirde hassas navigasyonla dolaşırken Tuzla Quest kapsamında kültürel yerleri ve yerel işletmeleri (restoranlar, kafeler ve oteller) keşfedersiniz. Belirlenen bir konuma ulaştığınızda, oradaki QR kodunu tarayarak sonraki aşamaların, içeriklerin ve indirimlerin kilidini açar; Tuzla Quest Finali’ne doğru ilerlersiniz.'
              : 'Tuzla Tour App is an interactive tourist guide with 3D GPS navigation, an AR camera guide, and the Tuzla Quest rewards game. As you explore the city with precise navigation, you discover cultural landmarks and local businesses (restaurants, cafés, and hotels) through Tuzla Quest. When you reach a designated location, scan its on-site QR code to unlock the next stages, content, and discounts—and progress toward the Tuzla Quest Finale!'
    },
    {
      id: 2,
      category: '3D GPS & Geofencing',
      icon: <Compass className="h-5 w-5 text-blue-500" />,
      question:
        lang === 'bs'
          ? 'Kako funkcioniše 3D GPS navigacija i geofencing obavijesti?'
          : lang === 'de'
            ? 'Wie funktionieren die 3D-GPS-Navigation und Geofencing-Benachrichtigungen?'
            : lang === 'tr'
              ? '3D GPS navigasyonu ve geofencing bildirimleri nasıl çalışır?'
              : 'How does 3D GPS Navigation & Geofencing work?',
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
      category: 'App Permissions',
      icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
      question:
        lang === 'bs'
          ? 'Zašto aplikacija traži dozvole za lokaciju, kameru i obavijesti?'
          : lang === 'de'
            ? 'Warum benötigt die App Zugriff auf Standort, Kamera und Benachrichtigungen?'
            : lang === 'tr'
              ? 'Uygulama neden konum, kamera ve bildirim izinleri istiyor?'
              : 'Why does the app ask for location, camera, and notification permissions?',
      answer:
        lang === 'bs'
          ? 'Pristup lokaciji omogućava prikaz vašeg položaja na mapi i korištenje funkcija zasnovanih na lokaciji. Kamera se koristi za skeniranje QR kodova lokacija i AR vodič. Dozvola za obavijesti omogućava aplikaciji da vam prikazuje obavijesti. Ove dozvole možete promijeniti u postavkama telefona.'
          : lang === 'de'
            ? 'Der Standortzugriff ermöglicht es der App, Ihre Position auf der Karte anzuzeigen und standortbasierte Funktionen zu nutzen. Die Kamera wird zum Scannen von QR-Codes an Orten und für den AR-Guide verwendet. Mit der Benachrichtigungsberechtigung kann die App Ihnen Mitteilungen anzeigen. Sie können diese Berechtigungen in den Einstellungen Ihres Telefons ändern.'
            : lang === 'tr'
              ? 'Konum izni, uygulamanın haritada konumunuzu göstermesini ve konum tabanlı özellikleri kullanmasını sağlar. Kamera, konum QR kodlarını taramak ve AR rehberini kullanmak için gereklidir. Bildirim izni, uygulamanın size bildirim göstermesini sağlar. Bu izinleri telefonunuzun ayarlarından değiştirebilirsiniz.'
              : 'Location access lets the app show your position on the map and use location-based features. The camera is used to scan location QR codes and use the AR guide. Notification permission lets the app show you notifications. You can change these permissions in your phone settings.',
    },
    {
      id: 4,
      category: 'QR Scanner & Discounts',
      icon: <QrCode className="h-5 w-5 text-indigo-500" />,
      question:
        lang === 'bs'
          ? 'Kako skenirati QR kodove i osvojiti nagrade?'
          : lang === 'de'
            ? 'Wie scanne ich QR-Codes und erhalte Rabatte in Geschäften?'
            : lang === 'tr'
              ? 'QR kodları nasıl taratıp işletmelerde indirim kazanırım?'
              : 'How do I scan QR codes and redeem partner discounts?',
      answer:
        lang === 'bs'
          ? 'U aplikaciji otvorite tab "QR Scan" sa laserskim nišanom. Usmjerite kameru prema službenom Tuzla Tour Guide QR kodu postavljenom na lokaciji. Aplikacija bilježi "Proof-of-Footprint" (dokaz posjete), otkriva nagradu i (npr. digitalni vaučer za 5%-20% popusta pri plaćanju) otključava sljedeću etapu!'
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
          ? 'Da! Nakon prvog otvaranja aplikacije, svi podaci su dostupni i offline. Tuzla Tour App koristi napredne vektorske PMTiles offline mape i lokalno keširanje. Sve bilješke, planovi puta, evidencija troškova, zvučni vodiči i važne turističke informacije rade u potpunosti offline bez trošenja roaming podataka. Apikaciju ne morate ni instalirati na telefon.'
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
          ? '100% Privacy by Design: sve vaše bilješke, crteži na platnu, to-do stavke, evidencija troškova i quest napredak pohranjeni su isključivo lokalno u memoriji vašeg telefona. Podaci se ne šalju na nikakve vanjske servere niti se prate vaše privatne zabilješke. Sukladno Zakonu o zaštiti ličnih podataka FBIH i (GDPR), poduzete su sve mjere kako bi se osigurala maksimalna privatnost korisnika.'
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
                    : (lang === 'bs' ? 'FCM token nije registrovan.' : 'FCM token is not registered.')}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRegisterPush}
                disabled={pushRegistrationPending}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
              >
                <Bell className="h-3.5 w-3.5" />
                <span>
                  {pushRegistrationPending
                    ? (lang === 'bs' ? 'Registracija...' : 'Registering...')
                    : (lang === 'bs' ? 'Registruj push' : 'Register Push')}
                </span>
              </button>

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
                {testNotificationScheduled ? <CheckCircle2 className="h-3.5 w-3.5 text-white" /> : <Bell className="h-3.5 w-3.5" />}
                <span>
                  {testNotificationScheduled
                    ? (lang === 'bs' ? 'Zakazano!' : 'Scheduled!')
                    : (lang === 'bs' ? 'Testiraj obavijest' : 'Test Notification')}
                </span>
              </button>
            </div>
          </div>
          {(pushRegistrationMessage || pushRegistrationError || testNotificationError) && (
            <div className="mt-3 space-y-1 text-xs">
              {pushRegistrationMessage && (
                <p className="text-slate-600">{pushRegistrationMessage}</p>
              )}
              {pushRegistrationError && (
                <p role="alert" className="text-red-700">{pushRegistrationError}</p>
              )}
              {testNotificationError && (
                <p role="alert" className="text-red-700">{testNotificationError}</p>
              )}
            </div>
          )}
        </div>
        <div className="mt-2 flex justify-end">
          <button type="button" onClick={() => navigate('/admin')} className="text-[10px] font-medium text-slate-400/70 hover:text-slate-600 underline underline-offset-2 decoration-slate-300/60">Admin</button>
        </div>
      </section>

    </div>
  );
};

