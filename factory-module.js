class FactoryGame {
    constructor() {
        this.factoryData = null;
    }

    loadFactoryData() {
        const progress = JSON.parse(localStorage.getItem('breweryGameProgress') || '{}');
        
        if (progress.equipmentPurchased) {
            this.showFactoryContent();
        } else {
            this.showPlaceholder();
        }
    }

    showFactoryContent() {
        const container = document.querySelector('.my-factory-content');
        if (!container) return;

        container.innerHTML = `
            <div class="factory-stats">
                <h3>📊 Статистика завода</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Тип помещения:</span>
                        <span class="stat-value" id="factory-type">Пивоварня ресторанного типа</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Оборудование:</span>
                        <span class="stat-value" id="equipment-count">5 единиц</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Общая стоимость:</span>
                        <span class="stat-value" id="total-equipment-cost">50 BP</span>
                    </div>
                </div>
            </div>
            
            <div class="equipment-list">
                <h3>⚙️ Мое оборудование</h3>
                <div id="my-equipment-container" class="my-equipment-container">
                    <div class="equipment-item">
                        <span class="equipment-name">Заторный аппарат 250л</span>
                        <span class="equipment-price">8 BP</span>
                    </div>
                    <div class="equipment-item">
                        <span class="equipment-name">Дробилка солода 100кг/ч</span>
                        <span class="equipment-price">4 BP</span>
                    </div>
                    <div class="equipment-item">
                        <span class="equipment-name">Насос (1 шт)</span>
                        <span class="equipment-price">2 BP</span>
                    </div>
                    <div class="equipment-item">
                        <span class="equipment-name">Химраствор для мойки</span>
                        <span class="equipment-price">0 BP</span>
                    </div>
                    <div class="equipment-item">
                        <span class="equipment-name">Теплообменник 300л/ч</span>
                        <span class="equipment-price">1 BP</span>
                    </div>
                </div>
            </div>
        `;
    }

    showPlaceholder() {
        const container = document.querySelector('.my-factory-content');
        if (!container) return;

        container.innerHTML = `
            <div class="placeholder-factory">
                <div class="placeholder-image">🚧</div>
                <h3>Завод еще не создан</h3>
                <p>Для доступа к этому разделу завершите настройку бизнеса:</p>
                <ol style="text-align: left; margin: 20px 0;">
                    <li>Пройти обучение (5 уровней)</li>
                    <li>Выбрать и арендовать помещение</li>
                    <li>Закупить оборудование</li>
                </ol>
                <button id="start-business-from-factory" class="equipment-action-btn primary">
                    Начать бизнес →
                </button>
            </div>
        `;

        document.getElementById('start-business-from-factory').addEventListener('click', () => {
            window.location.href = 'business.html';
        });
    }
}