const copy = {
  "en": [
    "A world of places to stay",
    "Worldwide hotel & accommodation network",
    "From city hotels to beach resorts, find your next stay with VoyHaven.",
    "Availability varies by destination and travel dates."
  ],
  "tr": [
    "Konaklamak için kocaman bir dünya",
    "Dünya genelinde otel ve konaklama ağı",
    "Şehir otellerinden sahil tatil köylerine, bir sonraki konaklamanı VoyHaven ile keşfet.",
    "Müsaitlik, destinasyona ve seyahat tarihlerine göre değişir."
  ],
  "de": [
    "Eine Welt voller Unterkünfte",
    "Weltweites Hotel- und Unterkunftsnetzwerk",
    "Vom Stadthotel bis zum Strandresort: Entdecke deine nächste Unterkunft mit VoyHaven.",
    "Die Verfügbarkeit hängt vom Reiseziel und den Reisedaten ab."
  ],
  "fr": [
    "Tout un monde où séjourner",
    "Réseau mondial d’hôtels et d’hébergements",
    "Des hôtels en ville aux complexes en bord de mer, découvre ton prochain séjour avec VoyHaven.",
    "La disponibilité varie selon la destination et les dates du séjour."
  ],
  "ru": [
    "Целый мир для отдыха",
    "Всемирная сеть отелей и объектов размещения",
    "От городских отелей до пляжных курортов — найди место для следующей поездки с VoyHaven.",
    "Доступность зависит от направления и дат поездки."
  ],
  "es": [
    "Un mundo de alojamientos",
    "Red mundial de hoteles y alojamientos",
    "De hoteles urbanos a resorts de playa, descubre tu próxima estancia con VoyHaven.",
    "La disponibilidad varía según el destino y las fechas del viaje."
  ],
  "ar": [
    "عالم من أماكن الإقامة",
    "شبكة عالمية من الفنادق وأماكن الإقامة",
    "من فنادق المدن إلى المنتجعات الشاطئية، اكتشف إقامتك القادمة مع VoyHaven.",
    "يختلف التوفر حسب الوجهة وتواريخ السفر."
  ],
  "pt": [
    "Um mundo de lugares para ficar",
    "Rede mundial de hotéis e acomodações",
    "De hotéis urbanos a resorts à beira-mar, descubra sua próxima estadia com a VoyHaven.",
    "A disponibilidade varia conforme o destino e as datas da viagem."
  ],
  "it": [
    "Un mondo di soggiorni",
    "Rete mondiale di hotel e strutture ricettive",
    "Dagli hotel in città ai resort sul mare, scopri il tuo prossimo soggiorno con VoyHaven.",
    "La disponibilità varia in base alla destinazione e alle date del viaggio."
  ],
  "zh": [
    "探索世界各地的住宿",
    "全球酒店及住宿网络",
    "从城市酒店到海滨度假村，与 VoyHaven 一起探索下一段住宿。",
    "供应情况因目的地和旅行日期而异。"
  ],
  "nl": [
    "Een wereld aan verblijfplaatsen",
    "Wereldwijd netwerk van hotels en accommodaties",
    "Van stadshotels tot strandresorts: ontdek je volgende verblijf met VoyHaven.",
    "Beschikbaarheid verschilt per bestemming en reisdatum."
  ],
  "nb": [
    "En verden av overnattingssteder",
    "Verdensomspennende nettverk av hoteller og overnattingssteder",
    "Fra byhoteller til strandresorter: Finn ditt neste opphold med VoyHaven.",
    "Tilgjengeligheten varierer etter reisemål og reisedatoer."
  ],
  "sv": [
    "En värld av boenden",
    "Globalt nätverk av hotell och boenden",
    "Från stadshotell till strandresorter: upptäck din nästa vistelse med VoyHaven.",
    "Tillgängligheten varierar beroende på resmål och resedatum."
  ],
  "da": [
    "En verden af overnatningssteder",
    "Globalt netværk af hoteller og overnatningssteder",
    "Fra byhoteller til strandresorts: find dit næste ophold med VoyHaven.",
    "Tilgængeligheden varierer efter rejsemål og rejsedatoer."
  ],
  "fi": [
    "Maailma täynnä majoituspaikkoja",
    "Maailmanlaajuinen hotelli- ja majoitusverkosto",
    "Kaupunkihotelleista rantalomakohteisiin – löydä seuraava majoituksesi VoyHavenin avulla.",
    "Saatavuus vaihtelee kohteen ja matkapäivien mukaan."
  ],
  "ja": [
    "世界に広がる宿泊先",
    "世界各地のホテル・宿泊施設ネットワーク",
    "シティホテルからビーチリゾートまで、VoyHavenで次の滞在先を見つけよう。",
    "空室状況は目的地と旅行日程によって異なります。"
  ],
  "ko": [
    "전 세계의 다양한 숙소",
    "전 세계 호텔 및 숙박 시설 네트워크",
    "도심 호텔부터 해변 리조트까지, VoyHaven에서 다음 숙소를 찾아보세요.",
    "예약 가능 여부는 여행지와 여행 날짜에 따라 달라집니다."
  ],
  "pl": [
    "Cały świat noclegów",
    "Światowa sieć hoteli i obiektów noclegowych",
    "Od hoteli miejskich po nadmorskie kurorty — odkryj kolejny pobyt z VoyHaven.",
    "Dostępność zależy od kierunku i dat podróży."
  ]
};

export default Object.fromEntries(Object.entries(copy).map(([language, [eyebrow, title, description, availability]]) => [language, { eyebrow, title, description, availability }]));
