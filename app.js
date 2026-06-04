// ==========================================================================
// Constantes e Utilitários de Data
// ==========================================================================

const CATEGORIES = {
    'Trabalho': { color: 'var(--info)', class: 'cat-trabalho' },
    'Pessoal': { color: '#d48c8c', class: 'cat-pessoal' },
    'Estudos': { color: '#d4a373', class: 'cat-estudos' },
    'Saúde': { color: 'var(--success)', class: 'cat-saude' },
    'Finanças': { color: 'var(--primary)', class: 'cat-financas' },
    'Outros': { color: 'var(--text-dark)', class: 'cat-outros' }
};

// Formata objeto Date para String YYYY-MM-DD sem problemas de fuso horário local
function formatDateToString(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// Formata string YYYY-MM-DD para exibição amigável em Português
function displayFriendlyDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
}

// Retorna o início (Domingo) e o fim (Sábado) da semana atual em relação a hoje
function getWeekRange() {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);
    
    return { start: startOfWeek, end: endOfWeek };
}

// ==========================================================================
// Estado da Aplicação
// ==========================================================================

let state = {
    tasks: [],
    selectedDate: formatDateToString(new Date()), // Data selecionada no calendário (padrão hoje)
    currentCalendarMonth: new Date(),            // Mês sendo visualizado no calendário
    activeFilter: 'all',                         // 'all', 'today', 'week', 'completed', ou 'category:<Nome>'
    dateFilterMode: 'sidebar',                   // 'sidebar' (usa activeFilter) ou 'calendar' (usa selectedDate)
    searchQuery: '',                             // Termo de pesquisa atual
    sortBy: 'date-desc',                         // 'date-asc', 'date-desc', 'priority-desc', 'alphabetical'
    completedCollapsed: false                    // Controla se a seção de concluídas está colapsada
};

// Tarefas padrão para o primeiro acesso
const DEFAULT_TASKS = [
    {
        id: 'default-1',
        title: 'Revisão do código do projeto TaskFlow 💻',
        description: 'Verificar a estrutura HTML/CSS, acessibilidade e responsividade da interface de calendário.',
        date: formatDateToString(new Date()), // Hoje
        category: 'Trabalho',
        priority: 'high',
        completed: false
    },
    {
        id: 'default-2',
        title: 'Treino de pernas e aeróbico 🏃‍♂️',
        description: 'Ir à academia às 19:30. Beber pelo menos 2L de água.',
        date: formatDateToString(new Date()), // Hoje
        category: 'Saúde',
        priority: 'medium',
        completed: false
    },
    {
        id: 'default-3',
        title: 'Estudar conceitos de Event Loop em JS 📚',
        description: 'Ler artigo na MDN e fazer exercícios práticos sobre microtasks e macrotasks.',
        date: formatDateToString(new Date(Date.now() + 86400000)), // Amanhã
        category: 'Estudos',
        priority: 'high',
        completed: false
    },
    {
        id: 'default-4',
        title: 'Planejar orçamento mensal do semestre 💰',
        description: 'Organizar planilha financeira e lançar gastos fixos e variáveis.',
        date: formatDateToString(new Date(Date.now() + 172800000)), // Em 2 dias
        category: 'Finanças',
        priority: 'low',
        completed: false
    },
    {
        id: 'default-5',
        title: 'Atualizar portfólio no GitHub',
        description: 'Subir os últimos projetos e refatorar o arquivo README principal.',
        date: formatDateToString(new Date(Date.now() - 86400000)), // Ontem
        category: 'Trabalho',
        priority: 'medium',
        completed: true
    }
];

// ==========================================================================
// Seleção de Elementos DOM
// ==========================================================================

const DOM = {
    // Sidebar
    btnFilterAll: document.getElementById('filter-all'),
    btnFilterToday: document.getElementById('filter-today'),
    btnFilterWeek: document.getElementById('filter-week'),
    btnFilterCompleted: document.getElementById('filter-completed'),
    categoryFiltersList: document.getElementById('category-filters-list'),
    
    badgeAll: document.getElementById('badge-all'),
    badgeToday: document.getElementById('badge-today'),
    badgeWeek: document.getElementById('badge-week'),
    badgeCompleted: document.getElementById('badge-completed'),

    // Calendário
    calendarMonthYear: document.getElementById('calendar-month-year'),
    calendarDaysGrid: document.getElementById('calendar-days-grid'),
    btnPrevMonth: document.getElementById('prev-month'),
    btnNextMonth: document.getElementById('next-month'),
    btnToday: document.getElementById('btn-today'),

    // Estatísticas
    progressBarFill: document.getElementById('progress-bar-fill'),
    statsPercentage: document.getElementById('stats-percentage'),
    statsCount: document.getElementById('stats-count'),

    // Painel de Tarefas
    tasksListTitle: document.getElementById('tasks-list-title'),
    tasksListSubtitle: document.getElementById('tasks-list-subtitle'),
    btnOpenAddModal: document.getElementById('btn-open-add-modal'),
    searchInput: document.getElementById('search-input'),
    selectSort: document.getElementById('select-sort'),
    tasksListPending: document.getElementById('tasks-list-pending'),
    tasksListCompleted: document.getElementById('tasks-list-completed'),
    completedSection: document.getElementById('completed-section'),
    btnToggleCompleted: document.getElementById('btn-toggle-completed'),
    completedChevron: document.getElementById('completed-chevron'),
    completedCount: document.getElementById('completed-count'),

    // Modal
    taskModal: document.getElementById('task-modal'),
    taskForm: document.getElementById('task-form'),
    taskIdInput: document.getElementById('task-id'),
    taskTitleInput: document.getElementById('task-title-input'),
    taskDescInput: document.getElementById('task-desc-input'),
    taskDateInput: document.getElementById('task-date-input'),
    taskCategoryInput: document.getElementById('task-category-input'),
    btnCancelModal: document.getElementById('btn-cancel-modal'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    modalTitle: document.getElementById('modal-title')
};

// ==========================================================================
// Funções de Inicialização e Persistência
// ==========================================================================

function init() {
    loadTasks();
    setupEventListeners();
    renderSidebarCategories();
    renderCalendar();
    renderTasks();
    updateBadgesAndStats();
}

function loadTasks() {
    const saved = localStorage.getItem('taskflow_tasks');
    if (saved) {
        state.tasks = JSON.parse(saved);
    } else {
        state.tasks = [...DEFAULT_TASKS];
        saveTasks();
    }
}

function saveTasks() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(state.tasks));
}

// ==========================================================================
// Renderização do Calendário Widget
// ==========================================================================

function renderCalendar() {
    const year = state.currentCalendarMonth.getFullYear();
    const month = state.currentCalendarMonth.getMonth();

    // Nome do Mês e Ano por extenso
    const monthYearString = state.currentCalendarMonth.toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
    });
    DOM.calendarMonthYear.textContent = monthYearString.charAt(0).toUpperCase() + monthYearString.slice(1);

    // Primeiro dia da semana do mês (0 = Domingo, 6 = Sábado)
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    // Total de dias do mês atual
    const totalDaysMonth = new Date(year, month + 1, 0).getDate();
    
    // Total de dias do mês anterior
    const totalDaysPrevMonth = new Date(year, month, 0).getDate();

    DOM.calendarDaysGrid.innerHTML = '';

    // 1. Renderizar os dias restantes do mês anterior (cinza/transparentes)
    for (let i = firstDayIndex; i > 0; i--) {
        const dayNum = totalDaysPrevMonth - i + 1;
        const prevMonthDate = new Date(year, month - 1, dayNum);
        const dateStr = formatDateToString(prevMonthDate);
        
        const dayEl = createDayCell(dayNum, dateStr, true);
        DOM.calendarDaysGrid.appendChild(dayEl);
    }

    // 2. Renderizar os dias do mês atual
    const todayStr = formatDateToString(new Date());
    for (let i = 1; i <= totalDaysMonth; i++) {
        const currentDate = new Date(year, month, i);
        const dateStr = formatDateToString(currentDate);
        
        const isToday = (dateStr === todayStr);
        const isSelected = (state.dateFilterMode === 'calendar' && dateStr === state.selectedDate);
        
        const dayEl = createDayCell(i, dateStr, false, isToday, isSelected);
        DOM.calendarDaysGrid.appendChild(dayEl);
    }

    // 3. Renderizar os dias do próximo mês para completar a grade de 42 dias (6 linhas)
    const totalCells = firstDayIndex + totalDaysMonth;
    const remainingCells = 42 - totalCells;
    
    for (let i = 1; i <= remainingCells; i++) {
        const nextMonthDate = new Date(year, month + 1, i);
        const dateStr = formatDateToString(nextMonthDate);
        
        const dayEl = createDayCell(i, dateStr, true);
        DOM.calendarDaysGrid.appendChild(dayEl);
    }
}

// Cria uma célula de dia individual
function createDayCell(dayNum, dateStr, isOtherMonth = false, isToday = false, isSelected = false) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    if (isOtherMonth) dayEl.classList.add('other-month');
    if (isToday) dayEl.classList.add('today');
    if (isSelected) dayEl.classList.add('selected');
    
    dayEl.innerHTML = `<span>${dayNum}</span>`;
    dayEl.dataset.date = dateStr;

    // Verificar se há tarefas ativas neste dia para desenhar indicadores
    const tasksOnDay = state.tasks.filter(t => t.date === dateStr && !t.completed);
    if (tasksOnDay.length > 0) {
        const indicatorContainer = document.createElement('div');
        indicatorContainer.className = 'day-indicators';
        
        // Criar indicadores únicos de prioridade no dia
        const prioritiesOnDay = [...new Set(tasksOnDay.map(t => t.priority))];
        prioritiesOnDay.forEach(prio => {
            const ind = document.createElement('span');
            ind.className = `indicator ${prio}`;
            indicatorContainer.appendChild(ind);
        });
        
        dayEl.appendChild(indicatorContainer);
    }

    // Evento de clique para selecionar o dia
    dayEl.addEventListener('click', () => {
        selectCalendarDate(dateStr);
    });

    return dayEl;
}

// Seleciona a data no calendário e aplica filtro
function selectCalendarDate(dateStr) {
    state.selectedDate = dateStr;
    state.dateFilterMode = 'calendar';
    
    // Sincroniza mês visualizado caso clique em dia do mês adjacente
    const [y, m, d] = dateStr.split('-').map(Number);
    state.currentCalendarMonth = new Date(y, m - 1, 1);

    // Remove destaque de filtros da sidebar
    document.querySelectorAll('.nav-btn, .category-btn').forEach(btn => btn.classList.remove('active'));

    renderCalendar();
    renderTasks();
    updateBadgesAndStats();
}

// Redefine para visualizar e selecionar a data de "Hoje"
function goToToday() {
    const today = new Date();
    state.currentCalendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    selectCalendarDate(formatDateToString(today));
}

// Navegação de mês
function changeMonth(direction) {
    const offset = direction === 'next' ? 1 : -1;
    state.currentCalendarMonth.setMonth(state.currentCalendarMonth.getMonth() + offset);
    renderCalendar();
}

// ==========================================================================
// Gerenciamento e Exibição de Tarefas (CRUD)
// ==========================================================================

// Renderiza a lista lateral de categorias
function renderSidebarCategories() {
    DOM.categoryFiltersList.innerHTML = '';
    
    Object.keys(CATEGORIES).forEach(catName => {
        const cat = CATEGORIES[catName];
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.id = `cat-${catName.toLowerCase()}`;
        
        // Contar tarefas pendentes na categoria
        const count = state.tasks.filter(t => t.category === catName && !t.completed).length;
        
        btn.innerHTML = `
            <span class="cat-dot" style="background-color: ${cat.color}"></span>
            <span>${catName}</span>
            <span class="badge">${count}</span>
        `;
        
        btn.addEventListener('click', () => {
            applySidebarFilter(`category:${catName}`, btn);
        });
        
        DOM.categoryFiltersList.appendChild(btn);
    });
}

// Aplica filtros clicando na barra lateral
function applySidebarFilter(filterType, elementClicked) {
    state.dateFilterMode = 'sidebar';
    state.activeFilter = filterType;
    
    // Atualiza classe ativa nos botões da sidebar
    document.querySelectorAll('.nav-btn, .category-btn').forEach(btn => btn.classList.remove('active'));
    elementClicked.classList.add('active');

    renderTasks();
    updateBadgesAndStats();
}

// Filtra e ordena as tarefas de acordo com o estado atual
function getFilteredAndSortedTasks() {
    let filtered = [...state.tasks];

    // 1. Filtragem por data ou seleção da sidebar
    if (state.dateFilterMode === 'calendar') {
        filtered = filtered.filter(t => t.date === state.selectedDate);
    } else {
        // Filtros laterais
        if (state.activeFilter === 'today') {
            const todayStr = formatDateToString(new Date());
            filtered = filtered.filter(t => t.date === todayStr);
        } else if (state.activeFilter === 'week') {
            const range = getWeekRange();
            filtered = filtered.filter(t => {
                const [y, m, d] = t.date.split('-').map(Number);
                const taskDate = new Date(y, m - 1, d);
                return taskDate >= range.start && taskDate <= range.end;
            });
        } else if (state.activeFilter === 'completed') {
            filtered = filtered.filter(t => t.completed);
        } else if (state.activeFilter.startsWith('category:')) {
            const catName = state.activeFilter.split(':')[1];
            filtered = filtered.filter(t => t.category === catName);
        }
        // Se for 'all', não aplica nenhum filtro extra
    }

    // 2. Filtro de barra de pesquisa
    if (state.searchQuery.trim() !== '') {
        const query = state.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(query) || 
            (t.description && t.description.toLowerCase().includes(query))
        );
    }

    // 3. Ordenação
    filtered.sort((a, b) => {
        if (state.sortBy === 'date-asc') {
            return a.date.localeCompare(b.date);
        } else if (state.sortBy === 'date-desc') {
            return b.date.localeCompare(a.date);
        } else if (state.sortBy === 'priority-desc') {
            const prioWeight = { high: 3, medium: 2, low: 1 };
            return prioWeight[b.priority] - prioWeight[a.priority];
        } else if (state.sortBy === 'alphabetical') {
            return a.title.localeCompare(b.title);
        }
        return 0;
    });

    return filtered;
}

// Renderiza a lista de tarefas pendentes e concluídas
function renderTasks() {
    const list = getFilteredAndSortedTasks();
    const pending = list.filter(t => !t.completed);
    const completed = list.filter(t => t.completed);

    // Atualizar títulos dos cabeçalhos baseados nos filtros ativos
    updateTaskListHeaders(list.length);

    // Renderizar Pendentes
    DOM.tasksListPending.innerHTML = '';
    if (pending.length === 0) {
        DOM.tasksListPending.innerHTML = `
            <div class="empty-state">
                <i data-lucide="clipboard-list" class="empty-icon"></i>
                <p>Nenhuma tarefa pendente encontrada.</p>
            </div>
        `;
    } else {
        pending.forEach(task => {
            const card = createTaskCard(task);
            DOM.tasksListPending.appendChild(card);
        });
    }

    // Renderizar Concluídas
    DOM.tasksListCompleted.innerHTML = '';
    DOM.completedCount.textContent = completed.length;
    
    if (completed.length === 0) {
        DOM.completedSection.style.display = 'none';
    } else {
        DOM.completedSection.style.display = 'block';
        completed.forEach(task => {
            const card = createTaskCard(task);
            DOM.tasksListCompleted.appendChild(card);
        });
    }

    // Processa os ícones do Lucide nos novos cartões renderizados
    lucide.createIcons();
}

// Cria a estrutura DOM de um cartão de tarefa
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed' : ''}`;
    card.dataset.id = task.id;

    // Verificar se o prazo expirou (se a tarefa não estiver concluída)
    const todayStr = formatDateToString(new Date());
    const isOverdue = !task.completed && task.date < todayStr;
    const dueClass = isOverdue ? 'due-overdue' : '';

    // Nome de exibição amigável da prioridade
    const prioLabel = { low: 'Baixa', medium: 'Média', high: 'Alta' }[task.priority];

    card.innerHTML = `
        <label class="task-checkbox-container" title="${task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}">
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span class="checkmark"></span>
        </label>
        
        <div class="task-details">
            <h4 class="task-title">${escapeHTML(task.title)}</h4>
            ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}
            
            <div class="task-meta">
                <span class="meta-pill prio-${task.priority}">
                    <i data-lucide="alert-circle"></i>
                    <span>${prioLabel}</span>
                </span>
                
                <span class="meta-pill ${CATEGORIES[task.category]?.class || 'cat-outros'}">
                    <i data-lucide="tag"></i>
                    <span>${task.category}</span>
                </span>
                
                <span class="meta-pill ${dueClass}">
                    <i data-lucide="calendar"></i>
                    <span>${formatDateToBR(task.date)}</span>
                    ${isOverdue ? ' (Atrasada)' : ''}
                </span>
            </div>
        </div>

        <div class="task-actions">
            <button class="btn-icon btn-edit" title="Editar Tarefa">
                <i data-lucide="edit-3"></i>
            </button>
            <button class="btn-icon danger btn-delete" title="Excluir Tarefa">
                <i data-lucide="trash-2"></i>
            </button>
        </div>
    `;

    // Eventos do cartão
    const checkbox = card.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => toggleTaskStatus(task.id));

    const btnEdit = card.querySelector('.btn-edit');
    btnEdit.addEventListener('click', () => openEditModal(task));

    const btnDelete = card.querySelector('.btn-delete');
    btnDelete.addEventListener('click', () => deleteTask(task.id));

    return card;
}

// Atualiza o título e subtítulo da seção de tarefas com base no filtro ativo
function updateTaskListHeaders(totalCount) {
    let title = 'Todas as Tarefas';
    let subtitle = '';

    if (state.dateFilterMode === 'calendar') {
        const friendly = displayFriendlyDate(state.selectedDate);
        title = `Tarefas no Dia`;
        subtitle = friendly.charAt(0).toUpperCase() + friendly.slice(1);
    } else {
        if (state.activeFilter === 'today') {
            title = 'Tarefas de Hoje';
            subtitle = displayFriendlyDate(formatDateToString(new Date()));
        } else if (state.activeFilter === 'week') {
            title = 'Tarefas desta Semana';
            const range = getWeekRange();
            subtitle = `Período: ${formatDateToBR(formatDateToString(range.start))} a ${formatDateToBR(formatDateToString(range.end))}`;
        } else if (state.activeFilter === 'completed') {
            title = 'Histórico de Concluídas';
            subtitle = 'Lista de todas as tarefas resolvidas';
        } else if (state.activeFilter.startsWith('category:')) {
            const catName = state.activeFilter.split(':')[1];
            title = `Categoria: ${catName}`;
            subtitle = `Exibindo tarefas de ${catName}`;
        }
    }

    DOM.tasksListTitle.textContent = title;
    DOM.tasksListSubtitle.textContent = `${subtitle} • ${totalCount} encontrada(s)`;
}

// ==========================================================================
// Funções CRUD auxiliares
// ==========================================================================

function toggleTaskStatus(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderCalendar(); // Atualiza indicadores do calendário
        renderTasks();
        updateBadgesAndStats();
        renderSidebarCategories(); // Atualiza contagem das categorias
    }
}

function deleteTask(id) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        state.tasks = state.tasks.filter(t => t.id !== id);
        saveTasks();
        renderCalendar();
        renderTasks();
        updateBadgesAndStats();
        renderSidebarCategories();
    }
}

function saveTaskFromForm(e) {
    e.preventDefault();

    const taskId = DOM.taskIdInput.value;
    const title = DOM.taskTitleInput.value.trim();
    const description = DOM.taskDescInput.value.trim();
    const date = DOM.taskDateInput.value;
    const category = DOM.taskCategoryInput.value;
    const priority = DOM.taskForm.querySelector('input[name="priority"]:checked').value;

    if (!title || !date) return;

    if (taskId) {
        // Editando tarefa existente
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            task.title = title;
            task.description = description;
            task.date = date;
            task.category = category;
            task.priority = priority;
        }
    } else {
        // Criando nova tarefa
        const newTask = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            title,
            description,
            date,
            category,
            priority,
            completed: false
        };
        state.tasks.push(newTask);
    }

    saveTasks();
    closeModal();
    
    // Se a tarefa adicionada/editada for no dia selecionado, renderiza
    renderCalendar();
    renderTasks();
    updateBadgesAndStats();
    renderSidebarCategories();
}

// ==========================================================================
// Gerenciamento do Modal
// ==========================================================================

function openAddModal() {
    DOM.modalTitle.textContent = 'Nova Tarefa';
    DOM.taskIdInput.value = '';
    DOM.taskForm.reset();
    
    // Preenche com a data selecionada no calendário ou com hoje
    if (state.dateFilterMode === 'calendar') {
        DOM.taskDateInput.value = state.selectedDate;
    } else {
        DOM.taskDateInput.value = formatDateToString(new Date());
    }

    // Padrão prioridade baixa no reset do form
    DOM.taskForm.querySelector('input[name="priority"][value="low"]').checked = true;

    DOM.taskModal.classList.add('active');
}

function openEditModal(task) {
    DOM.modalTitle.textContent = 'Editar Tarefa';
    DOM.taskIdInput.value = task.id;
    DOM.taskTitleInput.value = task.title;
    DOM.taskDescInput.value = task.description || '';
    DOM.taskDateInput.value = task.date;
    DOM.taskCategoryInput.value = task.category;
    
    DOM.taskForm.querySelector(`input[name="priority"][value="${task.priority}"]`).checked = true;

    DOM.taskModal.classList.add('active');
}

function closeModal() {
    DOM.taskModal.classList.remove('active');
}

// ==========================================================================
// Painel de Estatísticas e Badges
// ==========================================================================

function updateBadgesAndStats() {
    const todayStr = formatDateToString(new Date());
    const weekRange = getWeekRange();

    // Contadores gerais
    const totalCount = state.tasks.length;
    const pendingCount = state.tasks.filter(t => !t.completed).length;
    const completedCount = state.tasks.filter(t => t.completed).length;

    // Badges da Sidebar (apenas itens ativos/pendentes)
    DOM.badgeAll.textContent = pendingCount;
    
    DOM.badgeToday.textContent = state.tasks.filter(t => 
        t.date === todayStr && !t.completed
    ).length;
    
    DOM.badgeWeek.textContent = state.tasks.filter(t => {
        const [y, m, d] = t.date.split('-').map(Number);
        const taskDate = new Date(y, m - 1, d);
        return taskDate >= weekRange.start && taskDate <= weekRange.end && !t.completed;
    }).length;

    DOM.badgeCompleted.textContent = completedCount;

    // Estatísticas da Barra de Progresso
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    DOM.progressBarFill.style.width = `${percentage}%`;
    DOM.statsPercentage.textContent = `${percentage}% concluído`;
    DOM.statsCount.textContent = `${completedCount} de ${totalCount} tarefas`;
}

// ==========================================================================
// Configuração de Event Listeners
// ==========================================================================

function setupEventListeners() {
    // Cliques na Sidebar
    DOM.btnFilterAll.addEventListener('click', () => applySidebarFilter('all', DOM.btnFilterAll));
    DOM.btnFilterToday.addEventListener('click', () => applySidebarFilter('today', DOM.btnFilterToday));
    DOM.btnFilterWeek.addEventListener('click', () => applySidebarFilter('week', DOM.btnFilterWeek));
    DOM.btnFilterCompleted.addEventListener('click', () => applySidebarFilter('completed', DOM.btnFilterCompleted));

    // Cliques do Calendário
    DOM.btnPrevMonth.addEventListener('click', () => changeMonth('prev'));
    DOM.btnNextMonth.addEventListener('click', () => changeMonth('next'));
    DOM.btnToday.addEventListener('click', goToToday);

    // Barra de Pesquisa e Ordenação
    DOM.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderTasks();
    });
    DOM.selectSort.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderTasks();
    });

    // Seção de Concluídas (Colapsar)
    DOM.btnToggleCompleted.addEventListener('click', () => {
        state.completedCollapsed = !state.completedCollapsed;
        DOM.btnToggleCompleted.classList.toggle('collapsed', state.completedCollapsed);
        lucide.createIcons(); // Recriar o ícone da setinha
        
        if (state.completedCollapsed) {
            DOM.tasksListCompleted.style.maxHeight = '0px';
            DOM.tasksListCompleted.style.opacity = '0';
            DOM.completedChevron.style.transform = 'rotate(-90deg)';
        } else {
            DOM.tasksListCompleted.style.maxHeight = '1000px'; // Altura máxima fictícia segura
            DOM.tasksListCompleted.style.opacity = '1';
            DOM.completedChevron.style.transform = 'rotate(0deg)';
        }
    });

    // Controles do Modal
    DOM.btnOpenAddModal.addEventListener('click', openAddModal);
    DOM.btnCloseModal.addEventListener('click', closeModal);
    DOM.btnCancelModal.addEventListener('click', closeModal);
    DOM.taskForm.addEventListener('submit', saveTaskFromForm);

    // Fechar modal clicando fora
    window.addEventListener('click', (e) => {
        if (e.target === DOM.taskModal) {
            closeModal();
        }
    });
}

// ==========================================================================
// Utilitários de Formatação Adicionais e Escapes
// ==========================================================================

// Formata data do padrão YYYY-MM-DD para DD/MM/YYYY
function formatDateToBR(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Previne injeção de XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Inicializar tudo ao carregar a página
document.addEventListener('DOMContentLoaded', init);
