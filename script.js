document.addEventListener('DOMContentLoaded', () => {

    // --- Tab Navigation & Mobile Menu ---
    function activateTab(targetId) {
        document.querySelectorAll('.tab-section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        
        const target = document.getElementById(targetId);
        if (target) {
            target.classList.add('active');
            target.style.display = 'block';
        }
        
        document.getElementById('nav-links')?.classList.remove('active');
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', (e) => { 
        e.preventDefault(); 
        activateTab(btn.getAttribute('data-target')); 
    }));

    document.getElementById('hamburger')?.addEventListener('click', () => {
        document.getElementById('nav-links')?.classList.toggle('active');
    });

    // --- Modal Open/Close Logic ---
    const projectsModal = document.getElementById('projects-modal');
    
    document.getElementById('my-projects-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        projectsModal?.classList.remove('hidden');
    });

    document.getElementById('close-modal')?.addEventListener('click', () => {
        projectsModal?.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === projectsModal) {
            projectsModal?.classList.add('hidden');
        }
    });

});
