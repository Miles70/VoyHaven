const keys = ['sort', 'low', 'high', 'refund', 'all', 'refundable', 'partial', 'nonRefundable', 'unknown', 'stops', 'anyStops', 'direct', 'oneStop', 'reset', 'noMatches', 'cabinHelp', 'searchCabin'];
const rows = {
 tr: 'Sırala|Fiyat: düşükten yükseğe|Fiyat: yüksekten düşüğe|İade koşulu|Tümü|İade edilebilir|Kısmen iade edilebilir|İade edilemez|Koşul belirtilmemiş|Aktarma|Tüm uçuşlar|Aktarmasız|En fazla 1 aktarma|Filtreleri temizle|Bu filtrelere uygun uçuş yok.|Konfor bir tarife adıdır; Business sınıfı anlamına gelmez. Kabin sınıfını seçip yeniden ara.|Bu sınıfta ara',
 en: 'Sort by|Price: low to high|Price: high to low|Refund policy|All|Refundable|Partially refundable|Non-refundable|Not specified|Stops|All flights|Nonstop|Up to 1 stop|Reset filters|No flights match these filters.|Comfort is a fare name, not Business class. Select a cabin and search again.|Search this cabin',
 de: 'Sortieren|Preis: aufsteigend|Preis: absteigend|Erstattung|Alle|Erstattbar|Teilweise erstattbar|Nicht erstattbar|Nicht angegeben|Zwischenstopps|Alle Flüge|Direkt|Max. 1 Stopp|Filter zurücksetzen|Keine passenden Flüge.|Comfort ist ein Tarifname, keine Business Class. Kabine wählen und erneut suchen.|Kabine suchen',
 fr: 'Trier|Prix croissant|Prix décroissant|Remboursement|Tous|Remboursable|Partiellement remboursable|Non remboursable|Non précisé|Escales|Tous les vols|Sans escale|1 escale maximum|Réinitialiser|Aucun vol ne correspond.|Comfort est un nom de tarif, pas la classe Affaires. Choisissez une cabine et relancez la recherche.|Rechercher cette cabine',
 es: 'Ordenar|Precio ascendente|Precio descendente|Reembolso|Todos|Reembolsable|Parcialmente reembolsable|No reembolsable|No especificado|Escalas|Todos los vuelos|Sin escalas|Máximo 1 escala|Restablecer filtros|No hay vuelos con estos filtros.|Comfort es una tarifa, no clase Business. Elige una cabina y busca de nuevo.|Buscar esta cabina',
 it: 'Ordina|Prezzo crescente|Prezzo decrescente|Rimborso|Tutti|Rimborsabile|Parzialmente rimborsabile|Non rimborsabile|Non specificato|Scali|Tutti i voli|Diretto|Massimo 1 scalo|Azzera filtri|Nessun volo corrisponde.|Comfort è un nome tariffario, non Business Class. Scegli una cabina e cerca di nuovo.|Cerca questa cabina',
 pt: 'Ordenar|Preço crescente|Preço decrescente|Reembolso|Todos|Reembolsável|Parcialmente reembolsável|Não reembolsável|Não informado|Escalas|Todos os voos|Direto|Até 1 escala|Limpar filtros|Nenhum voo corresponde.|Comfort é uma tarifa, não classe Executiva. Escolha a cabine e busque novamente.|Buscar esta cabine',
 ru: 'Сортировка|Цена по возрастанию|Цена по убыванию|Возврат|Все|Возвратный|Частичный возврат|Без возврата|Не указано|Пересадки|Все рейсы|Без пересадок|Не более 1 пересадки|Сбросить фильтры|Нет подходящих рейсов.|Comfort — название тарифа, а не бизнес-класс. Выберите класс и повторите поиск.|Искать этот класс',
 ar: 'الترتيب|السعر من الأقل للأعلى|السعر من الأعلى للأقل|الاسترداد|الكل|قابل للاسترداد|قابل للاسترداد جزئياً|غير قابل للاسترداد|غير محدد|التوقفات|كل الرحلات|مباشر|توقف واحد كحد أقصى|مسح المرشحات|لا توجد رحلات مطابقة.|Comfort اسم تعرفة وليس درجة أعمال. اختر المقصورة وابحث مجدداً.|ابحث بهذه المقصورة',
 zh: '排序|价格从低到高|价格从高到低|退款条件|全部|可退款|可部分退款|不可退款|未注明|中转|所有航班|直飞|最多一次中转|清除筛选|没有符合条件的航班。|Comfort是票价名称，并非商务舱。请选择舱位后重新搜索。|搜索此舱位',
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
