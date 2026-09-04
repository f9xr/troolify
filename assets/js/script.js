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
    
    // 1b. Lazy-load below-the-fold CSS background images so they are not fetched
    // on every page load. Sections carry data-bg="path"; swap them in just before
    // they enter the viewport. No-JS users get the images from a <noscript> style.
    const lazyBgs = document.querySelectorAll('[data-bg]');
    const applyBg = (el) => {
        const src = el.getAttribute('data-bg');
        if (src) {
            el.style.backgroundImage = `url('${src}')`;
            el.removeAttribute('data-bg');
        }
    };
    if ('IntersectionObserver' in window && lazyBgs.length) {
        const bgObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    applyBg(entry.target);
                    bgObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '600px 0px' });
        lazyBgs.forEach((el) => bgObserver.observe(el));
    } else if (lazyBgs.length) {
        lazyBgs.forEach(applyBg);
    }
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        let parallaxScheduled = false;
        window.addEventListener('scroll', () => {
            if (parallaxScheduled) return;
            parallaxScheduled = true;
            requestAnimationFrame(() => {
                parallaxScheduled = false;
                const scrollY = window.scrollY;

                parallaxBgs.forEach(bg => {
                    // Adjust this multiplier to change the intensity of the parallax
                    const speed = 0.3;
                    // Use translate3d for better performance (GPU acceleration)
                    bg.style.transform = `scale(1.05) translate3d(0, ${scrollY * speed}px, 0)`;
                });
            });
        }, { passive: true });
    }
    
    });
