document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Flip, Observer, MotionPathPlugin);
    
    // --- LENIS SMOOTH SCROLL ---
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time)=>{
      lenis.raf(time * 1000)
    });
    gsap.ticker.lagSmoothing(0);


    // --- PRELOADER ---
    const preloaderTimeline = gsap.timeline();
    preloaderTimeline
        .from(".preloader-text", { y: 30, opacity: 0, duration: 1, ease: 'expo.out' })
        .to(".preloader-text", { y: -30, opacity: 0, duration: 1, ease: 'expo.in' }, "+=0.5")
        .to("#preloader", { yPercent: -100, duration: 1.2, ease: 'power3.inOut' })
        .to("body", { opacity: 1, duration: 0.1 }, "-=0.6");

    // --- CUSTOM CURSOR ---
    const cursor = document.getElementById('cursor');
    const cursorDot = document.getElementById('cursor-dot');
    const cursorCircle = document.getElementById('cursor-circle');
    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let circleX = 0, circleY = 0;
    gsap.ticker.add(() => {
        dotX += (mouseX - dotX) * 0.9; dotY += (mouseY - dotY) * 0.9;
        circleX += (mouseX - circleX) * 0.15; circleY += (mouseY - circleY) * 0.15;
        gsap.set(cursorDot, { x: dotX, y: dotY }); gsap.set(cursorCircle, { x: circleX, y: circleY });
    });
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    document.querySelectorAll('a, button, .gallery-item-flip').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
    
    // --- MAGNETIC BUTTONS ---
    document.querySelectorAll('.magnetic').forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = el.getBoundingClientRect();
            const x = e.clientX - (left + width / 2); const y = e.clientY - (top + height / 2);
            gsap.to(el, { x: x * 0.4, y: y * 0.4, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
        });
    });

    // --- HERO ANIMATION ---
    const heroTitle = document.querySelector(".hero-title");
    heroTitle.querySelectorAll('.line > span').forEach(lineContent => {
        const words = lineContent.innerText.split(' ');
        lineContent.innerHTML = words.map(word => `<span class="word inline-block">${word}</span>`).join(' ');
    });
    const heroTimeline = gsap.timeline({ delay: 2.8 });
    heroTimeline
        .to(".hero-title .word", { y: 0, stagger: 0.1, duration: 1.5, ease: 'expo.out' })
        .to(".hero-cta", { opacity: 1, duration: 0.5 }, "-=1");

    const grid = document.getElementById('hero-grid');
    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const xPercent = (clientX / window.innerWidth - 0.5) * 2;
        const yPercent = (clientY / window.innerHeight - 0.5) * 2;
        gsap.to(grid, {
            rotationX: -yPercent * 10, rotationY: -xPercent * 10, x: -xPercent * 50, y: -yPercent * 50, duration: 1, ease: 'power2.out'
        });
    });

    // --- ENHANCED FLIP GALLERY ANIMATION ---
    // Scroll-triggered entrance animation
    gsap.from(".gallery-item-flip", {
        scrollTrigger: {
            trigger: ".gallery-grid",
            start: "top 85%",
        },
        opacity: 0,
        y: 100,
        scale: 0.8,
        rotationZ: (i) => (i % 2 === 0 ? -5 : 5),
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.15
    });

    // Flip logic for click interaction
    const items = gsap.utils.toArray(".gallery-item-flip");
    const fullscreenView = document.querySelector(".fullscreen-view");

    items.forEach(item => {
        const image = item.querySelector('img');
        const overlay = item.querySelector('.gallery-item-overlay');
        const title = item.querySelector('.gallery-item-title');

        // Hover animation
        const hoverTimeline = gsap.timeline({ paused: true });
        hoverTimeline
            .to(image, { scale: 1.1, duration: 0.8, ease: 'power3.out' })
            .to(overlay, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)
            .to(title, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.1);
        
        item.addEventListener('mouseenter', () => hoverTimeline.play());
        item.addEventListener('mouseleave', () => hoverTimeline.reverse());

        // Click to flip
        item.addEventListener("click", () => {
            if (item.parentElement === fullscreenView) {
                const state = Flip.getState(item);
                const originalParent = document.querySelector(`.gallery-grid`);
                originalParent.appendChild(item);
                
                Flip.from(state, {
                    duration: 0.8,
                    ease: "expo.out",
                    onComplete: () => {
                        fullscreenView.style.display = "none";
                        gsap.set(item, { clearProps: "all" });
                    }
                });
            } else {
                const state = Flip.getState(item);
                fullscreenView.appendChild(item);
                fullscreenView.style.display = "flex";

                Flip.from(state, {
                    duration: 0.8,
                    ease: "expo.out",
                });
            }
        });
    });


    // --- INTERACTIVE PATH ANIMATION ---
    gsap.set("#path-object", {
        motionPath: {
            path: "#motion-path",
            align: "#motion-path",
            alignOrigin: [0.5, 0.5],
            autoRotate: true
        }
    });

    gsap.to("#motion-path", {
        strokeDashoffset: 0,
        scrollTrigger: {
            trigger: "#interactive-path",
            start: "top center",
            end: "bottom bottom",
            scrub: 1,
        },
        onUpdate: function() {
            const progress = this.progress();
            gsap.set("#path-object", { progress: progress });
        },
        strokeDasharray: 1000
    });
    

    // --- ADVANCED TEXT & ELEMENT SCROLL ANIMATIONS ---
    gsap.utils.toArray('.section-title').forEach(title => {
        const chars = title.innerText.split('').map(char => `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
        title.innerHTML = chars;
        gsap.from(title.querySelectorAll('.char'), {
            y: 120,
            stagger: 0.03,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: {
                trigger: title,
                start: 'top 85%'
            }
        });
    });
    
    // --- DRAGGABLE 3D CUBE ---
    const cube = document.querySelector('.cube');
    let rotationY = 0;
    let rotationX = 0;
    
    Observer.create({
        target: "#showcase-3d",
        type: "wheel,touch,pointer",
        onDrag: (self) => {
            rotationY += self.deltaX * 0.5;
            rotationX -= self.deltaY * 0.5;
            gsap.to(cube, {
                rotationY: rotationY,
                rotationX: rotationX,
                duration: 0.5,
                ease: 'power2.out'
            });
        }
    });


    gsap.from(".cta-button", {
        opacity: 0,
        scale: 0.5,
        duration: 1,
        ease: 'elastic.out(1, 0.5)',
        scrollTrigger: {
            trigger: "#contact",
            start: 'top 70%'
        }
    });


    // --- PAGE TRANSITION ---
    document.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const destination = link.getAttribute('href');
            gsap.timeline({
                onComplete: () => {
                    // Use GSAP's ScrollToPlugin which is aware of Lenis
                    gsap.to(window, { duration: 1.5, scrollTo: destination, ease: "power2.inOut" });
                }
            })
            .to(".transition-layer.layer-1", { transformOrigin: 'top', scaleY: 1, duration: 0.5, ease: 'power3.inOut' })
            .to(".transition-layer.layer-2", { transformOrigin: 'top', scaleY: 1, duration: 0.5, ease: 'power3.inOut' }, "-=0.3")
            .to(".transition-layer.layer-2", { transformOrigin: 'bottom', scaleY: 0, duration: 0.5, ease: 'power3.out', delay: 0.8})
            .to(".transition-layer.layer-1", { transformOrigin: 'bottom', scaleY: 0, duration: 0.5, ease: 'power3.out' }, "-=0.3");
        });
    });
});

