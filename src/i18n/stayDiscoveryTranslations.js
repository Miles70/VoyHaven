const copy = {
  "en": [
    "What kind of stay are you looking for?",
    "Explore hotels, apartments, hostels and more. Choose your destination and dates to see current prices.",
    "No accommodation is available in this city for your selected dates and accommodation type."
  ],
  "tr": [
    "Nasıl bir yerde kalmak istersin?",
    "Otel, apart otel, daire, hostel ve daha fazlasını keşfet. Güncel fiyatlar için destinasyonunu ve tarihlerini seç.",
    "Seçtiğin şehirde, bu tarihler ve konaklama türü için müsait yer bulunamadı."
  ],
  "de": [
    "Wie möchtest du übernachten?",
    "Entdecke Hotels, Apartments, Hostels und mehr. Wähle Reiseziel und Reisedaten für aktuelle Preise.",
    "In dieser Stadt sind für die gewählten Daten und die gewählte Unterkunftsart keine Unterkünfte verfügbar."
  ],
  "fr": [
    "Quel type d’hébergement recherchez-vous ?",
    "Découvrez hôtels, appartements, auberges de jeunesse et plus. Choisissez votre destination et vos dates pour voir les prix actuels.",
    "Aucun hébergement n’est disponible dans cette ville pour les dates et le type d’hébergement choisis."
  ],
  "ru": [
    "Где хочешь остановиться?",
    "Отели, апартаменты, хостелы и другие варианты. Выбери направление и даты, чтобы увидеть актуальные цены.",
    "В этом городе нет доступных вариантов выбранного типа на указанные даты."
  ],
  "es": [
    "¿En qué tipo de alojamiento quieres quedarte?",
    "Descubre hoteles, apartamentos, hostales y más. Elige destino y fechas para ver los precios actuales.",
    "No hay alojamientos disponibles en esta ciudad para las fechas y el tipo de alojamiento elegidos."
  ],
  "ar": [
    "ما نوع الإقامة التي تبحث عنها؟",
    "اكتشف الفنادق والشقق وبيوت الشباب والمزيد. اختر وجهتك وتواريخك للاطلاع على الأسعار الحالية.",
    "لا توجد أماكن إقامة متاحة في هذه المدينة للتواريخ ونوع الإقامة المحددين."
  ],
  "pt": [
    "Que tipo de hospedagem você procura?",
    "Explore hotéis, apartamentos, hostels e muito mais. Escolha o destino e as datas para ver os preços atuais.",
    "Não há acomodações disponíveis nesta cidade para as datas e o tipo de hospedagem selecionados."
  ],
  "it": [
    "Che tipo di soggiorno cerchi?",
    "Scopri hotel, appartamenti, ostelli e altro. Scegli destinazione e date per vedere i prezzi aggiornati.",
    "Non ci sono strutture disponibili in questa città per le date e il tipo di alloggio selezionati."
  ],
  "zh": [
    "你想住在哪里？",
    "探索酒店、公寓、青年旅舍等住宿。选择目的地和日期，查看实时价格。",
    "该城市在所选日期没有符合所选住宿类型的可预订住宿。"
  ],
  "nl": [
    "Wat voor verblijf zoek je?",
    "Ontdek hotels, appartementen, hostels en meer. Kies je bestemming en datums om actuele prijzen te bekijken.",
    "Er zijn in deze stad geen accommodaties beschikbaar voor de gekozen datums en het gekozen accommodatietype."
  ],
  "nb": [
    "Hva slags overnatting ser du etter?",
    "Utforsk hoteller, leiligheter, vandrerhjem og mer. Velg reisemål og datoer for å se gjeldende priser.",
    "Ingen overnattingssteder er tilgjengelige i denne byen for valgte datoer og overnattingstype."
  ],
  "sv": [
    "Vilken typ av boende söker du?",
    "Upptäck hotell, lägenheter, vandrarhem och mer. Välj resmål och datum för att se aktuella priser.",
    "Det finns inga tillgängliga boenden i den här staden för valda datum och boendetyp."
  ],
  "da": [
    "Hvilken type overnatning leder du efter?",
    "Udforsk hoteller, lejligheder, vandrerhjem og mere. Vælg rejsemål og datoer for at se aktuelle priser.",
    "Der er ingen ledige overnatningssteder i denne by for de valgte datoer og den valgte overnatningstype."
  ],
  "fi": [
    "Millaista majoitusta etsit?",
    "Tutustu hotelleihin, huoneistoihin, hostelleihin ja muihin majoituksiin. Valitse kohde ja päivät nähdäksesi ajantasaiset hinnat.",
    "Tässä kaupungissa ei ole saatavilla valitun tyyppistä majoitusta valittuina päivinä."
  ],
  "ja": [
    "どんな宿泊先をお探しですか？",
    "ホテル、アパートメント、ホステルなどを探そう。目的地と日程を選んで最新の料金を確認できます。",
    "この都市では、選択した日程と宿泊施設の種類で予約可能な宿泊先が見つかりませんでした。"
  ],
  "ko": [
    "어떤 숙소를 찾고 있나요?",
    "호텔, 아파트, 호스텔 등 다양한 숙소를 둘러보세요. 여행지와 날짜를 선택하면 최신 요금을 확인할 수 있어요.",
    "선택한 날짜와 숙소 유형에 맞는 예약 가능한 숙소가 이 도시에 없습니다."
  ],
  "pl": [
    "Jakiego noclegu szukasz?",
    "Odkryj hotele, apartamenty, hostele i inne obiekty. Wybierz kierunek i daty, aby zobaczyć aktualne ceny.",
    "W tym mieście nie ma dostępnych obiektów wybranego typu w podanych terminach."
  ]
};
export default Object.fromEntries(Object.entries(copy).map(([language, [title, description, empty]]) => [language, { title, description, empty }]));
