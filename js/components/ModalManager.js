/**
 * Modal yönetimi sınıfı - Tüm modalları yönetir
 * @class ModalManager
 */
class ModalManager {
  constructor() {
    // Modal sınıflarını başlat
    this.connectionPointModal = new ConnectionPointModal();
    this.rackPartsModal = new RackPartsModal();
    this.rackNameEditModal = new RackNameEditModal();
    this.distanceSettingsModal = new DistanceSettingsModal();
    
    this.init();
  }

  /**
   * Başlangıç ayarlarını yapar
   */
  init() {
    this.setupCloseButtons();
  }

  /**
   * Tüm modallardaki kapatma düğmelerini ayarlar
   */
  setupCloseButtons() {
    document.querySelectorAll('.close-button').forEach(button => {
      button.addEventListener('click', () => {
        const connectingRack = document.querySelector('.rack.connection-selecting');
        if (connectingRack) {
          connectingRack.classList.remove('connection-selecting');
        }
        
        document.querySelectorAll('.modal').forEach(modal => {
          modal.style.display = 'none';
        });
      });
    });
  }

  /**
   * Bağlantı noktası modalını gösterir
   */
  showConnectionPointModal() {
    this.connectionPointModal.show();
  }

  /**
   * Rack parçaları modalını gösterir
   * @param {HTMLElement} rack - Parçaları gösterilecek rack elementi
   */
  showRackPartsModal(rack) {
    this.rackPartsModal.showForRack(rack);
  }

  /**
   * Rack isim düzenleme modalını gösterir
   * @param {HTMLElement} rack - İsmi düzenlenecek rack elementi
   */
  showRackNameEditModal(rack) {
    this.rackNameEditModal.showForRack(rack);
  }

  /**
   * Mesafe ayarları modalını gösterir
   */
  showDistanceSettingsModal() {
    this.distanceSettingsModal.show();
  }
}
