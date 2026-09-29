// Section nav: highlight the link for the section currently in view.
const navLinks = document.querySelectorAll('.section-nav a[href^="#"]');
const sections = [...navLinks].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

const setActive = id => navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
}, { rootMargin: '-45% 0px -50% 0px' });   // a thin band just above mid-screen decides the active section

sections.forEach(s => sectionObserver.observe(s));

// Scrollytelling: update sticky graphic as steps scroll into view
const steps = document.querySelectorAll('.story-step');
const storyImg = document.getElementById('story-img');
const storyCaption = document.getElementById('story-caption');

const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Deactivate all, activate this one
            steps.forEach(s => s.classList.remove('active'));
            entry.target.classList.add('active');

            const newSrc = entry.target.dataset.img;
            const newCaption = entry.target.dataset.caption;

            // Compare the attribute, not .src: .src is the absolute URL and never equals the relative data-img.
            if (storyImg.getAttribute('src') !== newSrc) {
                storyImg.classList.add('swapping');
                setTimeout(() => {
                    // Attach handlers before setting src so a cached image can't load first;
                    // on error, un-fade anyway rather than leave the image hidden.
                    storyImg.onload = storyImg.onerror = () => storyImg.classList.remove('swapping');
                    storyImg.src = newSrc;
                    storyImg.alt = newCaption;
                    storyCaption.textContent = newCaption;
                }, 300);
            }
        }
    });
}, { threshold: 0.5, rootMargin: '-10% 0px -40% 0px' });

steps.forEach(step => stepObserver.observe(step));
