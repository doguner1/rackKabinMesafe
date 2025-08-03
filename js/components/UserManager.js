/**
 * Kullanıcı yönetimi sınıfı
 * @class UserManager
 */
class UserManager {
  constructor() {
    this.storageKey = 'beyazalan-users';
    this.currentUserKey = 'beyazalan-current-user';
    
    // İlk kullanımda admin kullanıcısını oluştur
    this.initializeUsers();
  }
  
  /**
   * İlk kullanımda admin kullanıcısını oluşturur
   */
  initializeUsers() {
    const users = this.getUsers();
    
    // Eğer hiç kullanıcı yoksa, admin kullanıcısını ekle
    if (users.length === 0) {
      this.addUser('admin', 'admin', true);
    }
  }
  
  /**
   * Tüm kullanıcıları döndürür
   * @returns {Array} Kullanıcı listesi
   */
  getUsers() {
    const usersJson = localStorage.getItem(this.storageKey);
    return usersJson ? JSON.parse(usersJson) : [];
  }
  
  /**
   * Kullanıcı ekler
   * @param {string} username - Kullanıcı adı
   * @param {string} password - Şifre
   * @param {boolean} isAdmin - Admin yetkisi
   * @returns {boolean} Ekleme başarılı mı
   */
  addUser(username, password, isAdmin = false) {
    const users = this.getUsers();
    
    // Kullanıcı adı zaten var mı kontrol et
    if (users.some(user => user.username === username)) {
      return false;
    }
    
    // Yeni kullanıcıyı ekle
    users.push({
      username,
      password,
      isAdmin
    });
    
    // Kullanıcıları kaydet
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    return true;
  }
  
  /**
   * Kullanıcı şifresini günceller
   * @param {string} username - Kullanıcı adı
   * @param {string} newPassword - Yeni şifre
   * @returns {boolean} Güncelleme başarılı mı
   */
  updatePassword(username, newPassword) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.username === username);
    
    if (userIndex === -1) {
      return false;
    }
    
    users[userIndex].password = newPassword;
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    return true;
  }
  
  /**
   * Kullanıcıyı siler
   * @param {string} username - Kullanıcı adı
   * @returns {boolean} Silme başarılı mı
   */
  deleteUser(username) {
    // Admin kullanıcısını silmeye izin verme
    if (username === 'admin') {
      return false;
    }
    
    const users = this.getUsers();
    const filteredUsers = users.filter(user => user.username !== username);
    
    if (filteredUsers.length === users.length) {
      return false; // Kullanıcı bulunamadı
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(filteredUsers));
    return true;
  }
  
  /**
   * Kullanıcı girişi yapar
   * @param {string} username - Kullanıcı adı
   * @param {string} password - Şifre
   * @returns {Object} Giriş sonucu
   */
  login(username, password) {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      // Giriş başarılı, oturum bilgisini kaydet
      localStorage.setItem(this.currentUserKey, JSON.stringify({
        username: user.username,
        isAdmin: user.isAdmin
      }));
      
      return {
        success: true,
        isAdmin: user.isAdmin
      };
    }
    
    return {
      success: false
    };
  }
  
  /**
   * Mevcut kullanıcı bilgisini döndürür
   * @returns {Object|null} Kullanıcı bilgisi
   */
  getCurrentUser() {
    const userJson = localStorage.getItem(this.currentUserKey);
    return userJson ? JSON.parse(userJson) : null;
  }
  
  /**
   * Kullanıcı çıkışı yapar
   */
  logout() {
    localStorage.removeItem(this.currentUserKey);
  }
}