/**
 * LocalStorage yönetimi
 * @class StorageManager
 */
class StorageManager {
  static loadRackDataFromLocalStorage() {
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

    const racks = document.querySelectorAll('.rack');
    
    racks.forEach(rack => {
      const hucreInfo = getHucreInfo(rack);
      const rackPosition = getRackPosition(rack);
      const rackId = `R${hucreInfo}-${rackPosition}`;
      
      // Önce mevcut rack parçalarını temizle
      const existingRackParts = rack.querySelectorAll('.rack-part');
      existingRackParts.forEach(part => part.remove());
      
      // Dolu parçaları ve grupları takip et
      const filledParts = [];
      const deviceGroups = {};
      
      // Önce tüm parçaları yükle ve dolu olanları belirle
      for (let i = 1; i <= 45; i++) {
        const storageKey = `${rackId}-part-${i}`;
        const storageData = localStorage.getItem(storageKey);
        
        if (storageData) {
          const parsedData = JSON.parse(storageData);
          
          rack.setAttribute(`data-part-${i}`, parsedData.state);
          if (parsedData.label) {
            rack.setAttribute(`data-part-label-${i}`, parsedData.label);
          } else {
            rack.removeAttribute(`data-part-label-${i}`);
          }
          
          // Dolu parçaları takip et
          if (parsedData.state === 'filled') {
            filledParts.push({
              u: i,
              label: parsedData.label || '',
              deviceId: parsedData.deviceId || ''
            });
            
            // Cihaz gruplarını takip et
            if (parsedData.deviceId) {
              if (!deviceGroups[parsedData.deviceId]) {
                deviceGroups[parsedData.deviceId] = [];
              }
              deviceGroups[parsedData.deviceId].push(i);
            }
          }
        }
      }
      
      // Ardışık grupları bul
      const findConsecutiveGroups = (parts) => {
        if (!parts || parts.length === 0) return [];
        
        // Parçaları U değerine göre sırala
        const sortedParts = [...parts].sort((a, b) => a - b);
        
        const groups = [];
        let currentGroup = [sortedParts[0]];
        
        // Ardışık parçaları grupla
        for (let i = 1; i < sortedParts.length; i++) {
          const currentU = sortedParts[i-1];
          const nextU = sortedParts[i];
          
          // Eğer ardışıksa aynı gruba ekle
          if (nextU === currentU + 1) {
            currentGroup.push(nextU);
          } else {
            // Ardışık değilse yeni grup başlat
            groups.push(currentGroup);
            currentGroup = [nextU];
          }
        }
        
        // Son grubu ekle
        groups.push(currentGroup);
        
        return groups;
      };
      
      // Cihaz gruplarını oluştur
      Object.keys(deviceGroups).forEach(deviceId => {
        const groups = findConsecutiveGroups(deviceGroups[deviceId]);
        
        groups.forEach(group => {
          // Her grup için rack parçalarını oluştur
          group.forEach((u, index) => {
            const part = document.createElement('div');
            part.className = 'rack-part filled';
            part.dataset.u = u;
            part.dataset.deviceId = deviceId;
            
            // Grup sınıflarını ekle
            if (index === 0) {
              part.classList.add('group-start');
            } else if (index === group.length - 1) {
              part.classList.add('group-end');
            } else {
              part.classList.add('group-middle');
            }
            
            // Cihaz rengini bul ve uygula
            const deviceData = localStorage.getItem(`${rackId}-devices`);
            if (deviceData) {
              const devices = JSON.parse(deviceData);
              const device = devices.find(d => d.id === deviceId);
              if (device && device.color) {
                part.style.backgroundColor = device.color;
              }
            }
            
            rack.appendChild(part);
          });
        });
      });
      
      // Etiket gruplarını oluştur (aynı etikete sahip ardışık parçalar)
      const labelGroups = {};
      filledParts.forEach(part => {
        if (part.label && !part.deviceId) { // Cihaza ait olmayan etiketli parçalar
          if (!labelGroups[part.label]) {
            labelGroups[part.label] = [];
          }
          labelGroups[part.label].push(part.u);
        }
      });
      
      // Etiket gruplarını oluştur
      Object.keys(labelGroups).forEach(label => {
        const groups = findConsecutiveGroups(labelGroups[label]);
        
        groups.forEach(group => {
          // Her grup için rack parçalarını oluştur
          group.forEach((u, index) => {
            // Eğer bu parça zaten bir cihaza ait değilse
            if (!rack.querySelector(`.rack-part[data-u="${u}"]`)) {
              const part = document.createElement('div');
              part.className = 'rack-part filled';
              part.dataset.u = u;
              
              // Grup sınıflarını ekle
              if (index === 0) {
                part.classList.add('group-start');
              } else if (index === group.length - 1) {
                part.classList.add('group-end');
              } else {
                part.classList.add('group-middle');
              }
              
              rack.appendChild(part);
            }
          });
        });
      });
    });
  }
  
  /**
   * Mesafe ayarlarını localStorage'a kaydeder
   * @param {number} distance - Noktalar arası mesafe (cm)
   */
  static saveDistanceSettings(distance) {
    localStorage.setItem('beyazalan-distance-settings', JSON.stringify({
      pointDistance: distance
    }));
  }
  
  /**
   * Mesafe ayarlarını localStorage'dan yükler
   * @returns {Object} Mesafe ayarları
   */
  static loadDistanceSettings() {
    const settings = localStorage.getItem('beyazalan-distance-settings');
    if (settings) {
      return JSON.parse(settings);
    }
    return { pointDistance: 2 }; // Varsayılan değer
  }

  /**
   * Endpoint mesafe ayarlarını localStorage'a kaydeder
   * @param {Array} distances - Endpoint mesafeleri dizisi
   */
  static saveEndpointDistances(distances) {
    localStorage.setItem('beyazalan-endpoint-distances', JSON.stringify(distances));
  }
  
  /**
   * Endpoint mesafe ayarlarını localStorage'dan yükler
   * @returns {Array} Endpoint mesafeleri dizisi
   */
  static loadEndpointDistances() {
    const distances = localStorage.getItem('beyazalan-endpoint-distances');
    if (distances) {
      return JSON.parse(distances);
    }
    return []; // Varsayılan boş dizi
  }

  /**
   * İki endpoint arasındaki mesafeyi bulur
   * @param {string} endpoint1 - Birinci endpoint ID'si
   * @param {string} endpoint2 - İkinci endpoint ID'si
   * @returns {number|null} Mesafe değeri veya null (mesafe bulunamadıysa)
   */
  static getDistanceBetweenEndpoints(endpoint1, endpoint2) {
    const distances = this.loadEndpointDistances();
    
    // Endpoint sıralaması önemli değil, her iki yönde de kontrol et
    const distance = distances.find(d => 
      (d.endpoint1 === endpoint1 && d.endpoint2 === endpoint2) || 
      (d.endpoint1 === endpoint2 && d.endpoint2 === endpoint1)
    );
    
    return distance ? distance.value : null;
  }
}