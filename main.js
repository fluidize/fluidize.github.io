document.addEventListener('DOMContentLoaded', function () {
    const inspiredBtn = document.getElementById('inspired-btn');
    if (inspiredBtn) {
        inspiredBtn.addEventListener('click', function () {
            location.assign('https://cyberspace.online');
        });
    }

    const secretBtn = document.getElementById('secret-btn');
    const secretModal = document.getElementById('secret-modal');
    const closeBtn = document.querySelector('.secret-modal-close');

    if (secretBtn && secretModal) {
        secretBtn.addEventListener('click', function () {
            secretModal.classList.add('active');
        });
    }

    if (closeBtn && secretModal) {
        closeBtn.addEventListener('click', function () {
            secretModal.classList.remove('active');
        });
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
        });
    });

    switchPage('home');
});
