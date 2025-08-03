/**
 * Rack isim düzenleme modal sınıfı
 * @class RackNameEditModal
 * @extends BaseModal
 */
class RackNameEditModal extends BaseModal {
  /**
   * Rack isim düzenleme modalını başlatır
   */
  constructor() {
    // Modal henüz DOM'da olmadığı için oluştur
    RackNameEditModal.createModalInDOM();
    super('rack-name-edit-modal');
    this.setupCloseButton();
  }

  /**
   * Rack isim düzenleme modalını DOM'da oluşturur
   * @static
   */
  static createModalInDOM() {
    // Eğer modal zaten varsa tekrar oluşturma
    if (document.getElementById('rack-name-edit-modal')) {
      return;
    }
    
    // Modal container oluştur
    const modal = document.createElement('div');
    modal.id = 'rack-name-edit-modal';
    modal.className = 'modal';
    
    // Modal içeriği
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Kapatma butonu
    const closeButton = document.createElement('span');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';
    
    // Başlık
    const title = document.createElement('h2');
    title.textContent = 'Rack İsmini Düzenle';
    
    // Form
    const form = document.createElement('div');
    form.className = 'rack-name-form';
    
    // Orijinal isim gösterimi
    const originalNameDiv = document.createElement('div');
    originalNameDiv.className = 'form-group';
    originalNameDiv.innerHTML = `
      <label>Orijinal Rack ID:</label>
      <span id="original-rack-id"></span>
    `;
    
    // Yeni isim girişi
    const newNameDiv = document.createElement('div');
    newNameDiv.className = 'form-group';
    newNameDiv.innerHTML = `
      <label for="new-rack-name">Yeni Rack İsmi:</label>
      <input type="text" id="new-rack-name" maxlength="20" placeholder="Yeni isim girin">
    `;
    
    // Butonlar
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'form-buttons';
    
    // Kaydet butonu
    const saveButton = document.createElement('button');
    saveButton.id = 'save-rack-name';
    saveButton.className = 'btn';
    saveButton.innerHTML = '<i class="fas fa-save"></i> Kaydet';
    
    // Sıfırla butonu
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-rack-name';
    resetButton.className = 'btn btn-secondary';
    resetButton.innerHTML = '<i class="fas fa-undo"></i> Orijinal İsme Döndür';
    
    // Elementleri birleştir
    buttonsDiv.appendChild(saveButton);
    buttonsDiv.appendChild(resetButton);
    
    form.appendChild(originalNameDiv);
    form.appendChild(newNameDiv);
    form.appendChild(buttonsDiv);
    
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(form);
    
    modal.appendChild(modalContent);
    
    // Modalı body'e ekle
    document.body.appendChild(modal);
  }

  /**
   * Belirli bir rack için modalı gösterir
   * @param {HTMLElement} rack - İsmi düzenlenecek rack elementi
   */
  showForRack(rack) {
    const rackIdElement = rack.querySelector('.rack-id');
    const defaultId = rackIdElement.getAttribute('data-default-id');
    const currentName = rackIdElement.textContent;
    
    // Modal içeriğini güncelle
    document.getElementById('original-rack-id').textContent = defaultId;
    const newNameInput = document.getElementById('new-rack-name');
    newNameInput.value = currentName !== defaultId ? currentName : '';
    
    // Kaydet butonu işlevi
    document.getElementById('save-rack-name').onclick = () => {
      const newName = newNameInput.value.trim();
      
      if (newName) {
        // Yeni ismi kaydet
        rackIdElement.textContent = newName;
        localStorage.setItem(`rack-custom-name-${defaultId.substring(1)}`, newName);
      } else {
        // Boş ise orijinal isme dön
        rackIdElement.textContent = defaultId;
        localStorage.removeItem(`rack-custom-name-${defaultId.substring(1)}`);
      }
      
      this.hide();
    };
    
    // Sıfırla butonu işlevi
    document.getElementById('reset-rack-name').onclick = () => {
      rackIdElement.textContent = defaultId;
      localStorage.removeItem(`rack-custom-name-${defaultId.substring(1)}`);
      this.hide();
    };
    
    // Modalı göster
    this.show();
  }
}