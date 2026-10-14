const keys = ['sort', 'low', 'high', 'refund', 'all', 'refundable', 'partial', 'nonRefundable', 'unknown', 'stops', 'anyStops', 'direct', 'oneStop', 'reset', 'noMatches', 'cabinHelp', 'searchCabin'];
const rows = {
 tr: 'Sırala|Fiyat: düşükten yükseğe|Fiyat: yüksekten düşüğe|İade koşulu|Tümü|İade edilebilir|Kısmen iade edilebilir|İade edilemez|Koşul belirtilmemiş|Aktarma|Tüm uçuşlar|Aktarmasız|En fazla 1 aktarma|Filtreleri temizle|Bu filtrelere uygun uçuş yok.|Daha konforlu bir yolculuk mu istiyorsun? Premium Ekonomi, Business veya First Class seçeneklerine göz atabilirsin. Biletteki “Konfor” adı ise kabin sınıfını değil, bilet paketini anlatır.|Bu sınıfta ara',
 en: 'Sort by|Price: low to high|Price: high to low|Refund policy|All|Refundable|Partially refundable|Non-refundable|Not specified|Stops|All flights|Nonstop|Up to 1 stop|Reset filters|No flights match these filters.|Looking for a little more comfort? Explore Premium Economy, Business or First Class. “Comfort” on a ticket refers to the fare package rather than the cabin.|Search this cabin',
 de: 'Sortieren|Preis: aufsteigend|Preis: absteigend|Erstattung|Alle|Erstattbar|Teilweise erstattbar|Nicht erstattbar|Nicht angegeben|Zwischenstopps|Alle Flüge|Direkt|Max. 1 Stopp|Filter zurücksetzen|Keine passenden Flüge.|Du möchtest komfortabler reisen? Entdecke Premium Economy, Business oder First Class. „Comfort“ auf dem Ticket bezeichnet das Tarifpaket, nicht die Kabine.|Kabine suchen',
 fr: 'Trier|Prix croissant|Prix décroissant|Remboursement|Tous|Remboursable|Partiellement remboursable|Non remboursable|Non précisé|Escales|Tous les vols|Sans escale|1 escale maximum|Réinitialiser|Aucun vol ne correspond.|Envie de voyager plus confortablement ? Découvrez les cabines Premium Economy, Affaires ou Première. « Comfort » désigne le forfait du billet, pas la cabine.|Rechercher cette cabine',
 es: 'Ordenar|Precio ascendente|Precio descendente|Reembolso|Todos|Reembolsable|Parcialmente reembolsable|No reembolsable|No especificado|Escalas|Todos los vuelos|Sin escalas|Máximo 1 escala|Restablecer filtros|No hay vuelos con estos filtros.|¿Buscas viajar con más comodidad? Explora Premium Economy, Business o Primera Clase. «Comfort» se refiere al paquete del billete, no a la cabina.|Buscar esta cabina',
 it: 'Ordina|Prezzo crescente|Prezzo decrescente|Rimborso|Tutti|Rimborsabile|Parzialmente rimborsabile|Non rimborsabile|Non specificato|Scali|Tutti i voli|Diretto|Massimo 1 scalo|Azzera filtri|Nessun volo corrisponde.|Vuoi viaggiare più comodamente? Scopri Premium Economy, Business o Prima Classe. «Comfort» indica il pacchetto del biglietto, non la cabina.|Cerca questa cabina',
 pt: 'Ordenar|Preço crescente|Preço decrescente|Reembolso|Todos|Reembolsável|Parcialmente reembolsável|Não reembolsável|Não informado|Escalas|Todos os voos|Direto|Até 1 escala|Limpar filtros|Nenhum voo corresponde.|Quer viajar com mais conforto? Explore Premium Economy, Executiva ou Primeira Classe. “Comfort” indica o pacote da passagem, não a cabine.|Buscar esta cabine',
 ru: 'Сортировка|Цена по возрастанию|Цена по убыванию|Возврат|Все|Возвратный|Частичный возврат|Без возврата|Не указано|Пересадки|Все рейсы|Без пересадок|Не более 1 пересадки|Сбросить фильтры|Нет подходящих рейсов.|Хочешь путешествовать комфортнее? Посмотри варианты премиум-эконом, бизнес или первого класса. Comfort в билете — название тарифного пакета, а не класса салона.|Искать этот класс',
 ar: 'الترتيب|السعر من الأقل للأعلى|السعر من الأعلى للأقل|الاسترداد|الكل|قابل للاسترداد|قابل للاسترداد جزئياً|غير قابل للاسترداد|غير محدد|التوقفات|كل الرحلات|مباشر|توقف واحد كحد أقصى|مسح المرشحات|لا توجد رحلات مطابقة.|هل ترغب في رحلة أكثر راحة؟ اكتشف الاقتصادية الممتازة أو درجة الأعمال أو الدرجة الأولى. يشير Comfort في التذكرة إلى باقة السعر، وليس درجة المقصورة.|ابحث بهذه المقصورة',
 zh: '排序|价格从低到高|价格从高到低|退款条件|全部|可退款|可部分退款|不可退款|未注明|中转|所有航班|直飞|最多一次中转|清除筛选|没有符合条件的航班。|想让旅途更舒适？看看高端经济舱、商务舱或头等舱。机票上的Comfort指票价套餐，而不是舱位。|搜索此舱位',
};
export default Object.fromEntries(Object.entries(rows).map(([lang, row]) => [lang, Object.fromEntries(keys.map((key, i) => [key, row.split('|')[i]]))]));

export const cabinOfferMessages = {
 tr: ['Bu uçuşta seçilen kabin için teklif bulunamadı.', 'Kabin fiyatı kontrol ediliyor…'],
 en: ['No offer in this cabin for this flight.', 'Checking cabin price…'],
 de: ['Kein Angebot in dieser Kabine für diesen Flug.', 'Kabinenpreis wird geprüft…'],
 fr: ['Aucune offre dans cette cabine pour ce vol.', 'Vérification du prix…'],
 es: ['No hay oferta en esta cabina para este vuelo.', 'Comprobando precio…'],
 it: ['Nessuna offerta in questa cabina per questo volo.', 'Verifica del prezzo…'],
 pt: ['Nenhuma oferta nesta cabine para este voo.', 'Verificando preço…'],
 ru: ['Нет предложения в этом классе на этот рейс.', 'Проверяем цену…'],
 ar: ['لا يوجد عرض بهذه المقصورة لهذه الرحلة.', 'جارٍ التحقق من السعر…'],
 zh: ['此航班没有所选舱位的报价。', '正在查询舱位价格…'],
};
export const cabinAlternativeMessages = {
 tr: ['Bu rota ve tarihlerde seçilen kabin için teklif bulunamadı.', 'Bu uçuşta seçtiğin sınıf müsait değil. Senin için aynı tarihlerdeki diğer seçenekleri bulduk.'],
 en: ['No offers in this cabin for this route and dates.', 'Your chosen cabin isn’t available on this flight. We found other options for you on the same dates.'],
 de: ['Keine Angebote in dieser Kabine für diese Strecke und Daten.', 'Deine gewünschte Kabine ist auf diesem Flug nicht verfügbar. Wir haben andere Optionen für dieselben Reisedaten gefunden.'],
 fr: ['Aucune offre dans cette cabine pour ce trajet et ces dates.', 'La cabine choisie n’est pas disponible sur ce vol. Nous avons trouvé d’autres options aux mêmes dates.'],
 es: ['No hay ofertas en esta cabina para esta ruta y fechas.', 'La cabina que elegiste no está disponible en este vuelo. Encontramos otras opciones para las mismas fechas.'],
 it: ['Nessuna offerta in questa cabina per questa tratta e queste date.', 'La cabina scelta non è disponibile su questo volo. Abbiamo trovato altre opzioni per le stesse date.'],
 pt: ['Nenhuma oferta nesta cabine para esta rota e datas.', 'A cabine que você escolheu não está disponível neste voo. Encontramos outras opções para as mesmas datas.'],
 ru: ['Нет предложений в этом классе на этот маршрут и даты.', 'На этом рейсе выбранный класс недоступен. Мы нашли другие варианты на те же даты.'],
 ar: ['لا توجد عروض بهذه المقصورة لهذا المسار والتواريخ.', 'المقصورة التي اخترتها غير متاحة على هذه الرحلة. وجدنا لك خيارات أخرى في التواريخ نفسها.'],
 zh: ['此航线和日期没有所选舱位的报价。', '这趟航班没有你选择的舱位。我们为你找到了相同日期的其他选择。'],
};
export const nearbyCabinMessages = {
 tr: ['Yakın tarihlerdeki seçeneklere bakıyoruz…', 'Seçtiğin tarihlerde bu sınıfta bilet bulamadık. Yakın tarihlerde bulduğumuz seçenekler aşağıda; rezervasyondan önce yeni tarihleri kontrol et.', 'Seçtiğin tarihlerde ve kontrol ettiğimiz yakın tarihlerde bu sınıfta bilet bulamadık. Farklı bir rota veya tarih deneyebilirsin.'],
 en: ['Looking at nearby dates…', 'We couldn’t find this cabin on your dates. Here are options on nearby dates; check the new dates before booking.', 'We couldn’t find this cabin on your dates or the nearby dates we checked. Try another route or date.'],
 de: ['Wir prüfen nahegelegene Termine…', 'Für deine Termine haben wir diese Kabine nicht gefunden. Hier sind Angebote für nahegelegene Termine. Prüfe die neuen Daten vor der Buchung.', 'Für deine Termine und die geprüften Alternativtermine haben wir diese Kabine nicht gefunden. Versuche eine andere Strecke oder ein anderes Datum.'],
 fr: ['Nous regardons les dates proches…', 'Cette cabine est indisponible à vos dates. Voici des options à des dates proches ; vérifiez les nouvelles dates avant de réserver.', 'Aucune offre dans cette cabine à vos dates ni aux dates proches vérifiées. Essayez un autre trajet ou une autre date.'],
 es: ['Buscando fechas cercanas…', 'No encontramos esta cabina para tus fechas. Aquí tienes opciones en fechas cercanas; comprueba las nuevas fechas antes de reservar.', 'No encontramos esta cabina para tus fechas ni las fechas cercanas consultadas. Prueba otra ruta o fecha.'],
 it: ['Cerchiamo nelle date vicine…', 'Non abbiamo trovato questa cabina nelle tue date. Ecco opzioni in date vicine: controlla le nuove date prima di prenotare.', 'Nessuna offerta in questa cabina nelle tue date o nelle date vicine controllate. Prova un’altra tratta o data.'],
 pt: ['Buscando em datas próximas…', 'Não encontramos esta cabine nas suas datas. Veja opções em datas próximas e confira as novas datas antes de reservar.', 'Não encontramos esta cabine nas suas datas nem nas datas próximas consultadas. Tente outra rota ou data.'],
 ru: ['Проверяем ближайшие даты…', 'На ваши даты этот класс не найден. Ниже варианты на ближайшие даты; проверьте новые даты перед бронированием.', 'На ваши даты и проверенные ближайшие даты этот класс не найден. Попробуйте другой маршрут или дату.'],
 ar: ['نبحث في التواريخ القريبة…', 'لم نجد هذه المقصورة في تواريخك. إليك خيارات في تواريخ قريبة؛ تحقق من التواريخ الجديدة قبل الحجز.', 'لم نجد هذه المقصورة في تواريخك أو التواريخ القريبة التي فحصناها. جرّب مساراً أو تاريخاً آخر.'],
 zh: ['正在查询邻近日期…', '所选日期没有该舱位。下方为邻近日期的选择，请在预订前确认新日期。', '所选日期及已查询的邻近日期均未找到该舱位，请尝试其他航线或日期。'],
};

export const flexibleDateLabels = {
 tr: ['Esnek tarih aralığı', '30 gün', '90 gün', '180 gün', '11 aya kadar', 'Kontrol edilen tarihler'],
 en: ['Flexible date range', '30 days', '90 days', '180 days', 'Up to 11 months', 'Checking dates'],
 de: ['Flexibler Zeitraum', '30 Tage', '90 Tage', '180 Tage', 'Bis zu 11 Monate', 'Geprüfte Termine'],
 fr: ['Dates flexibles', '30 jours', '90 jours', '180 jours', 'Jusqu’à 11 mois', 'Dates en cours'],
 es: ['Fechas flexibles', '30 días', '90 días', '180 días', 'Hasta 11 meses', 'Fechas consultadas'],
 it: ['Date flessibili', '30 giorni', '90 giorni', '180 giorni', 'Fino a 11 mesi', 'Date in verifica'],
 pt: ['Datas flexíveis', '30 dias', '90 dias', '180 dias', 'Até 11 meses', 'Datas em consulta'],
 ru: ['Гибкие даты', '30 дней', '90 дней', '180 дней', 'До 11 месяцев', 'Проверяем даты'],
 ar: ['نطاق التواريخ المرن', '30 يوماً', '90 يوماً', '180 يوماً', 'حتى 11 شهراً', 'التواريخ الجاري فحصها'],
 zh: ['灵活日期范围', '30天', '90天', '180天', '最多11个月', '正在查询的日期'],
};
