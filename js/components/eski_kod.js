/**
 * Rack mesafe hesaplama ve seçim işlemleri
 * @class RackManager
 */
class RackManager {
  /**
   * RackManager oluşturucu
   */
  constructor() {
    this.selectedRacks = [];
    this.mesafeGosterge = document.getElementById('mesafe-gosterge');
    this.mesafeDeger = document.getElementById('mesafe-deger');
    this.verticalDistance = document.getElementById('vertical-distance');
    this.horizontalDistance = document.getElementById('horizontal-distance');
    this.pathVertical = document.getElementById('path-vertical');
    this.pathHorizontal = document.getElementById('path-horizontal');
    this.tavanYuksekligiInput = document.getElementById('ceiling-height');
    this.rackYuksekligiInput = document.getElementById('rack-height');
    this.connectionPointModal = document.getElementById('connection-point-modal');
    
    this.olcekFaktoru = 1; // 1 piksel = 1 cm
    
    // Global erişim için instance'ı kaydet
    window.rackManagerInstance = this;
    
    this.init();
  }
  
  /**
   * Başlangıç ayarlarını yapar
   */
  init() {
    // Tüm rack elemanlarını seçme ve tıklama olayı ekleme
    const racks = document.querySelectorAll('.rack');
    racks.forEach(rack => {
      rack.addEventListener('click', (event) => this.handleRackClick(event));
    });
    
    // Tavan yüksekliği değişikliğini dinle
    if (this.tavanYuksekligiInput) {
      this.tavanYuksekligiInput.addEventListener('change', () => {
        if (this.selectedRacks.length === 2) {
          this.hesaplaMesafe();
        }
      });
    }
    
    // Rack yüksekliği değişikliğini dinle
    if (this.rackYuksekligiInput) {
      this.rackYuksekligiInput.addEventListener('change', () => {
        if (this.selectedRacks.length === 2) {
          this.hesaplaMesafe();
        }
      });
    }
    
    // Mesafe göstergesini başlangıçta görünür yap
    if (this.mesafeGosterge) {
      this.mesafeGosterge.style.display = 'flex';
      this.mesafeDeger.textContent = '0 +2'; // Başlangıç değeri
    }
  }
  
  /**
   * Rack tıklama olayını işler
   * @param {Event} event - Tıklama olayı
   */
  handleRackClick(event) {
    const rack = event.currentTarget;
    
    // Eğer zaten seçiliyse, seçimi kaldır
    if (rack.classList.contains('selected')) {
      rack.classList.remove('selected');
      this.selectedRacks = this.selectedRacks.filter(item => item !== rack);
      
      // Eğer seçili rack kalmadıysa mesafe göstergesini gizle
      if (this.selectedRacks.length < 2) {
        this.mesafeGosterge.style.display = 'none';
        this.pathVertical.style.display = 'none';
        this.pathHorizontal.style.display = 'none';
      }
    } else {
      // Bağlantı noktası seçim modalını göster
      this.showConnectionPointModal(rack);
    }
  }
  
  /**
   * Bağlantı noktası seçim modalını gösterir
   * @param {HTMLElement} rack - Seçilen rack
   */
  showConnectionPointModal(rack) {
    // Önceki seçimleri temizle
    document.querySelectorAll('.connection-point').forEach(p => p.classList.remove('selected'));
    document.getElementById('selected-point').textContent = 'Seçilmedi';
    document.getElementById('ceiling-distance').textContent = '0';
    
    // Rack'i bağlantı seçim modunda işaretle
    rack.classList.add('connection-selecting');
    
    // Modalı göster
    this.connectionPointModal.style.display = 'block';
  }
  
  /**
   * Rack seçimini tamamlar
   * @param {HTMLElement} rack - Seçilen rack
   */
  handleRackSelection(rack) {
    // Eğer zaten 2 rack seçiliyse, ilk seçileni kaldır
    if (this.selectedRacks.length >= 2) {
      this.selectedRacks[0].classList.remove('selected');
      this.selectedRacks.shift();
    }
    
    // Yeni rack'i seçili olarak işaretle
    this.selectedRacks.push(rack);
    
    // Eğer 2 rack seçildiyse mesafeyi hesapla ve göster
    if (this.selectedRacks.length === 2) {
      this.hesaplaMesafe();
    }
  }
  
  /**
   * İki rack arasındaki mesafeyi hesaplar
   */
  hesaplaMesafe() {
    const rack1 = this.selectedRacks[0];
    const rack2 = this.selectedRacks[1];
    
    // Hücre indekslerini bul
    const hucreler = Array.from(document.querySelectorAll('.hucre'));
    const index1 = hucreler.indexOf(rack1.closest('.hucre'));
    const index2 = hucreler.indexOf(rack2.closest('.hucre'));
    
    // Hücre konumu: satır ve sütun (2 satır x 3 sütun)
    const satir1 = Math.floor(index1 / 3);
    const sutun1 = index1 % 3;
    const satir2 = Math.floor(index2 / 3);
    const sutun2 = index2 % 3;
    
    // Rack konumu: 10 sütun x 2 satır (0-19 arası index)
    const racksInCell1 = Array.from(rack1.closest('.hucre').querySelectorAll('.rack'));
    const racksInCell2 = Array.from(rack2.closest('.hucre').querySelectorAll('.rack'));
    const pos1 = racksInCell1.indexOf(rack1);
    const pos2 = racksInCell2.indexOf(rack2);
    
    // 90 derece çevrildiği için satır ve sütun hesaplaması değişti
    const sutunIc1 = Math.floor(pos1 / 10); // 0 ya da 1
    const satirIc1 = pos1 % 10;
    
    const sutunIc2 = Math.floor(pos2 / 10);
    const satirIc2 = pos2 % 10;
    
    // Her rack arası değişti: genişlik 100 cm, yükseklik 60 cm
    const icX1 = sutunIc1 * 100; // Rack genişliği 100 cm
    const icY1 = satirIc1 * 60;  // Rack yüksekliği 60 cm
    
    const icX2 = sutunIc2 * 100; // Rack genişliği 100 cm
    const icY2 = satirIc2 * 60;  // Rack yüksekliği 60 cm
    
    // Hücre pozisyonunu cm cinsinden hesapla (değiştirildi)
    const hucreX1 = sutun1 * (2 * 100 + 300); // hücre içi + 3m boşluk
    const hucreY1 = satir1 * (10 * 60 + 150); // hücre içi + 1.5m boşluk
    
    const hucreX2 = sutun2 * (2 * 100 + 300);
    const hucreY2 = satir2 * (10 * 60 + 150);
    
    // Global pozisyonlar
    const globalX1 = hucreX1 + icX1;
    const globalY1 = hucreY1 + icY1;
    
    const globalX2 = hucreX2 + icX2;
    const globalY2 = hucreY2 + icY2;
    
    // Tavan yüksekliği ve rack yüksekliği
    const tavanYuksekligi = parseInt(this.tavanYuksekligiInput?.value || 300);
    const rackYuksekligi = parseInt(this.rackYuksekligiInput?.value || 100);
    
    // Bağlantı noktası yükseklikleri (metre cinsinden)
    const connectionHeight1 = parseInt(rack1.getAttribute('data-connection-height') || 3);
    const connectionHeight2 = parseInt(rack2.getAttribute('data-connection-height') || 3);
    
    // Dikey mesafe hesaplama (rack'ten tavana + tavandan diğer rack'e)
    const dikeyMesafe1 = connectionHeight1 * 100; // metre -> cm
    const dikeyMesafe2 = connectionHeight2 * 100; // metre -> cm
    const dikeyMesafe = dikeyMesafe1 + dikeyMesafe2;
    
    // Yatay mesafe hesaplama (tavan boyunca)
    const yatayMesafe = Math.abs(globalX2 - globalX1);
    
    // Toplam kablo mesafesi
    const kabloMesafesi = dikeyMesafe + yatayMesafe;
    
    // Sonuçları göster
    this.mesafeDeger.textContent = `${kabloMesafesi} +2`; // +2 eklendi
    this.verticalDistance.textContent = dikeyMesafe;
    this.horizontalDistance.textContent = yatayMesafe;
    this.mesafeGosterge.style.display = 'flex';
    this.pathVertical.style.display = 'block';
    this.pathHorizontal.style.display = 'block';
  }
}

// Sayfa yüklendiğinde RackManager'ı başlat
document.addEventListener('DOMContentLoaded', () => {
  new RackManager();
});