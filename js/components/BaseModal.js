/**
 * Tüm modallar için temel sınıf
 * @class BaseModal
 */
class BaseModal {
  /**
   * Modal sınıfını başlatır
   * @param {string} modalId - Modal element ID'si
   */
  constructor(modalId) {
    this.modal = document.getElementById(modalId);
    if (!this.modal) {
      console.error(`Modal element with ID '${modalId}' not found.`);
    }
  }

  /**
   * Kapatma düğmesini ayarlar
   */
  setupCloseButton() {
    const closeButton = this.modal.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.hide();
      });
    }
  }

  /**
   * Modalı gösterir
   */
  show() {
    if (this.modal) {
      this.modal.style.display = 'block';
    }
  }

  /**
   * Modalı gizler
   */
  hide() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}