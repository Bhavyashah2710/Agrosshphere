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