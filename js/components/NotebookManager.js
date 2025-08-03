/**
 * Not Defteri yönetimi
 * @class NotebookManager
 */
class NotebookManager {
  constructor() {
    this.notebookContainer = document.getElementById('notebook-container');
    this.notebookList = document.getElementById('notebook-list');
    this.notebookInput = document.getElementById('notebook-input');
    this.saveNoteBtn = document.getElementById('save-note-btn');
    this.emptyMessage = document.querySelector('.notebook-empty-message');
    this.noteCount = document.getElementById('note-count');
    this.selectedRacksInfo = document.getElementById('selected-racks-info');
    this.totalDistanceInfo = document.getElementById('total-distance-info');
    
    // Rack Manager'a erişim
    this.rackManager = window.rackManagerInstance;
    
    // Kullanıcı yöneticisine erişim
    this.userManager = window.userManagerInstance || new UserManager();
    
    // Tüm notları yükle
    this.allNotes = this.loadAllNotes();
    
    // Mevcut kullanıcının notlarını filtrele
    this.filterNotesByCurrentUser();
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderNotes();
    this.updateSelectedRacksInfo();
  }

  setupEventListeners() {
    this.saveNoteBtn.addEventListener('click', () => this.saveNote());
    
    this.notebookInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.saveNote();
      }
    });
    
    // Rack Manager'daki mesafe değişikliklerini dinle
    if (this.rackManager) {
      // Mesafe göstergesini izle
      const mesafeDeger = document.getElementById('mesafe-deger');
      if (mesafeDeger) {
        // MutationObserver kullanarak mesafe değerindeki değişiklikleri izle
        const observer = new MutationObserver(() => {
          this.updateSelectedRacksInfo();
        });
        
        observer.observe(mesafeDeger, { childList: true, characterData: true, subtree: true });
      }
      
      // Rack seçimlerini izle
      document.addEventListener('click', (event) => {
        if (event.target.closest('.rack')) {
          setTimeout(() => this.updateSelectedRacksInfo(), 100);
        }
      });
    }
  }

  // Seçili rack bilgilerini güncelle
  updateSelectedRacksInfo() {
    if (!this.rackManager) return;
    
    const selectedRacks = this.rackManager.selectedRacks;
    const mesafeDeger = document.getElementById('mesafe-deger');
    
    if (selectedRacks.length === 0) {
      this.selectedRacksInfo.textContent = 'Henüz rack seçilmedi';
      this.totalDistanceInfo.textContent = '0.00 m';
    } else if (selectedRacks.length === 1) {
      const rackId = selectedRacks[0].getAttribute('data-rack-id') || 'Bilinmeyen Rack';
      this.selectedRacksInfo.textContent = `Seçili Rack: ${rackId}`;
      this.totalDistanceInfo.textContent = '0.00 m';
    } else if (selectedRacks.length === 2) {
      const rack1Id = selectedRacks[0].getAttribute('data-rack-id') || 'Bilinmeyen Rack 1';
      const rack2Id = selectedRacks[1].getAttribute('data-rack-id') || 'Bilinmeyen Rack 2';
      this.selectedRacksInfo.textContent = `Seçili Rackler: ${rack1Id} - ${rack2Id}`;
      
      // Toplam mesafeyi al
      if (mesafeDeger) {
        this.totalDistanceInfo.textContent = `${mesafeDeger.textContent} m`;
      }
    }
  }

  // Tüm notları yükle
  loadAllNotes() {
    return JSON.parse(localStorage.getItem('notebook-notes')) || [];
  }

  // Mevcut kullanıcının notlarını filtrele
  filterNotesByCurrentUser() {
    const currentUser = this.userManager.getCurrentUser();
    
    if (currentUser) {
      // Kullanıcı sadece kendi notlarını görebilir
      this.notes = this.allNotes.filter(note => 
        !note.username || note.username === currentUser.username
      );
    } else {
      // Kullanıcı girişi yoksa boş liste göster
      this.notes = [];
    }
  }

  updateNoteCount() {
    if (this.noteCount) {
      const count = this.notes.length;
      if (count > 0) {
        this.noteCount.textContent = `(${count})`;
      } else {
        this.noteCount.textContent = '';
      }
    }
  }

  renderNotes() {
    if (!this.notebookList) return;
    
    this.notebookList.innerHTML = '';
    
    if (this.notes.length === 0) {
      if (this.emptyMessage) {
        this.emptyMessage.style.display = 'block';
      }
    } else {
      if (this.emptyMessage) {
        this.emptyMessage.style.display = 'none';
      }
      
      this.notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.className = 'notebook-item';
        noteItem.dataset.index = index;
        
        const noteText = document.createElement('span');
        noteText.className = 'notebook-text';
        noteText.textContent = note.text;
        
        const noteDetails = document.createElement('div');
        noteDetails.className = 'notebook-details';
        
        if (note.selectedRacks) {
          const racksInfo = document.createElement('span');
          racksInfo.className = 'racks-info';
          racksInfo.textContent = note.selectedRacks;
          noteDetails.appendChild(racksInfo);
        }
        
        if (note.totalDistance) {
          const distanceInfo = document.createElement('span');
          distanceInfo.className = 'distance-info';
          distanceInfo.textContent = note.totalDistance;
          noteDetails.appendChild(distanceInfo);
        }
        
        if (note.createdAt) {
          const dateInfo = document.createElement('span');
          dateInfo.className = 'date-info';
          const noteDate = new Date(note.createdAt);
          dateInfo.textContent = noteDate.toLocaleDateString('tr-TR');
          noteDetails.appendChild(dateInfo);
        }
        
        const editBtn = document.createElement('button');
        editBtn.className = 'notebook-edit';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'notebook-delete';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        
        noteItem.appendChild(noteText);
        noteItem.appendChild(noteDetails);
        noteItem.appendChild(editBtn);
        noteItem.appendChild(deleteBtn);
        this.notebookList.appendChild(noteItem);
        
        // Düzenleme butonu olayı
        editBtn.addEventListener('click', () => {
          // Düzenleme moduna geç
          const currentText = noteText.textContent;
          noteText.style.display = 'none';
          
          const editInput = document.createElement('input');
          editInput.type = 'text';
          editInput.className = 'notebook-edit-input';
          editInput.value = currentText;
          noteItem.insertBefore(editInput, noteDetails);
          
          editInput.focus();
          
          // Düzenleme tamamlandığında
          const finishEditing = () => {
            const newText = editInput.value.trim();
            if (newText) {
              // Notu güncelle
              this.notes[index].text = newText;
              this.allNotes[this.allNotes.findIndex(n => n.id === note.id)].text = newText;
              this.saveNotes();
              
              noteText.textContent = newText;
            }
            
            // Düzenleme alanını kaldır
            noteItem.removeChild(editInput);
            noteText.style.display = 'block';
          };
          
          editInput.addEventListener('blur', finishEditing);
          editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              finishEditing();
            }
          });
        });
        
        // Silme butonu olayı
        deleteBtn.addEventListener('click', () => {
          noteItem.classList.add('removing');
          setTimeout(() => {
            // Notu tüm notlardan kaldır
            const noteIndex = this.allNotes.findIndex(n => 
              n.id === note.id
            );
            
            if (noteIndex !== -1) {
              this.allNotes.splice(noteIndex, 1);
              this.saveNotes();
              
              // Filtrelenmiş listeyi güncelle
              this.filterNotesByCurrentUser();
              this.renderNotes();
              this.updateNoteCount();
            }
          }, 300);
        });
      });
    }
    
    this.updateNoteCount();
  }

  saveNotes() {
    localStorage.setItem('notebook-notes', JSON.stringify(this.allNotes));
  }

  saveNote() {
    const text = this.notebookInput.value.trim();
    if (text) {
      // Mevcut kullanıcıyı al
      const currentUser = this.userManager.getCurrentUser();
      
      if (currentUser) {
        // Seçili rack bilgilerini al
        const selectedRacksInfo = this.selectedRacksInfo.textContent;
        const totalDistanceInfo = this.totalDistanceInfo.textContent;
        
        // Yeni nota benzersiz ID ve kullanıcı adı ekle
        const newNote = {
          id: Date.now().toString(), // Benzersiz ID
          text,
          username: currentUser.username,
          selectedRacks: selectedRacksInfo,
          totalDistance: totalDistanceInfo,
          createdAt: new Date().toISOString()
        };
        
        // Tüm notlara ekle
        this.allNotes.push(newNote);
        
        // Filtrelenmiş listeyi güncelle
        this.filterNotesByCurrentUser();
        
        this.notebookInput.value = '';
        this.saveNotes();
        this.renderNotes();
        
        // Rack seçimlerini sıfırla
        if (this.rackManager) {
          // Seçili rackler varsa sıfırla
          if (this.rackManager.selectedRacks.length > 0) {
            const resetButton = document.getElementById('reset-button');
            if (resetButton) {
              resetButton.click();
            } else {
              // Reset butonu yoksa manuel olarak sıfırla
              this.rackManager.selectedRacks.forEach(rack => {
                rack.classList.remove('selected');
              });
              this.rackManager.selectedRacks = [];
              this.rackManager.updateDistanceDisplay();
            }
          }
        }
      }
    }
  }
}

// Sayfa yüklendiğinde NotebookManager'ı başlat
document.addEventListener('DOMContentLoaded', () => {
  // RackManager ve UserManager'ın yüklenmesini bekle
  setTimeout(() => {
    new NotebookManager();
  }, 500);
});