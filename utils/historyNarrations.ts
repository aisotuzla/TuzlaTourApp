import { Language } from '../types';

export interface HistoryPageNarration {
  title: Record<Language, string>;
  text: Record<Language, string>;
}

export const HISTORY_NARRATIONS: Record<number, HistoryPageNarration> = {
  0: {
    // Page 1: Origins, Neolitic, Roman Ad Salinas, Ottoman era, Austro-Hungarian modernization
    title: {
      bs: 'Historija Tuzle: Drevni počeci i rođenje grada',
      en: 'Tuzla History: Ancient Beginnings & The Birth of the City',
      de: 'Geschichte von Tuzla: Antike Anfänge & Geburt der Stadt',
      tr: 'Tuzla Tarihi: Antik Başlangıçlar ve Şehrin Doğuşu'
    },
    text: {
      bs: 'Dobrodošli u Tuzlu! Grad koji je nastao iz soli, i koji već hiljadama godina čuva svoju posebnu priču. Tuzla je jedno od najstarijih kontinuirano naseljenih mjesta u Bosni i Hercegovini. Njena historija traje duže od šest hiljada godina. Sam naziv grada dolazi od turske riječi tuz – što znači so. Još u neolitu, oko pet i po hiljada godina prije nove ere, ljudi su ovdje proizvodili so. Arheološka istraživanja u Gornjoj Tuzli otkrivaju dokaze o organizovanoj proizvodnji. U vrijeme Rimljana, naselje je nosilo ime Ad Salinas – što znači kod solana. U šesnaestom stoljeću, nakon dolaska Osmanlija, Tuzla se pretvara u pravi urbani centar sa Gazi Turali-begovom džamijom i Sonim trgom. Od 1878. godine, pod upravom Austro-Ugarske, dolazi modernizacija, razvoj industrije i planska urbanizacija Trga slobode.',
      en: 'Welcome to Tuzla! One of the oldest continuously inhabited urban areas in Bosnia and Herzegovina, with a history spanning more than 6,000 years. The city’s very name comes from the Turkish word tuz, meaning salt. Human settlement dates back to the Neolithic period around 5500 BC with organized salt production in Gornja Tuzla. During Roman rule, it was known as Ad Salinas. In the 16th century Ottoman era, Gazi Turali-beg Mosque and Soni Trg formed the urban core. From 1878 under Austro-Hungarian rule, modernization and architecture shaped Trg Slobode into the vibrant city center we see today.',
      de: 'Willkommen in Tuzla! Eines der ältesten durchgehend besiedelten Stadtgebiete in Bosnien und Herzegowina mit über 6.000 Jahren Geschichte. Der Name stammt vom türkischen Wort tuz für Salz. Die Besiedlung reicht bis in die Jungsteinzeit zurück mit früher Salzgewinnung. In der Römerzeit als Ad Salinas bekannt, entwickelte sich Tuzla im 16. Jahrhundert unter den Osmanen zum städtischen Zentrum mit der Gazi-Turali-Beg-Moschee und dem Salzplatz Soni Trg. Ab 1878 brachten die Österreicher Modernisierung und den Freiheitsplatz Trg Slobode.',
      tr: 'Tuzla\'ya hoş geldiniz! 6.000 yılı aşan geçmişiyle Bosna-Hersek\'in en eski yerleşim yerlerinden biridir. Şehrin adı Türkçe tuz kelimesinden gelmektedir. Neolitik dönemden itibaren organize tuz üretimi yapılmıştır. Roma döneminde Ad Salinas olarak anılan şehir, 16. yüzyılda Osmanlı fethiyle Gazi Turalı-beg Camii ve Soni Trg etrafında gelişti. 1878\'de Avusturya-Macaristan yönetimiyle modern şehircilik ve Özgürlük Meydanı Trg Slobode inşa edildi.'
    }
  },
  1: {
    // Page 2: 20th Century, Yugoslav era, Bosnian war / Kapija, Modern Tuzla
    title: {
      bs: 'Historija Tuzle: 20. stoljeće, Kapija i savremena Tuzla',
      en: 'Tuzla History: 20th Century, Kapija & Modern Tuzla',
      de: 'Geschichte von Tuzla: 20. Jahrhundert, Kapija & Modernes Tuzla',
      tr: 'Tuzla Tarihi: 20. Yüzyıl, Kapija ve Bugünkü Tuzla'
    },
    text: {
      bs: 'U dvadesetom stoljeću Tuzla postaje veliki industrijski centar Jugoslavije, poznat po rudarstvu, proizvodnji energije, snažnom radničkom identitetu i društvenoj toleranciji. Tokom rata u Bosni i Hercegovini od 1992. do 1995., Tuzla je ostala simbol multietničkog suživota i utočište za raseljene. Dana 25. maja 1995. godine, artiljerijska granata je pogodila Kapiju, usmrtivši 71 mladu osobu. Danas je Kapija memorijalno mjesto, tiha uspomena i simbol posvećenosti miru. Savremena Tuzla je živopisan kulturni i univerzitetski grad. Panonska slana jezera povezuju prahistorijsko naslijeđe sa modernim turizmom. Grad nastao iz soli i iskušan historijom, Tuzla danas stoji kao simbol otpornosti i suživota.',
      en: 'In the 20th century, Tuzla grew into a major industrial and energy hub of Yugoslavia, distinguished by working-class solidarity and multi-ethnic tolerance. During the Bosnian War, Tuzla remained a refuge of unity. On 25 May 1995, an artillery shell struck Kapija Square, killing 71 young people. Today, Kapija is a solemn memorial to peace. Modern Tuzla celebrates its prehistoric salt heritage through the Pannonian Salt Lakes, standing as a resilient symbol of coexistence, culture, and continuity.',
      de: 'Im 20. Jahrhundert entwickelte sich Tuzla zu einem bedeutenden Industriezentrum Jugoslawiens, geprägt von Bergbau, Arbeiteridentität und sozialer Toleranz. Während des Bosnienkrieges blieb Tuzla ein Zufluchtsort des Zusammenlebens. Am 25. Mai 1995 traf ein Granatengeschoss den Kapija-Platz und forderte 71 junge Menschenleben. Heute ist die Kapija eine Gedenkstätte des Friedens. Das moderne Tuzla verbindet seine Salzgeschichte mit den Pannonischen Salzseen als Symbol für Widerstandskraft und Vielfalt.',
      tr: '20. yüzyılda Tuzla, madencilik, enerji ve çok etnikli hoşgörüsüyle Yugoslavya\'nın büyük bir sanayi merkezi oldu. Bosna Savaşı sırasında barış ve bir arada yaşamanın sığınağı olarak kaldı. 25 Mayıs 1995\'te Kapija Meydanı\'na düşen mermi 71 gencin hayatına mal oldu. Bugün Kapija barışın anıtıdır. Günümüz Tuzlası, Panoniyen Tuz Gölleri ile geçmişini yaşatan canlı bir kültür ve üniversite şehridir.'
    }
  }
};
