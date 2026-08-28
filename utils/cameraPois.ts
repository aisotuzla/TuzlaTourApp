// src/utils/cameraPois.ts
// The 3 designated camera locations for TuzlaTour (all other POIs use QRScannerModal)

export interface CameraPOI {
    id: string;
    name: {
        bs: string;
        en: string;
    };
    lat: number;
    lon: number;
    category: "culture" | "history";
    description: {
        bs: string;
        en: string;
    };
    visualCues: {
        bs: string;
        en: string;
    };
    keyFeatures: string[];
}

export const CAMERA_TARGET_POIS: CameraPOI[] = [
    {
        id: "kapija",
        name: {
            bs: "Tuzlanska Kapija",
            en: "Kapija Monument"
        },
        lat: 44.538631,
        lon: 18.676906,
        category: "history",
        description: {
            bs: "Spomenik stradanju tuzlanske mladosti 25. maja 1995. godine, sa uklesanim stihovima Maka Dizdara i imenima 71 žrtve.",
            en: "Memorial dedicated to the 71 young victims killed on May 25, 1995, featuring inscribed verses by Mak Dizdar."
        },
        visualCues: {
            bs: "Kameni okvir portala na svijetlo-zelenoj fasadi sa isklesanim natpisom 'KAPIJA' iznad vrata, centralna spomen-ploča sa stihovima Maka Dizdara i bočni stubovi sa 71 imenom.",
            en: "Stone doorway portal set in light-green facade with 'KAPIJA' carved above, central slab with Mak Dizdar's poem, and side door panels listing 71 victims."
        },
        keyFeatures: [
            "Isklesani natpis 'KAPIJA' iznad portala",
            "Stihovi Maka Dizdara: 'Ovdje se ne živi samo da bi se živjelo...'",
            "Spisak 71 žrtve na bočnim stubovima",
            "Kaldrmisana pješačka zona na ulazu u stari dio grada"
        ]
    },
    {
        id: "mesa-selimovic",
        name: {
            bs: "Spomenik Meši Selimoviću",
            en: "Mesa Selimovic Monument"
        },
        lat: 44.53710706292608,
        lon: 18.67822758905615,
        category: "culture",
        description: {
            bs: "Bronzana skulptura velikog bosanskohercegovačkog pisca Meše Selimovića u prirodnoj veličini na glavnom gradskom korzu.",
            en: "Life-size bronze statue of celebrated Bosnian author Meša Selimović standing on the main pedestrian promenade (Korzo)."
        },
        visualCues: {
            bs: "Stojeća bronzana skulptura pisca u dugom ogrtaču/mantilu na pješačkoj zoni (Korzo), bronzana podna ploča sa natpisom 'MEŠA SELIMOVIĆ 1910 - 1982'.",
            en: "Full-length bronze standing statue in a long draped coat on pedestrian stone paving (Korzo), with ground plaque 'MEŠA SELIMOVIĆ 1910 - 1982'."
        },
        keyFeatures: [
            "Bronzana uspravna figura u dugom mantilu",
            "Karakteristično zamišljeno lice sa naočalama",
            "Bronzana podna ploča: 'MEŠA SELIMOVIĆ 1910 - 1982'",
            "Pješačka zona Korzo okružena gradskim fasadama"
        ]
    },
    {
        id: "kralj-tvrtko",
        name: {
            bs: "Spomenik Kralju Tvrtku (I)",
            en: "King Tvrtko Monument"
        },
        lat: 44.53812247668793,
        lon: 18.678359094003866,
        category: "history",
        description: {
            bs: "Monumentalni bronzani spomenik prvom bosanskom kralju Tvrtku I Kotromaniću na kamenom prijestolju u Gradskom parku.",
            en: "Monumental bronze statue of the first Bosnian King Tvrtko I Kotromanić seated on a stone throne in Gradski Park."
        },
        visualCues: {
            bs: "Masivna bronzana skulptura kralja na prijestolju sa krunom i poveljom, uzdignuta na visokom granitnom postolju sa zlatnim grbom Kotromanića (ljiljanima) u Gradskom parku.",
            en: "Grand bronze statue of King Tvrtko seated on throne with crown, mounted on tall granite pedestal with gold Kotromanić lily emblem in Gradski Park."
        },
        keyFeatures: [
            "Kralj Tvrtko I sa krunom i poveljom na prijestolju",
            "Visoko tamno granitno postolje sa zlatnim grbom ljiljana",
            "Zlatni natpis: 'TVRTKO I KOTROMANIĆ'",
            "Uređeni Gradski park sa živom ogradom i parkovskim drvećem"
        ]
    }
];

export function findCameraPoi(idOrName: string): CameraPOI | undefined {
    const query = idOrName.toLowerCase().trim();
    return CAMERA_TARGET_POIS.find(
        (p) =>
            p.id.toLowerCase() === query ||
            p.name.bs.toLowerCase().includes(query) ||
            p.name.en.toLowerCase().includes(query) ||
            (query.includes("kapija") && p.id === "kapija") ||
            (query.includes("mesa") && p.id === "mesa-selimovic") ||
            (query.includes("tvrtk") && p.id === "kralj-tvrtko")
    );
}