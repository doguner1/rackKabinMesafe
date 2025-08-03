/**
 * Hücre oluşturma komponenti
 * @class Hucre
 */
class Hucre {
  /**
   * Hücre oluşturucu
   * @param {number} rackSayisi - Hücredeki rack sayısı
   * @param {number} hucreIndex - Hücrenin indeksi
   */
  constructor(rackSayisi = 20, hucreIndex = 0) {
    this.rackSayisi = rackSayisi;
    this.hucreIndex = hucreIndex;
    
    // Tüm hücreler için tek sütun ve 10 satır kullanacağız
    this.satirSayisi = 10; // 11'den 10'a değiştirildi çünkü artık extra rack kullanmayacağız
    this.sutunSayisi = 1; // Her hücre için tek sütun
    
     // Endpoint sayacını statik olarak tanımla
    if (!Hucre.endpointCounter) {
      Hucre.endpointCounter = 1;
    }
    
    // Her hücre için endpoint başlangıç değerini ayarla
    this.endpointStartValue = this.hucreIndex * 11 + 1; // 11 olarak bırakıldı çünkü her hücrede hala 11 endpoint olacak
  }
  
  /**
   * Hücre DOM elementini oluşturur
   * @returns {HTMLElement} Oluşturulan hücre elementi
   */
  render() {
    const hucre = document.createElement('div');
    hucre.className = 'hucre';
    hucre.dataset.index = this.hucreIndex;
    
    // Tüm hücreler için tek sütun sınıfı ekle
    hucre.classList.add('hucre-tek-sutun');
    
    // Hücre başlığı
    const hucreBaslik = document.createElement('div');
    hucreBaslik.className = 'hucre-baslik';
    hucreBaslik.textContent = `Hücre ${this.hucreIndex + 1}`; // Hücre 1, Hücre 2, Hücre 3 şeklinde
    hucre.appendChild(hucreBaslik);
    
    // Rack grid yapısı
    const rackGrid = document.createElement('div');
    rackGrid.className = 'rack-grid';
    rackGrid.classList.add('rack-grid-tek-sutun');
    rackGrid.style.gridTemplateColumns = `repeat(${this.sutunSayisi}, 1fr)`;
    rackGrid.style.gridTemplateRows = `repeat(${this.satirSayisi}, 1fr)`;
    
    // Her hücre için endpoint sayacını hücre indeksine göre ayarla
    Hucre.endpointCounter = this.endpointStartValue;
    
    // Rack'leri oluştur (her hücre için 10 rack)
    for (let i = 0; i < 10; i++) {
      // Son rack için özel işlem yap (10. rack)
      if (i === 9) {
        // Son rack'e iki endpoint ekle (üstte ve altta)
        this.createLastRack(rackGrid, i, 1, 1, i + 1, 1);
      } else {
        this.createRack(rackGrid, i, 1, 1, i + 1, 1);
      }
    }
    
    hucre.appendChild(rackGrid);
    return hucre;
  }
  
  /**
   * Son rack'i oluşturma yardımcı fonksiyonu (hem üstte hem altta endpoint'i olan)
   */
  createLastRack(rackGrid, index, satirNo, sutunNo, rackSatir, rackSutun) {
    const rack = document.createElement('div');
    rack.className = 'rack';
    rack.dataset.index = index;
    rack.dataset.connectionHeight = '3'; // Varsayılan bağlantı yüksekliği (alt bölüm)
    
    // Rack'e tıklama olayı ekle
    rack.addEventListener('click', () => {
      // Diğer seçili rack'leri temizle
      document.querySelectorAll('.rack.connection-selecting').forEach(r => {
        r.classList.remove('connection-selecting');
      });
      
      // Bu rack'i seçili olarak işaretle
      rack.classList.add('connection-selecting');
      
      // Bağlantı noktası modalını göster
      if (window.modalManagerInstance) {
        window.modalManagerInstance.showConnectionPointModal(rack);
      }
    });
    
    // Rack içi bilgi etiketi
    const rackInfo = document.createElement('div');
    rackInfo.className = 'rack-info';
    const hucreSirasi = this.hucreIndex + 1; // 0 -> 1, 1 -> 2, 2 -> 3
    
    // Rack ID oluştur
    const defaultRackId = `R${hucreSirasi}-${rackSatir}${rackSutun}`;
    
    // LocalStorage'dan özel isim kontrolü
    const customNameKey = `rack-custom-name-${hucreSirasi}-${rackSatir}${rackSutun}`;
    const customName = localStorage.getItem(customNameKey);
    
    // Rack ID'sini göster (özel isim varsa onu göster)
    const displayName = customName || defaultRackId;
    rackInfo.innerHTML = `<span class="rack-id" data-default-id="${defaultRackId}">${displayName}</span>`;
    
    // Rack ID'ye tıklama olayını engelle ve çift tıklama ile düzenleme özelliği ekle
    const rackId = rackInfo.querySelector('.rack-id');
    rackId.addEventListener('click', (event) => {
      event.stopPropagation(); // Rack tıklama olayını engelle
    });
    
    rackInfo.addEventListener('dblclick', (event) => {
      event.stopPropagation(); // Rack tıklama olayını engelle
      showRackNameEditModal(rack);
    });
    
    rack.appendChild(rackInfo);
    
    // Üst Endpoint halkası ekle
    const endpoint = document.createElement('div');
    endpoint.className = 'rack-endpoint';
    // Endpoint ID'si tanımla - ardışık numara kullan
    const endpointNumber = Hucre.endpointCounter++;
    const endpointId = `EP-${endpointNumber}`;
    endpoint.id = endpointId;
    endpoint.setAttribute('data-endpoint-id', endpointId);
    endpoint.setAttribute('data-endpoint-number', endpointNumber);
    // Rack ID'sini endpoint'e bağla
    endpoint.setAttribute('data-rack-id', defaultRackId);
    // Endpoint numarasını görsel olarak göster
    endpoint.innerHTML = `<span class="endpoint-number">${endpointNumber}</span>`;
    // Endpoint tıklama olayını RackManager sınıfı yönetecek
    rack.appendChild(endpoint);
    
    // Alt Endpoint halkası ekle (11., 22., 33. endpoint'ler)
    const bottomEndpoint = document.createElement('div');
    bottomEndpoint.className = 'rack-endpoint';
    // Alt endpoint için stil ekle - üstteki yerine altta olacak
    bottomEndpoint.style.top = 'auto';
    bottomEndpoint.style.bottom = '-8px';
    
    // Endpoint ID'si tanımla - ardışık numara kullan
    const bottomEndpointNumber = Hucre.endpointCounter++;
    const bottomEndpointId = `EP-${bottomEndpointNumber}`;
    bottomEndpoint.id = bottomEndpointId;
    bottomEndpoint.setAttribute('data-endpoint-id', bottomEndpointId);
    bottomEndpoint.setAttribute('data-endpoint-number', bottomEndpointNumber);
    // Rack ID'sini endpoint'e bağla
    bottomEndpoint.setAttribute('data-rack-id', defaultRackId);
    // Endpoint numarasını görsel olarak göster
    bottomEndpoint.innerHTML = `<span class="endpoint-number">${bottomEndpointNumber}</span>`;
    rack.appendChild(bottomEndpoint);
    
    // Ayar butonu ekle
    const settingsButton = document.createElement('button');
    settingsButton.className = 'rack-settings-btn';
    settingsButton.innerHTML = '<i class="fas fa-cog"></i>';
    settingsButton.title = 'Rack Ayarları';
    settingsButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Rack tıklama olayını engelle
      showRackPartsModal(rack); // window. öneki kaldırıldı
    });
    rack.appendChild(settingsButton);
    
    // R1-92 ve R1-102 rack'leri için kapı simgesi ekle
    if (hucreSirasi === 1 && ((rackSatir === 9 && rackSutun === 2) || (rackSatir === 10 && rackSutun === 2))) {
      this.addDoorIcon(rack, rackGrid);
    }
    
    rackGrid.appendChild(rack);
    return rack;
  }

  /**
   * Rack oluşturma yardımcı fonksiyonu
   */
  createRack(rackGrid, index, satirNo, sutunNo, rackSatir, rackSutun) {
    const rack = document.createElement('div');
    rack.className = 'rack';
    rack.dataset.index = index;
    rack.dataset.connectionHeight = '3'; // Varsayılan bağlantı yüksekliği (alt bölüm)
    
    // Rack'e tıklama olayı ekle
    rack.addEventListener('click', () => {
      // Diğer seçili rack'leri temizle
      document.querySelectorAll('.rack.connection-selecting').forEach(r => {
        r.classList.remove('connection-selecting');
      });
      
      // Bu rack'i seçili olarak işaretle
      rack.classList.add('connection-selecting');
      
      // Bağlantı noktası modalını göster
      if (window.modalManagerInstance) {
        window.modalManagerInstance.showConnectionPointModal(rack);
      }
    });
    
    // Rack içi bilgi etiketi
    const rackInfo = document.createElement('div');
    rackInfo.className = 'rack-info';
    const hucreSirasi = this.hucreIndex + 1; // 0 -> 1, 1 -> 2, 2 -> 3
    
    // Rack ID oluştur
    const defaultRackId = `R${hucreSirasi}-${rackSatir}${rackSutun}`;
    
    // LocalStorage'dan özel isim kontrolü
    const customNameKey = `rack-custom-name-${hucreSirasi}-${rackSatir}${rackSutun}`;
    const customName = localStorage.getItem(customNameKey);
    
    // Rack ID'sini göster (özel isim varsa onu göster)
    const displayName = customName || defaultRackId;
    rackInfo.innerHTML = `<span class="rack-id" data-default-id="${defaultRackId}">${displayName}</span>`;
    
    // Rack ID'ye tıklama olayını engelle ve çift tıklama ile düzenleme özelliği ekle
    const rackId = rackInfo.querySelector('.rack-id');
    rackId.addEventListener('click', (event) => {
      event.stopPropagation(); // Rack tıklama olayını engelle
    });
    
    rackInfo.addEventListener('dblclick', (event) => {
      event.stopPropagation(); // Rack tıklama olayını engelle
      showRackNameEditModal(rack);
    });
    
    rack.appendChild(rackInfo);
    
    // Endpoint halkası ekle
    const endpoint = document.createElement('div');
    endpoint.className = 'rack-endpoint';
    // Endpoint ID'si tanımla - ardışık numara kullan
    const endpointNumber = Hucre.endpointCounter++;
    const endpointId = `EP-${endpointNumber}`;
    endpoint.id = endpointId;
    endpoint.setAttribute('data-endpoint-id', endpointId);
    endpoint.setAttribute('data-endpoint-number', endpointNumber);
    // Rack ID'sini endpoint'e bağla
    endpoint.setAttribute('data-rack-id', defaultRackId);
    // Endpoint numarasını görsel olarak göster
    endpoint.innerHTML = `<span class="endpoint-number">${endpointNumber}</span>`;
    // Endpoint tıklama olayını RackManager sınıfı yönetecek
    rack.appendChild(endpoint);
    
    // Ayar butonu ekle
    const settingsButton = document.createElement('button');
    settingsButton.className = 'rack-settings-btn';
    settingsButton.innerHTML = '<i class="fas fa-cog"></i>';
    settingsButton.title = 'Rack Ayarları';
    settingsButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Rack tıklama olayını engelle
      showRackPartsModal(rack); // window. öneki kaldırıldı
    });
    rack.appendChild(settingsButton);
    
    // R1-92 ve R1-102 rack'leri için kapı simgesi ekle
    if (hucreSirasi === 1 && ((rackSatir === 9 && rackSutun === 2) || (rackSatir === 10 && rackSutun === 2))) {
      this.addDoorIcon(rack, rackGrid);
    }
    
    rackGrid.appendChild(rack);
    return rack;
  }

  /**
   * Kapı simgesi ekler
   * @param {HTMLElement} rack - Kapının ekleneceği rack elementi
   * @param {HTMLElement} rackGrid - Rack grid elementi
   */
  addDoorIcon(rack, rackGrid) {
    // Eğer daha önce kapı eklenmişse, tekrar ekleme
    if (rackGrid.querySelector('.door-icon')) return;
    
    const doorIcon = document.createElement('div');
    doorIcon.className = 'door-icon';
    doorIcon.title = 'Giriş Kapısı';
    
    // Kapıyı rack'in altına ekle
    rack.appendChild(doorIcon);
  }
}

// Statik endpoint sayacını sıfırla
Hucre.endpointCounter = 1;
