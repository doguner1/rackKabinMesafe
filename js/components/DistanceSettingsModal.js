/**
 * Mesafe ayarları modal sınıfı
 * @class DistanceSettingsModal
 * @extends BaseModal
 */
class DistanceSettingsModal extends BaseModal {
  /**
   * Mesafe ayarları modalını başlatır
   */
  constructor() {
    super('distance-settings-modal');
    this.init();
  }

  /**
   * Başlangıç ayarlarını yapar
   */
  init() {
    this.setupCloseButton();
    this.setupAddButton();
    this.setupSaveButton();
  }

  /**
   * Mesafe ekleme düğmesini ayarlar
   */
  setupAddButton() {
    document.getElementById('add-distance-setting').addEventListener('click', () => {
      const endpoint1 = document.getElementById('endpoint-select-1').value;
      const endpoint2 = document.getElementById('endpoint-select-2').value;
      const distance = parseInt(document.getElementById('endpoint-distance').value);
      
      if (!endpoint1 || !endpoint2 || endpoint1 === endpoint2) {
        alert('Lütfen iki farklı endpoint seçin.');
        return;
      }
      
      if (isNaN(distance) || distance < 1) {
        alert('Lütfen geçerli bir mesafe değeri girin.');
        return;
      }
      
      const distances = StorageManager.loadEndpointDistances();
      const addButton = document.getElementById('add-distance-setting');
      
      // Düzenleme modu kontrolü
      if (addButton.dataset.editIndex !== undefined) {
        const editIndex = parseInt(addButton.dataset.editIndex);
        distances[editIndex] = { endpoint1, endpoint2, value: distance };
        
        // Düzenleme modunu sıfırla
        addButton.innerHTML = '<i class="fas fa-plus"></i> Ekle';
        delete addButton.dataset.editIndex;
      } else {
        // Aynı endpoint çifti için önceki ayarı kontrol et
        const existingIndex = distances.findIndex(d => 
          (d.endpoint1 === endpoint1 && d.endpoint2 === endpoint2) || 
          (d.endpoint1 === endpoint2 && d.endpoint2 === endpoint1)
        );
        
        if (existingIndex !== -1) {
          // Varolan ayarı güncelle
          distances[existingIndex].value = distance;
        } else {
          // Yeni ayar ekle
          distances.push({ endpoint1, endpoint2, value: distance });
        }
      }
      
      // Güncellenmiş diziyi kaydet
      StorageManager.saveEndpointDistances(distances);
      
      // Form alanlarını temizle
      document.getElementById('endpoint-select-1').value = '';
      document.getElementById('endpoint-select-2').value = '';
      document.getElementById('endpoint-distance').value = '2';
      
      // Listeyi yenile
      this.loadSavedDistances();
      
      // Mesafe göstergesini güncelle
      if (window.rackManagerInstance && window.rackManagerInstance.selectedRacks.length === 2) {
        window.rackManagerInstance.updateDistanceDisplay();
      }
    });
  }

  /**
   * Kaydet düğmesini ayarlar
   */
  setupSaveButton() {
    document.getElementById('save-distance-settings').addEventListener('click', () => {
      this.hide();
    });
  }

  /**
   * Modalı gösterir
   */
  show() {
    // Endpoint seçim listelerini doldur
    this.populateEndpointSelects();
    
    // Kaydedilmiş mesafeleri yükle ve listele
    this.loadSavedDistances();
    
    // Modalı göster
    super.show();
  }

  /**
   * Endpoint seçim listelerini doldurur
   */
  populateEndpointSelects() {
    const endpointSelect1 = document.getElementById('endpoint-select-1');
    const endpointSelect2 = document.getElementById('endpoint-select-2');
    
    // Listeleri temizle
    endpointSelect1.innerHTML = '<option value="">Endpoint seçiniz</option>';
    endpointSelect2.innerHTML = '<option value="">Endpoint seçiniz</option>';
    
    // Tüm endpoint'leri bul
    const endpoints = document.querySelectorAll('.rack-endpoint');
    
    // Endpoint'leri listelere ekle
    endpoints.forEach(endpoint => {
      const id = endpoint.getAttribute('data-endpoint-id');
      const number = endpoint.querySelector('.endpoint-number').textContent;
      const rackId = endpoint.closest('.rack').querySelector('.rack-id').textContent;
      
      const option1 = document.createElement('option');
      option1.value = id;
      option1.textContent = `${rackId} (${number})`;
      endpointSelect1.appendChild(option1);
      
      const option2 = document.createElement('option');
      option2.value = id;
      option2.textContent = `${rackId} (${number})`;
      endpointSelect2.appendChild(option2);
    });
  }

  /**
   * Kaydedilmiş mesafeleri yükler ve listeler
   */
  loadSavedDistances() {
    const savedDistancesList = document.querySelector('.saved-distances-list');
    const distances = StorageManager.loadEndpointDistances();
    
    // Listeyi temizle
    savedDistancesList.innerHTML = '';
    
    if (distances.length === 0) {
      savedDistancesList.innerHTML = '<div class="empty-list-message">Henüz kaydedilmiş mesafe bulunmamaktadır.</div>';
      return;
    }
    
    // Her mesafe için liste öğesi oluştur
    distances.forEach((distance, index) => {
      const distanceItem = document.createElement('div');
      distanceItem.className = 'distance-item';
      distanceItem.dataset.index = index;
      
      // Endpoint bilgilerini al
      const endpoint1El = document.querySelector(`[data-endpoint-id="${distance.endpoint1}"]`);
      const endpoint2El = document.querySelector(`[data-endpoint-id="${distance.endpoint2}"]`);
      
      const endpoint1Number = endpoint1El ? endpoint1El.querySelector('.endpoint-number').textContent : 'Bilinmeyen';
      const endpoint2Number = endpoint2El ? endpoint2El.querySelector('.endpoint-number').textContent : 'Bilinmeyen';
      
      const endpoint1RackId = endpoint1El ? endpoint1El.closest('.rack').querySelector('.rack-id').textContent : 'Bilinmeyen';
      const endpoint2RackId = endpoint2El ? endpoint2El.closest('.rack').querySelector('.rack-id').textContent : 'Bilinmeyen';
      
      distanceItem.innerHTML = `
        <div class="distance-info">
          <span class="distance-endpoints">${endpoint1RackId} (${endpoint1Number}) - ${endpoint2RackId} (${endpoint2Number})</span>
          <span class="distance-value">${distance.value} cm</span>
        </div>
        <div class="distance-actions">
          <button class="edit-distance-btn" title="Düzenle"><i class="fas fa-edit"></i></button>
          <button class="delete-distance-btn" title="Sil"><i class="fas fa-trash"></i></button>
        </div>
      `;
      
      // Düzenleme butonu olayı
      distanceItem.querySelector('.edit-distance-btn').addEventListener('click', () => {
        this.editDistance(index);
      });
      
      // Silme butonu olayı
      distanceItem.querySelector('.delete-distance-btn').addEventListener('click', () => {
        this.deleteDistance(index);
      });
      
      savedDistancesList.appendChild(distanceItem);
    });
  }

  /**
   * Mesafe ayarını düzenler
   * @param {number} index - Düzenlenecek mesafenin dizideki indeksi
   */
  editDistance(index) {
    const distances = StorageManager.loadEndpointDistances();
    const distance = distances[index];
    
    if (!distance) return;
    
    // Form alanlarını doldur
    document.getElementById('endpoint-select-1').value = distance.endpoint1;
    document.getElementById('endpoint-select-2').value = distance.endpoint2;
    document.getElementById('endpoint-distance').value = distance.value;
    
    // Ekle butonunu güncelle
    const addButton = document.getElementById('add-distance-setting');
    addButton.innerHTML = '<i class="fas fa-save"></i> Güncelle';
    addButton.dataset.editIndex = index;
  }

  /**
   * Mesafe ayarını siler
   * @param {number} index - Silinecek mesafenin dizideki indeksi
   */
  deleteDistance(index) {
    const distances = StorageManager.loadEndpointDistances();
    
    // Mesafeyi diziden kaldır
    distances.splice(index, 1);
    
    // Güncellenmiş diziyi kaydet
    StorageManager.saveEndpointDistances(distances);
    
    // Listeyi yenile
    this.loadSavedDistances();
    
    // Mesafe göstergesini güncelle
    if (window.rackManagerInstance && window.rackManagerInstance.selectedRacks.length === 2) {
      window.rackManagerInstance.updateDistanceDisplay();
    }
  }
}