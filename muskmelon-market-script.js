document.addEventListener('DOMContentLoaded', function() {
    
    // --- Sidebar Toggle Logic ---
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
    
    if (logoBtn && sidebar && sidebarOverlay && sidebarCloseBtn) {
        logoBtn.addEventListener('click', (event) => {
            event.preventDefault();
            toggleSidebar();
        });
        sidebarOverlay.addEventListener('click', toggleSidebar);
        sidebarCloseBtn.addEventListener('click', toggleSidebar);
    }

    // --- Price Data Simulation for Muskmelon ---
    // In a real application, you would fetch this data from an API.
    const getSimulatedPriceData = () => {
        const basePrice = 3300.00; // Based on online sources for muskmelon
        const todayPrice = basePrice + (Math.random() * 500 - 250); // Fluctuate by +/- 250
        const yesterdayPrice = basePrice + (Math.random() * 500 - 250);
        
        // Simulate detailed market data for Muskmelon
        const marketData = [
            { market: "Delhi (Azadpur)", min: 1000, max: 4500, modal: 2750 },
            { market: "Maharashtra (Mumbai)", min: 2000, max: 4500, modal: 3300 },
            { market: "Bangalore", min: 1000, max: 1500, modal: 1200 },
            { market: "Tamil Nadu (Chennai)", min: 2500, max: 5500, modal: 4000 },
        ];
        
        // Simulate 7-day history for Muskmelon
        const priceHistory = Array.from({length: 7}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const price = basePrice + (Math.random() * 400 - 200);
            return {
                label: date.toLocaleString('en-US', { month: 'short', day: 'numeric' }),
                price: price.toFixed(2)
            };
        });

        return {
            average: todayPrice,
            modal: marketData[1].modal, // Using Mumbai as the primary modal
            yesterdayAverage: yesterdayPrice,
            markets: marketData,
            history: priceHistory
        };
    };

    const displayPriceData = () => {
        const data = getSimulatedPriceData();

        // Update main price cards
        document.getElementById('avg-price').textContent = `₹${data.average.toFixed(2)}`;
        document.getElementById('modal-price').textContent = `₹${data.modal.toFixed(2)}`;
        document.getElementById('last-updated').textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit' });

        // Update price trend indicator
        const priceTrendEl = document.getElementById('price-trend');
        const difference = data.average - data.yesterdayAverage;
        priceTrendEl.innerHTML = ''; // Clear previous content
        if (difference > 0) {
            priceTrendEl.className = 'price-trend up';
            priceTrendEl.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                <span>₹${difference.toFixed(2)} vs Yesterday</span>
            `;
        } else {
            priceTrendEl.className = 'price-trend down';
            priceTrendEl.innerHTML = `
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                <span>₹${Math.abs(difference).toFixed(2)} vs Yesterday</span>
            `;
        }

        // Populate market price table
        const tableBody = document.getElementById('market-price-table-body');
        tableBody.innerHTML = ''; // Clear existing rows
        data.markets.forEach(market => {
            const row = `
                <tr>
                    <td>${market.market}</td>
                    <td>₹${market.min.toFixed(2)}</td>
                    <td>₹${market.max.toFixed(2)}</td>
                    <td>₹${market.modal.toFixed(2)}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
        
        // Render the price history chart
        renderPriceChart(data.history);
    };
    
    // --- Chart.js Rendering ---
    let priceChart = null; // To hold the chart instance
    const renderPriceChart = (historyData) => {
        const ctx = document.getElementById('price-history-chart').getContext('2d');
        
        // Set an optimal height for the chart container
        if (ctx.canvas.parentNode) {
            ctx.canvas.parentNode.style.height = '450px';
        }

        if(priceChart) {
            priceChart.destroy(); // Destroy old chart instance before creating new
        }

        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: historyData.map(d => d.label),
                datasets: [{
                    label: 'Modal Price (₹/Quintal)',
                    data: historyData.map(d => d.price),
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderColor: '#16a34a',
                    borderWidth: 3,
                    pointBackgroundColor: '#16a34a',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.4, // Makes the line smooth
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: '#e2e8f0'
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                return '₹' + value;
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                         callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    };

    // Initial load of price data
    displayPriceData();
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