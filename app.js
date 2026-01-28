// ===== Data & State =====
const CATEGORIES = {
    study: { icon: '📚', name: 'Học tập', color: '#6366f1' },
    food: { icon: '🍔', name: 'Ăn uống', color: '#f59e0b' },
    transport: { icon: '🚌', name: 'Di chuyển', color: '#10b981' },
    entertainment: { icon: '🎮', name: 'Giải trí', color: '#ec4899' },
    clothing: { icon: '👕', name: 'Quần áo', color: '#8b5cf6' },
    health: { icon: '💊', name: 'Y tế', color: '#ef4444' },
    tech: { icon: '📱', name: 'Công nghệ', color: '#06b6d4' },
    other: { icon: '🎁', name: 'Khác', color: '#64748b' }
};

let expenses = [];
let charts = {};

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initCharts();
    updateUI();
    setupEventListeners();
    updateCurrentDate();
});

// ===== Local Storage =====
function loadData() {
    const saved = localStorage.getItem('studentExpenses');
    if (saved) {
        expenses = JSON.parse(saved);
    }
}

function saveData() {
    localStorage.setItem('studentExpenses', JSON.stringify(expenses));
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const section = item.dataset.section;
            switchSection(section);
        });
    });

    // Prevent clicks inside sidebar from closing it
    document.querySelector('.sidebar').addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Mobile menu toggle
    document.getElementById('menuToggle').addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelector('.sidebar').classList.toggle('open');
    });

    // Close sidebar when clicking outside (only on mobile when sidebar is open)
    document.querySelector('.main-content').addEventListener('click', (e) => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // Add expense form
    document.getElementById('expenseForm').addEventListener('submit', handleAddExpense);

    // Set default date to today
    document.getElementById('expenseDate').valueAsDate = new Date();

    // Filter and sort
    document.getElementById('filterCategory').addEventListener('change', renderExpenseTable);
    document.getElementById('sortBy').addEventListener('change', renderExpenseTable);

    // Clear data
    document.getElementById('clearDataBtn').addEventListener('click', handleClearData);

    // Edit modal
    document.getElementById('closeModal').addEventListener('click', closeEditModal);
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
    document.getElementById('editForm').addEventListener('submit', handleEditExpense);

    // Close modal on outside click
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') {
            closeEditModal();
        }
    });
}

// ===== Navigation =====
function switchSection(sectionId) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });

    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });

    // Close mobile sidebar
    document.querySelector('.sidebar').classList.remove('open');
}

// ===== Add Expense =====
function handleAddExpense(e) {
    e.preventDefault();

    const expense = {
        id: Date.now(),
        name: document.getElementById('expenseName').value.trim(),
        amount: parseInt(document.getElementById('expenseAmount').value),
        category: document.getElementById('expenseCategory').value,
        date: document.getElementById('expenseDate').value,
        note: document.getElementById('expenseNote').value.trim(),
        votes: 0,
        createdAt: new Date().toISOString()
    };

    expenses.unshift(expense);
    saveData();
    updateUI();

    // Reset form
    e.target.reset();
    document.getElementById('expenseDate').valueAsDate = new Date();

    showToast('Đã thêm khoản chi mới!');
    switchSection('dashboard');
}

// ===== Edit Expense =====
function openEditModal(id) {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    document.getElementById('editId').value = expense.id;
    document.getElementById('editName').value = expense.name;
    document.getElementById('editAmount').value = expense.amount;
    document.getElementById('editCategory').value = expense.category;
    document.getElementById('editDate').value = expense.date;
    document.getElementById('editNote').value = expense.note || '';

    document.getElementById('editModal').classList.add('show');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
}

function handleEditExpense(e) {
    e.preventDefault();

    const id = parseInt(document.getElementById('editId').value);
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) return;

    expenses[index] = {
        ...expenses[index],
        name: document.getElementById('editName').value.trim(),
        amount: parseInt(document.getElementById('editAmount').value),
        category: document.getElementById('editCategory').value,
        date: document.getElementById('editDate').value,
        note: document.getElementById('editNote').value.trim()
    };

    saveData();
    updateUI();
    closeEditModal();
    showToast('Đã cập nhật khoản chi!');
}

// ===== Delete Expense =====
function deleteExpense(id) {
    if (!confirm('Bạn có chắc muốn xóa khoản chi này?')) return;

    expenses = expenses.filter(e => e.id !== id);
    saveData();
    updateUI();
    showToast('Đã xóa khoản chi!');
}

// ===== Voting =====
function upvote(id) {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
        expense.votes++;
        saveData();
        updateUI();
    }
}

function downvote(id) {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
        expense.votes--;
        saveData();
        updateUI();
    }
}

// ===== Clear Data =====
function handleClearData() {
    if (!confirm('Xóa tất cả dữ liệu? Hành động này không thể hoàn tác!')) return;

    expenses = [];
    saveData();
    updateUI();
    showToast('Đã xóa tất cả dữ liệu!');
}

// ===== Update UI =====
function updateUI() {
    updateStats();
    updateCharts();
    renderRecentExpenses();
    renderExpenseTable();
    renderVoteCards();
    renderTopVoted();
    renderCategoryBreakdown();
    renderQuickStats();
}

// ===== Stats =====
function updateStats() {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const thisMonth = expenses
        .filter(e => {
            const expDate = new Date(e.date);
            const now = new Date();
            return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, e) => sum + e.amount, 0);
    const totalVotes = expenses.reduce((sum, e) => sum + Math.abs(e.votes), 0);

    document.getElementById('totalExpense').textContent = formatCurrency(total);
    document.getElementById('monthExpense').textContent = formatCurrency(thisMonth);
    document.getElementById('expenseCount').textContent = expenses.length;
    document.getElementById('totalVotes').textContent = totalVotes;
}

// ===== Charts =====
function initCharts() {
    // Category Pie Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    charts.category = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#94a3b8',
                        padding: 15,
                        font: { size: 12 }
                    }
                }
            },
            cutout: '60%'
        }
    });

    // Monthly Bar Chart
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    charts.monthly = new Chart(monthlyCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Chi tiêu',
                data: [],
                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                borderColor: '#6366f1',
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: 'rgba(99, 102, 241, 0.9)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: {
                        color: '#94a3b8',
                        callback: value => formatCurrency(value)
                    }
                }
            }
        }
    });

    // Trend Line Chart
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    charts.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Chi tiêu hàng ngày',
                data: [],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#94a3b8' }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: {
                        color: '#94a3b8',
                        callback: value => formatCurrency(value)
                    }
                }
            }
        }
    });
}

function updateCharts() {
    // Category Chart
    const categoryData = {};
    expenses.forEach(e => {
        if (!categoryData[e.category]) {
            categoryData[e.category] = 0;
        }
        categoryData[e.category] += e.amount;
    });

    const categoryLabels = Object.keys(categoryData).map(key => CATEGORIES[key]?.name || key);
    const categoryValues = Object.values(categoryData);
    const categoryColors = Object.keys(categoryData).map(key => CATEGORIES[key]?.color || '#64748b');

    charts.category.data.labels = categoryLabels;
    charts.category.data.datasets[0].data = categoryValues;
    charts.category.data.datasets[0].backgroundColor = categoryColors;
    charts.category.update('none');

    // Monthly Chart
    const monthlyData = {};
    const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    
    expenses.forEach(e => {
        const date = new Date(e.date);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthlyData[key]) {
            monthlyData[key] = { month: date.getMonth(), year: date.getFullYear(), amount: 0 };
        }
        monthlyData[key].amount += e.amount;
    });

    const sortedMonths = Object.values(monthlyData)
        .sort((a, b) => (a.year - b.year) || (a.month - b.month))
        .slice(-6);

    charts.monthly.data.labels = sortedMonths.map(m => monthNames[m.month]);
    charts.monthly.data.datasets[0].data = sortedMonths.map(m => m.amount);
    charts.monthly.update('none');

    // Trend Chart (Last 7 days)
    const trendData = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        trendData[key] = 0;
    }

    expenses.forEach(e => {
        if (trendData.hasOwnProperty(e.date)) {
            trendData[e.date] += e.amount;
        }
    });

    const trendLabels = Object.keys(trendData).map(date => {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    charts.trend.data.labels = trendLabels;
    charts.trend.data.datasets[0].data = Object.values(trendData);
    charts.trend.update('none');
}

// ===== Render Recent Expenses =====
function renderRecentExpenses() {
    const container = document.getElementById('recentExpenseList');
    const recent = expenses.slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = '<p class="empty-message">Chưa có khoản chi nào</p>';
        return;
    }

    container.innerHTML = recent.map(expense => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-category-icon">${CATEGORIES[expense.category]?.icon || '🎁'}</div>
                <div class="expense-details">
                    <h4>${escapeHtml(expense.name)}</h4>
                    <span>${CATEGORIES[expense.category]?.name || 'Khác'} • ${formatDate(expense.date)}</span>
                </div>
            </div>
            <div class="expense-amount">-${formatCurrency(expense.amount)}</div>
        </div>
    `).join('');
}

// ===== Render Expense Table =====
function renderExpenseTable() {
    const container = document.getElementById('expenseTableBody');
    const filterCategory = document.getElementById('filterCategory').value;
    const sortBy = document.getElementById('sortBy').value;

    let filtered = [...expenses];

    // Filter
    if (filterCategory) {
        filtered = filtered.filter(e => e.category === filterCategory);
    }

    // Sort
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'date-desc': return new Date(b.date) - new Date(a.date);
            case 'date-asc': return new Date(a.date) - new Date(b.date);
            case 'amount-desc': return b.amount - a.amount;
            case 'amount-asc': return a.amount - b.amount;
            default: return 0;
        }
    });

    if (filtered.length === 0) {
        container.innerHTML = '<tr><td colspan="6" class="empty-message">Không có khoản chi nào</td></tr>';
        return;
    }

    container.innerHTML = filtered.map(expense => {
        const voteClass = expense.votes > 0 ? 'positive' : expense.votes < 0 ? 'negative' : '';
        return `
            <tr>
                <td class="table-category">${CATEGORIES[expense.category]?.icon || '🎁'}</td>
                <td>${escapeHtml(expense.name)}</td>
                <td class="table-amount">${formatCurrency(expense.amount)}</td>
                <td>${formatDate(expense.date)}</td>
                <td>
                    <div class="table-votes">
                        <button class="btn-icon btn-upvote" onclick="upvote(${expense.id})" title="Upvote">👍</button>
                        <span class="vote-count ${voteClass}">${expense.votes}</span>
                        <button class="btn-icon btn-downvote" onclick="downvote(${expense.id})" title="Downvote">👎</button>
                    </div>
                </td>
                <td class="table-actions">
                    <button class="btn-icon btn-edit" onclick="openEditModal(${expense.id})" title="Sửa">✏️</button>
                    <button class="btn-icon btn-delete" onclick="deleteExpense(${expense.id})" title="Xóa">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== Render Vote Cards =====
function renderVoteCards() {
    const container = document.getElementById('voteCards');

    if (expenses.length === 0) {
        container.innerHTML = '<p class="empty-message">Chưa có khoản chi nào để bình chọn</p>';
        return;
    }

    container.innerHTML = expenses.map(expense => {
        const scoreClass = expense.votes > 0 ? 'positive' : expense.votes < 0 ? 'negative' : 'neutral';
        return `
            <div class="vote-card">
                <div class="vote-card-header">
                    <div class="vote-card-icon">${CATEGORIES[expense.category]?.icon || '🎁'}</div>
                    <div class="vote-card-info">
                        <h4>${escapeHtml(expense.name)}</h4>
                        <span>${CATEGORIES[expense.category]?.name || 'Khác'} • ${formatDate(expense.date)}</span>
                    </div>
                </div>
                <div class="vote-card-amount">${formatCurrency(expense.amount)}</div>
                <div class="vote-actions">
                    <div class="vote-buttons">
                        <button class="btn-vote btn-upvote" onclick="upvote(${expense.id})">
                            👍 Cần thiết
                        </button>
                        <button class="btn-vote btn-downvote" onclick="downvote(${expense.id})">
                            👎 Không cần
                        </button>
                    </div>
                    <div class="vote-score ${scoreClass}">${expense.votes > 0 ? '+' : ''}${expense.votes}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ===== Render Top Voted =====
function renderTopVoted() {
    const container = document.getElementById('topVotedList');
    const topVoted = [...expenses]
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 5);

    if (topVoted.length === 0 || topVoted.every(e => e.votes === 0)) {
        container.innerHTML = '<p class="empty-message">Chưa có bình chọn nào</p>';
        return;
    }

    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

    container.innerHTML = topVoted.map((expense, index) => `
        <div class="top-voted-item">
            <span class="top-voted-rank">${medals[index]}</span>
            <div class="top-voted-info">
                <h4>${CATEGORIES[expense.category]?.icon || '🎁'} ${escapeHtml(expense.name)}</h4>
                <span>${formatCurrency(expense.amount)}</span>
            </div>
            <div class="top-voted-votes">${expense.votes > 0 ? '+' : ''}${expense.votes}</div>
        </div>
    `).join('');
}

// ===== Render Category Breakdown =====
function renderCategoryBreakdown() {
    const container = document.getElementById('categoryBreakdown');
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    if (total === 0) {
        container.innerHTML = '<p class="empty-message">Chưa có dữ liệu</p>';
        return;
    }

    const categoryData = {};
    expenses.forEach(e => {
        if (!categoryData[e.category]) {
            categoryData[e.category] = 0;
        }
        categoryData[e.category] += e.amount;
    });

    const sorted = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1]);

    container.innerHTML = sorted.map(([category, amount]) => {
        const percent = (amount / total * 100).toFixed(1);
        return `
            <div class="category-item">
                <span class="category-icon">${CATEGORIES[category]?.icon || '🎁'}</span>
                <span class="category-name">${CATEGORIES[category]?.name || 'Khác'}</span>
                <div class="category-bar">
                    <div class="category-fill" style="width: ${percent}%; background: ${CATEGORIES[category]?.color || '#64748b'}"></div>
                </div>
                <span class="category-percent">${percent}%</span>
            </div>
        `;
    }).join('');
}

// ===== Render Quick Stats =====
function renderQuickStats() {
    if (expenses.length === 0) {
        document.getElementById('maxExpense').textContent = '-';
        document.getElementById('minExpense').textContent = '-';
        document.getElementById('avgExpense').textContent = '-';
        document.getElementById('topCategory').textContent = '-';
        return;
    }

    const amounts = expenses.map(e => e.amount);
    const max = Math.max(...amounts);
    const min = Math.min(...amounts);
    const avg = Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length);

    // Top category
    const categoryCount = {};
    expenses.forEach(e => {
        categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
    });
    const topCat = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];

    document.getElementById('maxExpense').textContent = formatCurrency(max);
    document.getElementById('minExpense').textContent = formatCurrency(min);
    document.getElementById('avgExpense').textContent = formatCurrency(avg);
    document.getElementById('topCategory').textContent = topCat ? `${CATEGORIES[topCat[0]]?.icon} ${CATEGORIES[topCat[0]]?.name}` : '-';
}

// ===== Utilities =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('vi-VN', options);
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
