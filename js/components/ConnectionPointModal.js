/**
 * Bağlantı noktası modal sınıfı
 * @class ConnectionPointModal
 * @extends BaseModal
 */
class ConnectionPointModal extends BaseModal {
  /**
   * Bağlantı noktası modalını başlatır
   */
  constructor() {
    super('connection-point-modal');
    this.init();
  }

  /**
   * Başlangıç ayarlarını yapar
   */
  init() {
    this.setupCloseButton();
    this.setupConnectionPoints();
    this.setupConfirmButton();
  }

  /**
   * Bağlantı noktalarını ayarlar
   */
  setupConnectionPoints() {
    document.querySelectorAll('.connection-point').forEach(point => {
      point.addEventListener('click', () => {
        document.querySelectorAll('.connection-point').forEach(p => p.classList.remove('selected'));
        point.classList.add('selected');
        
        const height = point.getAttribute('data-height');
        const pointName = point.textContent;
        
        document.getElementById('selected-point').textContent = pointName;
        
        // Bağlantı noktasına göre tavana mesafeyi ayarla
        let ceilingDistance = '0';
        switch(parseInt(height)) {
          case 1: // Üst Bölüm - 0.5 metre
            ceilingDistance = '1.0';
            break;
          case 2: // Orta Bölüm - 1.5 metre
            ceilingDistance = '1.5';
            break;
          case 3: // Alt Bölüm - 2.5 metre
            ceilingDistance = '2.5';
            break;
          case 4: // En Alt Bölüm - 3.5 metre
            ceilingDistance = '3.5';
            break;
          default:
            ceilingDistance = '0';
        }
        
        document.getElementById('ceiling-distance').textContent = ceilingDistance;
      });
    });
  }

  /**
   * Onay düğmesini ayarlar
   */
  setupConfirmButton() {
    document.getElementById('confirm-connection').addEventListener('click', () => {
      const selectedPoint = document.querySelector('.connection-point.selected');
      if (!selectedPoint) {
        alert('Lütfen bir bağlantı noktası seçin.');
        return;
      }
      
      const height = selectedPoint.getAttribute('data-height');
      const currentRack = document.querySelector('.rack.connection-selecting');
      
      if (currentRack) {
        currentRack.setAttribute('data-connection-height', height);
        // Seçilen bağlantı noktasına göre ek mesafe ekle
        let additionalDistance = 0;
        
        // Bağlantı noktasına göre mesafeleri ayarla
        switch(parseInt(height)) {
           case 1: // Üst Bölüm - 0.5 metre (50 cm)
             additionalDistance = 100;
             break;
          case 2: // Orta Bölüm - 1.5 metre (150 cm)
            additionalDistance = 150;
            break;
          case 3: // Alt Bölüm - 2.5 metre (250 cm)
            additionalDistance = 250;
            break;
          case 4: // En Alt Bölüm - 3.5 metre (350 cm)
            additionalDistance = 350;
            break;
          default:
            additionalDistance = 0;
        }
        
        currentRack.setAttribute('data-additional-distance', additionalDistance);
        
        currentRack.classList.remove('connection-selecting');
        currentRack.classList.add('selected');
        
        if (window.rackManagerInstance) {
          window.rackManagerInstance.handleRackSelection(currentRack);
          // Toplam mesafeyi yeniden hesapla
          window.rackManagerInstance.calculateTotalDistance();
          // Mesafe göstergesini güncelle
          window.rackManagerInstance.updateDistanceDisplay();
        }
      }
      
      this.hide();
    });
  }
}