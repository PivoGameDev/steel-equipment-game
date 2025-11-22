class BusinessGame {
    constructor() {
        this.businessLevels = {
            'preparation': {
                name: "Пивоварня ресторанного типа",
                price: 50,
                area: "50м²",
                baseCapacity: "1,500 л/мес", 
                maxCapacity: "10,000 л/мес",
                equipment: "2-в-1 система, 1 сотрудник",
                description: "Базовое помещение для старта. Идеально для обучения и первых экспериментов."
            },
            'mashing': {
                name: "Пивоварня с дистрибуцией",
                price: 150,
                area: "100м²", 
                baseCapacity: "4,000 л/мес",
                maxCapacity: "25,000 л/мес",
                equipment: "Автоматические системы, 4 сотрудника", 
                description: "Профессиональное оборудование для качественного заторного процесса."
            },
            'fermentation': {
                name: "Пивоваренный завод",
                price: 300,
                area: "200м²",
                baseCapacity: "8,000 л/мес",
                maxCapacity: "50,000 л/мес", 
                equipment: "Контролируемые танки, 5 сотрудников",
                description: "Современные ЦКТ с точным контролем температуры и давления."
            }
        };

        this.state = {
            balance: 100,
            purchasedFacilities: []
        };

        this.initBusinessScreen();
    }

    initBusinessScreen() {
        this.renderBusinessCards();
        this.loadProgress();
    }

    renderBusinessCards() {
        const container = document.querySelector('.business-options');
        if (!container) return;

        container.innerHTML = '';

        Object.entries(this.businessLevels).forEach(([type, facility]) => {
            const isAvailable = this.isFacilityAvailable(type);
            const isPurchased = this.state.purchasedFacilities.includes(type);
            
            const card = document.createElement('div');
            card.className = `business-card ${isAvailable ? 'available' : 'locked'}`;
            card.dataset.type = type;
            
            let buttonHTML = '';
            if (isAvailable && !isPurchased) {
                buttonHTML = `<button class="business-action-btn" data-price="${facility.price}" data-type="${type}">Арендовать за ${facility.price} BP</button>`;
            } else if (isPurchased) {
                buttonHTML = `<button class="business-action-btn equipped" data-type="${type}">Оснастить оборудованием →</button>`;
            }
            
            card.innerHTML = `
                <div class="business-image ${type}-image"></div>
                <h3>${facility.name} ${!isAvailable ? '🔒' : ''}</h3>
                <p class="business-card-desc">
                    <strong>Площадь:</strong> ${facility.area}<br>
                    <strong>Базовая производительность:</strong> ${facility.baseCapacity}<br>
                    <strong>Максимальная производительность:</strong> ${facility.maxCapacity}<br>
                    <strong>Оснащение:</strong> ${facility.equipment}
                </p>
                <div class="business-price">Стоимость аренды: ${facility.price} BP</div>
                <div class="business-balance">Ваш баланс: <span>${this.state.balance}</span> BP</div>
                ${buttonHTML}
            `;
            
            container.appendChild(card);
        });

        // Добавляем обработчики для кнопок
        this.addBusinessEventListeners();
    }

    addBusinessEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('business-action-btn')) {
                const card = e.target.closest('.business-card');
                const facilityType = card.dataset.type;
                const price = parseInt(e.target.dataset.price);
                
                if (e.target.classList.contains('equipped')) {
                    this.showFacilityEquipment(facilityType);
                } else {
                    this.rentFacility(facilityType, price);
                }
            }
        });
    }

    isFacilityAvailable(facilityType) {
        const facilityOrder = ['preparation', 'mashing', 'fermentation'];
        const currentIndex = facilityOrder.indexOf(facilityType);
        
        if (currentIndex === 0) return true;
        
        const previousFacility = facilityOrder[currentIndex - 1];
        return this.state.purchasedFacilities.includes(previousFacility);
    }

    rentFacility(facilityType, price) {
        if (this.state.balance >= price && !this.state.purchasedFacilities.includes(facilityType)) {
            this.state.balance -= price;
            this.state.purchasedFacilities.push(facilityType);
            
            this.updateBudgetDisplay();
            this.renderBusinessCards();
            this.saveProgress();
            
            alert(`Поздравляем! Вы арендовали ${this.businessLevels[facilityType].name}`);
            
            // Показываем экран оборудования
            this.showFacilityEquipment(facilityType);
        } else {
            alert('Недостаточно средств или помещение уже куплено');
        }
    }

    showFacilityEquipment(facilityType) {
        // Скрываем текущий экран
        document.getElementById('business-start-screen').classList.add('hidden');
        
        // Показываем экран оборудования
        const equipmentScreen = document.getElementById('facility-equipment-screen');
        equipmentScreen.classList.remove('hidden');
        
        // Обновляем информацию
        const facility = this.businessLevels[facilityType];
        document.getElementById('equipment-facility-name').innerHTML = 
            `Оснащение: <span class="facility-name-orange">${facility.name}</span>`;
        document.getElementById('equipment-budget').textContent = this.state.balance;
        
        // Инициализируем магазин оборудования
        this.initEquipmentStore(facilityType);
    }

    initEquipmentStore(facilityType) {
        // Здесь будет логика магазина оборудования
        console.log('Инициализация магазина оборудования для:', facilityType);
        
        // Временная кнопка для тестирования
        const equipmentContent = document.querySelector('.wide-equipment-store');
        if (equipmentContent) {
            equipmentContent.innerHTML += `
                <div style="text-align: center; margin: 20px 0;">
                    <button id="complete-equipment" class="equipment-action-btn primary">
                        Завершить оснащение (тест)
                    </button>
                </div>
            `;
            
            document.getElementById('complete-equipment').addEventListener('click', () => {
                this.completeBusiness();
            });
        }
    }

    completeBusiness() {
        // Сохраняем прогресс
        const progress = JSON.parse(localStorage.getItem('breweryGameProgress') || '{}');
        progress.equipmentPurchased = true;
        progress.businessCompleted = true;
        localStorage.setItem('breweryGameProgress', JSON.stringify(progress));
        
        alert('🎉 Ваша пивоварня готова к работе! Теперь вы можете управлять ей в разделе "Мой завод".');
        
        // Переходим в главное меню
        window.location.href = 'index.html';
    }

    updateBudgetDisplay() {
        const budgetElements = document.querySelectorAll('.budget-value');
        budgetElements.forEach(element => {
            element.textContent = this.state.balance + ' BP';
        });
    }

    loadProgress() {
        const progress = JSON.parse(localStorage.getItem('breweryGameProgress') || '{}');
        if (progress.business) {
            this.state.balance = progress.business.balance || 100;
            this.state.purchasedFacilities = progress.business.purchasedFacilities || [];
        }
        this.updateBudgetDisplay();
    }

    saveProgress() {
        const progress = JSON.parse(localStorage.getItem('breweryGameProgress') || '{}');
        progress.business = {
            balance: this.state.balance,
            purchasedFacilities: this.state.purchasedFacilities
        };
        localStorage.setItem('breweryGameProgress', JSON.stringify(progress));
    }
}