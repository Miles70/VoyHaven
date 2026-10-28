const keys = ['cabin', 'personal', 'checked', 'pieces', 'unspecified', 'duration', 'operated', 'seats', 'paid', 'fee'];
const rows = {
 en: 'Cabin bag|Personal item|Checked bag|pieces|Not specified|Duration|Operated by|Seats remaining in this offer|Optional paid baggage|Fee',
 tr: 'Kabin bagajı|Kişisel eşya|Uçak altı bagajı|adet|Bilgi belirtilmedi|Uçuş süresi|Uçuşu gerçekleştiren|Bu teklifte kalan koltuk|Ücretli ek bagaj seçenekleri|Ücret',
 de: 'Handgepäck|Persönlicher Gegenstand|Aufgabegepäck|Stück|Nicht angegeben|Dauer|Durchgeführt von|Verbleibende Plätze in diesem Angebot|Optionales kostenpflichtiges Gepäck|Gebühr',
 fr: 'Bagage cabine|Article personnel|Bagage en soute|pièces|Non précisé|Durée|Opéré par|Places restantes pour cette offre|Bagages supplémentaires payants|Frais',
 es: 'Equipaje de cabina|Artículo personal|Equipaje facturado|piezas|No especificado|Duración|Operado por|Asientos restantes en esta oferta|Equipaje adicional de pago|Cargo',
 it: 'Bagaglio a mano|Oggetto personale|Bagaglio da stiva|pezzi|Non specificato|Durata|Operato da|Posti rimasti per questa offerta|Bagagli extra a pagamento|Costo',
 pt: 'Bagagem de cabine|Item pessoal|Bagagem despachada|peças|Não especificado|Duração|Operado por|Lugares restantes nesta oferta|Bagagem extra paga|Taxa',
 ru: 'Ручная кладь|Личная вещь|Регистрируемый багаж|шт.|Не указано|Длительность|Выполняет|Осталось мест по этому предложению|Дополнительный платный багаж|Сбор',
 ar: 'حقيبة المقصورة|غرض شخصي|أمتعة مسجلة|قطع|غير محدد|المدة|الناقل المشغل|المقاعد المتبقية في هذا العرض|أمتعة إضافية مدفوعة|رسوم',
 zh: '随身行李|个人物品|托运行李|件|未提供|时长|承运航空公司|此报价剩余座位|付费额外行李|费用',
 nl: 'Cabinebagage|Persoonlijk item|Ruimbagage|stuks|Niet vermeld|Duur|Uitgevoerd door|Resterende stoelen voor dit aanbod|Extra betaalde bagage|Kosten',
 nb: 'Håndbagasje|Personlig gjenstand|Innsjekket bagasje|kolli|Ikke oppgitt|Varighet|Operert av|Ledige seter i dette tilbudet|Ekstra bagasje mot betaling|Gebyr',
 sv: 'Kabinbagage|Personligt föremål|Incheckat bagage|kolli|Ej angivet|Restid|Utförs av|Platser kvar i detta erbjudande|Extra bagage mot avgift|Avgift',
 da: 'Håndbagage|Personlig genstand|Indchecket bagage|stk.|Ikke oplyst|Varighed|Opereret af|Resterende pladser i dette tilbud|Ekstra bagage mod betaling|Gebyr',
 fi: 'Käsimatkatavara|Henkilökohtainen tavara|Ruumamatkatavara|kpl|Ei ilmoitettu|Kesto|Liikennöivä yhtiö|Tämän tarjouksen vapaat paikat|Maksullinen lisämatkatavara|Maksu',
 ja: '機内持込手荷物|身の回り品|預け入れ手荷物|個|記載なし|所要時間|運航会社|この運賃の残席数|有料追加手荷物|料金',
 ko: '기내 수하물|개인 소지품|위탁 수하물|개|명시되지 않음|소요 시간|운항 항공사|이 요금의 잔여 좌석|유료 추가 수하물|수수료',
 pl: 'Bagaż kabinowy|Przedmiot osobisty|Bagaż rejestrowany|szt.|Nie podano|Czas lotu|Obsługiwany przez|Pozostałe miejsca w tej ofercie|Dodatkowy płatny bagaż|Opłata',
};
export default Object.fromEntries(Object.entries(rows).map(([language, row]) => [language, Object.fromEntries(row.split('|').map((value, index) => [keys[index], value]))]));
