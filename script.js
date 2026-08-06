document.addEventListener('DOMContentLoaded', () => {

    function activateTab(targetId) {
        document.querySelectorAll('.tab-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const target = document.getElementById(targetId);
        if (target) {
            target.classList.add('active');
        }
        
        document.getElementById('nav-links')?.classList.remove('active');
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', (e) => { 
        // 🌟 শুধুমাত্র যেসব লিংকে nav-btn ক্লাস আছে, সেগুলোকেই আটকাবে 🌟
        e.preventDefault(); 
        activateTab(btn.getAttribute('data-target')); 
    }));

    document.getElementById('hamburger')?.addEventListener('click', () => {
        document.getElementById('nav-links')?.classList.toggle('active');
    });

});
