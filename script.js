// script.js - основной файл с интерактивностью

// Прелоадер
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', function() {

    // Инициализация карты
    if (document.getElementById('leaflet-map')) {
        initMap();
    }

    function initMap() {
        const mapElement = document.getElementById('leaflet-map');
        if (!mapElement) return;

        window.map = L.map('leaflet-map').setView([52.6, 39.6], 9);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(window.map);

        // Загружаем данные из глобальной переменной sitesDatabase
        if (typeof sitesDatabase !== 'undefined' && sitesDatabase.length) {
            addMarkers(window.map, sitesDatabase);
        }

        // Исправление для корректного отображения на мобильных
        setTimeout(() => window.map.invalidateSize(), 200);

        window.addEventListener('resize', () => {
            setTimeout(() => window.map.invalidateSize(), 100);
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
            // Заповедники и ООПТ
            'заповедник': '#2e7d32',           // тёмно-зелёный
            'памятник природы': '#4caf50',      // зелёный
            'природный парк': '#81c784',        // светло-зелёный
            'заказник': '#66bb6a',              // средне-зелёный

            // Водные объекты
            'водный': '#0288d1',                 // синий
            'водный объект': '#0288d1',          // синий
            'река': '#0288d1',                    // синий
            'озеро': '#0288d1',                    // синий
            'водохранилище': '#0288d1',           // синий

            // Духовные центры
            'духовный центр': '#1b5e20',          // тёмно-зелёный
            'духовный': '#1b5e20',                 // тёмно-зелёный
            'монастырь': '#1b5e20',                 // тёмно-зелёный
            'храм': '#1b5e20',                      // тёмно-зелёный
            'святые места': '#1b5e20',              // тёмно-зелёный

            // Усадьбы
            'усадьба': '#8bc34a',                  // салатовый
            'историческая усадьба': '#8bc34a',     // салатовый

            // Археология
            'археологический': '#cddc39',          // жёлто-зелёный
            'археологический памятник': '#cddc39', // жёлто-зелёный

            // Лесные массивы
            'лесной': '#388e3c',                    // зелёный
            'лесной массив': '#388e3c',              // зелёный

            // Геологические объекты
            'геологический': '#ff9800',              // оранжевый
            'геологический объект': '#ff9800',       // оранжевый
            'карстовый': '#ff9800',                   // оранжевый

            // Исторические памятники
            'исторический': '#9c27b0',                // фиолетовый
            'памятник инженерии': '#9c27b0',          // фиолетовый
            'мост': '#9c27b0',                          // фиолетовый

            // Городские достопримечательности
            'парк': '#4caf50',                          // зелёный
            'сквер': '#4caf50',                          // зелёный

            // По умолчанию
            'default': '#2e7d32'                         // тёмно-зелёный
        };

        // Приводим тип к нижнему регистру и ищем в словаре
        const normalizedType = type?.toLowerCase() || '';
        const color = colors[normalizedType] || colors['default'];

        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background-color: ${color};
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                transition: transform 0.2s;
            "></div>`,
            iconSize: [24, 24],
            popupAnchor: [0, -20]
        });
    }

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

    // Плавный скролл к якорям
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

    // Фильтрация карточек на all-sites
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

    // Поиск
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

    // Обработка параметров url
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam && window.location.pathname.includes('all-sites.html')) {
        const input = document.getElementById('search-input');
        if (input) {
            input.value = searchParam;
            performSearch(searchParam);
        }
    }

    // Счетчик статистики
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

    // Кнопка наверх
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
});

document.addEventListener("DOMContentLoaded", function () {

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.querySelector(".lightbox-close");
    const zoomInBtn = document.getElementById("zoom-in");
    const zoomOutBtn = document.getElementById("zoom-out");
    const zoomLabel = document.getElementById("zoom-level");

    if (!lightbox) return;

    let scale = 1;

    function setZoom(newScale) {
        scale = Math.min(Math.max(newScale, 0.5), 3);
        lightboxImg.style.transform = `scale(${scale})`;
        zoomLabel.textContent = Math.round(scale * 100) + "%";
    }

    function openLightbox(src) {
        lightbox.style.display = "flex";
        lightboxImg.src = src;
        setZoom(1);
    }

    function closeLightbox() {
        lightbox.style.display = "none";
        setZoom(1);
    }

    document.querySelector(".detail-gallery").addEventListener("click", function (e) {
        const img = e.target.tagName === "IMG" ? e.target : e.target.querySelector("img");
        if (img && img.src) openLightbox(img.src);
    });

    closeBtn.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    zoomInBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        setZoom(scale + 0.25);
    });

    zoomOutBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        setZoom(scale - 0.25);
    });

    // Scroll to zoom
    lightboxImg.addEventListener("wheel", function (e) {
        e.preventDefault();
        setZoom(scale + (e.deltaY < 0 ? 0.15 : -0.15));
    });

    // Keyboard: +/- and Escape
    document.addEventListener("keydown", function (e) {
        if (lightbox.style.display !== "flex") return;
        if (e.key === "+" || e.key === "=") setZoom(scale + 0.25);
        if (e.key === "-") setZoom(scale - 0.25);
        if (e.key === "Escape") closeLightbox();
    });

});