/**
 * Rapor yönetimi sınıfı
 * @class ReportManager
 */
class ReportManager {
  constructor() {
    this.reportModal = document.getElementById('report-modal');
    this.reportContent = document.getElementById('report-content');
    this.downloadButton = document.getElementById('download-report');
    
    this.init();
  }

  init() {
    this.setupDownloadButton();
  }

  setupDownloadButton() {
    if (this.downloadButton) {
      this.downloadButton.addEventListener('click', () => {
        alert('PDF indirme özelliği henüz eklenmedi.');
      });
    }
  }

  showReportModal() {
    // Hücre bilgisini al
    function getHucreInfo(rack) {
      const hucreler = Array.from(document.querySelectorAll('.hucre'));
      const hucre = rack.closest('.hucre');
      const index = hucreler.indexOf(hucre);
      const satir = Math.floor(index / 3) + 1;
      const sutun = (index % 3) + 1;
      return `${satir}-${sutun}`;
    }

    // Rack pozisyonunu al
    function getRackPosition(rack) {
      const racks = Array.from(rack.closest('.hucre').querySelectorAll('.rack'));
      const index = racks.indexOf(rack);
      const satir = Math.floor(index / 10) + 1;
      const sutun = (index % 10) + 1;
      return `${satir}-${sutun}`;
    }

    let reportHTML = '<div class="report-section">';
    reportHTML += '<h3>Genel Bilgiler</h3>';
    reportHTML += '<table>';
    
    const ceilingHeight = document.getElementById('ceiling-height');
    const rackHeight = document.getElementById('rack-height');
    
    if (ceilingHeight) {
      reportHTML += `<tr><td>Tavan Yüksekliği:</td><td>${ceilingHeight.value} cm</td></tr>`;
    }
    if (rackHeight) {
      reportHTML += `<tr><td>Rack Yüksekliği:</td><td>${rackHeight.value} cm</td></tr>`;
    }
    
    reportHTML += '</table>';
    reportHTML += '</div>';
    
    const selectedRacks = document.querySelectorAll('.rack.selected');
    if (selectedRacks.length > 0) {
      reportHTML += '<div class="report-section">';
      reportHTML += '<h3>Seçili Rack Bilgileri</h3>';
      reportHTML += '<table>';
      
      selectedRacks.forEach((rack, index) => {
        const hucreInfo = getHucreInfo(rack);
        const rackPosition = getRackPosition(rack);
        const connectionHeight = rack.getAttribute('data-connection-height') || '3';
        
        reportHTML += `<tr><td>Rack ${index + 1}:</td><td>Hücre ${hucreInfo}, Pozisyon ${rackPosition}</td></tr>`;
        reportHTML += `<tr><td>Bağlantı Yüksekliği:</td><td>${connectionHeight} m</td></tr>`;
        
        let filledParts = [];
        for (let i = 1; i <= 45; i++) {
          const state = rack.getAttribute(`data-part-${i}`);
          const label = rack.getAttribute(`data-part-label-${i}`);
          if (state === 'filled') {
            filledParts.push(label ? `${i}U (${label})` : `${i}U`);
          }
        }
        
        if (filledParts.length > 0) {
          reportHTML += `<tr><td>Dolu Parçalar:</td><td>${filledParts.join(', ')}</td></tr>`;
        }
      });
      
      reportHTML += '</table>';
      reportHTML += '</div>';
    }
    
    if (selectedRacks.length === 2) {
      reportHTML += '<div class="report-section">';
      reportHTML += '<h3>Mesafe Bilgileri</h3>';
      reportHTML += '<table>';
      
      const mesafeDeger = document.getElementById('mesafe-deger');
      const verticalDistance = document.getElementById('vertical-distance');
      const horizontalDistance = document.getElementById('horizontal-distance');
      
      if (mesafeDeger) {
        reportHTML += `<tr><td>Toplam Kablo Mesafesi:</td><td>${mesafeDeger.textContent} cm</td></tr>`;
      }
      /*
      if (verticalDistance) {
        reportHTML += `<tr><td>Dikey Mesafe:</td><td>${verticalDistance.textContent} cm</td></tr>`;
      }
      if (horizontalDistance) {
        reportHTML += `<tr><td>Yatay Mesafe:</td><td>${horizontalDistance.textContent} cm</td></tr>`;
      }
        */
      
      reportHTML += '</table>';
      reportHTML += '</div>';
    }
    
    this.reportContent.innerHTML = reportHTML;
    this.reportModal.style.display = 'block';
  }
}