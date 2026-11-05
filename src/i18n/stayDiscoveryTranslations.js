const copy = {
  "en": [
    "What kind of stay are you looking for?",
    "Explore hotels, apartments, hostels and more. Choose your destination and dates to see current prices."
  ],
  "tr": [
    "Nasıl bir yerde kalmak istersin?",
    "Otel, apart otel, daire, hostel ve daha fazlasını keşfet. Güncel fiyatlar için destinasyonunu ve tarihlerini seç."
  ],
  "de": [
    "Wie möchtest du übernachten?",
    "Entdecke Hotels, Apartments, Hostels und mehr. Wähle Reiseziel und Reisedaten für aktuelle Preise."
  ],
  "fr": [
    "Quel type d’hébergement recherchez-vous ?",
    "Découvrez hôtels, appartements, auberges de jeunesse et plus. Choisissez votre destination et vos dates pour voir les prix actuels."
  ],
  "ru": [
    "Где хочешь остановиться?",
    "Отели, апартаменты, хостелы и другие варианты. Выбери направление и даты, чтобы увидеть актуальные цены."
  ],
  "es": [
    "¿En qué tipo de alojamiento quieres quedarte?",
    "Descubre hoteles, apartamentos, hostales y más. Elige destino y fechas para ver los precios actuales."
  ],
  "ar": [
    "ما نوع الإقامة التي تبحث عنها؟",
    "اكتشف الفنادق والشقق وبيوت الشباب والمزيد. اختر وجهتك وتواريخك للاطلاع على الأسعار الحالية."
  ],
  "pt": [
    "Que tipo de hospedagem você procura?",
    "Explore hotéis, apartamentos, hostels e muito mais. Escolha o destino e as datas para ver os preços atuais."
  ],
  "it": [
    "Che tipo di soggiorno cerchi?",
    "Scopri hotel, appartamenti, ostelli e altro. Scegli destinazione e date per vedere i prezzi aggiornati."
  ],
  "zh": [
    "你想住在哪里？",
    "探索酒店、公寓、青年旅舍等住宿。选择目的地和日期，查看实时价格。"
  ],
  "nl": [
    "Wat voor verblijf zoek je?",
    "Ontdek hotels, appartementen, hostels en meer. Kies je bestemming en datums om actuele prijzen te bekijken."
  ],
  "nb": [
    "Hva slags overnatting ser du etter?",
    "Utforsk hoteller, leiligheter, vandrerhjem og mer. Velg reisemål og datoer for å se gjeldende priser."
  ],
  "sv": [
    "Vilken typ av boende söker du?",
    "Upptäck hotell, lägenheter, vandrarhem och mer. Välj resmål och datum för att se aktuella priser."
  ],
  "da": [
    "Hvilken type overnatning leder du efter?",
    "Udforsk hoteller, lejligheder, vandrerhjem og mere. Vælg rejsemål og datoer for at se aktuelle priser."
  ],
  "fi": [
    "Millaista majoitusta etsit?",
    "Tutustu hotelleihin, huoneistoihin, hostelleihin ja muihin majoituksiin. Valitse kohde ja päivät nähdäksesi ajantasaiset hinnat."
  ],
  "ja": [
    "どんな宿泊先をお探しですか？",
    "ホテル、アパートメント、ホステルなどを探そう。目的地と日程を選んで最新の料金を確認できます。"
  ],
  "ko": [
    "어떤 숙소를 찾고 있나요?",
    "호텔, 아파트, 호스텔 등 다양한 숙소를 둘러보세요. 여행지와 날짜를 선택하면 최신 요금을 확인할 수 있어요."
  ],
  "pl": [
    "Jakiego noclegu szukasz?",
    "Odkryj hotele, apartamenty, hostele i inne obiekty. Wybierz kierunek i daty, aby zobaczyć aktualne ceny."
  ]
};
export default Object.fromEntries(Object.entries(copy).map(([language, [title, description]]) => [language, { title, description }]));
