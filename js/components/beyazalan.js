/**
 * Veri Merkezi Beyaz Alan oluşturma komponenti
 * @class BeyazAlan
 */
class BeyazAlan {
  /**
   * Beyaz Alan oluşturucu
   * @param {number} hucreSayisi - Toplam hücre sayısı
   * @param {number} rackSayisi - Her hücredeki rack sayısı
   */
  constructor(hucreSayisi = 6, rackSayisi = 20) {
    this.hucreSayisi = hucreSayisi;
    this.rackSayisi = rackSayisi;
    this.satirSayisi = 1; // 1 satır (sadece 1. satır gösterilecek)
    this.sutunSayisi = 3; // 3 sütun (3 hücre yan yana gösterilecek)
  }
  
  /**
   * Beyaz Alan DOM elementini oluşturur
   * @returns {HTMLElement} Oluşturulan beyaz alan elementi
   */
  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'beyaz-alan-wrapper';
    
    // Ayar butonu ekleme
    const settingsButton = document.createElement('button');
    settingsButton.className = 'beyaz-alan-settings-btn';
    settingsButton.innerHTML = '<i class="fas fa-cog"></i>';
    settingsButton.title = 'Mesafe Ayarları';
    settingsButton.addEventListener('click', () => {
      // Mesafe ayarları modalını göster
      if (window.modalManagerInstance) {
        window.modalManagerInstance.showDistanceSettingsModal();
      }
    });
    wrapper.appendChild(settingsButton);
    
    // Koordinat etiketleri
    const koordinatlar = document.createElement('div');
    koordinatlar.className = 'koordinatlar';
    
    // Sütun etiketleri
    const sutunEtiketleri = document.createElement('div');
    sutunEtiketleri.className = 'sutun-etiketleri';
    for (let i = 0; i < this.sutunSayisi; i++) {
      const etiket = document.createElement('div');
      etiket.className = 'koordinat-etiket';
      etiket.textContent = `Sütun ${i + 1}`;
      sutunEtiketleri.appendChild(etiket);
    }
    koordinatlar.appendChild(sutunEtiketleri);
    
    // Satır etiketleri
    const satirEtiketleri = document.createElement('div');
    satirEtiketleri.className = 'satir-etiketleri';
    for (let i = 0; i < this.satirSayisi; i++) {
      const etiket = document.createElement('div');
      etiket.className = 'koordinat-etiket';
      etiket.textContent = `Satır ${i + 1}`;
      satirEtiketleri.appendChild(etiket);
    }
    koordinatlar.appendChild(satirEtiketleri);
    
    wrapper.appendChild(koordinatlar);
    
    // Beyaz alan grid yapısı
    const beyazAlan = document.createElement('div');
    beyazAlan.className = 'beyaz-alan';
    beyazAlan.style.gridTemplateColumns = `repeat(${this.sutunSayisi}, auto)`;
    beyazAlan.style.gridTemplateRows = `repeat(${this.satirSayisi}, auto)`;
    
    // 3 hücre oluştur
    const hucre1 = new Hucre(this.rackSayisi, 0); // Hücre 1 (index 0)
    const hucre2 = new Hucre(this.rackSayisi, 1); // Hücre 2 (index 1)
    const hucre3 = new Hucre(this.rackSayisi, 2); // Hücre 3 (index 2)
    
    beyazAlan.appendChild(hucre1.render());
    beyazAlan.appendChild(hucre2.render());
    beyazAlan.appendChild(hucre3.render());
    
    wrapper.appendChild(beyazAlan);
    return wrapper;
  }
}