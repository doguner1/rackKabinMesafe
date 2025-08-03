/**
 * Rack parçaları modal sınıfı
 * @class RackPartsModal
 */
class RackPartsModal extends BaseModal {
  /**
   * @param {string} modalId - Modal element ID'si
   */
  constructor(modalId = 'rack-parts-modal') {
    super(modalId);
    this.selectedDevice = null; // Seçilen cihaz
    this.deviceList = []; // Cihaz listesi
    this.init();
  }

  /**
   * Modal işlevselliğini başlatır
   */
  init() {
    this.setupSaveButton();
    // Tab butonları ve cihaz butonları showForRack metodunda ayarlanacak
  }

  /**
   * Tab butonlarını ayarlar
   */
  setupTabButtons() {
    const tabButtons = this.modal.querySelectorAll('.tab-btn');
    const tabContents = this.modal.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
      // Önceki event listener'ları temizle
      button.onclick = null;
      
      // Yeni event listener ekle
      button.onclick = (e) => {
        // Aktif sekme butonunu değiştir
        this.modal.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // İlgili içeriği göster
        const tabId = button.getAttribute('data-tab');
        
        this.modal.querySelectorAll('.tab-content').forEach(content => {
          content.style.display = content.id === tabId ? 'block' : 'none';
        });
        
        // Cihaz ekleme modunda ise seçili parçaları temizle
        if (tabId === 'device-tab') {
          this.modal.querySelectorAll('.rack-part.selected').forEach(part => {
            part.classList.remove('selected');
          });
        }
      };
    });
  }

  /**
   * Cihaz butonlarını ayarlar
   */
  setupDeviceButtons() {
    // Cihaz ekleme butonu
    const addDeviceBtn = this.modal.querySelector('#add-device-btn');
    
    if (!addDeviceBtn) {
      console.error('Cihaz ekle butonu bulunamadı!');
      return;
    }
    
    // Önceki event listener'ları temizle
    addDeviceBtn.onclick = null;
    
    // Yeni event listener ekle
    addDeviceBtn.onclick = (e) => {
      e.preventDefault();
      const deviceNameInput = this.modal.querySelector('#device-name');
      const deviceSizeInput = this.modal.querySelector('#device-size');
      
      if (!deviceNameInput || !deviceSizeInput) {
        console.error('Cihaz adı veya boyutu input alanları bulunamadı!');
        return;
      }
      
      const deviceName = deviceNameInput.value.trim();
      const deviceSize = parseInt(deviceSizeInput.value);
      
      // Validasyon
      if (!deviceName) {
        alert('Lütfen bir cihaz adı girin.');
        return;
      }
      
      if (!deviceSize || deviceSize < 1 || deviceSize > 45) {
        alert('Lütfen geçerli bir cihaz boyutu girin (1-45 arası).');
        return;
      }
      
      // Seçili parçaları kontrol et
      const selectedParts = document.querySelectorAll('.rack-part.selected');
      
      if (selectedParts.length !== deviceSize) {
        alert(`Lütfen tam olarak ${deviceSize} adet U parçası seçin.`);
        return;
      }
      
      // Seçili parçaların ardışık olup olmadığını kontrol et
      const selectedUValues = Array.from(selectedParts).map(part => parseInt(part.dataset.u)).sort((a, b) => a - b);
      
      for (let i = 1; i < selectedUValues.length; i++) {
        if (selectedUValues[i] !== selectedUValues[i-1] + 1) {
          alert('Seçilen U parçaları ardışık olmalıdır.');
          return;
        }
      }
      
      // Düzenleme modunda mı?
      if (this.selectedDevice) {
        // Eski cihazı kaldır
        this.deleteDevice(this.selectedDevice.id, false);
      }
      
      // Yeni cihaz oluştur
      const deviceId = this.selectedDevice ? this.selectedDevice.id : Date.now().toString();
      const deviceColor = this.selectedDevice ? this.selectedDevice.color : this.getRandomColor();
      
      const device = {
        id: deviceId,
        name: deviceName,
        size: deviceSize,
        uRange: {
          start: selectedUValues[0],
          end: selectedUValues[selectedUValues.length - 1]
        },
        color: deviceColor
      };
      
      // Seçili parçaları güncelle
      selectedParts.forEach(part => {
        part.classList.remove('selected');
        part.classList.remove('empty');
        part.classList.add('filled');
        part.dataset.deviceId = deviceId;
        part.style.backgroundColor = deviceColor;
      });
      
      // Cihaz listesine ekle
      if (!this.selectedDevice) {
        this.deviceList.push(device);
      } else {
        // Düzenleme modunda, cihazı güncelle
        const index = this.deviceList.findIndex(d => d.id === deviceId);
        if (index !== -1) {
          this.deviceList[index] = device;
        } else {
          this.deviceList.push(device);
        }
        this.selectedDevice = null;
      }
      
      // Formu temizle
      document.getElementById('device-name').value = '';
      document.getElementById('device-size').value = '';
      
      // Cihaz listesini güncelle
      this.updateDeviceList();
    };
  }

  /**
   * Rastgele renk oluşturur
   * @returns {string} - Hex renk kodu
   */
  getRandomColor() {
    const colors = [
      '#3498db', // Mavi
      '#2ecc71', // Yeşil
      '#e74c3c', // Kırmızı
      '#f39c12', // Turuncu
      '#9b59b6', // Mor
      '#1abc9c', // Turkuaz
      '#d35400', // Koyu Turuncu
      '#c0392b', // Koyu Kırmızı
      '#16a085', // Koyu Turkuaz
      '#8e44ad', // Koyu Mor
      '#27ae60', // Koyu Yeşil
      '#2980b9', // Koyu Mavi
      '#f1c40f', // Sarı
      '#7f8c8d', // Gri
      '#34495e'  // Lacivert
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
      deviceListElement.innerHTML = '<div class="empty-device-list">Henüz cihaz eklenmemiş</div>';
      return;
    }
    
    this.deviceList.forEach(device => {
      const deviceItem = document.createElement('div');
      deviceItem.className = 'device-item';
      deviceItem.dataset.deviceId = device.id;
      
      deviceItem.innerHTML = `
        <div class="device-color" style="background-color: ${device.color}"></div>
        <div class="device-info">
          <div class="device-name">${device.name}</div>
          <div class="device-size">${device.size}U (${device.uRange.start}-${device.uRange.end})</div>
        </div>
        <div class="device-actions">
          <button class="edit-device-btn" title="Düzenle"><i class="fas fa-edit"></i></button>
          <button class="delete-device-btn" title="Sil"><i class="fas fa-trash-alt"></i></button>
        </div>
      `;
      
      // Düzenleme butonu
      deviceItem.querySelector('.edit-device-btn').addEventListener('click', () => {
        this.editDevice(device.id);
      });
      
      // Silme butonu
      deviceItem.querySelector('.delete-device-btn').addEventListener('click', () => {
        this.deleteDevice(device.id);
      });
      
      deviceListElement.appendChild(deviceItem);
    });
  }

  /**
   * Cihazı düzenler
   * @param {string} deviceId - Cihaz ID'si
   */
  editDevice(deviceId) {
    const device = this.deviceList.find(d => d.id === deviceId);
    if (!device) return;
    
    // Cihaz bilgilerini forma doldur
    document.getElementById('device-name').value = device.name;
    document.getElementById('device-size').value = device.size;
    
    // Cihazın U parçalarını seç
    document.querySelectorAll('.rack-part').forEach(part => {
      const uValue = parseInt(part.dataset.u);
      if (uValue >= device.uRange.start && uValue <= device.uRange.end) {
        part.classList.add('selected');
      }
    });
    
    // Cihazı seçili olarak işaretle
    this.selectedDevice = device;
    
    // Cihaz sekmesine geç
    document.querySelector('.tab-btn[data-tab="device-tab"]').click();
  }

  /**
   * Cihazı siler
   * @param {string} deviceId - Cihaz ID'si
   * @param {boolean} updateList - Cihaz listesini güncelle
   */
  deleteDevice(deviceId, updateList = true) {
    // Cihazın U parçalarını temizle
    document.querySelectorAll(`.rack-part[data-device-id="${deviceId}"]`).forEach(part => {
      part.classList.remove('filled');
      part.classList.add('empty');
      part.removeAttribute('data-device-id');
      part.style.backgroundColor = '';
    });
    
    // Cihazı listeden kaldır
    this.deviceList = this.deviceList.filter(d => d.id !== deviceId);
    
    // Cihaz listesini güncelle
    if (updateList) {
      this.updateDeviceList();
    }
  }

  /**
   * Kaydet butonunu ayarlar
   */
  setupSaveButton() {
    document.getElementById('save-rack-parts').addEventListener('click', () => {
      const currentRack = document.querySelector('.rack.selected');
      if (!currentRack) return;
      
      // Seçilen bölümlere göre mesafe eklemesi yapılacak
      let additionalDistance = 0;
      
      document.querySelectorAll('.rack-part').forEach(part => {
        const uValue = parseInt(part.dataset.u);
        const state = part.classList.contains('filled') ? 'filled' : 'empty';
        const input = part.querySelector('.rack-part-label-input');
        const label = input ? input.value.trim() : '';
        const deviceId = part.dataset.deviceId || '';
        
        // Rack'in data attribute'larını güncelle
        currentRack.setAttribute(`data-part-${uValue}`, state);
        if (label) {
          currentRack.setAttribute(`data-part-label-${uValue}`, label);
        } else {
          currentRack.removeAttribute(`data-part-label-${uValue}`);
        }
        
        // LocalStorage'a kaydet
        const rackId = currentRack.querySelector('.rack-id').getAttribute('data-default-id');
        const storageKey = `${rackId}-part-${uValue}`;
        localStorage.setItem(storageKey, JSON.stringify({
          state: state,
          label: label,
          deviceId: deviceId
        }));
      });
      
      // Cihaz listesini kaydet
      const rackId = currentRack.querySelector('.rack-id').getAttribute('data-default-id');
      localStorage.setItem(`${rackId}-devices`, JSON.stringify(this.deviceList));
      
      this.hide();
    });
  }

  /**
   * Rack parçaları modalını gösterir
   * @param {HTMLElement} rack - Parçaları gösterilecek rack elementi
   */
  showForRack(rack) {
    // Hücre bilgisini al
    function getHucreInfo(rack) {
      const hucreler = Array.from(document.querySelectorAll('.hucre'));
      const hucre = rack.closest('.hucre');
      const index = hucreler.indexOf(hucre);
      const satir = Math.floor(index / 3) + 1;
      const sutun = (index % 3) + 1;
      return `${satir}-${sutun}`;
    }

    // Rack pozisyonunu al
    function getRackPosition(rack) {
      const racks = Array.from(rack.closest('.hucre').querySelectorAll('.rack'));
      const index = racks.indexOf(rack);
      const satir = Math.floor(index / 10) + 1;
      const sutun = (index % 10) + 1;
      return `${satir}-${sutun}`;
    }

    const hucreInfo = getHucreInfo(rack);
    const rackPosition = getRackPosition(rack);
    const rackId = `R${hucreInfo}-${rackPosition}`;
    
    document.querySelector('#rack-parts-modal h2').textContent = `${rackId} Rack Parçaları Ayarları`;
    
    const rackPartsVisual = document.querySelector('.rack-parts-visual');
    rackPartsVisual.innerHTML = '';
    
    // Cihaz listesini yükle
    const savedDevicesData = localStorage.getItem(`${rackId}-devices`);
    this.deviceList = savedDevicesData ? JSON.parse(savedDevicesData) : [];
    
    // Cihaz listesini güncelle
    this.updateDeviceList();
    
    // 45 eş parçayı oluştur
    for (let i = 1; i <= 45; i++) {
      const part = document.createElement('div');
      part.className = 'rack-part';
      part.dataset.u = i;
      
      const storageKey = `${rackId}-part-${i}`;
      const storageData = localStorage.getItem(storageKey);
      let savedState, savedLabel, savedDeviceId;
      
      if (storageData) {
        const parsedData = JSON.parse(storageData);
        savedState = parsedData.state;
        savedLabel = parsedData.label || '';
        savedDeviceId = parsedData.deviceId || '';
        
        rack.setAttribute(`data-part-${i}`, savedState);
        if (savedLabel) {
          rack.setAttribute(`data-part-label-${i}`, savedLabel);
        } else {
          rack.removeAttribute(`data-part-label-${i}`);
        }
        
        if (savedDeviceId) {
          part.dataset.deviceId = savedDeviceId;
          const device = this.deviceList.find(d => d.id === savedDeviceId);
          if (device) {
            part.style.backgroundColor = device.color;
          }
        }
      } else {
        savedState = rack.getAttribute(`data-part-${i}`);
        savedLabel = rack.getAttribute(`data-part-label-${i}`) || '';
        
        if (savedState) {
          localStorage.setItem(storageKey, JSON.stringify({
            state: savedState,
            label: savedLabel,
            deviceId: ''
          }));
        }
      }
      
      part.textContent = savedLabel ? `${i}U: ${savedLabel}` : `${i}U`;
      
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
        
        // Aktif sekmeyi kontrol et
        const isDeviceTab = document.querySelector('.tab-btn[data-tab="device-tab"]').classList.contains('active');
        
        if (isDeviceTab) {
          // Cihaz ekleme modunda
          if (part.dataset.deviceId) {
            // Cihaza ait bir parçaya tıklandığında, tüm cihazı kaldır
            const deviceId = part.dataset.deviceId;
            const confirmDelete = confirm('Bu parça bir cihaza ait. Cihazı kaldırmak istiyor musunuz?');
            if (confirmDelete) {
              this.deleteDevice(deviceId);
            }
          } else {
            // Cihaz ekleme modunda parça seçimi
            if (part.classList.contains('selected')) {
              part.classList.remove('selected');
            } else {
              part.classList.add('selected');
            }
          }
        } else {
          // Manuel doldurma modunda
          // Ctrl tuşuna basılıysa çoklu seçim modunda
          const isMultiSelect = e.ctrlKey || e.metaKey;
          
          if (part.classList.contains('filled')) {
            part.classList.remove('filled');
            part.classList.add('empty');
            
            // Cihaza ait bir parçaysa, cihaz bilgisini temizle
            if (part.dataset.deviceId) {
              delete part.dataset.deviceId;
              part.style.backgroundColor = '';
              
              // Cihaz listesini güncelle
              this.deviceList = this.deviceList.filter(d => d.id !== part.dataset.deviceId);
              this.updateDeviceList();
            }
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
        }
      });
      
      // Shift tuşu ile aralık seçimi
      part.addEventListener('mousedown', (e) => {
        // Aktif sekmeyi kontrol et
        const isDeviceTab = document.querySelector('.tab-btn[data-tab="device-tab"]').classList.contains('active');
        
        if (isDeviceTab) {
          // Cihaz ekleme modunda Shift ile aralık seçimi
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
              
              for (let i = start; i <= end; i++) {
                // Cihaza ait parçaları atla
                if (!allParts[i].dataset.deviceId) {
                  allParts[i].classList.add('selected');
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
        } else {
          // Manuel doldurma modunda Shift ile aralık seçimi
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
              
              for (let i = start; i <= end; i++) {
                allParts[i].classList.remove('empty');
                allParts[i].classList.add('filled');
              }
            }
          } else {
            // Normal tıklama - son tıklanan parçayı işaretle
            document.querySelectorAll('.rack-part').forEach(p => {
              p.classList.remove('last-clicked');
            });
            part.classList.add('last-clicked');
          }
        }
      });
      
      part.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        
        // Aktif sekmeyi kontrol et
        const isDeviceTab = document.querySelector('.tab-btn[data-tab="device-tab"]').classList.contains('active');
        
        // Cihaz ekleme modunda çift tıklama ile etiket düzenlemeyi engelle
        if (!isDeviceTab) {
          part.classList.add('editing');
          labelInput.focus();
        }
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
    
    // Kaydet butonu
    document.getElementById('save-rack-parts').onclick = () => {
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
        
        rack.setAttribute(`data-part-${uValue}`, state);
        if (label) {
          rack.setAttribute(`data-part-label-${uValue}`, label);
        } else {
          rack.removeAttribute(`data-part-label-${uValue}`);
        }
        
        const storageKey = `${rackId}-part-${uValue}`;
        localStorage.setItem(storageKey, JSON.stringify({
          state: state,
          label: label
        }));
      });
      
      // Seçilen bölgelere göre mesafe ekle
      if (selectedParts.top) additionalDistance += 100; // Üst bölüm: 1 metre (100 cm)
      if (selectedParts.middle) additionalDistance += 200; // Orta bölüm: 2 metre (200 cm)
      if (selectedParts.bottom) additionalDistance += 300; // Alt bölüm: 3 metre (300 cm)
      
      // RackManager'a seçilen rack'i ve ek mesafeyi bildir
      if (window.rackManagerInstance) {
        rack.setAttribute('data-additional-distance', additionalDistance);
        window.rackManagerInstance.calculateTotalDistance(); // Toplam mesafeyi yeniden hesapla
        window.rackManagerInstance.updateDistanceDisplay(); // Mesafe göstergesini güncelle
      }
      
      this.hide();
    };
    
    // Önce modalı göster
    this.show();
    
    // Modal gösterildikten sonra butonları ayarla
    this.setupTabButtons();
    this.setupDeviceButtons();
  }

  /**
   * Etiket düzenlemeyi tamamlar
   * @param {HTMLElement} part - Rack parçası elementi
   * @param {HTMLInputElement} input - Etiket giriş alanı
   * @param {number} index - Parça indeksi
   */
  finishEditing(part, input, index) {
    // Aktif sekmeyi kontrol et
    const isDeviceTab = document.querySelector('.tab-btn[data-tab="device-tab"]').classList.contains('active');
    
    // Cihaz ekleme modunda etiket düzenlemeyi engelle
    if (isDeviceTab) return;
    
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