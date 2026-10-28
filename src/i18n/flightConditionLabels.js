const keys = ['refundPenalty', 'changePenalty', 'refundFee', 'changeFee', 'from', 'noPenalty'];
const rows = {
 en: 'Refundable with a penalty|Changes allowed with a penalty|Refund fee|Change fee|From|Without a penalty',
 tr: 'Ceza ücreti uygulanarak iade edilebilir|Ceza ücreti uygulanarak değişiklik yapılabilir|İade cezası|Değişiklik ücreti|Başlangıç tutarı|Ceza ücreti olmadan',
 de: 'Erstattung gegen Gebühr möglich|Änderungen gegen Gebühr möglich|Erstattungsgebühr|Änderungsgebühr|Ab|Ohne Gebühr',
 fr: 'Remboursable avec pénalité|Modifications autorisées avec pénalité|Frais de remboursement|Frais de modification|À partir de|Sans pénalité',
 es: 'Reembolsable con penalización|Cambios permitidos con penalización|Cargo por reembolso|Cargo por cambio|Desde|Sin penalización',
 it: 'Rimborsabile con penale|Modifiche consentite con penale|Penale di rimborso|Costo di modifica|A partire da|Senza penale',
 pt: 'Reembolsável com penalidade|Alterações permitidas com penalidade|Taxa de reembolso|Taxa de alteração|A partir de|Sem penalidade',
 ru: 'Возврат со штрафом|Изменения разрешены со штрафом|Сбор за возврат|Сбор за изменение|От|Без штрафа',
 ar: 'قابل للاسترداد مع غرامة|التغييرات مسموحة مع غرامة|رسوم الاسترداد|رسوم التغيير|ابتداءً من|بدون غرامة',
 zh: '可退款但需支付罚金|允许更改但需支付罚金|退票费|改签费|起始金额|无罚金',
 nl: 'Restitutie mogelijk tegen kosten|Wijzigingen toegestaan tegen kosten|Restitutiekosten|Wijzigingskosten|Vanaf|Zonder kosten',
 nb: 'Refunderbar mot gebyr|Endringer tillatt mot gebyr|Refusjonsgebyr|Endringsgebyr|Fra|Uten gebyr',
 sv: 'Återbetalningsbar mot avgift|Ändringar tillåtna mot avgift|Återbetalningsavgift|Ändringsavgift|Från|Utan avgift',
 da: 'Refunderbar mod gebyr|Ændringer tilladt mod gebyr|Refusionsgebyr|Ændringsgebyr|Fra|Uden gebyr',
 fi: 'Palautettavissa maksua vastaan|Muutokset sallittu maksua vastaan|Palautusmaksu|Muutosmaksu|Alkaen|Ilman maksua',
 ja: '手数料を支払って払い戻し可能|手数料を支払って変更可能|払い戻し手数料|変更手数料|最低額|手数料なし',
 ko: '위약금 부과 후 환불 가능|위약금 부과 후 변경 가능|환불 수수료|변경 수수료|최소 금액|위약금 없음',
 pl: 'Zwrot możliwy za opłatą|Zmiany dozwolone za opłatą|Opłata za zwrot|Opłata za zmianę|Od|Bez opłaty',
};
export default Object.fromEntries(Object.entries(rows).map(([language, row]) => [language, Object.fromEntries(row.split('|').map((value, index) => [keys[index], value]))]));
