/**
 * Not defteri yönetim sınıfı
 */
class NotebookManager {
  /**
   * NotebookManager sınıfını başlatır
   */
  constructor() {
    console.log('NotebookManager constructor çağrıldı');
    
    // DOM yüklenmesini bekle
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeAfterDOM());
      console.log('DOM henüz yüklenmedi, DOMContentLoaded olayı bekleniyor');
    } else {
      // DOM zaten yüklenmişse hemen başlat
      this.initializeAfterDOM();
      console.log('DOM zaten yüklendi, hemen başlatılıyor');
    }
  }
  
  /**
   * DOM yüklendikten sonra başlatma işlemlerini yapar
   */
  initializeAfterDOM() {
    console.log('DOM yüklendi, UI elementleri alınıyor');
    
    // UI Elementleri
    this.notebookContainer = document.getElementById('notebook-container');
    this.notebookContent = document.getElementById('notebook-content');
    this.notebookRackInfo = document.getElementById('notebook-rack-info');
    this.notebookDistanceInfo = document.getElementById('notebook-distance-info');
    this.noteInput = document.getElementById('note-input');
    this.noteSaveButton = document.getElementById('note-save-button');
    
    console.log('UI elementleri:', {
      notebookContainer: this.notebookContainer,
      notebookContent: this.notebookContent,
      notebookRackInfo: this.notebookRackInfo,
      notebookDistanceInfo: this.notebookDistanceInfo,
      noteInput: this.noteInput,
      noteSaveButton: this.noteSaveButton
    });
    
    // RackManager referansı
    this.rackManager = null;
    
    // Kullanıcı yöneticisi
    this.userManager = new UserManager();
    this.currentUser = this.userManager.getCurrentUser();
    console.log('Kullanıcı bilgisi:', this.currentUser);
    
    // Notlar dizisi - başlangıçta boş dizi olarak tanımla
    this.notes = [];
    console.log('NotebookManager: this.notes dizisi oluşturuldu', this.notes);
    
    // Başlangıç ayarları
    this.init();
    
    // Not defteri başlığını güncelle
    this.updateNotebookTitle();
  }
  
  /**
   * Başlangıç ayarlarını yapar
   */
  init() {
    console.log('NotebookManager init çağrıldı');
    // RackManager referansını al
    this.rackManager = window.rackManager;
    console.log('RackManager referansı:', this.rackManager);
    
    // Notları yükle
    this.loadNotes();
    
    // Not kaydetme butonuna tıklama olayı ekle
    if (this.noteSaveButton) {
      console.log('Not kaydetme butonu bulundu, olay dinleyici ekleniyor');
      this.noteSaveButton.addEventListener('click', () => {
        console.log('Not kaydetme butonuna tıklandı');
        this.saveNote();
      });
    } else {
      console.error('Not kaydetme butonu bulunamadı!');
    }
    
    // Not giriş alanına enter tuşu olayı ekle
    if (this.noteInput) {
      console.log('Not giriş alanı bulundu, olay dinleyici ekleniyor');
      this.noteInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          console.log('Enter tuşuna basıldı');
          e.preventDefault();
          this.saveNote();
        }
      });
    } else {
      console.error('Not giriş alanı bulunamadı!');
    }
    
    // Kullanıcı oturumu değiştiğinde başlığı güncelle
    window.addEventListener('storage', (e) => {
      if (e.key === 'beyazalan-current-user') {
        console.log('Kullanıcı oturumu değişti');
        this.currentUser = this.userManager.getCurrentUser();
        this.updateNotebookTitle();
        // Kullanıcı değiştiğinde notları yeniden filtrele
        this.filterNotes();
      }
    });
    
    console.log('NotebookManager başlatıldı');
  }
  
  /**
   * Not defteri başlığını kullanıcı adına göre günceller
   */
  updateNotebookTitle() {
    // Başlık elementini bul
    const notebookHeader = document.querySelector('.notebook-header h2');
    if (!notebookHeader) return;
    
    // Kullanıcı bilgisini al
    this.currentUser = this.userManager.getCurrentUser();
    
    // Başlığı güncelle
    if (this.currentUser) {
      notebookHeader.textContent = `${this.currentUser.username}'nın Not Defteri`;
    } else {
      notebookHeader.textContent = 'Not Defteri';
    }
  }
  
  /**
   * Notları yerel depolamadan yükler
   */
  loadNotes() {
    console.log('loadNotes çağrıldı');
    
    try {
      // this.notes'u başlangıçta boş dizi olarak tanımla
      this.notes = [];
      
      // Yerel depolamadan notları al
      const savedNotes = localStorage.getItem('notes');
      console.log('localStorage\'dan alınan notlar:', savedNotes);
      
      if (savedNotes) {
        try {
          // JSON formatındaki notları parse et
          const parsedNotes = JSON.parse(savedNotes);
          console.log('Notlar başarıyla yüklendi:', parsedNotes);
          
          // Notlar dizi mi kontrol et
          if (Array.isArray(parsedNotes)) {
            // Her not öğesini doğrula
            this.notes = parsedNotes.filter(note => {
              // Not geçerli mi kontrol et
              if (!note || typeof note !== 'object') {
                console.warn('Geçersiz not objesi atlanıyor:', note);
                return false;
              }
              
              // Gerekli alanlar var mı kontrol et
              if (!note.id || !note.userId) {
                console.warn('Eksik alanlara sahip not atlanıyor:', note);
                return false;
              }
              
              return true;
            });
            
            console.log('Doğrulanmış notlar:', this.notes);
          } else {
            console.error('Kaydedilen notlar dizi değil, boş dizi kullanılıyor');
          }
        } catch (error) {
          console.error('Notları ayrıştırma hatası:', error);
        }
      } else {
        console.log('Kayıtlı not bulunamadı, boş dizi kullanılıyor');
      }
      
      // Notları filtrele ve göster
      this.filterNotes();
      
      return this.notes;
    } catch (error) {
      console.error('Notları yükleme hatası:', error);
      this.notes = [];
      this.filterNotes();
      return [];
    }
  }
  
  /**
   * Notları kullanıcıya göre filtreler
   */
  filterNotes() {
    console.log('filterNotes çağrıldı');
    
    // this.notes dizisinin geçerli olduğundan emin ol
    if (!Array.isArray(this.notes)) {
      console.warn('this.notes dizisi değil, boş dizi oluşturuluyor');
      this.notes = [];
    }
    
    // Güncel kullanıcı bilgisini al
    this.currentUser = this.userManager.getCurrentUser();
    console.log('Güncel kullanıcı:', this.currentUser);
    
    // Kullanıcı giriş yapmamışsa boş dizi döndür
    if (!this.currentUser) {
      console.log('Kullanıcı giriş yapmamış, boş dizi gösteriliyor');
      this.renderNotes([]);
      return;
    }
    
    console.log('Filtreleme öncesi tüm notlar:', this.notes);
    
    try {
      // Kullanıcıya ait notları filtrele
      const filteredNotes = this.notes.filter(note => {
        // Not geçerli mi kontrol et
        if (!note || typeof note !== 'object' || !note.userId) {
          console.warn('Geçersiz not objesi:', note);
          return false;
        }
        return note.userId === this.currentUser.username;
      });
      console.log('Kullanıcıya ait filtrelenmiş notlar:', filteredNotes);
      
      // Notları tarihe göre sırala (en yeni en üstte)
      filteredNotes.sort((a, b) => {
        try {
          return new Date(b.createdAt) - new Date(a.createdAt);
        } catch (error) {
          console.error('Not sıralama hatası:', error);
          return 0;
        }
      });
      
      // Filtrelenmiş notları göster
      this.renderNotes(filteredNotes);
    } catch (error) {
      console.error('Notları filtreleme hatası:', error);
      this.renderNotes([]);
    }
  }
  
  /**
   * Notları ekranda gösterir
   * @param {Array} notes - Gösterilecek notlar dizisi
   */
  renderNotes(notes) {
    console.log('renderNotes çağrıldı, gösterilecek notlar:', notes);
    
    // notes parametresinin dizi olduğundan emin ol
    if (!Array.isArray(notes)) {
      console.error('notes parametresi dizi değil:', notes);
      notes = [];
    }
    
    if (!this.notebookContent) {
      console.error('notebookContent bulunamadı!');
      return;
    }
    
    try {
      // Not içeriğini temizle
      this.notebookContent.innerHTML = '';
      console.log('Not içeriği temizlendi');
      
      // Notlar boşsa mesaj göster
      if (notes.length === 0) {
        console.log('Gösterilecek not yok, boş mesaj ekleniyor');
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-notes-message';
        emptyMessage.textContent = 'Henüz not eklenmemiş.';
        this.notebookContent.appendChild(emptyMessage);
        return;
      }
      
      console.log('Notlar DOM\'a ekleniyor, not sayısı:', notes.length);
      // Her not için bir öğe oluştur ve ekle
      notes.forEach(note => {
        try {
          if (!note || typeof note !== 'object') {
            console.warn('Geçersiz not objesi, atlanıyor:', note);
            return;
          }
          
          console.log('Not öğesi oluşturuluyor:', note);
          const noteItem = this.createNoteItem(note);
          
          if (noteItem) {
            this.notebookContent.appendChild(noteItem);
            console.log('Not öğesi DOM\'a eklendi');
          } else {
            console.error('Not öğesi oluşturulamadı:', note);
          }
        } catch (noteError) {
          console.error('Not öğesi oluşturma hatası:', noteError);
        }
      });
    } catch (error) {
      console.error('Notları render etme hatası:', error);
      // Hata durumunda boş mesaj göster
      this.notebookContent.innerHTML = '';
      const errorMessage = document.createElement('div');
      errorMessage.className = 'empty-notes-message';
      errorMessage.textContent = 'Notlar yüklenirken bir hata oluştu.';
      this.notebookContent.appendChild(errorMessage);
    }
  }
  
  /**
   * Not öğesi oluşturur
   * @param {Object} note - Not nesnesi
   * @returns {HTMLElement} - Oluşturulan not öğesi veya null (hata durumunda)
   */
  createNoteItem(note) {
    try {
      // Not geçerli mi kontrol et
      if (!note || typeof note !== 'object') {
        console.error('Geçersiz not objesi:', note);
        return null;
      }
      
      // Not ID'si var mı kontrol et
      if (!note.id) {
        console.warn('Not ID\'si eksik, otomatik ID oluşturuluyor');
        note.id = Date.now().toString();
      }
      
      // Not öğesi container'ı
      const noteItem = document.createElement('div');
      noteItem.className = 'notebook-item';
      noteItem.dataset.id = note.id;
      
      // Not içeriği
      const noteContent = document.createElement('div');
      noteContent.className = 'notebook-item-content';
      
      // Not metni
      const noteText = document.createElement('div');
      noteText.className = 'notebook-item-text';
      noteText.textContent = note.text || 'Not içeriği yok';
      noteText.addEventListener('click', () => this.editNote(note, noteText));
      
      // Not bilgileri
      const noteInfo = document.createElement('div');
      noteInfo.className = 'notebook-item-info';
      
      try {
        // Tarih formatlamayı güvenli şekilde yap
        let formattedDate = 'Tarih bilgisi yok';
        if (note.createdAt) {
          const date = new Date(note.createdAt);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toLocaleString('tr-TR', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          } else {
            console.warn('Geçersiz tarih formatı:', note.createdAt);
          }
        }
        
        noteInfo.innerHTML = `
          <div class="notebook-item-racks">${note.rackInfo || 'Rack bilgisi yok'}</div>
          <div class="notebook-item-distance">${note.distanceInfo || 'Mesafe bilgisi yok'}</div>
          <div class="notebook-item-date">${formattedDate}</div>
        `;
      } catch (dateError) {
        console.warn('Tarih formatı hatası:', dateError);
        noteInfo.innerHTML = `
          <div class="notebook-item-racks">${note.rackInfo || 'Rack bilgisi yok'}</div>
          <div class="notebook-item-distance">${note.distanceInfo || 'Mesafe bilgisi yok'}</div>
          <div class="notebook-item-date">Tarih bilgisi yok</div>
        `;
      }
      
      // Buton konteynerı
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'notebook-item-buttons';
      
      // Düzenleme butonu
      const editButton = document.createElement('button');
      editButton.className = 'notebook-item-edit';
      editButton.innerHTML = '<i class="fas fa-edit"></i>';
      editButton.title = 'Düzenle';
      editButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Olayın yayılmasını engelle
        this.editNote(note, noteText);
      });
      
      // Silme butonu
      const deleteButton = document.createElement('button');
      deleteButton.className = 'notebook-item-delete';
      deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      deleteButton.title = 'Sil';
      deleteButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Olayın yayılmasını engelle
        this.deleteNote(note.id);
      });
      
      // Butonları konteyner'a ekle
      buttonContainer.appendChild(editButton);
      buttonContainer.appendChild(deleteButton);
      
      // Öğeleri birleştir
      noteContent.appendChild(noteText);
      noteContent.appendChild(noteInfo);
      noteItem.appendChild(noteContent);
      noteItem.appendChild(buttonContainer);
      
      return noteItem;
    } catch (error) {
      console.error('Not öğesi oluşturma hatası:', error);
      return null;
    }
  }
  
  /**
   * Not düzenleme işlemini başlatır
   * @param {Object} note - Düzenlenecek not
   * @param {HTMLElement} noteTextElement - Not metni elementi
   */
  editNote(note, noteTextElement) {
    try {
      console.log('editNote çağrıldı, not:', note);
      
      // Not ve noteTextElement geçerli mi kontrol et
      if (!note || typeof note !== 'object') {
        console.error('Geçersiz not objesi:', note);
        return;
      }
      
      if (!noteTextElement || !(noteTextElement instanceof HTMLElement)) {
        console.error('Geçersiz not metni elementi:', noteTextElement);
        return;
      }
      
      // Güncel kullanıcı bilgisini al
      this.currentUser = this.userManager.getCurrentUser();
      
      // Kullanıcı giriş yapmamışsa işlemi iptal et
      if (!this.currentUser) {
        console.warn('Kullanıcı giriş yapmamış');
        alert('Not düzenlemek için giriş yapmalısınız.');
        return;
      }
      
      // Not başka bir kullanıcıya aitse işlemi iptal et
      if (note.userId !== this.currentUser.username) {
        console.warn('Kullanıcı yetkisiz not düzenleme girişimi');
        alert('Bu notu düzenleme yetkiniz yok.');
        return;
      }
      
      // Mevcut metni al
      const currentText = note.text || '';
      console.log('Mevcut not metni:', currentText);
      
      // Düzenleme alanı oluştur
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.className = 'notebook-edit-input';
      editInput.value = currentText;
      
      // Metin elementini düzenleme alanıyla değiştir
      noteTextElement.innerHTML = '';
      noteTextElement.appendChild(editInput);
      
      // Input'a odaklan
      editInput.focus();
      
      // Düzenleme tamamlandığında notu güncelle
      const saveEdit = () => {
        const newText = editInput.value.trim();
        if (newText) {
          // Notu güncelle ve başarılı olup olmadığını kontrol et
          const updateSuccess = this.updateNoteText(note.id, newText);
          
          if (updateSuccess) {
            // Metin elementini güncelle
            noteTextElement.textContent = newText;
            console.log('Not metni DOM\'da güncellendi');
          } else {
            // Güncelleme başarısız olduysa eski metni geri getir
            noteTextElement.textContent = currentText;
            console.error('Not güncellenemedi');
          }
        } else {
          // Boş değer girilirse eski metni geri getir
          noteTextElement.textContent = currentText;
          console.warn('Boş not metni');
          //alert('Not metni boş olamaz.');
        }
      };
      
      // Enter tuşuna basıldığında düzenlemeyi kaydet
      editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveEdit();
        }
      });
      
      // Odak kaybedildiğinde düzenlemeyi kaydet
      editInput.addEventListener('blur', saveEdit);
    } catch (error) {
      console.error('Not düzenleme hatası:', error);
      alert('Not düzenlenirken bir hata oluştu!');
      // Hata durumunda notları yeniden render et
      this.filterNotes();
    }
  }
  
  /**
   * Not metnini günceller
   * @param {string} noteId - Güncellenecek notun ID'si
   * @param {string} newText - Yeni not metni
   * @returns {boolean} - Güncelleme başarılı mı
   */
  updateNoteText(noteId, newText) {
    console.log(`updateNoteText çağrıldı, ID: ${noteId}, yeni metin: ${newText}`);
    
    try {
      // Parametreleri kontrol et
      if (!noteId) {
        console.error('Geçersiz not ID\'si');
        return false;
      }
      
      if (!newText || newText.trim() === '') {
        console.error('Geçersiz not metni');
        return false;
      }
      
      // this.notes'un dizi olduğundan emin ol
      if (!Array.isArray(this.notes)) {
        console.error('this.notes dizi değil, boş dizi oluşturuluyor');
        this.notes = [];
        return false;
      }
      
      // Güncel kullanıcı bilgisini al
      this.currentUser = this.userManager.getCurrentUser();
      
      // Kullanıcı giriş yapmamışsa işlemi iptal et
      if (!this.currentUser) {
        console.warn('Kullanıcı giriş yapmamış');
        alert('Not düzenlemek için giriş yapmalısınız.');
        return false;
      }
      
      // Düzenlenecek notu bul
      const noteIndex = this.notes.findIndex(note => note.id === noteId);
      
      // Not bulunamadıysa işlemi iptal et
      if (noteIndex === -1) {
        console.error(`ID'si ${noteId} olan not bulunamadı`);
        alert('Düzenlenecek not bulunamadı.');
        return false;
      }
      
      // Not başka bir kullanıcıya aitse işlemi iptal et
      if (this.notes[noteIndex].userId !== this.currentUser.username) {
        console.warn('Kullanıcı yetkisiz not güncelleme girişimi');
        alert('Bu notu düzenleme yetkiniz yok.');
        return false;
      }
      
      // Notu güncelle
      this.notes[noteIndex].text = newText.trim();
      this.notes[noteIndex].updatedAt = new Date().toISOString();
      console.log('Not güncellendi:', this.notes[noteIndex]);
      
      // Notları kaydet
      try {
        localStorage.setItem('notes', JSON.stringify(this.notes));
        return true;
      } catch (error) {
        console.error('Not kaydetme hatası:', error);
        return false;
      }
    } catch (error) {
      console.error('Not güncelleme hatası:', error);
      return false;
    }
  }
  
  /**
   * Yeni not ekler
   */
  saveNote() {
    console.log('saveNote çağrıldı');
    
    try {
      // Kullanıcı giriş yapmamışsa işlemi durdur
      this.currentUser = this.userManager.getCurrentUser();
      if (!this.currentUser) {
        console.error('Kullanıcı giriş yapmamış, not eklenemez!');
        alert('Not eklemek için giriş yapmalısınız!');
        return;
      }
      
      // UI elementlerini kontrol et
      if (!this.noteInput) {
        console.error('noteInput bulunamadı');
        alert('Not giriş alanı bulunamadı!');
        return;
      }
      
      // Not metnini al
      const noteText = this.noteInput.value.trim();
      console.log('Not metni:', noteText);
      
      // Rack bilgilerini al (null kontrolü ile)
      const rackInfo = this.notebookRackInfo ? this.notebookRackInfo.textContent : 'Henüz rack seçilmedi';
      const distanceInfo = this.notebookDistanceInfo ? this.notebookDistanceInfo.textContent : 'Toplam Mesafe: 0.00 m';
      console.log('Rack bilgileri:', { rackInfo, distanceInfo });
      
      // Yeni not oluştur
      const newNote = {
        id: Date.now().toString(),
        text: noteText || '', // Boş not da kabul edilebilir
        rackInfo: rackInfo,
        distanceInfo: distanceInfo,
        userId: this.currentUser.username,
        createdAt: new Date().toISOString()
      };
      console.log('Yeni not oluşturuldu:', newNote);
      
      // this.notes'un dizi olduğundan emin ol
      if (!Array.isArray(this.notes)) {
        console.warn('this.notes dizi değil, boş dizi oluşturuluyor');
        this.notes = [];
      }
      
      // Notu notlar dizisine ekle (en başa ekle)
      this.notes.unshift(newNote);
      console.log('Not diziye eklendi, yeni dizi:', this.notes);
      
      // Notları kaydet
      localStorage.setItem('notes', JSON.stringify(this.notes));
      console.log('Notlar localStorage\'a kaydedildi');
      //alert('Not başarıyla kaydedildi!'); // Kullanıcıya bilgi ver
      
      // Not giriş alanını temizle
      this.noteInput.value = '';
      
      // Seçili rackları sıfırla
      this.resetRackSelections();
      
      // Notları filtrele ve göster - bu önemli!
      this.filterNotes();
      
      console.log('Not başarıyla eklendi ve gösterildi');
    } catch (error) {
      console.error('Not ekleme hatası:', error);
      alert('Not eklenirken bir hata oluştu: ' + error.message);
    }
  }
  
  /**
   * Seçili rackları sıfırlar
   */
  resetRackSelections() {
    console.log('resetRackSelections çağrıldı');
    
    try {
      if (this.rackManager) {
        // Reset butonunu bul ve tıkla
        const resetButton = document.getElementById('reset-button');
        if (resetButton) {
          console.log('Reset butonu bulundu, tıklanıyor');
          resetButton.click();
        } else {
          console.log('Reset butonu bulunamadı, manuel sıfırlama yapılıyor');
          // Reset butonu yoksa manuel olarak sıfırla
          if (this.rackManager.selectedRacks) {
            this.rackManager.selectedRacks.forEach(rack => {
              rack.classList.remove('selected');
            });
            this.rackManager.selectedRacks = [];
          }
          
          if (this.rackManager.selectedEndpoints) {
            this.rackManager.selectedEndpoints.forEach(endpoint => {
              endpoint.classList.remove('active');
            });
            this.rackManager.selectedEndpoints = [];
          }
          
          if (this.rackManager.allPathEndpoints) {
            this.rackManager.allPathEndpoints.forEach(endpoint => {
              endpoint.classList.remove('path');
            });
            this.rackManager.allPathEndpoints = [];
          }
          
          this.rackManager.pathSegments = [];
          this.rackManager.updateDistanceDisplay();
        }
        console.log('Rack seçimleri sıfırlandı');
      } else {
        console.warn('rackManager bulunamadı');
      }
    } catch (error) {
      console.error('Rack seçimlerini sıfırlama hatası:', error);
    }
  }
  
  /**
   * Tarihi formatlar
   * @param {string} dateString - ISO formatında tarih string'i
   * @returns {string} - Formatlanmış tarih
   */
  formatDate(dateString) {
    try {
      if (!dateString) {
        console.warn('Geçersiz tarih string\'i');
        return 'Tarih bilgisi yok';
      }
      
      const date = new Date(dateString);
      
      // Geçersiz tarih kontrolü
      if (isNaN(date.getTime())) {
        console.warn('Geçersiz tarih formatı:', dateString);
        return 'Geçersiz tarih';
      }
      
      // Tarih formatla
      return date.toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Tarih formatlama hatası:', error);
      return 'Tarih hatası';
    }
  }
  
  /**
   * Notu siler
   * @param {string} noteId - Silinecek not ID'si
   */
  deleteNote(noteId) {
    console.log(`deleteNote çağrıldı, ID: ${noteId}`);
    
    try {
      // noteId geçerli mi kontrol et
      if (!noteId) {
        console.error('Geçersiz not ID\'si');
        return;
      }
      
      // Güncel kullanıcı bilgisini al
      this.currentUser = this.userManager.getCurrentUser();
      
      // Kullanıcı giriş yapmamışsa işlemi iptal et
      if (!this.currentUser) {
        console.warn('Kullanıcı giriş yapmamış');
        alert('Not silmek için giriş yapmalısınız.');
        return;
      }
      
      // this.notes'un dizi olduğundan emin ol
      if (!Array.isArray(this.notes)) {
        console.error('this.notes dizi değil, boş dizi oluşturuluyor');
        this.notes = [];
        return;
      }
      
      // Silinecek notu bul
      const noteToDelete = this.notes.find(note => note.id === noteId);
      
      // Not bulunamadıysa veya not başka bir kullanıcıya aitse işlemi iptal et
      if (!noteToDelete) {
        console.error(`ID'si ${noteId} olan not bulunamadı`);
        alert('Silinecek not bulunamadı.');
        return;
      }
      
      if (noteToDelete.userId !== this.currentUser.username) {
        console.warn('Kullanıcı yetkisiz not silme girişimi');
        alert('Bu notu silme yetkiniz yok.');
        return;
      }
      
      // Silme işlemini onayla
      if (confirm('Bu notu silmek istediğinize emin misiniz?')) {
        try {
          // Not öğesini bul
          const noteElement = document.querySelector(`.notebook-item[data-id="${noteId}"]`);
          
          // Silme animasyonu ekle
          if (noteElement) {
            noteElement.classList.add('deleting');
            
            // Animasyon tamamlandıktan sonra notu sil
            setTimeout(() => {
              try {
                // Notu diziden kaldır
                this.notes = this.notes.filter(note => note.id !== noteId);
                console.log('Not diziden kaldırıldı, yeni dizi:', this.notes);
                
                // Notları kaydet
                this.saveNotes();
                
                // Not öğesini DOM'dan kaldır
                if (noteElement.parentNode) {
                  noteElement.parentNode.removeChild(noteElement);
                  console.log('Not DOM\'dan kaldırıldı');
                }
                
                // Eğer hiç not kalmadıysa boş mesajı göster
                if (this.notes.filter(note => note.userId === this.currentUser.username).length === 0) {
                  const emptyMessage = document.createElement('div');
                  emptyMessage.className = 'empty-notes-message';
                  //emptyMessage.textContent = 'Henüz not eklenmemiş.';
                  this.notebookContent.appendChild(emptyMessage);
                }
              } catch (innerError) {
                console.error('Not silme işlemi sırasında hata:', innerError);
                this.filterNotes(); // Hata durumunda notları yeniden render et
              }
            }, 300);
          } else {
            console.warn('Silinecek not DOM\'da bulunamadı, direkt siliniyor');
            // Element bulunamazsa direkt sil
            this.notes = this.notes.filter(note => note.id !== noteId);
            this.saveNotes();
          }
        } catch (domError) {
          console.error('DOM işlemi hatası:', domError);
          // Notu diziden kaldır ve kaydet
          this.notes = this.notes.filter(note => note.id !== noteId);
          this.saveNotes();
        }
      } else {
        console.log('Kullanıcı silme işlemini iptal etti');
      }
    } catch (error) {
      console.error('Not silme hatası:', error);
      alert('Not silinirken bir hata oluştu!');
    }
  }
  
  /**
   * Notları yerel depolamaya kaydeder
   * @returns {boolean} - Kayıt işlemi başarılı mı
   */
  saveNotes() {
    console.log('saveNotes çağrıldı');
    
    // this.notes'un dizi olduğundan emin ol
    if (!Array.isArray(this.notes)) {
      console.error('this.notes dizi değil, boş dizi oluşturuluyor');
      this.notes = [];
    }
    
    try {
      // Notları JSON formatına çevir ve localStorage'a kaydet
      const notesJSON = JSON.stringify(this.notes);
      localStorage.setItem('notes', notesJSON);
      console.log('Notlar localStorage\'a kaydedildi. Not sayısı:', this.notes.length);
      
      // Her zaman filterNotes() çağır - bu önemli!
      // Bu, notların her zaman güncel olmasını sağlar
      this.filterNotes();
      
      return true; // Başarılı kayıt
    } catch (error) {
      console.error('Not kaydetme hatası:', error);
      alert('Notlar kaydedilirken bir hata oluştu: ' + error.message);
      return false; // Başarısız kayıt
    }
  }
}

// Sayfa yüklendiğinde NotebookManager'ı başlat
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded olayı tetiklendi, NotebookManager başlatılıyor');
  window.notebookManager = new NotebookManager();
});

// Hata ayıklama için global hata dinleyicisi
window.addEventListener('error', (event) => {
  console.error('Global hata yakalandı:', event.error);
});