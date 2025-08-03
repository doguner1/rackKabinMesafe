/**
 * Patch Panel Modal sınıfı
 * @class PatchPanelModal
 * @extends BaseModal
 */
class PatchPanelModal extends BaseModal {
  /**
   * Patch Panel modalını başlatır
   */
  constructor() {
    super('patch-panel-modal');
    this.init();
    this.rows = 1; // Satır sayısı
    this.cols = 4; // Sütun sayısı (sabit 4)
    this.portNames = {}; // Port isimlerini saklamak için
  }

  /**
   * Başlangıç ayarlarını yapar
   */
  init() {
    this.setupCloseButton();
    this.setupSaveButton();
  }

  /**
   * Kaydet düğmesini ayarlar
   */
  setupSaveButton() {
    const saveButton = document.getElementById('save-patch-panel');
    if (saveButton) {
      saveButton.addEventListener('click', () => {
        this.hide();
      });
    }
  }

  /**
   * Belirli bir cihaz için modalı gösterir
   * @param {Object} device - Gösterilecek cihaz bilgileri
   */
  showForDevice(device) {
    // Cihaz boyutuna göre satır sayısını ayarla
    if (device.size === 1) {
      this.rows = 1; // 1U için 1x4 grid
    } else if (device.size === 2) {
      this.rows = 3; // 2U için 3x4 grid
    } else if (device.size === 4) {
      this.rows = 6; // 4U için 6x4 grid
    } else {
      // Diğer boyutlar için varsayılan değer
      this.rows = 1;
    }
    
    // Modal başlığını güncelle
    const modalTitle = document.querySelector('#patch-panel-modal h2');
    if (modalTitle) {
      modalTitle.textContent = `${device.name} - Patch Panel`;
    }
    
    // Port grid'ini oluştur
    this.createPortGrid();
    
    // Kaydedilmiş port isimlerini yükle
    this.loadPortNames(device.id);
    
    // Modalı göster
    this.show();
  }
  
  /**
   * Port grid'ini oluşturur
   */
  createPortGrid() {
    const portGrid = document.querySelector('.patch-panel-grid');
    if (!portGrid) return;
    
    portGrid.innerHTML = '';
    portGrid.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
    
    // Scrollview için maksimum 3 satır göster, fazlası için scroll
    if (this.rows > 3) {
      portGrid.style.maxHeight = '300px'; // 3 satır için yaklaşık yükseklik
      portGrid.style.overflowY = 'auto';
    } else {
      portGrid.style.maxHeight = 'none';
      portGrid.style.overflowY = 'visible';
    }
    
    // Port'ları oluştur
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const portId = `port-${row}-${col}`;
        const port = document.createElement('div');
        port.className = 'patch-panel-port';
        port.dataset.row = row;
        port.dataset.col = col;
        port.id = portId;
        
        // Port adı
        const portName = document.createElement('div');
        portName.className = 'port-name';
        portName.textContent = this.portNames[portId] || `Port ${row+1}-${col+1}`;
        port.appendChild(portName);
        
        // Çift tıklama ile isim değiştirme
        port.addEventListener('dblclick', (e) => {
          this.editPortName(port);
        });
        
        portGrid.appendChild(port);
      }
    }
  }
  
  /**
   * Port ismini düzenleme moduna geçer
   * @param {HTMLElement} port - İsmi düzenlenecek port elementi
   */
  editPortName(port) {
    const portName = port.querySelector('.port-name');
    const currentName = portName.textContent;
    
    // Düzenleme modunda olduğunu belirt
    port.classList.add('editing');
    
    // Mevcut içeriği input ile değiştir
    portName.innerHTML = '';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'port-name-input';
    input.value = currentName;
    input.maxLength = 20;
    portName.appendChild(input);
    
    // Input'a odaklan
    input.focus();
    input.select();
    
    // Input olayları
    input.addEventListener('blur', () => {
      this.finishEditing(port, input);
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.finishEditing(port, input);
      } else if (e.key === 'Escape') {
        input.value = currentName;
        this.finishEditing(port, input);
      }
    });
  }
  
  /**
   * Port ismi düzenlemeyi tamamlar
   * @param {HTMLElement} port - İsmi düzenlenen port elementi
   * @param {HTMLInputElement} input - İsim giriş alanı
   */
  finishEditing(port, input) {
    const portName = port.querySelector('.port-name');
    const newName = input.value.trim() || `Port ${parseInt(port.dataset.row)+1}-${parseInt(port.dataset.col)+1}`;
    
    // Düzenleme modundan çık
    port.classList.remove('editing');
    
    // İsmi güncelle
    portName.textContent = newName;
    
    // İsmi kaydet
    this.portNames[port.id] = newName;
    this.savePortNames();
  }
  
  /**
   * Port isimlerini yükler
   * @param {string} deviceId - Cihaz ID'si
   */
  loadPortNames(deviceId) {
    try {
      const savedNames = localStorage.getItem(`patch-panel-${deviceId}`);
      if (savedNames) {
        this.portNames = JSON.parse(savedNames);
      } else {
        this.portNames = {};
      }
    } catch (error) {
      console.error('Port isimleri yüklenirken hata:', error);
      this.portNames = {};
    }
  }
  
  /**
   * Port isimlerini kaydeder
   */
  savePortNames() {
    try {
      localStorage.setItem(`patch-panel-${this.currentDeviceId}`, JSON.stringify(this.portNames));
    } catch (error) {
      console.error('Port isimleri kaydedilirken hata:', error);
    }
  }
}

// Global değişken olarak tanımla
let patchPanelModal;

// Sayfa yüklendiğinde modal'ı oluştur
document.addEventListener('DOMContentLoaded', () => {
  patchPanelModal = new PatchPanelModal();
});