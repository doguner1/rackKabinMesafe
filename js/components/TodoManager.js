/**
 * Todo List yönetimi
 * @class TodoManager
 */
class TodoManager {
  constructor() {
    this.todoList = document.getElementById('todo-list');
    this.todoInput = document.getElementById('todo-input');
    this.addTodoBtn = document.getElementById('add-todo-btn');
    this.emptyMessage = document.querySelector('.todo-empty-message');
    this.todoCount = document.getElementById('todo-count');
    
    // Kullanıcı yöneticisine erişim
    this.userManager = window.userManagerInstance || new UserManager();
    
    // Kullanıcı filtresi için dropdown oluştur
    this.createUserFilter();
    
    // Tüm görevleri yükle
    this.allTodos = this.loadAllTodos();
    
    // Mevcut kullanıcının görevlerini filtrele
    this.filterTodosByCurrentUser();
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderTodos();
  }

  setupEventListeners() {
    this.addTodoBtn.addEventListener('click', () => this.addTodo());
    
    this.todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addTodo();
      }
    });
  }

  // Kullanıcı filtresi oluştur
  createUserFilter() {
    // Todo header'a kullanıcı filtresi ekle
    const todoHeader = document.querySelector('.todo-header');
    
    // Filtre container oluştur
    const filterContainer = document.createElement('div');
    filterContainer.className = 'todo-filter';
    
    // Kullanıcı dropdown'ı oluştur
    const userSelect = document.createElement('select');
    userSelect.id = 'todo-user-filter';
    userSelect.className = 'todo-user-filter';
    
    // Mevcut kullanıcı
    const currentUser = this.userManager.getCurrentUser();
    
    // Eğer admin ise tüm kullanıcıların görevlerini görebilir
    if (currentUser && currentUser.isAdmin) {
      // Tüm görevler seçeneği
      const allOption = document.createElement('option');
      allOption.value = 'all';
      allOption.textContent = 'Tüm Görevler';
      userSelect.appendChild(allOption);
      
      // Tüm kullanıcıları ekle
      const users = this.userManager.getUsers();
      users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.username;
        option.textContent = user.username;
        
        // Mevcut kullanıcıyı seçili yap
        if (currentUser && user.username === currentUser.username) {
          option.selected = true;
        }
        
        userSelect.appendChild(option);
      });
      
      // Filtre değiştiğinde görevleri güncelle
      userSelect.addEventListener('change', () => {
        this.filterTodosByUser(userSelect.value);
      });
      
      filterContainer.appendChild(userSelect);
      todoHeader.appendChild(filterContainer);
    }
  }

  // Tüm görevleri yükle
  loadAllTodos() {
    return JSON.parse(localStorage.getItem('todos')) || [];
  }

  // Mevcut kullanıcının görevlerini filtrele
  filterTodosByCurrentUser() {
    const currentUser = this.userManager.getCurrentUser();
    
    if (currentUser) {
      if (currentUser.isAdmin) {
        // Admin tüm görevleri görebilir (varsayılan olarak kendi görevlerini göster)
        this.todos = this.allTodos.filter(todo => 
          !todo.username || todo.username === currentUser.username
        );
      } else {
        // Normal kullanıcı sadece kendi görevlerini görebilir
        this.todos = this.allTodos.filter(todo => 
          !todo.username || todo.username === currentUser.username
        );
      }
    } else {
      // Kullanıcı girişi yoksa boş liste göster
      this.todos = [];
    }
  }

  // Belirli bir kullanıcının görevlerini filtrele
  filterTodosByUser(username) {
    if (username === 'all') {
      // Tüm görevleri göster
      this.todos = this.allTodos;
    } else {
      // Belirli kullanıcının görevlerini göster
      this.todos = this.allTodos.filter(todo => 
        !todo.username || todo.username === username
      );
    }
    
    this.renderTodos();
  }

  updateTodoCount() {
    const uncompletedCount = this.todos.filter(todo => !todo.completed).length;
    if (uncompletedCount > 0) {
      this.todoCount.textContent = `(${uncompletedCount})`;
    } else {
      this.todoCount.textContent = '';
    }
  }

  renderTodos() {
    this.todoList.innerHTML = '';
    
    if (this.todos.length === 0) {
      this.emptyMessage.style.display = 'block';
    } else {
      this.emptyMessage.style.display = 'none';
      
      this.todos.forEach((todo, index) => {
        const todoItem = document.createElement('li');
        todoItem.className = 'todo-item';
        todoItem.dataset.index = index;
        
        // Öncelik rengini ayarla
        if (todo.priority) {
          switch(todo.priority) {
            case 'important':
              todoItem.style.borderLeft = '4px solid #FF9800';
              break;
            case 'urgent':
              todoItem.style.borderLeft = '4px solid #F44336';
              break;
            default:
              todoItem.style.borderLeft = '4px solid #4CAF50';
          }
        }
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        
        const todoText = document.createElement('span');
        todoText.className = 'todo-text';
        if (todo.completed) todoText.classList.add('completed');
        todoText.textContent = todo.text;
        
        // Kullanıcı adını göster (eğer varsa ve mevcut kullanıcı admin ise)
        const currentUser = this.userManager.getCurrentUser();
        if (currentUser && currentUser.isAdmin && todo.username) {
          const userBadge = document.createElement('span');
          userBadge.className = 'todo-user-badge';
          userBadge.textContent = todo.username;
          todoItem.appendChild(userBadge);
        }
        
        // Eğer görev admin tarafından atanmışsa bir bilgi etiketi ekle
        if (todo.assignedBy && todo.assignedBy !== todo.username) {
          const assignedByBadge = document.createElement('span');
          assignedByBadge.className = 'todo-assigned-badge';
          assignedByBadge.style.fontSize = '11px';
          assignedByBadge.style.backgroundColor = '#1a237e';
          assignedByBadge.style.color = 'white';
          assignedByBadge.style.padding = '2px 5px';
          assignedByBadge.style.borderRadius = '3px';
          assignedByBadge.style.marginLeft = '5px';
          assignedByBadge.innerHTML = `<i class="fas fa-user-shield"></i> ${todo.assignedBy}`;
          todoItem.appendChild(assignedByBadge);
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'todo-delete';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        
        todoItem.appendChild(checkbox);
        todoItem.appendChild(todoText);
        todoItem.appendChild(deleteBtn);
        this.todoList.appendChild(todoItem);
        
        checkbox.addEventListener('change', () => {
          // Görev tamamlama durumunu güncelle
          const todoIndex = this.allTodos.findIndex(t => 
            t.id === todo.id
          );
          
          if (todoIndex !== -1) {
            this.allTodos[todoIndex].completed = checkbox.checked;
            
            // Tamamlanma tarihini ekle veya kaldır
            if (checkbox.checked) {
              this.allTodos[todoIndex].completedAt = new Date().toISOString();
              todoText.classList.add('completed');
            } else {
              delete this.allTodos[todoIndex].completedAt;
              todoText.classList.remove('completed');
            }
            
            this.saveTodos();
            this.updateTodoCount();
          }
        });
        
        deleteBtn.addEventListener('click', () => {
          todoItem.classList.add('removing');
          setTimeout(() => {
            // Görevi tüm görevlerden kaldır
            const todoIndex = this.allTodos.findIndex(t => 
              t.id === todo.id
            );
            
            if (todoIndex !== -1) {
              this.allTodos.splice(todoIndex, 1);
              this.saveTodos();
              
              // Filtrelenmiş listeyi güncelle
              const filterSelect = document.getElementById('todo-user-filter');
              if (filterSelect) {
                this.filterTodosByUser(filterSelect.value);
              } else {
                this.filterTodosByCurrentUser();
              }
              
              this.renderTodos();
              this.updateTodoCount();
            }
          }, 300);
        });
      });
    }
    
    this.updateTodoCount();
  }

  saveTodos() {
    localStorage.setItem('todos', JSON.stringify(this.allTodos));
  }

  addTodo() {
    const text = this.todoInput.value.trim();
    if (text) {
      // Mevcut kullanıcıyı al
      const currentUser = this.userManager.getCurrentUser();
      
      if (currentUser) {
        // Yeni göreve benzersiz ID ve kullanıcı adı ekle
        const newTodo = {
          id: Date.now().toString(), // Benzersiz ID
          text,
          completed: false,
          username: currentUser.username,
          createdAt: new Date().toISOString()
        };
        
        // Tüm görevlere ekle
        this.allTodos.push(newTodo);
        
        // Filtrelenmiş listeyi güncelle
        const filterSelect = document.getElementById('todo-user-filter');
        if (filterSelect) {
          this.filterTodosByUser(filterSelect.value);
        } else {
          this.filterTodosByCurrentUser();
        }
        
        this.todoInput.value = '';
        this.saveTodos();
        this.renderTodos();
      }
    }
  }
}