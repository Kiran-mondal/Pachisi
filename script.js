document.addEventListener('DOMContentLoaded', () => {

    function activateTab(targetId) {
        document.querySelectorAll('.tab-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const target = document.getElementById(targetId);
        if (target) {
            target.classList.add('active');
        }
        
        // ক্লিক করার পর মোবাইলের মেনু বন্ধ করা
        const navLinks = document.getElementById('nav-links');
        if(navLinks) navLinks.classList.remove('active');
    }
    
    // ১. গেমের ভেতরের ট্যাবগুলো কাজ করার জন্য
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            activateTab(btn.getAttribute('data-target')); 
        });
    });

    // ২. 🌟 My Projects ট্যাবটিকে জবরদস্তি খোলার কোড 🌟
    const myProjectsBtn = document.getElementById('my-projects-btn');
    if (myProjectsBtn) {
        myProjectsBtn.addEventListener('click', (e) => {
            e.preventDefault(); // ব্রাউজারের ক্যাশ বা আগের কোনো বাধা থাকলে সেটা ভাঙবে
            window.location.href = 'projects/index.html'; // সরাসরি আপনার ফোল্ডারে পাঠিয়ে দেবে
        });
    }

    // ৩. মোবাইল মেনু (হ্যামবার্গার)
    document.getElementById('hamburger')?.addEventListener('click', () => {
        document.getElementById('nav-links')?.classList.toggle('active');
    });

});
