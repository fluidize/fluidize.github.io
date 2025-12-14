function copy_solana() {
    var copyText = document.getElementById("solana").innerHTML;
    navigator.clipboard.writeText(copyText).then(function() {
        const btn = document.getElementById("copy_solana");
        const originalText = btn.textContent;
        btn.textContent = "Copied!";
        btn.style.background = "#ff0000";
        btn.style.color = "#ffffff";
        setTimeout(function() {
            btn.textContent = originalText;
            btn.style.background = "";
            btn.style.color = "";
        }, 2000);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const minimizeBtn = document.querySelector('.minimize-btn');
    const sidebar = document.querySelector('.sidebar');
    
    if (minimizeBtn && sidebar) {
        minimizeBtn.addEventListener('click', function() {
            sidebar.classList.toggle('minimized');
        });
    }
    
    const themeBtn = document.querySelector('.theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', function() {
            const currentTheme = document.body.getAttribute('data-theme');
            if (currentTheme === 'light') {
                document.body.setAttribute('data-theme', 'dark');
                themeBtn.textContent = 'Dark';
            } else {
                document.body.setAttribute('data-theme', 'light');
                themeBtn.textContent = 'Light';
            }
        });
    }
    
    const secretBtn = document.getElementById('secret-btn');
    const secretModal = document.getElementById('secret-modal');
    const closeBtn = document.querySelector('.secret-modal-close');
    
    if (secretBtn && secretModal) {
        secretBtn.addEventListener('click', function() {
            secretModal.classList.add('active');
        });
    }
    
    if (closeBtn && secretModal) {
        closeBtn.addEventListener('click', function() {
            secretModal.classList.remove('active');
        });
    }
    
    // Page navigation
    function switchPage(page) {
        const contentAreas = {
            'home': document.getElementById('home-content'),
            'socials': document.getElementById('socials-content'),
            'projects': document.getElementById('projects-content')
        };
        
        // Hide all content areas
        Object.values(contentAreas).forEach(area => {
            if (area) area.style.display = 'none';
        });
        
        // Show selected content area
        if (contentAreas[page]) {
            contentAreas[page].style.display = 'block';
        }
        
        // Update active nav links
        const allNavLinks = document.querySelectorAll('.nav-link[data-page], .logo-btn[data-page]');
        allNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });
    }
    
    const navLinks = document.querySelectorAll('.nav-link[data-page], .logo-btn[data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            switchPage(page);
        });
    });
    
    // Set home as active by default
    switchPage('home');
});
