import { Language } from '../types';

export interface PannonicaNarration {
  title: Record<Language, string>;
  text: Record<Language, string>;
}

export const PANNONICA_NARRATION: PannonicaNarration = {
  title: {
    bs: 'Panonska jezera u Tuzli',
    en: 'Pannonian Lakes Tuzla',
    de: 'Die Pannonischen Seen von Tuzla',
    tr: 'Tuzla Pannonia Gölleri'
  },
  text: {
    bs: 'Tuzla, turistički dragulj, grad u centralnom dijelu Balkana sa mirisom mora u kojoj je voda slanija od Jadrana, a atmosfera mediteranska. Kombinacija prirodnih zdravstvenih prednosti, opuštanja i zabave. Prije mnogo miliona godina, Panonsko more se povuklo ostavljajući ogromne naslage soli ispod Tuzle. Godine 2003. grad je pretvorio centralni dio grada u jedina umjetna slana jezera u Evropi. Danas Panonska jezera čine rekreativni kompleks s tri slana jezera, slanim vodopadima, neolitskom sojeničkom postavkom i geološkim muzejom. To je ljekovita kombinacija kristalno čiste vode i visoke koncentracije slane otopine koja se crpi s dubine od 300 metara sa salinitetom od 30 do 35 grama po litru.',
    en: 'Tuzla has brought the sea to the city! Imagine an urban oasis where the water is saltier than the Adriatic and the vibes are purely Mediterranean, combining natural health benefits with relaxation and entertainment. Millions of years ago, the Pannonian Sea retreated, leaving massive salt deposits under Tuzla. In 2003, the city transformed this central area into Europe’s only artificial salt lakes. Today, Pannonica is a recreational complex with three salt lakes, salty waterfalls, a Neolithic settlement, and a geological museum with a therapeutic salinity of 30 to 35 grams per liter.',
    de: 'Tuzla hat das Meer in die Stadt geholt! Stellen Sie sich eine urbane Oase vor, in der das Wasser salziger ist als das der Adria und die Atmosphäre ausgesprochen mediterran ist. Vor Millionen von Jahren zog sich das Pannonische Meer zurück und hinterließ riesige Salzvorkommen unter Tuzla. Im Jahr 2003 verwandelte die Stadt das absinkende Gelände im Stadtzentrum in einen Weltklasse-Komplex aus Salzseen. Heute bilden die Pannonischen Seen einen Erholungskomplex mit drei Salzseen, Salzwasserfällen, neolithischer Siedlung und geologischem Museum.',
    tr: 'Tuzla, denizi şehre getirdi! Suyun Adriyatik\'ten daha tuzlu olduğu, Akdeniz havasının estiği, doğal sağlık faydalarının eğlence ve dinlenme ile buluştuğu bir şehir vahası hayal edin. Milyonlarca yıl önce Pannonia Denizi çekilince, Tuzla\'nın altında devasa tuz yatakları bıraktı. 2003 yılında şehir yönetimi, burayı üç tuz gölü, tuzlu şelaleler, Neolitik yerleşim ve Jeoloji Müzesi içeren dünya standartlarında bir rekreasyon merkezine dönüştürdü.'
  }
};
