export const cleanHotelText = (value, limit = 5000) => typeof value === "string" ? value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, limit) : "";

export function normalizeHotelReviews(payload) {
  const rows = Array.isArray(payload?.data) ? payload.data : payload?.data?.reviews || payload?.reviews || [];
  return rows.filter((row) => row && typeof row === "object").map((row) => {
    const score = row.averageScore == null ? null : Number(row.averageScore);
    const rawDate = /^\d{4}-\d{2}-\d{2}/.test(String(row.date || "")) ? String(row.date).slice(0, 10) : "";
    const parsedDate = rawDate ? new Date(`${rawDate}T00:00:00Z`) : null;
    const date = parsedDate && Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === rawDate ? rawDate : "";
    return { name: cleanHotelText(row.name, 100), headline: cleanHotelText(row.headline, 500), pros: cleanHotelText(row.pros), cons: cleanHotelText(row.cons), date, score: Number.isFinite(score) && score >= 0 && score <= 10 ? score : null, language: cleanHotelText(row.language, 5) };
  }).filter((row) => row.headline || row.pros || row.cons);
}

export function mappedHotelRoom(rate, rooms) {
  const id = rate?.mappedRoomId;
  if (id === undefined || id === null || String(id).trim() === "" || !Array.isArray(rooms)) return null;
  return rooms.find((room) => room?.id !== undefined && String(room.id) === String(id)) || null;
}
