/**
 * Ana uygulama başlatıcı
 * @class AppInitializer
 */
class AppInitializer {
  static init() {
    // Beyaz alanı oluştur
    const container = document.getElementById('beyaz-alan-container');
    const beyazAlan = new BeyazAlan(6, 20);
    container.appendChild(beyazAlan.render());
    
    // Yöneticileri başlat
    const headerManager = new HeaderManager();
    const modalManager = new ModalManager();
    const userManager = new UserManager(); // UserManager'ı ekle
    const todoManager = new TodoManager();
    const reportManager = new ReportManager();
    const rackManager = new RackManager();
    
    // Global erişim için kaydet
    window.headerManagerInstance = headerManager;
    window.modalManagerInstance = modalManager;
    window.userManagerInstance = userManager; // UserManager'ı global yap
    window.todoManagerInstance = todoManager;
    window.reportManagerInstance = reportManager;
    window.rackManagerInstance = rackManager;
    
    // Global fonksiyonları ayarla
    window.showRackPartsModal = (rack) => modalManager.showRackPartsModal(rack);
    window.showRackNameEditModal = (rack) => modalManager.showRackNameEditModal(rack);
    
    // LocalStorage'dan verileri yükle
    StorageManager.loadRackDataFromLocalStorage();
  }
}