// Yardımcı adaylarının hazır adları (Kemal, 15 Ekim akşam: "adayların
// hepsine sen bir isim yaz, ben değiştirebileyim istersem"). Kanon değil;
// işe alırken kutuda yazar, Kemal silip kendi adını yazabilir.
// Dönem 2000'lerin başı: o yıllarda yirmili yaşlarında olanların sık adları.
const KADIN = ['Elif', 'Zeynep', 'Merve', 'Esra', 'Seda', 'Burcu', 'Ebru', 'Derya', 'Gizem', 'Pınar', 'Özge', 'Tuğba', 'Deniz', 'Aslı', 'Sevgi'];
const ERKEK = ['Emre', 'Burak', 'Murat', 'Serkan', 'Onur', 'Kerem', 'Tolga', 'Barış', 'Volkan', 'Cem', 'Mert', 'Ozan', 'Umut', 'Hakan', 'Caner'];

// Aynı aday her açılışta aynı adı alır; dükkânda zaten olan adlar atlanır
export function adOner(tohum: number, kadin: boolean, kullanilan: string[]) {
  const liste = kadin ? KADIN : ERKEK;
  for (let i = 0; i < liste.length; i++) {
    const ad = liste[(tohum + i) % liste.length];
    if (!kullanilan.includes(ad)) return ad;
  }
  return liste[tohum % liste.length];
}
