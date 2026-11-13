// src/utils/questPopupHtml.ts
import { Language } from '../types';
import { POI_COLORS } from '../constants/questData';

const CATEGORY_TAGS: Record<string, Record<string, string>> = {
  culture: { bs: '🏛️ Kultura', en: '🏛️ Culture', de: '🏛️ Kultur', tr: '🏛️ Kültür' },
  history: { bs: '🏰 Historija', en: '🏰 History', de: '🏰 Geschichte', tr: '🏰 Tarih' },
  nature: { bs: '🌲 Priroda & Jezera', en: '🌲 Nature & Lakes', de: '🌲 Natur & Seen', tr: '🌲 Doğa ve Göller' },
  food: { bs: '🥞 Slatki Kutak & Gastronomija', en: '🥞 Dessert & Food Spot', de: '🥞 Dessert-Lokal', tr: '🥞 Tatlı & Yemek' },
  shopping: { bs: '🛍️ Shopping & Zabava', en: '🛍️ Shopping & Fun', de: '🛍️ Einkaufen & Spaß', tr: '🛍️ Alışveriş & Eğlence' },
  art: { bs: '🎨 Umjetnost & Galerija', en: '🎨 Fine Art Gallery', de: '🎨 Kunstgalerie', tr: '🎨 Sanat Galerisi' },
};

export const generateQuestPopupHtml = (
  loc: any,
  lang: Language,
  isUnlocked: boolean = false,
  _isQuest: boolean = true
) => {
  const markerColor = POI_COLORS[loc.id as keyof typeof POI_COLORS] || '#3b82f6';
  const previewImg = loc.Image || loc.image;
  const title = loc.name?.[lang] || loc.name?.en || loc.name?.bs || 'Tuzla POI';
  const desc = loc.description?.[lang] || loc.description?.en || loc.description?.bs || '';
  const escapedTitle = title.replace(/'/g, "\\'");
  const coords = loc.coordinates || [44.5388, 18.6750];
  const catKey = loc.category || 'culture';
  const categoryLabel = (CATEGORY_TAGS[catKey] && CATEGORY_TAGS[catKey][lang]) || (lang === 'bs' ? '📍 Znamenitost' : '📍 Landmark');
  const hasAudio = Boolean(loc.audio && String(loc.audio).trim().length > 0) || Boolean(loc.audioByLang);
  // Resolve audio path: prefer audioByLang for current language, fallback chain: lang → en → bs → audio
  const resolvedAudio: string = (loc.audioByLang?.[lang as 'bs'|'en'|'de']
    || loc.audioByLang?.en
    || loc.audioByLang?.bs
    || loc.audio
    || '') as string;
  const hasVideo = Boolean(loc.video);
  const hasPanorama = Boolean(loc.panorama);

  return `
    <div style="padding: 14px 14px 16px; font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, sans-serif; background: #0f172a; color: #ffffff; border-radius: 20px; border: 1.5px solid ${markerColor}66; box-shadow: 0 20px 40px rgba(0,0,0,0.6); width: 270px; max-width: 90vw; box-sizing: border-box;">
      ${previewImg ? `
        <div style="position: relative; width: 100%; height: 120px; margin-bottom: 10px; border-radius: 14px; overflow: hidden; background: #1e293b;">
          <img src="${previewImg}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.style.display='none'" />
          <div style="position: absolute; top: 8px; left: 8px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; color: #f8fafc; border: 1px solid rgba(255,255,255,0.15);">
            ${categoryLabel}
          </div>
          ${isUnlocked ? `
            <div style="position: absolute; top: 8px; right: 8px; background: #10b981; color: #022c22; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase;">
              ✓ ${lang === 'bs' ? 'Otkriveno' : 'Unlocked'}
            </div>
          ` : ''}
        </div>
      ` : ''}

      <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 900; color: ${markerColor}; line-height: 1.25; letter-spacing: -0.01em;">
          ${title}
        </h3>
      </div>

      <p style="font-size: 12px; margin: 8px 0 12px; color: #cbd5e1; line-height: 1.45; font-weight: 500;">
        ${desc}
      </p>

      <!-- Action Buttons Grid -->
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <!-- Top Row: AR Guide & Audio Guide -->
        <div style="display: flex; gap: 6px; width: 100%;">
          <button onclick="window.startArTrailFromPopup && window.startArTrailFromPopup('${loc.id}', '${escapedTitle}', ${coords[0]}, ${coords[1]})" style="flex: 1; padding: 10px 8px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #0f172a; border: none; border-radius: 12px; font-weight: 900; font-family: 'Quicksand', sans-serif; cursor: pointer; text-transform: uppercase; font-size: 11px; letter-spacing: 0.03em; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 4px 12px rgba(245,158,11,0.35);">
            🧭 ${lang === 'bs' ? 'AR Vodič' : 'AR Guide'}
          </button>
          
          ${hasAudio ? `
            <button onclick="window.playPoiAudio && window.playPoiAudio('${loc.id}', '${escapedTitle}', '${resolvedAudio}')" style="flex: 1; padding: 10px 8px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; border: none; border-radius: 12px; font-weight: 900; font-family: 'Quicksand', sans-serif; cursor: pointer; text-transform: uppercase; font-size: 11px; letter-spacing: 0.03em; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 4px 12px rgba(37,99,235,0.35);">
              🎧 Audio
            </button>
          ` : ''}
        </div>

        <!-- Second Row: GPS Navigation -->
        <button onclick="window.startNavigationFromPopup && window.startNavigationFromPopup('${escapedTitle}', ${coords[0]}, ${coords[1]})" style="width: 100%; padding: 9px 8px; background: #1e293b; color: #f1f5f9; border: 1px solid #334155; border-radius: 12px; font-weight: 800; font-family: 'Quicksand', sans-serif; cursor: pointer; text-transform: uppercase; font-size: 11px; letter-spacing: 0.03em; display: flex; align-items: center; justify-content: center; gap: 5px;">
          🚗 ${lang === 'bs' ? 'Navigacija' : 'Navigate'}
        </button>

        <!-- Optional: Video Button -->
        ${hasVideo ? `
          <button onclick="window.playQuestVideo && window.playQuestVideo('${loc.video}', '${escapedTitle}')" style="width: 100%; padding: 8px; background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 10px; font-weight: 800; font-family: 'Quicksand', sans-serif; cursor: pointer; text-transform: uppercase; font-size: 10px; display: flex; align-items: center; justify-content: center; gap: 4px;">
            🎬 ${lang === 'bs' ? 'Pogledaj Video' : 'Watch Video'}
          </button>
        ` : ''}

        <!-- Optional: 360 Panorama Button -->
        ${hasPanorama ? `
          <button onclick="window.openQuestPanorama && window.openQuestPanorama('${loc.panorama}', '${escapedTitle}', ${loc.panoramaHaov || 270})" style="width: 100%; padding: 8px; background: rgba(14, 165, 233, 0.2); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.4); border-radius: 10px; font-weight: 800; font-family: 'Quicksand', sans-serif; cursor: pointer; text-transform: uppercase; font-size: 10px; display: flex; align-items: center; justify-content: center; gap: 4px;">
            🔄 ${lang === 'bs' ? '360° Panorama' : '360° Panorama'}
          </button>
        ` : ''}
      </div>
    </div>
  `;
};

export const generateHotelPopupHtml = (hotel: any, lang: Language, hotelId: string) => {
  return `
    <div style="padding: 16px; font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, sans-serif; background: #0f172a; color: white; border-radius: 20px; border: 1.5px solid #3b82f644; box-shadow: 0 20px 40px rgba(0,0,0,0.6); width: 260px; box-sizing: border-box;">
      <h3 style="margin: 0; font-size: 16px; font-weight: 900; color: #60a5fa;">${hotel.name}</h3>
      <p style="font-size: 12px; margin: 8px 0; color: #94a3b8; line-height: 1.45;">${hotel.description?.[lang] || hotel.description?.bs || hotel.description?.en || ''}</p>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
         <span style="font-size: 11px; color: #fbbf24; font-weight: 900; background: rgba(251,191,36,0.15); padding: 3px 8px; border-radius: 8px;">⭐ ${hotel.rating}</span>
         <span style="font-size: 10px; color: #60a5fa; font-weight: bold; text-transform: uppercase; background: rgba(59,130,246,0.1); padding: 3px 8px; border-radius: 8px;">🏨 Hotel</span>
      </div>
      <button onclick="window.setGlobalMapNavTarget ? window.setGlobalMapNavTarget('${hotelId}') : (window.startNavigationFromPopup && window.startNavigationFromPopup('${hotel.name.replace(/'/g, "\\'")}', ${hotel.latitude}, ${hotel.longitude}))" style="width: 100%; padding: 10px; background: #2563eb; color: white; border: none; border-radius: 12px; font-weight: 900; font-family: 'Quicksand', sans-serif; cursor: pointer; text-transform: uppercase; font-size: 11px;">
        ${lang === 'bs' ? 'Započni GPS Navigaciju' : 'Start GPS Navigation'}
      </button>
    </div>
  `;
};
