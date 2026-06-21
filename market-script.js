document.addEventListener('DOMContentLoaded', function() {
    


    








    // --- UI Elements ---
    const ui = {
        sidebar: document.getElementById('sidebar'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),
        logoBtn: document.getElementById('logo-btn'),
        sidebarCloseBtn: document.getElementById('sidebar-close-btn'),
        stateSelect: document.getElementById('state-select'),
        commoditySelect: document.getElementById('commodity-select'),
        loaderOverlay: document.getElementById('loader-overlay'),
        avgPrice: document.getElementById('avg-price'),
        yesterdayAvgPrice: document.getElementById('yesterday-avg-price'),
        priceTrend: document.getElementById('price-trend'),
        lastUpdated: document.getElementById('last-updated'),
        tableBody: document.getElementById('market-price-table-body')
    };

    // --- State and Constants ---
    const API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
    const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
    const states = ["Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "NCT of Delhi", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
    const commodities = ["Onion", "Potato", "Tomato", "Wheat", "Paddy(Dhan)(Common)", "Mustard", "Apple", "Banana", "Brinjal", "Cauliflower", "Green Gram Dal (Moong Dal)", "Lemon", "Mango", "Rice", "Soyabean"];

    // --- Functions ---
    const toggleSidebar = () => {
        if (ui.sidebar) ui.sidebar.classList.toggle('sidebar-open');
        if (ui.sidebarOverlay) ui.sidebarOverlay.classList.toggle('visible');
    };

    const populateFilters = () => {
        states.forEach(state => ui.stateSelect.add(new Option(state, state)));
        commodities.forEach(c => ui.commoditySelect.add(new Option(c, c)));
        ui.stateSelect.value = "Maharashtra";
        ui.commoditySelect.value = "Onion";
    };

    const fetchData = async () => {
        ui.loaderOverlay.classList.remove('hidden');
        const url = `${BASE_URL}?api-key=${API_KEY}&format=json&limit=500&filters[state]=${encodeURIComponent(ui.stateSelect.value)}&filters[commodity]=${encodeURIComponent(ui.commoditySelect.value)}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const data = await response.json();
            if (data.records && data.records.length > 0) {
                processAndRenderData(data.records);
            } else {
                renderNoData();
            }
        } catch (error) {
            console.error("Failed to fetch market data:", error);
            renderError();
        } finally {
            ui.loaderOverlay.classList.add('hidden');
        }
    };
    
    const parseDate = (dateStr) => {
        const [d, m, y] = dateStr.split('-');
        return new Date(`${y}-${m}-${d}`);
    };

    const processAndRenderData = (records) => {
        const validRecords = records.filter(r => {
            const price = parseFloat(r.modal_price);
            return !isNaN(price) && price > 0;
        });

        if (validRecords.length === 0) {
            renderNoData();
            return;
        }

        const recordsByDate = validRecords.reduce((acc, r) => {
            (acc[r.arrival_date] = acc[r.arrival_date] || []).push(r);
            return acc;
        }, {});
        
        const uniqueSortedDates = Object.keys(recordsByDate).sort((a, b) => parseDate(b) - parseDate(a));

        // Today's Data (most recent from API)
        const latestDateStr = uniqueSortedDates[0];
        const todayRecords = recordsByDate[latestDateStr];
        const todayPrices = todayRecords.map(r => parseFloat(r.modal_price));
        const averagePrice = todayPrices.reduce((a, b) => a + b, 0) / todayPrices.length;

        // Yesterday's Data (second most recent from API)
        let yesterdayAveragePrice = 0;
        if (uniqueSortedDates.length > 1) {
            const yesterdayDateStr = uniqueSortedDates[1];
            const yesterdayRecords = recordsByDate[yesterdayDateStr];
            const yesterdayPrices = yesterdayRecords.map(r => parseFloat(r.modal_price));
            yesterdayAveragePrice = yesterdayPrices.reduce((a, b) => a + b, 0) / yesterdayPrices.length;
        }

        renderPriceCards(averagePrice, yesterdayAveragePrice);
        renderMarketTable(todayRecords);
    };

    const renderPriceCards = (todayAvg, yesterdayAvg) => {
        ui.avgPrice.textContent = `₹${todayAvg.toFixed(2)}`;
        ui.yesterdayAvgPrice.textContent = yesterdayAvg > 0 ? `₹${yesterdayAvg.toFixed(2)}` : 'N/A';
        ui.lastUpdated.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit' });

        const diff = todayAvg - yesterdayAvg;
        if (yesterdayAvg === 0 || isNaN(diff)) {
            ui.priceTrend.innerHTML = `<span>--</span>`;
            ui.priceTrend.className = 'price-trend-display';
            return;
        }

        const isUp = diff > 0;
        const icon = isUp 
            ? `<svg class="h-8 w-8 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" /></svg>`
            : `<svg class="h-8 w-8 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3.707-7.293l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 10.586V7a1 1 0 11-2 0v3.586L7.707 9.293a1 1 0 01-1.414-1.414z" clip-rule="evenodd" /></svg>`;
        
        ui.priceTrend.className = `price-trend-display ${isUp ? 'up' : 'down'}`;
        ui.priceTrend.innerHTML = `${icon}<span>${Math.abs(diff).toFixed(2)}</span>`;
    };
    
    const renderMarketTable = (records) => {
        ui.tableBody.innerHTML = '';
        records.slice(0, 10).forEach(market => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="font-medium">${market.market}</td>
                <td>₹${parseFloat(market.min_price).toFixed(2)}</td>
                <td>₹${parseFloat(market.max_price).toFixed(2)}</td>
                <td class="font-semibold text-primary-dark">₹${parseFloat(market.modal_price).toFixed(2)}</td>
            `;
            ui.tableBody.appendChild(row);
        });
    };

    const renderNoData = () => {
        ui.avgPrice.textContent = 'N/A';
        ui.yesterdayAvgPrice.textContent = 'N/A';
        ui.priceTrend.innerHTML = '<span>--</span>';
        ui.priceTrend.className = 'price-trend-display';
        ui.tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-8 text-slate-500">No data available for this selection.</td></tr>`;
    };

    const renderError = () => {
        renderNoData();
        ui.tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-8 text-red-500 font-semibold">Could not load data. Please check your connection.</td></tr>`;
    };

    // --- Event Listeners ---
    if (ui.logoBtn) ui.logoBtn.addEventListener('click', (e) => { e.preventDefault(); toggleSidebar(); });
    if (ui.sidebarOverlay) ui.sidebarOverlay.addEventListener('click', toggleSidebar);
    if (ui.sidebarCloseBtn) ui.sidebarCloseBtn.addEventListener('click', toggleSidebar);
    ui.stateSelect.addEventListener('change', fetchData);
    ui.commoditySelect.addEventListener('change', fetchData);

    // --- Initial Load ---
    populateFilters();
    fetchData();
});



document.addEventListener('DOMContentLoaded', function() {

    // --- Re-triggering Scroll Animations ---
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                // Remove 'visible' class when the element is out of view to re-trigger animation
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    const elementsToAnimate = document.querySelectorAll('.scroll-animate');
    elementsToAnimate.forEach(el => scrollObserver.observe(el));



    


    // --- Sticky Sidebar Navigation Logic ---
    const sections = document.querySelectorAll('.content-section');
    const navItems = document.querySelectorAll('.nav-item');

    if (sections.length > 0 && navItems.length > 0) {
        const observerOptions = {
            rootMargin: '-40% 0px -60% 0px', // Adjusted trigger point
            threshold: 0
        };

        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    
                    // Remove active class from all nav items
                    navItems.forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // Add active class to the corresponding nav item
                    const activeNavItem = document.querySelector(`.nav-item[href="#${id}"]`);
                    if (activeNavItem) {
                        activeNavItem.classList.add('active');
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }


    
    //sidebar logic
    const logoBtn = document.getElementById('logo-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const body = document.body;

    const toggleSidebar = () => {
        sidebar.classList.toggle('sidebar-open');
        sidebarOverlay.classList.toggle('visible');
        body.classList.toggle('sidebar-active');
    };
    
    // Ensure all sidebar elements exist before adding listeners
    if (logoBtn && sidebar && sidebarOverlay && sidebarCloseBtn) {
        logoBtn.addEventListener('click', (event) => {
            event.preventDefault();
            toggleSidebar();
        });
        sidebarOverlay.addEventListener('click', toggleSidebar);
        sidebarCloseBtn.addEventListener('click', toggleSidebar);
    }


});

    
    // --- Sidebar Dropdown Logic ---
document.addEventListener('DOMContentLoaded', function() {
    const dropdownToggles = document.querySelectorAll('.sidebar-dropdown-toggle');

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(event) {
            // Prevent the link from navigating to "#"
            event.preventDefault(); 
            
            // Find the parent ".sidebar-dropdown" container
            const dropdown = this.closest('.sidebar-dropdown');
            
            if (dropdown) {
                // Toggle the "open" class to trigger the CSS animations
                dropdown.classList.toggle('open');
            }
        });
    });

    



});



