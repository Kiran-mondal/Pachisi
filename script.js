document.addEventListener('DOMContentLoaded', () => {

    // 1. Tab Switching Logic
    function activateTab(targetId) {
        document.querySelectorAll('.tab-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const target = document.getElementById(targetId);
        if (target) {
            target.classList.add('active');
        }
        
        // Close mobile menu if open
        const navLinks = document.getElementById('nav-links');
        if(navLinks) navLinks.classList.remove('active');
    }
    
    // Attach click events to all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => { 
            const target = btn.getAttribute('data-target');
            if (target) {
                e.preventDefault(); 
                activateTab(target); 
            }
        });
    });

    // 2. My Projects Tab (Direct Link)
    const myProjectsBtn = document.getElementById('my-projects-btn');
    if (myProjectsBtn) {
        myProjectsBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            window.location.href = 'projects/index.html'; 
        });
    }

    // 3. Mobile Hamburger Menu
    document.getElementById('hamburger')?.addEventListener('click', (e) => {
        const navLinks = document.getElementById('nav-links');
        if (navLinks) {
            navLinks.classList.toggle('active');
            e.currentTarget.setAttribute('aria-expanded', navLinks.classList.contains('active'));
        }
    });

    // 4. Start Game Button Logic
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            // Hide Setup, Show Game UI
            document.getElementById('game-setup-screen').style.display = 'none';
            document.getElementById('actual-game-screen').style.display = 'flex';
            
            // Wait 300ms for browser to render layout, then start 3D
            setTimeout(() => {
                if (typeof window.init3DGame === 'function') {
                    window.init3DGame();
                } else {
                    alert("3D Engine failed to load. Please refresh.");
                }
            }, 300);
        });
    }
});
