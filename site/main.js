const buttons = document.querySelectorAll('.tab-btn[data-tab]');
const panels = document.querySelectorAll('.tab-panel');

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        // Update buttons
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update panels
        panels.forEach(p => p.classList.remove('active'));
        document.getElementById('tab-' + target).classList.add('active');
    });
});
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

            if (storyImg.src !== newSrc) {
                storyImg.classList.add('swapping');
                setTimeout(() => {
                    storyImg.src = newSrc;
                    storyImg.onload = () => storyImg.classList.remove('swapping');
                    storyCaption.textContent = newCaption;
                }, 300);
            }
        }
    });
}, { threshold: 0.5, rootMargin: '-10% 0px -40% 0px' });

steps.forEach(step => stepObserver.observe(step));
