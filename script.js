// script.js - основной файл с интерактивностью

// Прелоадер
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', function() {

    // ========== ИНИЦИАЛИЗАЦИЯ КАРТЫ ==========
    if (document.getElementById('leaflet-map')) {
        initMap();
    }

    function initMap() {
        const mapElement = document.getElementById('leaflet-map');
        if (!mapElement) return;

        var map = L.map('leaflet-map').setView([52.6, 39.6], 9);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // Загружаем данные из глобальной переменной sitesDatabase
        if (typeof sitesDatabase !== 'undefined' && sitesDatabase.length) {
            addMarkers(map, sitesDatabase);
        }

        // Исправление для корректного отображения на мобильных
        setTimeout(() => map.invalidateSize(), 200);

        window.addEventListener('resize', () => {
            setTimeout(() => map.invalidateSize(), 100);
        });
    }

    function addMarkers(map, sites) {
        sites.forEach(site => {
            if (!site.coords) return;

            const marker = L.marker(site.coords, {
                icon: createCustomIcon(site.type),
                riseOnHover: true
            }).addTo(map);

            const popupContent = `
                <div style="text-align: center;">
                    <div class="popup-title">${site.name}</div>
                    <div class="popup-type">${site.category || site.type}</div>
                    <p style="margin: 10px 0;">${site.description.substring(0, 100)}...</p>
                    <button onclick="window.location.href='sites/${site.id}.html'" class="popup-btn">
                        <i class="fas fa-info-circle"></i> Подробнее
                    </button>
                </div>
            `;

            marker.bindPopup(popupContent, {
                maxWidth: 300,
                minWidth: 250
            });

            marker.on('click', function() {
                const quickInfo = document.getElementById('quick-info');
                if (quickInfo) {
                    quickInfo.innerHTML = `
                        <h3>${site.name}</h3>
                        <p><strong>Тип:</strong> ${site.category || site.type}</p>
                        <p>${site.fullDescription ? site.fullDescription.substring(0, 150) + '...' : site.description}</p>
                        <button onclick="window.location.href='sites/${site.id}.html'" class="btn btn-primary" style="margin-top: 15px; width: 100%;">
                            Перейти к полной информации →
                        </button>
                    `;
                }
            });
        });
    }

    function createCustomIcon(type) {
        const colors = {
            'заповедник': '#2e7d32',
            'памятник природы': '#4caf50',
            'природный парк': '#81c784',
            'духовный центр': '#1b5e20',
            'усадьба': '#8bc34a',
            'археологический': '#cddc39'
        };

        const color = colors[type?.toLowerCase()] || '#2e7d32';

        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background-color: ${color};
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [24, 24],
            popupAnchor: [0, -20]
        });
    }

    // ========== АНИМАЦИЯ ПРИ ПРОКРУТКЕ ==========
    const fadeElements = document.querySelectorAll('.fade-in');

    function checkFade() {
        fadeElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top < windowHeight - 100 && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    }

    checkFade();
    window.addEventListener('scroll', checkFade);

    // ========== ПЛАВНЫЙ СКРОЛЛ К ЯКОРЯМ ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ========== ФИЛЬТРАЦИЯ КАРТОЧЕК НА ALL-SITES ==========
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sitesGrid = document.getElementById('sites-grid');

    if (filterBtns.length && sitesGrid) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'transparent';
                    b.style.color = 'var(--primary-green)';
                });
                this.classList.add('active');
                this.style.background = 'var(--primary-green)';
                this.style.color = 'white';

                const filter = this.dataset.filter;
                filterSites(filter);
            });
        });
    }

    function filterSites(filter) {
        const cards = document.querySelectorAll('.site-card');
        cards.forEach(card => {
            if (filter === 'all' || card.dataset.type === filter) {
                card.style.display = 'block';
                setTimeout(() => card.style.opacity = '1', 10);
            } else {
                card.style.opacity = '0';
                setTimeout(() => card.style.display = 'none', 300);
            }
        });
    }

    // ========== ПОИСК ==========
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    }

    function performSearch(query) {
        query = query.toLowerCase().trim();
        if (!query) return;

        // Если мы на странице all-sites.html, фильтруем карточки
        if (window.location.pathname.includes('all-sites.html')) {
            const cards = document.querySelectorAll('.site-card');
            let found = false;
            cards.forEach(card => {
                const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                const desc = card.querySelector('.site-card-description')?.textContent.toLowerCase() || '';
                const region = card.querySelector('.site-card-region')?.textContent.toLowerCase() || '';

                if (title.includes(query) || desc.includes(query) || region.includes(query)) {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                    found = true;
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
            if (!found) alert('Ничего не найдено. Попробуйте другое слово.');
        } else {
            // На других страницах перенаправляем на all-sites.html с параметром
            window.location.href = `all-sites.html?search=${encodeURIComponent(query)}`;
        }
    }

    // ========== ОБРАБОТКА ПАРАМЕТРОВ URL ==========
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam && window.location.pathname.includes('all-sites.html')) {
        const input = document.getElementById('search-input');
        if (input) {
            input.value = searchParam;
            performSearch(searchParam);
        }
    }

    // ========== ДИНАМИЧЕСКИЙ СЧЁТЧИК СТАТИСТИКИ ==========
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length) {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.textContent);
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    stat.textContent = target;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, 20);
        });
    }

    // ========== КНОПКА "НАВЕРХ" ==========
    window.onscroll = function() {
        const btn = document.getElementById('scrollTop');
        if (btn) {
            if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
                btn.style.display = 'block';
            } else {
                btn.style.display = 'none';
            }
        }
    };

    window.scrollToTop = function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

}); // <-- Это правильная закрывающая скобка для DOMContentLoaded