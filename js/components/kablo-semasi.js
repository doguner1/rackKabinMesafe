/**
 * Kablo şeması oluşturma komponenti
 * @class KabloSemasi
 */
class KabloSemasi {
  constructor() {
    this.svg = null;
    this.yollar = [];
    this.activeYol = null;
    this.tavanYuksekligi = 300; // Varsayılan tavan yüksekliği (cm)
  }
  
  /**
   * SVG elementini oluşturur
   * @returns {SVGElement} Oluşturulan SVG elementi
   */
  render() {
    // SVG oluştur
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "kablo-semasi");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    
    this.svg = svg;
    
    // Tavan yüksekliği değişikliğini dinle
    const tavanYuksekligiInput = document.getElementById('ceiling-height');
    if (tavanYuksekligiInput) {
      this.tavanYuksekligi = parseInt(tavanYuksekligiInput.value);
      tavanYuksekligiInput.addEventListener('change', (e) => {
        this.tavanYuksekligi = parseInt(e.target.value);
        // Aktif bir yol varsa güncelle
        if (this.activeYol) {
          const selectedRacks = document.querySelectorAll('.rack.selected');
          if (selectedRacks.length === 2) {
            this.yoluGöster(selectedRacks[0], selectedRacks[1]);
          }
        }
      });
    }
    
    // Sayfa yüklendiğinde kablo yollarını oluştur
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => this.yollarıOluştur(), 100);
      });
    } else {
      setTimeout(() => this.yollarıOluştur(), 100);
    }
    
    return svg;
  }
  
  /**
   * Kablo yollarını oluşturur
   */
  yollarıOluştur() {
    const beyazAlan = document.querySelector('.beyaz-alan');
    const hucreler = document.querySelectorAll('.hucre');
    
    if (!beyazAlan || hucreler.length === 0) return;
    
    // Hücrelerin konumlarını al
    const hucreKonumları = [];
    hucreler.forEach((hucre, index) => {
      const rect = hucre.getBoundingClientRect();
      const beyazAlanRect = beyazAlan.getBoundingClientRect();
      
      // Hücrenin beyaz alan içindeki göreceli konumu
      const x = rect.left - beyazAlanRect.left + rect.width / 2;
      const y = rect.top - beyazAlanRect.top + rect.height / 2;
      
      hucreKonumları.push({ x, y, width: rect.width, height: rect.height, index });
    });
    
    // Yatay ve dikey kablo yollarını oluştur
    this.yatayYollarıOluştur(hucreKonumları);
    this.dikeyYollarıOluştur(hucreKonumları);
    this.köşeBağlantılarınıEkle(hucreKonumları);
  }
  
  /**
   * Yatay kablo yollarını oluşturur
   * @param {Array} hucreKonumları - Hücrelerin konum bilgileri
   */
  yatayYollarıOluştur(hucreKonumları) {
    // Yatay kablo yolları (her satır için)
    for (let satir = 0; satir < 2; satir++) {
      const yolNoktaları = [];
      
      // Her satırdaki hücreler için
      for (let sutun = 0; sutun < 3; sutun++) {
        const index = satir * 3 + sutun;
        const hucre = hucreKonumları[index];
        
        if (!hucre) continue;
        
        // Hücrenin sol ve sağ kenarlarından offset ile yol noktaları
        const offset = hucre.width * 0.1;
        const solX = hucre.x - hucre.width / 2 - offset;
        const sagX = hucre.x + hucre.width / 2 + offset;
        const ortaY = hucre.y - hucre.height * 0.3; // Tavan yoluna yakın
        
        yolNoktaları.push({ x: solX, y: ortaY });
        yolNoktaları.push({ x: sagX, y: ortaY });
      }
      
      // Yatay yolu çiz
      this.yolÇiz(yolNoktaları, `yatay-${satir}`);
    }
  }
  
  /**
   * Dikey kablo yollarını oluşturur
   * @param {Array} hucreKonumları - Hücrelerin konum bilgileri
   */
  dikeyYollarıOluştur(hucreKonumları) {
    // Dikey kablo yolları (her sütun için)
    for (let sutun = 0; sutun < 3; sutun++) {
      const yolNoktaları = [];
      
      // Her sütundaki hücreler için
      for (let satir = 0; satir < 2; satir++) {
        const index = satir * 3 + sutun;
        const hucre = hucreKonumları[index];
        
        if (!hucre) continue;
        
        // Hücrenin üst ve alt kenarlarından offset ile yol noktaları
        const ortaX = hucre.x;
        const ustY = hucre.y - hucre.height / 2 - 20;
        const altY = hucre.y + hucre.height / 2 + 20;
        
        yolNoktaları.push({ x: ortaX, y: ustY });
        yolNoktaları.push({ x: ortaX, y: altY });
      }
      
      // Dikey yolu çiz
      this.yolÇiz(yolNoktaları, `dikey-${sutun}`);
    }
  }
  
  /**
   * Köşe bağlantılarını ekler
   * @param {Array} hucreKonumları - Hücrelerin konum bilgileri
   */
  köşeBağlantılarınıEkle(hucreKonumları) {
    // Köşe noktalarını bağla
    for (let satir = 0; satir < 2; satir++) {
      for (let sutun = 0; sutun < 3; sutun++) {
        const index = satir * 3 + sutun;
        const hucre = hucreKonumları[index];
        
        if (!hucre) continue;
        
        // Köşe noktaları
        const offset = 20;
        const solUst = { 
          x: hucre.x - hucre.width / 2 - offset, 
          y: hucre.y - hucre.height / 2 - offset 
        };
        const sagUst = { 
          x: hucre.x + hucre.width / 2 + offset, 
          y: hucre.y - hucre.height / 2 - offset 
        };
        const solAlt = { 
          x: hucre.x - hucre.width / 2 - offset, 
          y: hucre.y + hucre.height / 2 + offset 
        };
        const sagAlt = { 
          x: hucre.x + hucre.width / 2 + offset, 
          y: hucre.y + hucre.height / 2 + offset 
        };
        
        // Köşe bağlantılarını çiz
        this.yolÇiz([solUst, sagUst], `ust-${satir}-${sutun}`);
        this.yolÇiz([solAlt, sagAlt], `alt-${satir}-${sutun}`);
        this.yolÇiz([solUst, solAlt], `sol-${satir}-${sutun}`);
        this.yolÇiz([sagUst, sagAlt], `sag-${satir}-${sutun}`);
      }
    }
  }
  
  /**
   * SVG yolu çizer
   * @param {Array} noktalar - Yol noktaları
   * @param {string} id - Yol ID'si
   */
  yolÇiz(noktalar, id) {
    if (!this.svg || noktalar.length < 2) return;
    
    // SVG path oluştur
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", "kablo-yolu");
    path.setAttribute("id", id);
    
    // Path data oluştur
    let pathData = `M ${noktalar[0].x} ${noktalar[0].y}`;
    for (let i = 1; i < noktalar.length; i++) {
      pathData += ` L ${noktalar[i].x} ${noktalar[i].y}`;
    }
    
    path.setAttribute("d", pathData);
    this.svg.appendChild(path);
    
    // Yolu kaydet
    this.yollar.push({ id, path, noktalar });
  }
  
  /**
   * İki rack arasındaki yolu gösterir
   * @param {HTMLElement} rack1 - Birinci rack
   * @param {HTMLElement} rack2 - İkinci rack
   */
  yoluGöster(rack1, rack2) {
    // Önceki aktif yolları temizle
    if (this.activeYol) {
      if (Array.isArray(this.activeYol)) {
        this.activeYol.forEach(yol => yol.classList.remove('active'));
      } else {
        this.activeYol.classList.remove('active');
      }
      this.activeYol = null;
    }
    
    // Rack'lerin hücrelerini bul
    const hucre1 = rack1.closest('.hucre');
    const hucre2 = rack2.closest('.hucre');
    
    if (!hucre1 || !hucre2) return;
    
    const hucreler = Array.from(document.querySelectorAll('.hucre'));
    const index1 = hucreler.indexOf(hucre1);
    const index2 = hucreler.indexOf(hucre2);
    
    // Hücre konumu: satır ve sütun (2 satır x 3 sütun)
    const satir1 = Math.floor(index1 / 3);
    const sutun1 = index1 % 3;
    const satir2 = Math.floor(index2 / 3);
    const sutun2 = index2 % 3;
    
    // Yatay ve dikey yolları bul
    const yatayYol1 = this.svg.querySelector(`#yatay-${satir1}`);
    const yatayYol2 = this.svg.querySelector(`#yatay-${satir2}`);
    const dikeyYol1 = this.svg.querySelector(`#dikey-${sutun1}`);
    const dikeyYol2 = this.svg.querySelector(`#dikey-${sutun2}`);
    
    // Aktif edilecek yolları tut
    const aktifYollar = [];
    
    // Yolları aktif et
    if (satir1 === satir2) {
      // Aynı satırdaysa sadece yatay yolu göster
      if (yatayYol1) {
        yatayYol1.classList.add('active');
        aktifYollar.push(yatayYol1);
      }
    } else if (sutun1 === sutun2) {
      // Aynı sütundaysa sadece dikey yolu göster
      if (dikeyYol1) {
        dikeyYol1.classList.add('active');
        aktifYollar.push(dikeyYol1);
      }
    } else {
      // Farklı satır ve sütundaysa L şeklinde yol göster
      if (yatayYol1) {
        yatayYol1.classList.add('active');
        aktifYollar.push(yatayYol1);
      }
      if (dikeyYol2) {
        dikeyYol2.classList.add('active');
        aktifYollar.push(dikeyYol2);
      }
      
      // Köşe bağlantısını da aktif et
      const koseYol = this.svg.querySelector(`#${satir1 < satir2 ? 'alt' : 'ust'}-${satir1}-${sutun2}`);
      if (koseYol) {
        koseYol.classList.add('active');
        aktifYollar.push(koseYol);
      }
    }
    
    this.activeYol = aktifYollar;
    
    // Rack'lere özel bağlantıları göster
    this.rackBaglantisiGoster(rack1, rack2);
  }
  
  /**
   * Rack'ler arasındaki özel bağlantıları gösterir
   * @param {HTMLElement} rack1 - Birinci rack
   * @param {HTMLElement} rack2 - İkinci rack
   */
  rackBaglantisiGoster(rack1, rack2) {
    // Rack'lerin konumlarını al
    const rect1 = rack1.getBoundingClientRect();
    const rect2 = rack2.getBoundingClientRect();
    const beyazAlanRect = document.querySelector('.beyaz-alan').getBoundingClientRect();
    
    // Rack'lerin beyaz alan içindeki göreceli konumları
    const rack1X = rect1.left - beyazAlanRect.left + rect1.width / 2;
    const rack1Y = rect1.top - beyazAlanRect.top;
    const rack2X = rect2.left - beyazAlanRect.left + rect2.width / 2;
    const rack2Y = rect2.top - beyazAlanRect.top;
    
    // Rack'lerden tavana çıkan dikey hatlar
    const rack1Top = { x: rack1X, y: rack1Y };
    const rack1Ceiling = { x: rack1X, y: rack1Y - this.tavanYuksekligi };
    const rack2Top = { x: rack2X, y: rack2Y };
    const rack2Ceiling = { x: rack2X, y: rack2Y - this.tavanYuksekligi };
    
    // Tavan bağlantısı
    const ceilingPath = [
      rack1Ceiling,
      rack2Ceiling
    ];
    
    // Rack'lerden tavana çıkan hatları çiz
    this.yolÇiz([rack1Top, rack1Ceiling], 'rack1-ceiling');
    this.yolÇiz([rack2Top, rack2Ceiling], 'rack2-ceiling');
    this.yolÇiz(ceilingPath, 'ceiling-connection');
    
    // Yolları aktif et
    const rack1CeilingPath = this.svg.querySelector('#rack1-ceiling');
    const rack2CeilingPath = this.svg.querySelector('#rack2-ceiling');
    const ceilingConnectionPath = this.svg.querySelector('#ceiling-connection');
    
    if (rack1CeilingPath) {
      rack1CeilingPath.classList.add('active');
      this.activeYol = this.activeYol || [];
      if (Array.isArray(this.activeYol)) {
        this.activeYol.push(rack1CeilingPath);
      }
    }
    
    if (rack2CeilingPath) {
      rack2CeilingPath.classList.add('active');
      this.activeYol = this.activeYol || [];
      if (Array.isArray(this.activeYol)) {
        this.activeYol.push(rack2CeilingPath);
      }
    }
    
    if (ceilingConnectionPath) {
      ceilingConnectionPath.classList.add('active');
      this.activeYol = this.activeYol || [];
      if (Array.isArray(this.activeYol)) {
        this.activeYol.push(ceilingConnectionPath);
      }
    }
  }
}