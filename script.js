document.addEventListener('DOMContentLoaded', () => {
    // Note: navbar scroll effect + mobile menu are handled by assets/js/layout.js.

    // 1. Scroll Reveal Animation using Intersection Observer
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 2. Subtle Parallax for Backgrounds
    const parallaxBgs = document.querySelectorAll('.hero-bg, .cinematic-bg, .final-cta-bg');
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            parallaxBgs.forEach(bg => {
                // Adjust this multiplier to change the intensity of the parallax
                const speed = 0.3;
                // Use translate3d for better performance (GPU acceleration)
                bg.style.transform = `scale(1.05) translate3d(0, ${scrollY * speed}px, 0)`;
            });
        });
    }
    
    // 3. Category Filter active state (UI only demonstration)
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');
        });
    });
});
