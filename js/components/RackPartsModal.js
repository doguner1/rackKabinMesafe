/**
 * Rack parçaları modal sınıfı
 * @class RackPartsModal
 * @extends BaseModal
 */
class RackPartsModal extends BaseModal {
  /**
   * Rack parçaları modalını başlatır
   */
  constructor() {
    super('rack-parts-modal');
    this.init();
    this.selectedDevice = null;
    this.deviceList = [];
    this.currentRack = null; // Şu anda açık olan rack'i saklamak için
    this.currentRackId = null; // Şu anda açık olan rack'in ID'si
  }

  /**
   * Başlangıç ayarlarını yapar
   */
  init() {
    this.setupCloseButton();
    this.setupSaveButton();
    // Tab butonları ve cihaz butonları showForRack metodunda ayarlanacak
    // this.setupDeviceButtons();
    // this.setupTabButtons();
  }

  /**
   * Kaydet düğmesini ayarlar
   */
  setupSaveButton() {
    document.getElementById('save-rack-parts').addEventListener('click', () => {
      // Eğer currentRack yoksa, işlemi durdur
      if (!this.currentRack) {
        console.error('Kaydetme işlemi için geçerli bir rack bulunamadı!');
        return;
      }
      const currentRack = this.currentRack;
      
      // Seçilen bölümlere göre mesafe eklemesi yapılacak
      let additionalDistance = 0;
      let selectedParts = {
        top: false,    // 1-15 arası
        middle: false, // 16-30 arası
        bottom: false  // 31-45 arası
      };
      
      document.querySelectorAll('.rack-part').forEach(part => {
        const uValue = parseInt(part.dataset.u);
        const state = part.classList.contains('filled') ? 'filled' : 'empty';
        const input = part.querySelector('.rack-part-label-input');
        const label = input ? input.value.trim() : '';
        const deviceId = part.dataset.deviceId || '';
        
        // Dolu parçaları kontrol et ve bölgeleri belirle
        if (state === 'filled') {
          if (uValue >= 1 && uValue <= 15) {
            selectedParts.top = true;
          } else if (uValue >= 16 && uValue <= 30) {
            selectedParts.middle = true;
          } else if (uValue >= 31 && uValue <= 45) {
            selectedParts.bottom = true;
          }
        }
        
        currentRack.setAttribute(`data-part-${uValue}`, state);
        if (label) {
          currentRack.setAttribute(`data-part-label-${uValue}`, label);
        } else {
          currentRack.removeAttribute(`data-part-label-${uValue}`);
        }
        
        if (deviceId) {
          currentRack.setAttribute(`data-part-device-${uValue}`, deviceId);
        } else {
          currentRack.removeAttribute(`data-part-device-${uValue}`);
        }
        
        // Tutarlılık için sınıf değişkenindeki ID'yi kullan
        const storageKey = `${this.currentRackId}-part-${uValue}`;
        
        console.log(`Parça ${uValue} kaydediliyor: ${storageKey}`, { state, label, deviceId });
        
        try {
          localStorage.setItem(storageKey, JSON.stringify({
            state: state,
            label: label,
            deviceId: deviceId
          }));
        } catch (error) {
          console.error(`${storageKey} için localStorage kayıt hatası:`, error);
        }
      });
      
      // Cihazları kaydet - tutarlılık için sınıf değişkenindeki ID'yi kullan
      console.log(`Cihaz listesi kaydediliyor: ${this.currentRackId}-devices`, this.deviceList);
      
      try {
        localStorage.setItem(`${this.currentRackId}-devices`, JSON.stringify(this.deviceList));
      } catch (error) {
        console.error(`${this.currentRackId}-devices için localStorage kayıt hatası:`, error);
      }
      
      // Kullanıcıya bilgi ver
      alert('Rack parçaları başarıyla kaydedildi.');
      
      // Seçilen bölgelere göre mesafe ekle
      if (selectedParts.top) additionalDistance += 100; // Üst bölüm: 1 metre (100 cm)
      if (selectedParts.middle) additionalDistance += 200; // Orta bölüm: 2 metre (200 cm)
      if (selectedParts.bottom) additionalDistance += 300; // Alt bölüm: 3 metre (300 cm)
      
      // RackManager'a seçilen rack'i ve ek mesafeyi bildir
      if (window.rackManagerInstance) {
        currentRack.setAttribute('data-additional-distance', additionalDistance);
        window.rackManagerInstance.calculateTotalDistance(); // Toplam mesafeyi yeniden hesapla
        window.rackManagerInstance.updateDistanceDisplay(); // Mesafe göstergesini güncelle
      }
      
      this.hide();
    });
  }

  /**
   * Cihaz ekleme ve yönetim düğmelerini ayarlar
   */
  setupDeviceButtons() {
    console.log('setupDeviceButtons çağrıldı');
    // Cihaz ekleme butonu
    const addDeviceBtn = document.getElementById('add-device-btn');
    console.log('Cihaz ekleme butonu:', addDeviceBtn);
    
    if (!addDeviceBtn) {
      console.error('Cihaz ekle butonu bulunamadı!');
      return;
    }
    
    // Önceki event listener'ları temizle
    addDeviceBtn.onclick = null;
    
    // Yeni event listener ekle
    addDeviceBtn.onclick = (e) => {
      e.preventDefault();
      console.log('Cihaz ekleme butonu tıklandı');
      
      const deviceName = document.getElementById('device-name').value.trim();
      const deviceSize = parseInt(document.getElementById('device-size').value);
      console.log('Cihaz adı:', deviceName, 'Cihaz boyutu:', deviceSize);
      
      if (!deviceName || isNaN(deviceSize) || deviceSize < 1 || deviceSize > 45) {
        alert('Lütfen geçerli bir cihaz adı ve boyutu girin (1-45 arası)');
        return;
      }
      
      // Seçili U parçalarını kontrol et
      const selectedParts = Array.from(document.querySelectorAll('.rack-part.selected'));
      
      if (selectedParts.length === 0) {
        alert('Lütfen cihazı yerleştirmek için en az bir U parçası seçin');
        return;
      }
      
      if (selectedParts.length !== deviceSize) {
        alert(`Seçilen U sayısı (${selectedParts.length}) ile cihaz boyutu (${deviceSize}U) eşleşmiyor`);
        return;
      }
      
      // Seçilen parçaların ardışık olup olmadığını kontrol et
      const uValues = selectedParts.map(part => parseInt(part.dataset.u)).sort((a, b) => a - b);
      for (let i = 1; i < uValues.length; i++) {
        if (uValues[i] !== uValues[i-1] + 1) {
          alert('Seçilen U parçaları ardışık olmalıdır');
          return;
        }
      }
      
      // Yeni cihaz oluştur
      const deviceId = `device-${Date.now()}`;
      const device = {
        id: deviceId,
        name: deviceName,
        size: deviceSize,
        uStart: uValues[0],
        uEnd: uValues[uValues.length - 1],
        color: this.getRandomColor()
      };
      
      // Cihazı listeye ekle
      this.deviceList.push(device);
      
      // Seçilen parçaları güncelle
      selectedParts.forEach((part, index) => {
        part.classList.remove('selected');
        part.classList.remove('empty');
        part.classList.add('filled');
        part.dataset.deviceId = deviceId;
        part.style.backgroundColor = device.color;
        
        // Cihaz adını sadece ortadaki parçada göster, diğerlerinde U değerlerini gizle
        const uValue = parseInt(part.dataset.u);
        if (index === Math.floor(selectedParts.length / 2)) {
          // Ortadaki parçada sadece cihaz adını göster
          part.textContent = deviceName;
        } else {
          // Diğer parçalarda hiçbir şey gösterme
          part.textContent = '';
        }
        
        // Cihaz bilgilerini güncelle
        if (index === 0) {
          device.uStart = uValue;
        }
        if (index === selectedParts.length - 1) {
          device.uEnd = uValue;
        }
        
        // Etiket input'unu tekrar ekle
        const input = part.querySelector('.rack-part-label-input') || document.createElement('input');
        input.type = 'text';
        input.className = 'rack-part-label-input';
        input.value = '';
        input.maxLength = 20;
        input.placeholder = 'Açıklama girin';
        part.appendChild(input);
      });
      
      // Cihaz listesini güncelle
      this.updateDeviceList();
      
      // Formu temizle
      document.getElementById('device-name').value = '';
      document.getElementById('device-size').value = '';
    };
  }
  
  /**
   * Rastgele bir renk döndürür
   * @returns {string} - Hex renk kodu
   */
  getRandomColor() {
    const colors = [
      '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
      '#1abc9c', '#d35400', '#c0392b', '#16a085', '#8e44ad',
      '#27ae60', '#2980b9', '#f1c40f', '#e67e22', '#34495e'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  /**
   * Cihaz listesini günceller
   */
  updateDeviceList() {
    const deviceListElement = document.getElementById('device-list');
    deviceListElement.innerHTML = '';
    
    if (this.deviceList.length === 0) {
      deviceListElement.innerHTML = '<p class="no-devices">Henüz cihaz eklenmemiş</p>';
      return;
    }
    
    // Cihaz listesini localStorage'a kaydet
    try {
      localStorage.setItem(`${this.currentRackId}-devices`, JSON.stringify(this.deviceList));
    } catch (error) {
      console.error(`${this.currentRackId}-devices için localStorage kayıt hatası:`, error);
    }
    
    this.deviceList.forEach(device => {
      const deviceElement = document.createElement('div');
      deviceElement.className = 'device-item';
      deviceElement.innerHTML = `
        <div class="device-color" style="background-color: ${device.color}"></div>
        <div class="device-info">
          <div class="device-name">${device.name}</div>
          <div class="device-details">${device.size}U (${device.uStart}-${device.uEnd})</div>
        </div>
        <div class="device-actions">
          <button class="device-edit-btn" data-device-id="${device.id}"><i class="fas fa-edit"></i></button>
          <button class="device-delete-btn" data-device-id="${device.id}"><i class="fas fa-trash"></i></button>
        </div>
      `;
      
      // Düzenleme butonu
      deviceElement.querySelector('.device-edit-btn').addEventListener('click', () => {
        this.editDevice(device.id);
      });
      
      // Silme butonu
      deviceElement.querySelector('.device-delete-btn').addEventListener('click', () => {
        this.deleteDevice(device.id);
      });
      
      deviceListElement.appendChild(deviceElement);
    });
  }
  
  /**
   * Cihaz düzenleme
   * @param {string} deviceId - Düzenlenecek cihazın ID'si
   */
  editDevice(deviceId) {
    const device = this.deviceList.find(d => d.id === deviceId);
    if (!device) return;
    
    // Formu doldur
    document.getElementById('device-name').value = device.name;
    document.getElementById('device-size').value = device.size;
    
    // Eski cihazı kaldır
    this.deleteDevice(deviceId, false);
    
    // Kullanıcıya mesaj göster
    alert(`"${device.name}" cihazını düzenlemek için yeni konumunu seçin ve Ekle butonuna tıklayın`);
  }
  
  /**
   * Cihaz silme
   * @param {string} deviceId - Silinecek cihazın ID'si
   * @param {boolean} updateList - Cihaz listesini güncelle
   */
  deleteDevice(deviceId, updateList = true) {
    // Cihazı listeden kaldır
    this.deviceList = this.deviceList.filter(d => d.id !== deviceId);
    
    // İlgili rack parçalarını temizle
    document.querySelectorAll(`.rack-part[data-device-id="${deviceId}"]`).forEach(part => {
      part.classList.remove('filled');
      part.classList.add('empty');
      part.style.backgroundColor = '';
      delete part.dataset.deviceId;
      
      // U değerlerini tekrar göster
      const uValue = parseInt(part.dataset.u);
      part.textContent = `${uValue}U`;
      
      // Etiket input'unu tekrar ekle
      const input = part.querySelector('.rack-part-label-input') || document.createElement('input');
      input.type = 'text';
      input.className = 'rack-part-label-input';
      input.value = '';
      input.maxLength = 20;
      input.placeholder = 'Açıklama girin';
      part.appendChild(input);
      
      // LocalStorage'dan cihaz bilgisini temizle
      const storageKey = `${this.currentRackId}-part-${uValue}`;
      try {
        const storageData = localStorage.getItem(storageKey);
        if (storageData) {
          const parsedData = JSON.parse(storageData);
          parsedData.deviceId = '';
          localStorage.setItem(storageKey, JSON.stringify(parsedData));
        }
      } catch (error) {
        console.error(`${storageKey} için localStorage güncelleme hatası:`, error);
      }
      
      // Rack elementinden cihaz bilgisini temizle
      if (this.currentRack) {
        this.currentRack.removeAttribute(`data-part-device-${uValue}`);
      }
    });
    
    if (updateList) {
      this.updateDeviceList();
    }
  }

  /**
   * Tab butonlarını ayarlar
   */
  setupTabButtons() {
    console.log('setupTabButtons çağrıldı');
    const tabButtons = document.querySelectorAll('#rack-parts-modal .tab-btn');
    const tabContents = document.querySelectorAll('#rack-parts-modal .tab-content');

    console.log('Tab butonları:', tabButtons.length);
    console.log('Tab içerikleri:', tabContents.length);

    tabButtons.forEach(button => {
      // Önceki event listener'ları temizle
      button.onclick = null;
      
      // Yeni event listener ekle
      button.onclick = (e) => {
        e.preventDefault();
        const tabId = button.getAttribute('data-tab');
        console.log('Tab butonu tıklandı:', tabId);
        
        // Aktif tab butonunu değiştir
        document.querySelectorAll('#rack-parts-modal .tab-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // İlgili içeriği göster
        tabContents.forEach(content => {
          if (content.id === tabId) {
            content.style.display = 'block';
            console.log(`${tabId} içeriği gösterildi`);
          } else {
            content.style.display = 'none';
            console.log(`${content.id} içeriği gizlendi`);
          }
        });

        // Cihaz ekleme modunda ise seçili parçaları temizle
        if (tabId === 'device-tab') {
          document.querySelectorAll('.rack-part.selected').forEach(part => {
            part.classList.remove('selected');
          });
          console.log('Seçili parçalar temizlendi');
        }
      };
    });
  }

  /**
   * Rack ID'sini hesaplar
   * @param {HTMLElement} rack - Rack elementi
   * @returns {string} - Hesaplanan rack ID'si
   */
  calculateRackId(rack) {
    // Hücre bilgisini al
    const hucreler = Array.from(document.querySelectorAll('.hucre'));
    const hucre = rack.closest('.hucre');
    const hucreIndex = hucreler.indexOf(hucre);
    const hucreSatir = Math.floor(hucreIndex / 3) + 1;
    const hucreSutun = (hucreIndex % 3) + 1;
    const hucreInfo = `${hucreSatir}-${hucreSutun}`;

    // Rack pozisyonunu al
    const racks = Array.from(hucre.querySelectorAll('.rack'));
    const rackIndex = racks.indexOf(rack);
    const rackSatir = Math.floor(rackIndex / 10) + 1;
    const rackSutun = (rackIndex % 10) + 1;
    const rackPosition = `${rackSatir}-${rackSutun}`;

    return `R${hucreInfo}-${rackPosition}`;
  }

  /**
   * Belirli bir rack için modalı gösterir
   * @param {HTMLElement} rack - Parçaları gösterilecek rack elementi
   */
  showForRack(rack) {
    // Geçerli rack'i sakla
    this.currentRack = rack;
    
    // Rack ID'sini hesapla ve sakla
    this.currentRackId = this.calculateRackId(rack);
    
    console.log(`Rack parçaları yükleniyor: ${this.currentRackId}`);
    
    // Rack ID'sini kontrol et
    const rackIdElement = rack.querySelector('.rack-id');
    const defaultId = rackIdElement.getAttribute('data-default-id');
    
    if (defaultId !== this.currentRackId) {
      console.warn(`Uyarı: Hesaplanan rack ID (${this.currentRackId}) ile default ID (${defaultId}) eşleşmiyor!`);
    }
    
    document.querySelector('#rack-parts-modal h2').textContent = `${this.currentRackId} Rack Parçaları Ayarları`;
    
    // Cihaz listesini yükle
    const savedDevices = localStorage.getItem(`${this.currentRackId}-devices`);
    console.log(`Cihaz listesi yükleniyor: ${this.currentRackId}-devices`, savedDevices ? 'Veri var' : 'Veri yok');
    
    try {
      this.deviceList = savedDevices ? JSON.parse(savedDevices) : [];
      
      // Cihaz listesindeki her cihaz için başlangıç ve bitiş U değerlerini hesapla
      this.deviceList.forEach(device => {
        if (!device.uStart || !device.uEnd || !device.size) {
          // Cihazın parçalarını bul
          const deviceParts = [];
          for (let i = 1; i <= 45; i++) {
            const partKey = `${this.currentRackId}-part-${i}`;
            const partData = localStorage.getItem(partKey);
            if (partData) {
              try {
                const parsedData = JSON.parse(partData);
                if (parsedData.deviceId === device.id) {
                  deviceParts.push(i);
                }
              } catch (e) {
                console.error(`Parça verisi ayrıştırma hatası:`, e);
              }
            }
          }
          
          // Parçalar varsa, başlangıç ve bitiş U değerlerini ayarla
          if (deviceParts.length > 0) {
            deviceParts.sort((a, b) => a - b);
            device.uStart = deviceParts[0];
            device.uEnd = deviceParts[deviceParts.length - 1];
            device.size = deviceParts.length;
          }
        }
      });
    } catch (error) {
      console.error(`${this.currentRackId}-devices için JSON parse hatası:`, error);
      this.deviceList = [];
    }
    
    const rackPartsVisual = document.querySelector('.rack-parts-visual');
    rackPartsVisual.innerHTML = '';
    
    // 45 eş parçayı oluştur
    for (let i = 1; i <= 45; i++) {
      const part = document.createElement('div');
      part.className = 'rack-part';
      part.dataset.u = i;
      
      const storageKey = `${this.currentRackId}-part-${i}`;
      const storageData = localStorage.getItem(storageKey);
      console.log(`Parça ${i} yükleniyor: ${storageKey}`, storageData ? 'Veri var' : 'Veri yok');
      
      let savedState, savedLabel, savedDeviceId;
      
      if (storageData) {
        try {
          const parsedData = JSON.parse(storageData);
          savedState = parsedData.state;
          savedLabel = parsedData.label || '';
          savedDeviceId = parsedData.deviceId || '';
        } catch (error) {
          console.error(`${rackId}-part-${i} için JSON parse hatası:`, error);
          savedState = 'empty';
          savedLabel = '';
          savedDeviceId = '';
        }
        
        rack.setAttribute(`data-part-${i}`, savedState);
        if (savedLabel) {
          rack.setAttribute(`data-part-label-${i}`, savedLabel);
        } else {
          rack.removeAttribute(`data-part-label-${i}`);
        }
        
        if (savedDeviceId) {
          rack.setAttribute(`data-part-device-${i}`, savedDeviceId);
          part.dataset.deviceId = savedDeviceId;
          
          // Cihaz rengini ayarla
          const device = this.deviceList.find(d => d.id === savedDeviceId);
          if (device) {
            part.style.backgroundColor = device.color;
          }
        }
      } else {
        savedState = rack.getAttribute(`data-part-${i}`);
        savedLabel = rack.getAttribute(`data-part-label-${i}`) || '';
        savedDeviceId = rack.getAttribute(`data-part-device-${i}`) || '';
        
        if (savedState) {
          localStorage.setItem(storageKey, JSON.stringify({
            state: savedState,
            label: savedLabel,
            deviceId: savedDeviceId
          }));
        }
      }
      
      // Eğer bir cihaza ait parça ise ve cihaz listesinde varsa
      if (savedDeviceId) {
        const device = this.deviceList.find(d => d.id === savedDeviceId);
        if (device) {
          // Cihaz rengini ayarla
          part.style.backgroundColor = device.color;
          
          // Cihazın boyutunu hesapla
          const deviceSize = device.size || 1;
          
          // Cihazın başlangıç U değerini bul
          const deviceStartU = device.uStart || i;
          
          // Parçanın cihaz içindeki pozisyonunu hesapla
          const partPosition = i - deviceStartU;
          
          // Ortadaki parçada cihaz adını göster, diğerlerinde hiçbir şey gösterme
          if (partPosition === Math.floor(deviceSize / 2)) {
            part.textContent = device.name;
          } else {
            part.textContent = '';
          }
        } else {
          part.textContent = savedLabel ? `${i}U: ${savedLabel}` : `${i}U`;
        }
      } else {
        part.textContent = savedLabel ? `${i}U: ${savedLabel}` : `${i}U`;
      }
      
      if (savedState === 'filled') {
        part.classList.add('filled');
      } else {
        part.classList.add('empty');
      }
      
      const labelInput = document.createElement('input');
      labelInput.type = 'text';
      labelInput.className = 'rack-part-label-input';
      labelInput.value = savedLabel;
      labelInput.maxLength = 20;
      labelInput.placeholder = 'Açıklama girin';
      part.appendChild(labelInput);
      
      // Event listeners
      part.addEventListener('click', (e) => {
        if (part.classList.contains('editing')) return;
        
        // Cihaz ekleme modunda ise seçim yap
        if (document.getElementById('device-size').value) {
          if (part.classList.contains('selected')) {
            part.classList.remove('selected');
          } else {
            part.classList.add('selected');
          }
          return;
        }
        
        // Normal mod - dolu/boş durumunu değiştir
        // Ctrl tuşuna basılıysa çoklu seçim modunda
        const isMultiSelect = e.ctrlKey || e.metaKey;
        
        // Eğer bir cihaza ait parça ise, cihazın tüm parçalarını seç
        if (part.dataset.deviceId) {
          const deviceId = part.dataset.deviceId;
          const device = this.deviceList.find(d => d.id === deviceId);
          
          if (device) {
            // P.P ile başlayan cihaz isimlerine tıklandığında Patch Panel Modal'ı aç
            if (device.name.startsWith("P.P")) {
              // Patch Panel Modal'ı aç
              if (typeof patchPanelModal !== 'undefined') {
                patchPanelModal.currentDeviceId = device.id;
                patchPanelModal.showForDevice(device);
              }
              return;
            }
            
            // Cihaz ekle ile eklenmiş cihazlara tıklama engeli
            // Cihaz ekle ile eklenen cihazlar deviceList'te bulunur
            // Bu cihazlara tıklandığında hiçbir işlem yapma
            return;
          }
        }
        
        if (part.classList.contains('filled')) {
          part.classList.remove('filled');
          part.classList.add('empty');
        } else {
          part.classList.remove('empty');
          part.classList.add('filled');
          
          // Çoklu seçim modunda ve bir etiket girilmişse, aynı etiketi diğer seçili parçalara da uygula
          if (isMultiSelect) {
            const input = part.querySelector('.rack-part-label-input');
            const label = input ? input.value.trim() : '';
            
            // Etiket girme modalını göster
            if (!label) {
              part.classList.add('editing');
              input.focus();
            }
          }
        }
      });
      
      // Shift tuşu ile aralık seçimi
      part.addEventListener('mousedown', (e) => {
        if (e.shiftKey) {
          e.preventDefault();
          
          // Son tıklanan parçayı bul
          const allParts = Array.from(document.querySelectorAll('.rack-part'));
          const lastClickedPart = allParts.find(p => p.classList.contains('last-clicked'));
          
          if (lastClickedPart) {
            const startIndex = allParts.indexOf(lastClickedPart);
            const endIndex = allParts.indexOf(part);
            
            // Aralıktaki tüm parçaları seç
            const start = Math.min(startIndex, endIndex);
            const end = Math.max(startIndex, endIndex);
            
            // Cihaz ekleme modunda ise seçim yap
            if (document.getElementById('device-size').value) {
              for (let i = start; i <= end; i++) {
                allParts[i].classList.add('selected');
              }
            } else {
              for (let i = start; i <= end; i++) {
                allParts[i].classList.remove('empty');
                allParts[i].classList.add('filled');
              }
            }
          }
        } else {
          // Normal tıklama - son tıklanan parçayı işaretle
          document.querySelectorAll('.rack-part').forEach(p => {
            p.classList.remove('last-clicked');
          });
          part.classList.add('last-clicked');
        }
      });
      
      part.addEventListener('dblclick', (e) => {
        // Cihaz ekleme modunda ise çift tıklama işlemini engelle
        if (document.getElementById('device-size').value) return;
        
        e.stopPropagation();
        part.classList.add('editing');
        labelInput.focus();
      });
      
      labelInput.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      labelInput.addEventListener('blur', () => {
        this.finishEditing(part, labelInput, i);
      });
      
      labelInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.finishEditing(part, labelInput, i);
        }
      });
      
      rackPartsVisual.appendChild(part);
    }
    
    // Cihaz listesini güncelle
    this.updateDeviceList();
    
    // Önce modalı göster
    this.show();
    
    // Modal gösterildikten sonra butonları ayarla
    setTimeout(() => {
      console.log('Modal gösterildi, butonlar ayarlanıyor...');
      this.setupTabButtons();
      this.setupDeviceButtons();
    }, 100);
  }

  /**
   * Etiket düzenlemeyi tamamlar
   * @param {HTMLElement} part - Rack parçası elementi
   * @param {HTMLInputElement} input - Etiket giriş alanı
   * @param {number} index - Parça indeksi
   */
  finishEditing(part, input, index) {
    const label = input.value.trim();
    part.classList.remove('editing');
    
    // Etiket değiştiğinde, aynı etiketi diğer seçili parçalara da uygula
    if (label) {
      // Ctrl veya Shift ile seçilmiş diğer parçaları bul
      const selectedParts = Array.from(document.querySelectorAll('.rack-part.filled'));
      const consecutiveGroups = this.findConsecutiveGroups(selectedParts);
      
      // Aynı etikete sahip ardışık parçaları grupla
      for (const group of consecutiveGroups) {
        if (group.includes(part)) {
          // Bu parçanın bulunduğu gruba aynı etiketi uygula
          group.forEach((selectedPart, i) => {
            const selectedIndex = parseInt(selectedPart.dataset.u);
            const selectedInput = selectedPart.querySelector('.rack-part-label-input');
            
            // Etiketi güncelle
            selectedInput.value = label;
            
            // İlk parça için normal etiket göster
            if (i === 0) {
              selectedPart.textContent = `${selectedIndex}U: ${label}`;
              selectedPart.classList.add('group-start');
            } 
            // Son parça için sadece U değerini göster
            else if (i === group.length - 1) {
              selectedPart.textContent = `${selectedIndex}U`;
              selectedPart.classList.add('group-end');
            } 
            // Ortadaki parçalar için sadece U değerini göster
            else {
              selectedPart.textContent = `${selectedIndex}U`;
              selectedPart.classList.add('group-middle');
            }
            
            selectedPart.appendChild(selectedInput);
          });
          
          // Diğer grupları aramaya gerek yok
          break;
        }
      }
    } else {
      // Etiket yoksa normal davranış
      part.textContent = `${index}U`;
      part.appendChild(input);
    }
  }
  
  /**
   * Ardışık rack parçalarını gruplar
   * @param {Array} parts - Rack parçaları
   * @returns {Array} - Ardışık parça grupları
   */
  findConsecutiveGroups(parts) {
    if (!parts || parts.length === 0) return [];
    
    // Parçaları U değerine göre sırala
    const sortedParts = [...parts].sort((a, b) => {
      return parseInt(a.dataset.u) - parseInt(b.dataset.u);
    });
    
    const groups = [];
    let currentGroup = [sortedParts[0]];
    
    // Ardışık parçaları grupla
    for (let i = 1; i < sortedParts.length; i++) {
      const currentU = parseInt(sortedParts[i-1].dataset.u);
      const nextU = parseInt(sortedParts[i].dataset.u);
      
      // Eğer ardışıksa aynı gruba ekle
      if (nextU === currentU + 1) {
        currentGroup.push(sortedParts[i]);
      } else {
        // Ardışık değilse yeni grup başlat
        groups.push(currentGroup);
        currentGroup = [sortedParts[i]];
      }
    }
    
    // Son grubu ekle
    groups.push(currentGroup);
    
    return groups;
  }
}
