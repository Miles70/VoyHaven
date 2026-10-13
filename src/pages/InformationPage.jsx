import AboutPage from "./AboutPage";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import siteConfig from "../config/site";
import "./InformationPage.css";

const configuredSupportEmail = String(import.meta.env.VITE_SUPPORT_EMAIL || "").trim();
// Keep legacy mailbox configuration intact; use account support until a
// current-brand mailbox is configured.
const supportEmail = /@(?:www\.)?rotavoy\.com$/i.test(configuredSupportEmail) ? "" : configuredSupportEmail;
const supportCopy = {
  en: ["Send questions, hotel partnership requests and travel feedback through the support section of your account.", "For reservation help, sign in and create a support request with your booking reference. You can track replies in your account.", "Open account support"],
  tr: ["Sorularını, otel iş birliği taleplerini ve seyahat geri bildirimlerini hesabındaki destek bölümünden iletebilirsin.", "Rezervasyon desteği için giriş yapıp rezervasyon referansınla bir destek talebi oluştur. Yanıtları hesabından takip edebilirsin.", "Hesabımdan destek al"],
  de: ["Sende Fragen, Hotelpartnerschaftsanfragen und Reisefeedback über den Supportbereich deines Kontos.", "Melde dich für Buchungshilfe an und erstelle eine Supportanfrage mit deiner Buchungsreferenz. Antworten findest du in deinem Konto.", "Kontosupport öffnen"],
  fr: ["Envoie tes questions, demandes de partenariat hôtelier et avis de voyage depuis la rubrique assistance de ton compte.", "Pour une réservation, connecte-toi et crée une demande avec ta référence. Tu peux suivre les réponses dans ton compte.", "Ouvrir l’assistance du compte"],
  ru: ["Отправляй вопросы, предложения о сотрудничестве с отелями и отзывы через раздел поддержки в своём аккаунте.", "Для помощи с бронированием войди и создай обращение с номером бронирования. Ответы можно отслеживать в аккаунте.", "Открыть поддержку аккаунта"],
  ar: ["أرسل الأسئلة وطلبات الشراكة الفندقية وملاحظات السفر عبر قسم الدعم في حسابك.", "للمساعدة في الحجز، سجّل الدخول وأنشئ طلب دعم مع مرجع الحجز. يمكنك متابعة الردود في حسابك.", "فتح دعم الحساب"],
  es: ["Envía preguntas, solicitudes de colaboración hotelera y comentarios sobre viajes desde la sección de soporte de tu cuenta.", "Para recibir ayuda con una reserva, inicia sesión y crea una solicitud con tu referencia. Puedes seguir las respuestas en tu cuenta.", "Abrir soporte de la cuenta"],
  pt: ["Envia perguntas, pedidos de parceria hoteleira e comentários sobre viagens pela secção de apoio da tua conta.", "Para ajuda com uma reserva, inicia sessão e cria um pedido com a referência da reserva. Podes acompanhar as respostas na tua conta.", "Abrir apoio da conta"],
  it: ["Invia domande, richieste di collaborazione alberghiera e feedback sui viaggi dalla sezione assistenza del tuo account.", "Per assistenza con una prenotazione, accedi e crea una richiesta con il riferimento della prenotazione. Puoi seguire le risposte nel tuo account.", "Apri l’assistenza dell’account"],
  zh: ["通过账户中的支持页面发送问题、酒店合作请求和旅行反馈。", "如需预订帮助，请登录并提交包含预订编号的支持请求。你可以在账户中查看回复。", "打开账户支持"],
};

const mailSupportCopy = {
  en: ["Contact", "Travel Support", "Email us with questions, hotel partnership requests or travel feedback.", "For reservation support, include your booking reference and the email address used for your reservation."],
  tr: ["İletişim", "Seyahat Desteği", "Soruların, otel iş birliği taleplerin ve seyahat geri bildirimlerin için bize e-posta gönderebilirsin.", "Rezervasyon desteği için mesajına rezervasyon referansını ve rezervasyonda kullandığın e-posta adresini ekle."],
  de: ["Kontakt", "Reisesupport", "Schreib uns bei Fragen, Hotelpartnerschaftsanfragen oder Reisefeedback eine E-Mail.", "Gib bei Buchungsfragen deine Buchungsreferenz und die für die Buchung verwendete E-Mail-Adresse an."],
  fr: ["Contact", "Assistance voyage", "Écris-nous pour toute question, demande de partenariat hôtelier ou remarque sur ton voyage.", "Pour une demande concernant une réservation, indique ta référence et l’adresse e-mail utilisée pour la réservation."],
  ru: ["Контакты", "Поддержка путешественников", "Напиши нам по вопросам, предложениям о сотрудничестве с отелями или отзывам о путешествиях.", "Для помощи с бронированием укажи номер бронирования и адрес электронной почты, использованный при бронировании."],
  ar: ["اتصل بنا", "دعم السفر", "راسلنا عبر البريد الإلكتروني للأسئلة وطلبات الشراكة الفندقية وملاحظات السفر.", "للدعم المتعلق بالحجز، أرفق مرجع الحجز وعنوان البريد الإلكتروني المستخدم في الحجز."],
  es: ["Contacto", "Asistencia de viaje", "Escríbenos por correo con preguntas, solicitudes de colaboración hotelera o comentarios sobre viajes.", "Para recibir ayuda con una reserva, incluye la referencia y la dirección de correo utilizada en la reserva."],
  pt: ["Contacto", "Apoio à viagem", "Envia-nos um e-mail com perguntas, pedidos de parceria hoteleira ou comentários sobre viagens.", "Para ajuda com uma reserva, inclui a referência da reserva e o endereço de e-mail utilizado na reserva."],
  it: ["Contatti", "Assistenza viaggi", "Scrivici per domande, richieste di collaborazione alberghiera o feedback sui viaggi.", "Per assistenza con una prenotazione, indica il riferimento della prenotazione e l’indirizzo e-mail utilizzato per prenotare."],
  zh: ["联系我们", "旅行支持", "如有问题、酒店合作请求或旅行反馈，请发送电子邮件联系我们。", "如需预订支持，请提供预订编号和预订时使用的电子邮件地址。"],
};

const content = {
  en: {
    contact: ["Contact", `Questions, hotel partnership requests and travel feedback can be sent to ${supportEmail}. We aim to respond as soon as possible.`],
    support: ["Travel Support", `For reservation support, include your VoyHaven booking reference and the email address used during checkout when contacting ${supportEmail}. Never send a wallet recovery phrase or private key.`],
    privacy: ["Privacy Policy", "VoyHaven processes the information required to provide hotel search, reservations, payments, authentication and customer support. Authentication may be handled by third-party identity providers. Payment transactions made on public blockchains are public by design. Personal information is not sold."],
    terms: ["Travel Terms of Service", "VoyHaven provides travel search and booking services. Hotel availability, room conditions, cancellation terms and prices may change until a reservation is confirmed. Users must provide accurate guest and contact information and review the live rate conditions before payment."],
    refund: ["Cancellation & Refund Policy", "Cancellation and refund eligibility depends on the hotel rate and reservation conditions shown during booking. Some rates may be non-refundable. Blockchain network fees and completed irreversible transfers cannot be reversed by VoyHaven. Contact support with your booking reference for eligible cancellation or refund requests."],
    updated: "Last updated: September 28, 2026",
    back: "Back to travel",
  },
  tr: {
    contact: ["İletişim", `Sorularını, otel iş birliği taleplerini ve seyahat geri bildirimlerini ${supportEmail} adresine gönderebilirsin. Mümkün olan en kısa sürede dönüş yapmayı hedefliyoruz.`],
    support: ["Seyahat Desteği", `Rezervasyon desteği için ${supportEmail} adresine yazarken VoyHaven rezervasyon referansını ve checkout sırasında kullandığın e-posta adresini ekle. Cüzdan kurtarma kelimelerini veya özel anahtarını asla gönderme.`],
    privacy: ["Gizlilik Politikası", "VoyHaven; otel arama, rezervasyon, ödeme, kimlik doğrulama ve müşteri desteği için gereken bilgileri işler. Kimlik doğrulama üçüncü taraf sağlayıcılar üzerinden gerçekleştirilebilir. Herkese açık blokzincirlerdeki ödeme işlemleri yapıları gereği açıktır. Kişisel bilgiler satılmaz."],
    terms: ["Seyahat Kullanım Şartları", "VoyHaven seyahat arama ve rezervasyon hizmeti sunar. Otel müsaitliği, oda koşulları, iptal şartları ve fiyatlar rezervasyon onaylanana kadar değişebilir. Kullanıcı doğru misafir ve iletişim bilgisi vermeli ve ödeme öncesinde güncel fiyat koşullarını kontrol etmelidir."],
    refund: ["İptal ve İade Politikası", "İptal ve iade uygunluğu rezervasyon sırasında gösterilen otel fiyat planı ve rezervasyon koşullarına bağlıdır. Bazı fiyatlar iade edilemez olabilir. Blokzincir ağ ücretleri ve tamamlanmış geri döndürülemez transferler VoyHaven tarafından geri alınamaz. Uygun iptal veya iade talepleri için rezervasyon referansınla desteğe ulaş."],
    updated: "Son güncelleme: 28 Eylül 2026",
    back: "Travel'a dön",
  },
};

function InformationPage({ page }) {
  const { language } = useLanguage();
  const localized = content[language] || content.en;
  const [title, body] = localized[page] || localized.contact;
  const supportPage = ["contact", "support"].includes(page);
  const accountSupport = !supportEmail && supportPage;
  const mailText = mailSupportCopy[language] || mailSupportCopy.en;
  const supportIndex = page === "contact" ? 0 : 1;
  const supportText = supportCopy[language] || supportCopy.en;

  if (page === "about") return <AboutPage />;

  return (
    <main className="informationPage container">
      <p className="informationEyebrow">{siteConfig.brandName} · Travel</p>
      <h1>{supportPage ? mailText[supportIndex] : title}</h1>
      <p>{accountSupport ? supportText[supportIndex] : supportPage ? mailText[supportIndex + 2] : body}</p>
      {supportPage && supportEmail && <p><a href={`mailto:${supportEmail}`}>{supportEmail}</a></p>}
      {supportPage && <Link to="/account?tab=support">{supportText[2]}</Link>}
      {page !== "about" && <small>{localized.updated}</small>}
      <Link to="/" className="informationBack">← {localized.back}</Link>
    </main>
  );
}

export default InformationPage;
