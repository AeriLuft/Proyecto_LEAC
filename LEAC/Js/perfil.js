// Js/perfil.js - Sincronizado y Funcional

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Verificar Sesión
    let currentUser = JSON.parse(localStorage.getItem('leacUser'));
    if (!currentUser) { window.location.href = 'index.html'; return; }

    // --- Migración de Datos (Asegurar compatibilidad) ---
    if (typeof currentUser.lifetimePoints === 'undefined') currentUser.lifetimePoints = currentUser.points;
    if (!currentUser.redemptionHistory) currentUser.redemptionHistory = [];
    if (!currentUser.trips) currentUser.trips = Math.floor(currentUser.lifetimePoints / 1500);

    // Calcular nivel inicial
    calculateLevel(currentUser);
    saveUser(currentUser);

    // 2. Inicializar UI
    updateProfileUI(currentUser);
    renderRedemptionHistory(currentUser);
    initializeChart(currentUser.lifetimePoints);

    // 3. Edición de Perfil (Toggle visual)
    const showEditBtn = document.getElementById('showEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editForm = document.getElementById('editProfileForm');

    showEditBtn.addEventListener('click', () => {
        showEditBtn.classList.add('hidden');
        editForm.classList.remove('hidden');
        document.getElementById('editName').value = currentUser.name;
        document.getElementById('editEmail').value = currentUser.email;
        anime({ targets: editForm, opacity: [0, 1], translateY: [-10, 0], duration: 300, easing: 'easeOutQuad' });
    });

    cancelEditBtn.addEventListener('click', () => {
        editForm.classList.add('hidden');
        showEditBtn.classList.remove('hidden');
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser.name = document.getElementById('editName').value;
        currentUser.email = document.getElementById('editEmail').value;
        const photoInput = document.getElementById('newAvatar');

        if (photoInput.files && photoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentUser.avatar = e.target.result;
                saveUserAndRefresh(currentUser);
            };
            reader.readAsDataURL(photoInput.files[0]);
        } else {
            saveUserAndRefresh(currentUser);
        }
        editForm.classList.add('hidden');
        showEditBtn.classList.remove('hidden');
    });

    // 4. Lógica de Canje (Modal Personalizado Integrado)
    const redemptionModal = document.getElementById('redemptionModal');
    const modalItemName = document.getElementById('modalItemName');
    const modalItemCost = document.getElementById('modalItemCost');
    const confirmBtn = document.getElementById('confirmRedeemBtn');
    const cancelModalBtn = document.getElementById('cancelRedeemBtn');
    let pendingItem = null;

    document.querySelectorAll('.btn-redeem').forEach(btn => {
        btn.addEventListener('click', function() {
            const cost = parseInt(this.getAttribute('data-cost'));
            const itemName = this.getAttribute('data-name');
            
            if (currentUser.points >= cost) {
                pendingItem = { cost, itemName };
                modalItemName.textContent = itemName;
                modalItemCost.textContent = cost;
                
                redemptionModal.classList.remove('hidden');
                anime({ targets: '#redemptionModalContent', scale: [0.95, 1], opacity: [0, 1], duration: 250, easing: 'easeOutQuad' });
            } else {
                alert(`Saldo insuficiente. Tienes ${currentUser.points} pts, necesitas ${cost}.`);
            }
        });
    });

    confirmBtn.addEventListener('click', () => {
        if (pendingItem) {
            currentUser.points -= pendingItem.cost;
            currentUser.redemptionHistory.unshift({
                item: pendingItem.itemName,
                cost: pendingItem.cost,
                date: new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
            });
            saveUserAndRefresh(currentUser);
            closeModal();
        }
    });

    cancelModalBtn.addEventListener('click', closeModal);
    
    function closeModal() {
        anime({
            targets: '#redemptionModalContent', scale: 0.95, opacity: 0, duration: 200, easing: 'easeInQuad',
            complete: () => { redemptionModal.classList.add('hidden'); pendingItem = null; }
        });
    }

    // Logout
    document.getElementById('logoutBtnPerfil')?.addEventListener('click', () => {
        if(confirm("¿Cerrar sesión?")) { localStorage.removeItem('leacUser'); window.location.href = 'index.html'; }
    });
});

// --- Funciones Auxiliares ---

function calculateLevel(user) {
    const total = user.lifetimePoints;
    if (total >= 5000) user.level = 'Diamante';
    else if (total >= 1000) user.level = 'Oro';
    else user.level = 'Plata';
}

function saveUser(user) { localStorage.setItem('leacUser', JSON.stringify(user)); }
function saveUserAndRefresh(user) { saveUser(user); updateProfileUI(user); renderRedemptionHistory(user); }

function updateProfileUI(user) {
    // Datos
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('userName').textContent = user.name;
    document.getElementById('totalPoints').textContent = user.points.toLocaleString();
    document.getElementById('lifetimePoints').textContent = user.lifetimePoints.toLocaleString();
    document.getElementById('totalTrips').textContent = user.trips;
    
    // Avatar
    const avatar = user.avatar || 'img/default_avatar.png';
    document.getElementById('profileAvatar').src = avatar;
    document.getElementById('userAvatar').src = avatar;

    // Nivel
    const level = user.level || 'Plata';
    const nextGoal = level === 'Oro' ? 5000 : (level === 'Diamante' ? 10000 : 1000);
    const nextLevel = level === 'Oro' ? 'Diamante' : (level === 'Diamante' ? 'Leyenda' : 'Oro');

    document.getElementById('currentLevelName').textContent = level;
    document.getElementById('nextLevelName').textContent = nextLevel;
    document.getElementById('profileLevel').textContent = `NIVEL ${level.toUpperCase()}`;

    // Badge Color (Sincronizado con estilos globales)
    const badge = document.getElementById('profileLevel');
    let badgeClass = "px-4 py-1 text-xs font-bold rounded-full text-white tracking-wider ";
    if(level === 'Diamante') badgeClass += "bg-blue-500";
    else if(level === 'Oro') badgeClass += "bg-yellow-500";
    else badgeClass += "bg-gray-400";
    badge.className = badgeClass;

    // Barra
    const progress = Math.min((user.lifetimePoints / nextGoal) * 100, 100);
    document.getElementById('progressBar').style.width = `${progress}%`;
    document.getElementById('pointsDisplay').textContent = user.lifetimePoints.toLocaleString();
    document.getElementById('pointsNextLevel').textContent = nextGoal.toLocaleString();
    document.getElementById('pointsNeeded').textContent = Math.max(nextGoal - user.lifetimePoints, 0).toLocaleString();
    document.getElementById('nextLevelProgress').textContent = `${Math.floor(progress)}%`;

    // Descuento
    const discounts = { 'Plata': '5%', 'Oro': '10%', 'Diamante': '15%' };
    document.getElementById('currentDiscount').textContent = discounts[level] || '0%';
}

function renderRedemptionHistory(user) {
    const list = document.getElementById('redemptionHistoryList');
    if (!list) return;
    list.innerHTML = '';
    
    if (!user.redemptionHistory.length) {
        list.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-gray-400 italic">Sin actividad reciente</td></tr>`;
        return;
    }

    user.redemptionHistory.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="font-medium text-gray-800">${item.item}</td>
            <td class="text-gray-500">${item.date}</td>
            <td class="text-right font-bold text-primary">-${item.cost}</td>
        `;
        list.appendChild(row);
    });
}

function initializeChart(lifetimePoints) {
    const chartDom = document.getElementById('pointsChart');
    if (!chartDom) return;
    let myChart = echarts.getInstanceByDom(chartDom) || echarts.init(chartDom);
    
    const option = {
        color: ['#C65D00'], // Color Primario LEAC
        tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#eee', textStyle: { color: '#333' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'], axisLine: { lineStyle: { color: '#e5e7eb' } } },
        yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#f3f4f6' } } },
        series: [{
            data: [lifetimePoints * 0.2, lifetimePoints * 0.4, lifetimePoints * 0.6, lifetimePoints * 0.7, lifetimePoints * 0.85, lifetimePoints],
            type: 'line', smooth: true, symbolSize: 8, lineStyle: { width: 3 },
            areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1, [{offset:0, color:'rgba(198,93,0,0.2)'}, {offset:1, color:'rgba(198,93,0,0)'}]) }
        }]
    };
    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
}