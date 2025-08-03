/**
 * Üst bar ve kontrol paneli yönetimi
 * @class HeaderManager
 */
class HeaderManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupResetButton();
    this.setupPrintButton();
  }

  setupResetButton() {
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        location.reload();
      });
    }
  }

  setupPrintButton() {
    const printButton = document.getElementById('print-button');
    if (printButton) {
      printButton.addEventListener('click', () => {
        if (window.reportManagerInstance) {
          window.reportManagerInstance.showReportModal();
        }
      });
    }
  }
}