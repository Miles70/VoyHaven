const keys = ['details', 'connections', 'baggageDetails'];
const rows = {
  en: ['Flight details', 'Via', 'Baggage details'],
  tr: ['Uçuş detayları', 'Aktarma', 'Bagaj detayları'],
  de: ['Flugdetails', 'Über', 'Gepäckdetails'],
  fr: ['Détails du vol', 'Via', 'Détails des bagages'],
  es: ['Detalles del vuelo', 'Vía', 'Detalles del equipaje'],
  it: ['Dettagli del volo', 'Via', 'Dettagli del bagaglio'],
  pt: ['Detalhes do voo', 'Via', 'Detalhes da bagagem'],
  ru: ['Детали рейса', 'Через', 'Информация о багаже'],
  ar: ['تفاصيل الرحلة', 'عبر', 'تفاصيل الأمتعة'],
  zh: ['航班详情', '经停', '行李详情'],
};
export default Object.fromEntries(Object.entries(rows).map(([language, values]) => [language, Object.fromEntries(keys.map((key, index) => [key, values[index]]))]));
