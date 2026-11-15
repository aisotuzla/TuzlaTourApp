import { QUEST_TARGETS } from '../constants/questData';
import { LOCATIONS } from '../constants';

export const normalizeQrText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[ -_]/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();

export const findQuestTargetFromQr = (decodedText: string) => {
  if (!decodedText) return undefined;
  const raw = decodedText.trim();
  const normalized = normalizeQrText(raw);

  // Extract last path segment if raw text is a URL or file path (e.g. /QRTrgSlobode.png -> QRTrgSlobode, /quest/panonika -> panonika)
  const urlSegment = raw.includes('/') ? raw.split(/[/?#]/).filter(Boolean).pop()?.split('.')[0] : '';
  const normalizedUrlSeg = urlSegment ? normalizeQrText(urlSegment) : '';

  // Extract query parameter if raw text contains query (e.g. geo:...?q=Pannonic%20Lakes%20(Panonska%20jezera))
  let queryText = '';
  if (raw.includes('?q=') || raw.includes('&q=')) {
    try {
      const qPart = raw.split(/[?&]q=/)[1]?.split('&')[0];
      if (qPart) queryText = decodeURIComponent(qPart);
    } catch (_) {}
  }
  const normalizedQuery = queryText ? normalizeQrText(queryText) : '';

  return QUEST_TARGETS.find((target) => {
    const constLocation = LOCATIONS.find(
      (l) =>
        l.id === target.id ||
        l.qrCode === target.id ||
        normalizeQrText(l.name?.en || '') === normalizeQrText(target.name?.en || '')
    );

    const candidates = [
      target.id,
      target.name?.en,
      target.name?.bs,
      (target as any).Html5Qrcode,
      (target as any).Html5Qrcode ? (target as any).Html5Qrcode.split('/').pop()?.split('.')[0] : '',
      constLocation?.qrCode,
      constLocation?.id,
      constLocation?.name?.en,
      constLocation?.name?.bs,
    ]
      .filter(Boolean)
      .map((c) => normalizeQrText(c as string));

    return candidates.some(
      (candidate) =>
        candidate === normalized ||
        (normalizedUrlSeg && candidate === normalizedUrlSeg) ||
        (normalizedQuery && (candidate === normalizedQuery || normalizedQuery.includes(candidate))) ||
        (candidate.length >= 6 && normalized.includes(candidate))
    );
  });
};
