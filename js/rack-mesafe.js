/**
 * Endpoint seçim ve mesafe hesaplama islemleri
 * @class RackManager
 */
class RackManager {
  /**
   * RackManager olusturucu
   */
  constructor() {
    this.selectedEndpoints = []; // Seçilen endpoint'leri tutacak dizi
    this.allPathEndpoints = []; // Tüm path isaretli endpoint'leri tutacak dizi
    this.selectedRacks = []; // Seçilen rack'leri tutacak dizi
    this.mesafeGosterge = document.getElementById('mesafe-gosterge');
    this.mesafeDeger = document.getElementById('mesafe-deger');
    this.totalDistanceCm = 0; // Toplam mesafeyi cm cinsinden tutacak degisken
    this.pathSegments = []; // Yol segmentlerini tutacak dizi
    
    // Eski koddan alinan degiskenler
    this.verticalDistance = document.getElementById('vertical-distance');
    this.horizontalDistance = document.getElementById('horizontal-distance');
    this.pathVertical = document.getElementById('path-vertical');
    this.pathHorizontal = document.getElementById('path-horizontal');
    this.tavanYuksekligiInput = document.getElementById('ceiling-height');
    this.rackYuksekligiInput = document.getElementById('rack-height');
    this.connectionPointModal = document.getElementById('connection-point-modal');
    
    this.olcekFaktoru = 1; // 1 piksel = 1 cm
    
    // Global erisim için instance'i kaydet
    window.rackManagerInstance = this;
    
    this.init();
  }
  
  /**
   * Baslangiç ayarlarini yapar
   */
  init() {
    // Mesafe göstergesini baslangiçta görünür yap
    if (this.mesafeGosterge) {
      this.mesafeGosterge.style.display = 'flex';
      this.mesafeDeger.textContent = '0.00'; // Baslangiç degeri 0 olarak ayarlandi
    }
    
    // Tüm endpoint'lere tiklama olayi ekle
    this.addEndpointClickListeners();
    
    // Tüm rack elemanlarini seçme ve tiklama olayi ekleme
    const racks = document.querySelectorAll('.rack');
    racks.forEach(rack => {
      rack.addEventListener('click', (event) => this.handleRackClick(event));
    });
    
    // Tavan yüksekligi degisikligini dinle
    if (this.tavanYuksekligiInput) {
      this.tavanYuksekligiInput.addEventListener('change', () => {
        if (this.selectedRacks.length === 2) {
          this.hesaplaMesafe();
        }
      });
    }
    
    // Rack yüksekligi degisikligini dinle
    if (this.rackYuksekligiInput) {
      this.rackYuksekligiInput.addEventListener('change', () => {
        if (this.selectedRacks.length === 2) {
          this.hesaplaMesafe();
        }
      });
    }
    
    // Geri butonuna tiklama olayi ekle
    const backButton = document.getElementById('back-button');
    if (backButton) {
      backButton.addEventListener('click', () => this.handleBackButtonClick());
    }
    
    // Reset butonuna tiklama olayi ekle
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        // Seçili rackler varsa sıfırla
        this.selectedRacks.forEach(rack => {
          rack.classList.remove('selected');
        });
        this.selectedRacks = [];
        
        // Seçili endpointler varsa sıfırla
        this.selectedEndpoints.forEach(endpoint => {
          endpoint.classList.remove('active');
        });
        this.selectedEndpoints = [];
        
        // Path işaretli endpointler varsa sıfırla
        this.allPathEndpoints.forEach(endpoint => {
          endpoint.classList.remove('path');
        });
        this.allPathEndpoints = [];
        
        // Path segmentlerini sıfırla
        this.pathSegments = [];
        
        // Mesafe göstergesini güncelle
        this.updateDistanceDisplay();
        
        // Not defteri bilgilerini güncelle
        this.updateNotebookInfo();
      });
    }
  }
  
  /**
   * Geri butonuna tiklama olayini isler
   */
  handleBackButtonClick() {
    // Eger seçili endpoint yoksa islem yapma
    if (this.selectedEndpoints.length === 0) return;
    
    // Son eklenen endpoint'i al
    const lastEndpoint = this.selectedEndpoints.pop();
    
    // Son segment'i bul ve kaldir
    if (this.pathSegments.length > 0) {
      const lastSegment = this.pathSegments.pop();
      
      // Endpoint'lerin hücre bilgilerini al
      if (lastSegment) {
        const endpoint1 = lastSegment.endpoint1;
        const endpoint2 = lastSegment.endpoint2;
        
        // Endpoint numaralarini al
        const startNumber = parseInt(endpoint1.getAttribute('data-endpoint-number'));
        const endNumber = parseInt(endpoint2.getAttribute('data-endpoint-number'));
        
        if (!isNaN(startNumber) && !isNaN(endNumber)) {
          // Baslangiç ve bitis numaralarini sirala
          const minNumber = Math.min(startNumber, endNumber);
          const maxNumber = Math.max(startNumber, endNumber);
          
          // Ayni hücre içindeki endpoint'leri kontrol et
          const hucre1 = endpoint1.closest('.hucre');
          const hucre2 = endpoint2.closest('.hucre');
          
          if (hucre1 === hucre2) {
            // Ayni hücre içindeyse, aradaki tüm endpoint'lerin path sinifini kaldir
            for (let i = minNumber; i <= maxNumber; i++) {
              const endpoint = document.querySelector(`[data-endpoint-number="${i}"]`);
              if (endpoint) {
                endpoint.classList.remove('path');
                // allPathEndpoints listesinden de kaldir
                this.allPathEndpoints = this.allPathEndpoints.filter(ep => ep !== endpoint);
              }
            }
          } else {
            // Farkli hücrelerdeyse, sadece seçilen endpoint'lerin path sinifini kaldir
            endpoint1.classList.remove('path');
            endpoint2.classList.remove('path');
            
            // allPathEndpoints listesinden de kaldir
            this.allPathEndpoints = this.allPathEndpoints.filter(ep => ep !== endpoint1 && ep !== endpoint2);
          }
        }
      }
    }
    
    // Son endpoint'in active sinifini kaldir
    if (lastEndpoint) {
      lastEndpoint.classList.remove('active');
    }
    
    // Mesafe degerini güncelle
    this.updateDistanceDisplay();
  }
  
  /**
   * Tüm endpoint'lere tiklama olayi ekler
   */
  addEndpointClickListeners() {
    const endpoints = document.querySelectorAll('.rack-endpoint');
    endpoints.forEach(endpoint => {
      // Mevcut click event listener'i kaldir
      const newEndpoint = endpoint.cloneNode(true);
      endpoint.parentNode.replaceChild(newEndpoint, endpoint);
      
      // Yeni click event listener ekle
      newEndpoint.addEventListener('click', (event) => {
        event.stopPropagation(); // Rack tiklama olayini engelle
        this.handleEndpointClick(newEndpoint);
      });
    });
  }
  
  /**
   * Endpoint tiklama olayini isler
   * @param {HTMLElement} endpoint - Tiklanan endpoint
   */
  handleEndpointClick(endpoint) {
    // Eger zaten seçiliyse, seçimi kaldir
    if (endpoint.classList.contains('active')) {
      endpoint.classList.remove('active');
      endpoint.classList.remove('path'); // Path sinifini da kaldir
      this.selectedEndpoints = this.selectedEndpoints.filter(item => item !== endpoint);
      // Tüm path endpoint'lerinden de kaldir
      this.allPathEndpoints = this.allPathEndpoints.filter(item => item !== endpoint);
    } else {
      // Eger zaten 2 endpoint seçiliyse, ilk seçileni kaldir
      if (this.selectedEndpoints.length >= 2) {
        // Ilk seçilen endpoint'in active sinifini kaldir ama path sinifini kaldirma
        this.selectedEndpoints[0].classList.remove('active');
        this.selectedEndpoints.shift();
      }
      
      // Yeni endpoint'i seçili olarak isaretle
      endpoint.classList.add('active');
      this.selectedEndpoints.push(endpoint);
    }
    
    // Eger iki endpoint seçildiyse, yol haritasini göster ve segment ekle
    if (this.selectedEndpoints.length === 2) {
      this.showPathBetweenEndpoints();
      this.addPathSegment(this.selectedEndpoints[0], this.selectedEndpoints[1]);
    }
    
    // Mesafe degerini güncelle
    this.updateDistanceDisplay();
  }
  
  /**
   * Iki endpoint arasindaki yol segmentini ekler
   * @param {HTMLElement} endpoint1 - Birinci endpoint
   * @param {HTMLElement} endpoint2 - Ikinci endpoint
   */
  addPathSegment(endpoint1, endpoint2) {
    // Endpoint numaralarini al
    const startNumber = parseInt(endpoint1.getAttribute('data-endpoint-number'));
    const endNumber = parseInt(endpoint2.getAttribute('data-endpoint-number'));
    
    if (isNaN(startNumber) || isNaN(endNumber)) return;
    
    // Hücre bilgilerini al
    const hucre1 = endpoint1.closest('.hucre');
    const hucre2 = endpoint2.closest('.hucre');
    const hucre1Index = parseInt(hucre1.dataset.index);
    const hucre2Index = parseInt(hucre2.dataset.index);
    
    // Segment mesafesini hesapla
    let segmentDistance = 0;
    
    if (hucre1 === hucre2) {
      // Ayni hücre içindeyse, rack parçalari arasindaki mesafeyi hesapla
      // Baslangiç ve bitis numaralarini sirala
      const minNumber = Math.min(startNumber, endNumber);
      const maxNumber = Math.max(startNumber, endNumber);
      
      // Rack'ler arasi mesafeyi hesapla (her rack arasi 80 cm olarak degistirildi)
      const rackCount = maxNumber - minNumber;
      segmentDistance = rackCount * 80; // Her rack arasi 80 cm (0.80 metre)
    } else {
      // Farkli hücreler arasindaysa, sabit mesafeleri ekle
      if ((hucre1Index === 0 && hucre2Index === 1) || (hucre1Index === 1 && hucre2Index === 0)) {
        // Hücre 1 ile Hücre 2 arasi - 227 cm olarak geri degistirildi
        segmentDistance = 227;
      } else if ((hucre1Index === 1 && hucre2Index === 2) || (hucre1Index === 2 && hucre2Index === 1)) {
        // Hücre 2 ile Hücre 3 arasi
        segmentDistance = 240;
      } else if ((hucre1Index === 0 && hucre2Index === 2) || (hucre1Index === 2 && hucre2Index === 0)) {
        // Hücre 1 ile Hücre 3 arasi (Hücre 1 -> Hücre 2 -> Hücre 3)
        segmentDistance = 227 + 240;
      }
    }
    
    // Segment bilgisini diziye ekle
    this.pathSegments.push({
      endpoint1: endpoint1,
      endpoint2: endpoint2,
      distance: segmentDistance
    });
  }
  
  /**
   * Iki endpoint arasindaki yol haritasini gösterir
   */
  showPathBetweenEndpoints() {
    // Seçili endpoint'lerin numaralarini al
    const endpoint1 = this.selectedEndpoints[0];
    const endpoint2 = this.selectedEndpoints[1];
    
    if (!endpoint1 || !endpoint2) return;
    
    // Endpoint numaralarini al
    const startNumber = parseInt(endpoint1.getAttribute('data-endpoint-number'));
    const endNumber = parseInt(endpoint2.getAttribute('data-endpoint-number'));
    
    if (isNaN(startNumber) || isNaN(endNumber)) return;
    
    // Baslangiç ve bitis numaralarini sirala
    const minNumber = Math.min(startNumber, endNumber);
    const maxNumber = Math.max(startNumber, endNumber);
    
    // Ayni hücre içindeki endpoint'leri kontrol et
    const hucre1 = endpoint1.closest('.hucre');
    const hucre2 = endpoint2.closest('.hucre');
    
    if (hucre1 === hucre2) {
      // Ayni hücre içindeyse, aradaki tüm endpoint'leri isaretle
      for (let i = minNumber; i <= maxNumber; i++) {
        const endpoint = document.querySelector(`[data-endpoint-number="${i}"]`);
        if (endpoint) {
          endpoint.classList.add('path');
          // Eger bu endpoint daha önce path olarak isaretlenmediyse, listeye ekle
          if (!this.allPathEndpoints.includes(endpoint)) {
            this.allPathEndpoints.push(endpoint);
          }
        }
      }
    } else {
      // Farkli hücrelerdeyse, sadece seçilen endpoint'leri isaretle
      endpoint1.classList.add('path');
      endpoint2.classList.add('path');
      
      // Eger bu endpoint'ler daha önce path olarak isaretlenmediyse, listeye ekle
      if (!this.allPathEndpoints.includes(endpoint1)) {
        this.allPathEndpoints.push(endpoint1);
      }
      if (!this.allPathEndpoints.includes(endpoint2)) {
        this.allPathEndpoints.push(endpoint2);
      }
    }
  }
  
  /**
   * Tüm yol segmentlerinin toplam mesafesini hesaplar
   */
  calculateTotalDistance() {
    // Tüm segmentlerin mesafelerini topla
    let totalDistance = 0;
    
    for (const segment of this.pathSegments) {
      totalDistance += segment.distance;
    }
    
    // Seçili rack'lerin ek mesafelerini ekle
    document.querySelectorAll('.rack.selected').forEach(rack => {
      const additionalDistance = parseInt(rack.getAttribute('data-additional-distance') || '0');
      if (!isNaN(additionalDistance)) {
        totalDistance += additionalDistance;
      }
    });
    
    // Toplam mesafeyi güncelle
    this.totalDistanceCm = totalDistance;
  }
  
  /**
   * Mesafe göstergesini günceller
   */
  updateDistanceDisplay() {
    // Toplam mesafeyi hesapla
    this.calculateTotalDistance();
    
    // Iki endpoint seçildiyse 0.20 metre (20 cm) ekle
    let finalDistance = this.totalDistanceCm;
    if (this.selectedEndpoints.length === 2) {
      finalDistance += 20; // 0.20 metre = 20 cm
    }
    
    // Mesafe degerini güncelle
    if (this.mesafeDeger) {
      // Mesafeyi metre cinsine çevir (cm -> m)
      const distanceInMeters = finalDistance / 100;
      this.mesafeDeger.textContent = distanceInMeters.toFixed(2);
      
      // Not defteri bileşenini güncelle
      this.updateNotebookInfo();
    }
    
    // Mesafe göstergesini görünürlügünü güncelle
    if (this.mesafeGosterge) {
      if (this.selectedEndpoints.length > 0 || this.pathSegments.length > 0 || this.selectedRacks.length > 0) {
        this.mesafeGosterge.style.display = 'flex';
      } else {
        this.mesafeGosterge.style.display = 'none';
      }
    }
  }
  
  /**
   * Not defteri bilgilerini günceller
   */
  updateNotebookInfo() {
    // Not defteri bileşeni varsa güncelle
    const notebookRackInfo = document.getElementById('notebook-rack-info');
    const notebookDistanceInfo = document.getElementById('notebook-distance-info');
    
    if (notebookRackInfo && notebookDistanceInfo) {
      if (this.selectedRacks.length === 0) {
        // Hiç rack seçilmemişse
        notebookRackInfo.textContent = 'Henüz rack seçilmedi';
        notebookDistanceInfo.textContent = 'Toplam Mesafe: 0.00 m';
      } else if (this.selectedRacks.length === 1) {
        // Bir rack seçilmişse
        const rackId = this.selectedRacks[0].getAttribute('data-rack-id') || 'Bilinmeyen Rack';
        notebookRackInfo.textContent = `Seçilen Rack: ${rackId}`;
        notebookDistanceInfo.textContent = 'Toplam Mesafe: 0.00 m';
      } else if (this.selectedRacks.length === 2) {
        // İki rack seçilmişse
        const rack1Id = this.selectedRacks[0].getAttribute('data-rack-id') || 'Bilinmeyen Rack';
        const rack2Id = this.selectedRacks[1].getAttribute('data-rack-id') || 'Bilinmeyen Rack';
        notebookRackInfo.textContent = `Seçilen Rackler: ${rack1Id} - ${rack2Id}`;
        notebookDistanceInfo.textContent = `Toplam Mesafe: ${this.mesafeDeger.textContent} m`;
      }
    }
  }
  
  /**
   * Rack tiklama olayini isler
   * @param {Event} event - Tiklama olayi
   */
  handleRackClick(event) {
    const rack = event.currentTarget;
    
    // Eger zaten seçiliyse, seçimi kaldir
    if (rack.classList.contains('selected')) {
      rack.classList.remove('selected');
      this.selectedRacks = this.selectedRacks.filter(item => item !== rack);
      
      // Eger seçili rack kalmadiysa mesafe göstergesini gizle
      if (this.selectedRacks.length < 2) {
        if (this.pathVertical) this.pathVertical.style.display = 'none';
        if (this.pathHorizontal) this.pathHorizontal.style.display = 'none';
      }
    } else {
      // Baglanti noktasi seçim modalini göster
      this.showConnectionPointModal(rack);
    }
    
    // Mesafe degerini güncelle
    this.updateDistanceDisplay();
  }
  
  /**
   * Baglanti noktasi seçim modalini gösterir
   * @param {HTMLElement} rack - Seçilen rack
   */
  showConnectionPointModal(rack) {
    if (!this.connectionPointModal) return;
    
    // Önceki seçimleri temizle
    document.querySelectorAll('.connection-point').forEach(p => p.classList.remove('selected'));
    const selectedPointElement = document.getElementById('selected-point');
    if (selectedPointElement) selectedPointElement.textContent = 'Seçilmedi';
    
    const ceilingDistanceElement = document.getElementById('ceiling-distance');
    if (ceilingDistanceElement) ceilingDistanceElement.textContent = '0';
    
    // Rack'i baglanti seçim modunda isaretle
    rack.classList.add('connection-selecting');
    
    // Modali göster
    this.connectionPointModal.style.display = 'block';
  }
  
  /**
   * Rack seçimini tamamlar
   * @param {HTMLElement} rack - Seçilen rack
   */
  handleRackSelection(rack) {
    // Eger zaten 2 rack seçiliyse, ilk seçileni kaldir
    if (this.selectedRacks.length >= 2) {
      this.selectedRacks[0].classList.remove('selected');
      this.selectedRacks.shift();
    }
    
    // Yeni rack'i seçili olarak isaretle
    rack.classList.add('selected');
    this.selectedRacks.push(rack);
    
    // Eger 2 rack seçildiyse mesafeyi hesapla ve göster
    if (this.selectedRacks.length === 2) {
      this.hesaplaMesafe();
    }
    
    // Mesafe degerini güncelle
    this.updateDistanceDisplay();
    
    // Rack ID'sini ayarla (eğer yoksa)
    if (!rack.hasAttribute('data-rack-id')) {
      const hucre = rack.closest('.hucre');
      const hucreIndex = hucre ? Array.from(document.querySelectorAll('.hucre')).indexOf(hucre) + 1 : 0;
      const rackIndex = hucre ? Array.from(hucre.querySelectorAll('.rack')).indexOf(rack) + 1 : 0;
      rack.setAttribute('data-rack-id', `Rack ${hucreIndex}-${rackIndex}`);
    }
  }
  
  /**
   * Iki rack arasindaki mesafeyi hesaplar
   */
  hesaplaMesafe() {
    if (this.selectedRacks.length !== 2) return;
    
    const rack1 = this.selectedRacks[0];
    const rack2 = this.selectedRacks[1];
    
    // Hücre indekslerini bul
    const hucreler = Array.from(document.querySelectorAll('.hucre'));
    const index1 = hucreler.indexOf(rack1.closest('.hucre'));
    const index2 = hucreler.indexOf(rack2.closest('.hucre'));
    
    // Hücre konumu: satir ve sütun (2 satir x 3 sütun)
    const satir1 = Math.floor(index1 / 3);
    const sutun1 = index1 % 3;
    const satir2 = Math.floor(index2 / 3);
    const sutun2 = index2 % 3;
    
    // Rack konumu: 10 sütun x 2 satir (0-19 arasi index)
    const racksInCell1 = Array.from(rack1.closest('.hucre').querySelectorAll('.rack'));
    const racksInCell2 = Array.from(rack2.closest('.hucre').querySelectorAll('.rack'));
    const pos1 = racksInCell1.indexOf(rack1);
    const pos2 = racksInCell2.indexOf(rack2);
    
    // 90 derece çevrildigi için satir ve sütun hesaplamasi degisti
    const sutunIc1 = Math.floor(pos1 / 10); // 0 ya da 1
    const satirIc1 = pos1 % 10;
    
    const sutunIc2 = Math.floor(pos2 / 10);
    const satirIc2 = pos2 % 10;
    
    // Her rack arasi degisti: genislik 100 cm, yükseklik 60 cm
    const icX1 = sutunIc1 * 100; // Rack genisligi 100 cm
    const icY1 = satirIc1 * 60;  // Rack yüksekligi 60 cm
    
    const icX2 = sutunIc2 * 100; // Rack genisligi 100 cm
    const icY2 = satirIc2 * 60;  // Rack yüksekligi 60 cm
    
    // Hücre pozisyonunu cm cinsinden hesapla (degistirildi)
    const hucreX1 = sutun1 * (2 * 100 + 300); // hücre içi + 3m bosluk
    const hucreY1 = satir1 * (10 * 60 + 150); // hücre içi + 1.5m bosluk
    
    const hucreX2 = sutun2 * (2 * 100 + 300);
    const hucreY2 = satir2 * (10 * 60 + 150);
    
    // Global pozisyonlar
    const globalX1 = hucreX1 + icX1;
    const globalY1 = hucreY1 + icY1;
    
    const globalX2 = hucreX2 + icX2;
    const globalY2 = hucreY2 + icY2;
    
    // Tavan yüksekligi ve rack yüksekligi
    const tavanYuksekligi = parseInt(this.tavanYuksekligiInput?.value || 300);
    const rackYuksekligi = parseInt(this.rackYuksekligiInput?.value || 100);
    
    // Baglanti noktasi yükseklikleri (metre cinsinden)
    const connectionHeightValue1 = parseInt(rack1.getAttribute('data-connection-height') || 3);
    const connectionHeightValue2 = parseInt(rack2.getAttribute('data-connection-height') || 3);
    
    // Bağlantı noktalarına göre mesafeleri hesapla
    let dikeyMesafe1 = 0;
    let dikeyMesafe2 = 0;
    
    // Birinci rack için mesafe hesaplama
     switch(connectionHeightValue1) {
       case 1: // Üst Bölüm - 0.5 metre (50 cm)
         dikeyMesafe1 = 100;
         break;
      case 2: // Orta Bölüm - 1.5 metre (150 cm)
        dikeyMesafe1 = 150;
        break;
      case 3: // Alt Bölüm - 2.5 metre (250 cm)
        dikeyMesafe1 = 250;
        break;
      case 4: // En Alt Bölüm - 3.5 metre (350 cm)
        dikeyMesafe1 = 350;
        break;
      default:
        dikeyMesafe1 = 300; // Varsayılan değer
    }
    
    // İkinci rack için mesafe hesaplama
     switch(connectionHeightValue2) {
       case 1: // Üst Bölüm - 0.5 metre (50 cm)
         dikeyMesafe2 = 100;
         break;
      case 2: // Orta Bölüm - 1.5 metre (150 cm)
        dikeyMesafe2 = 150;
        break;
      case 3: // Alt Bölüm - 2.5 metre (250 cm)
        dikeyMesafe2 = 250;
        break;
      case 4: // En Alt Bölüm - 3.5 metre (350 cm)
        dikeyMesafe2 = 350;
        break;
      default:
        dikeyMesafe2 = 300; // Varsayılan değer
    }
    
    const dikeyMesafe = dikeyMesafe1 + dikeyMesafe2;
    
    // Yatay mesafe hesaplama (tavan boyunca)
    const yatayMesafe = Math.abs(globalX2 - globalX1);
    
    // Toplam kablo mesafesi
    const kabloMesafesi = dikeyMesafe + yatayMesafe;
    
    // Sonuçlari göster
    if (this.mesafeDeger) this.mesafeDeger.textContent = `${(kabloMesafesi/100).toFixed(2)}`; // cm -> m
    if (this.verticalDistance) this.verticalDistance.textContent = dikeyMesafe;
    if (this.horizontalDistance) this.horizontalDistance.textContent = yatayMesafe;
    if (this.mesafeGosterge) this.mesafeGosterge.style.display = 'flex';
    
    // Toplam mesafeyi güncelle
    this.totalDistanceCm = kabloMesafesi;
  }
  
  // ... existing code ...
}

// Sayfa yüklendiginde RackManager'i baslat
document.addEventListener('DOMContentLoaded', () => {
  new RackManager();
});