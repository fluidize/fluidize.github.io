document.addEventListener('DOMContentLoaded', function () {
    const inspiredBtn = document.getElementById('inspired-btn');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');

    function setMenuOpen(open) {
        document.body.classList.toggle('menu-open', open);
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        }
        if (sidebarBackdrop) {
            sidebarBackdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
        }
    }

    function closeMenu() {
        setMenuOpen(false);
    }

    function openInNewTab(url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    if (inspiredBtn) {
        inspiredBtn.addEventListener('click', function () {
            openInNewTab('https://cyberspace.online');
        });
    }

    document.querySelectorAll('#socials-content [data-url]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var url = btn.getAttribute('data-url');
            if (url) {
                openInNewTab(url);
            }
        });
    });

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            setMenuOpen(!document.body.classList.contains('menu-open'));
        });
    }

    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', closeMenu);
    }

    const contentAreas = {
        home: document.getElementById('home-content'),
        socials: document.getElementById('socials-content'),
        projects: document.getElementById('projects-content'),
    };

    const navSelector = '.nav-link';

    function switchPage(page) {
        Object.values(contentAreas).forEach(function (area) {
            if (area) area.style.display = 'none';
        });
        if (contentAreas[page]) {
            contentAreas[page].style.display = 'block';
        }
        document.querySelectorAll(navSelector).forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('data-page') === page);
        });
    }

    document.querySelectorAll(navSelector).forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            switchPage(link.getAttribute('data-page'));
            closeMenu();
        });
    });

    switchPage('home');

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
            setMenuOpen(false);
        }
    });
});
