import { additionalTranslations } from "./extended/index.js";
const brandTranslations = {
  en: {
    journeyTitle: "Your next journey starts with VoyHaven",
    journeyDescription: "Wherever you want to go, explore hotel and flight options and shape your travel plans.",
    allRightsReserved: "All rights reserved.",
  },
  tr: {
    journeyTitle: "Bir sonraki yolculuğun VoyHaven ile başlıyor",
    journeyDescription: "Nereye gitmek istersen, otel ve uçuş seçeneklerini keşfet; seyahat planını şekillendir.",
    allRightsReserved: "Tüm hakları saklıdır.",
  },
  ru: {
    journeyTitle: "Ваше следующее путешествие начинается с VoyHaven",
    journeyDescription: "Куда бы вы ни захотели отправиться, выбирайте отели и авиарейсы и планируйте своё путешествие.",
    allRightsReserved: "Все права защищены.",
  },
  ar: {
    journeyTitle: "رحلتك القادمة تبدأ مع VoyHaven",
    journeyDescription: "أينما ترغب في الذهاب، اكتشف خيارات الفنادق ورحلات الطيران وخطط لرحلتك.",
    allRightsReserved: "جميع الحقوق محفوظة.",
  },
  zh: {
    journeyTitle: "下一段旅程，从 VoyHaven 开始",
    journeyDescription: "无论你想去哪里，都可以探索酒店与航班选择，规划属于你的旅程。",
    allRightsReserved: "保留所有权利。",
  },
  es: {
    journeyTitle: "Tu próximo viaje empieza con VoyHaven",
    journeyDescription: "Vayas donde vayas, descubre opciones de hoteles y vuelos y dale forma a tu viaje.",
    allRightsReserved: "Todos los derechos reservados.",
  },
  pt: {
    journeyTitle: "Sua próxima viagem começa com a VoyHaven",
    journeyDescription: "Aonde quer que você queira ir, descubra opções de hotéis e voos e planeje sua viagem.",
    allRightsReserved: "Todos os direitos reservados.",
  },
  fr: {
    journeyTitle: "Votre prochain voyage commence avec VoyHaven",
    journeyDescription: "Où que vous souhaitiez aller, découvrez les hôtels et les vols disponibles et préparez votre voyage.",
    allRightsReserved: "Tous droits réservés.",
  },
  de: {
    journeyTitle: "Deine nächste Reise beginnt mit VoyHaven",
    journeyDescription: "Wohin du auch reisen möchtest: Entdecke Hotels und Flüge und gestalte deine Reisepläne.",
    allRightsReserved: "Alle Rechte vorbehalten.",
  },
  it: {
    journeyTitle: "Il tuo prossimo viaggio inizia con VoyHaven",
    journeyDescription: "Ovunque tu voglia andare, scopri le opzioni di hotel e voli e organizza il tuo viaggio.",
    allRightsReserved: "Tutti i diritti riservati.",
  },
};

export default brandTranslations;

Object.assign(brandTranslations, additionalTranslations("brandTranslations.js", "default"));

// A compact welcome keeps the booking form in view on small screens.
const mobileSlogans = {
  en: "New places, unforgettable memories.",
  tr: "Yeni yerler, unutulmaz anılar.",
  de: "Neue Orte, unvergessliche Erinnerungen.",
  fr: "De nouveaux horizons, des souvenirs inoubliables.",
  ru: "Новые места, незабываемые впечатления.",
  es: "Nuevos lugares, recuerdos inolvidables.",
  ar: "أماكن جديدة، ذكريات لا تُنسى.",
  pt: "Novos lugares, memórias inesquecíveis.",
  it: "Nuovi luoghi, ricordi indimenticabili.",
  zh: "探索新天地，留下难忘回忆。",
  nl: "Nieuwe plekken, onvergetelijke herinneringen.",
  nb: "Nye steder, uforglemmelige minner.",
  sv: "Nya platser, oförglömliga minnen.",
  da: "Nye steder, uforglemmelige minder.",
  fi: "Uusia paikkoja, unohtumattomia muistoja.",
  ja: "新しい場所で、忘れられない思い出を。",
  ko: "새로운 곳에서, 잊지 못할 추억을.",
  pl: "Nowe miejsca, niezapomniane wspomnienia.",
};
for (const [language, mobileSlogan] of Object.entries(mobileSlogans)) {
  brandTranslations[language].mobileSlogan = mobileSlogan;
}
