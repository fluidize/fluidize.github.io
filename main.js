document.addEventListener('DOMContentLoaded', function () {
    // Initialize projects loaded flag
    window.projectsLoaded = false;
    
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const menuHint = document.querySelector('.menu-hint');
    const mainContent = document.querySelector('.main-content');

    function typeText(el, text, opts) {
        const options = opts || {};
        const delayMs = typeof options.delayMs === 'number' ? options.delayMs : 1000;
        const stepMs = typeof options.stepMs === 'number' ? options.stepMs : 35;

        if (!el) return;

        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
            el.textContent = text;
            return;
        }

        el.textContent = '';
        window.setTimeout(function () {
            let i = 0;
            const timer = window.setInterval(function () {
                i += 1;
                el.textContent = text.slice(0, i);
                if (i >= text.length) {
                    window.clearInterval(timer);
                }
            }, stepMs);
        }, delayMs);
    }

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
            if (menuHint) {
                menuHint.style.display = 'none';
            }
        });
    }

    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', closeMenu);
    }

    const contentAreas = {
        home: document.getElementById('home-content'),
        about: document.getElementById('about-content'),
        socials: document.getElementById('socials-content'),
        projects: document.getElementById('projects-content'),
    };

    const navSelector = '.filetree-link';

    function switchPage(page, opts) {
        const silent = opts && opts.silent;
        Object.values(contentAreas).forEach(function (area) {
            if (area) area.style.display = 'none';
        });
        if (contentAreas[page]) {
            contentAreas[page].style.display = 'block';
        }
        document.querySelectorAll(navSelector).forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('data-page') === page && !link.getAttribute('data-project'));
        });
        if (!silent) {
            const expected = '#page=' + page;
            if (window.location.hash !== expected) {
                window.location.hash = expected;
            }
        }
    }

    function setActiveProject(projectId) {
        document.querySelectorAll(navSelector).forEach(function (link) {
            const linkProject = link.getAttribute('data-project');
            const linkPage = link.getAttribute('data-page');
            
            if (linkProject === projectId) {
                link.classList.add('active');
            } else if (linkPage === 'projects' && !linkProject) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function handleNavClick(e) {
        e.preventDefault();
        const page = this.getAttribute('data-page');
        const project = this.getAttribute('data-project');

        if (project) {
            // Open the project via its URL hash so the link is shareable
            setActiveProject(project);
            const projectHash = '#project=' + project;
            if (window.location.hash !== projectHash) {
                window.location.hash = projectHash;
            } else {
                openProjectFromHash(projectHash);
            }
        } else {
            switchPage(page);
        }

        closeMenu();
    }

    // Attach initial listeners to existing nav links
    document.querySelectorAll(navSelector).forEach(function (link) {
        link.addEventListener('click', handleNavClick);
    });

    switchPage('home', { silent: true });

    // Function to generate abbreviated name from title
    function generateAbbreviation(title) {
        return title
            .replace(/[^\w\s-]/g, '') // Remove special characters and emojis (keep hyphens)
            .split(/[\s-]+/) // Split by spaces and hyphens
            .filter(word => word.length > 0) // Remove empty strings
            .map(word => {
                // If the word is a number, use the entire number
                if (!isNaN(word)) {
                    return word.toLowerCase();
                }
                return word.charAt(0).toLowerCase();
            })
            .join('');
    }

    // Function to dynamically generate project items in filetree
    function generateProjectItems() {
        const projectCards = document.querySelectorAll('.project-card');
        const projectsNested = document.getElementById('projects-nested');
        
        if (!projectsNested || projectCards.length === 0) return;
        
        const projectItems = [];
        
        projectCards.forEach(function(card, index) {
            const titleElement = card.querySelector('.project-title');
            if (!titleElement) return;
            
            const title = titleElement.textContent.trim();
            const abbreviation = generateAbbreviation(title);
            const cardId = card.getAttribute('data-project') || abbreviation;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'filetree-item';
            
            const link = document.createElement('a');
            link.href = 'javascript:void(0)';
            link.className = 'filetree-link';
            link.setAttribute('data-page', 'projects');
            link.setAttribute('data-project', cardId);
            link.textContent = abbreviation + '.txt';
            
            itemDiv.appendChild(link);
            
            projectItems.push(itemDiv);
        });
        
        // Clear existing items and add new ones
        projectsNested.innerHTML = '';
        projectItems.forEach(function(item) {
            projectsNested.appendChild(item);
        });
        
        // Attach event listeners to new project links only
        projectItems.forEach(function(item) {
            const link = item.querySelector('.filetree-link');
            if (link) {
                link.addEventListener('click', handleNavClick);
            }
        });
    }

    // Make generateProjectItems globally accessible for projects.js
    window.generateProjectItems = generateProjectItems;

    const homeSubtitleText = document.querySelector('.home-subtitle .home-subtitle-text');
    if (homeSubtitleText) {
        const text = homeSubtitleText.textContent || '';
        typeText(homeSubtitleText, text, { delayMs: 1000, stepMs: 35 });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
            setMenuOpen(false);
        }
    });

    const SIZE_CACHE_KEY = 'fluidize-size-cache';
    const SIZE_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
    const sizeMemoryCache = {}; // In-memory cache to dedupe concurrent calls

    function getCachedSize(cacheKey) {
        if (sizeMemoryCache[cacheKey]) {
            return sizeMemoryCache[cacheKey];
        }
        try {
            const raw = localStorage.getItem(SIZE_CACHE_KEY);
            if (!raw) return null;
            const cache = JSON.parse(raw);
            const entry = cache[cacheKey];
            if (!entry || !entry.value) return null;
            if (Date.now() - entry.timestamp > SIZE_CACHE_TTL) return null;
            sizeMemoryCache[cacheKey] = entry.value;
            return entry.value;
        } catch (error) {
            return null;
        }
    }

    function setCachedSize(cacheKey, value) {
        sizeMemoryCache[cacheKey] = value;
        try {
            const raw = localStorage.getItem(SIZE_CACHE_KEY);
            const cache = raw ? JSON.parse(raw) : {};
            cache[cacheKey] = { value: value, timestamp: Date.now() };
            localStorage.setItem(SIZE_CACHE_KEY, JSON.stringify(cache));
        } catch (error) {
            // Ignore storage errors (private mode, quota, etc.)
        }
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0.0 B';
        if (bytes < 1024) return `${bytes.toFixed(1)} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    // Fetch folder size from GitHub API
    async function fetchFolderSize(repo, path) {
        const cacheKey = path ? `${repo}/${path}` : repo;
        const cached = getCachedSize(cacheKey);
        if (cached) return cached;

        try {
            let totalSize = 0;
            
            // Recursive function to calculate folder size
            async function calculateSize(currentPath) {
                try {
                    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${currentPath}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch contents');
                    }
                    
                    const contents = await response.json();
                    
                    if (!Array.isArray(contents)) {
                        // If it's a single file, add its size
                        if (contents.size) {
                            totalSize += contents.size;
                        }
                        return;
                    }
                    
                    // Process each item in the directory
                    for (const item of contents) {
                        if (item.type === 'file' && item.size) {
                            totalSize += item.size;
                        } else if (item.type === 'dir') {
                            // Recursively calculate subdirectory size
                            await calculateSize(item.path);
                        }
                    }
                } catch (error) {
                    console.error('Error calculating size for path:', currentPath, error);
                }
            }
            
            await calculateSize(path);

            const result = formatBytes(totalSize);
            setCachedSize(cacheKey, result);
            return result;
            
        } catch (error) {
            console.error('Error fetching folder size:', error);
            return 'N/A';
        }
    }

    // Fetch repository size from GitHub API
    async function fetchRepoSize(repo) {
        const cacheKey = repo;
        const cached = getCachedSize(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`https://api.github.com/repos/${repo}`);
            if (!response.ok) {
                throw new Error('Failed to fetch repository info');
            }
            const data = await response.json();
            
            if (data.size !== undefined) {
                const result = formatBytes(data.size * 1024);
                setCachedSize(cacheKey, result);
                return result;
            }
            
            return 'N/A';
        } catch (error) {
            console.error('Error fetching repo size:', error);
            return 'N/A';
        }
    }

    // Update all size info elements
    async function updateSizeInfo() {
        const sizeInfoElements = document.querySelectorAll('.size-info');

        for (const element of sizeInfoElements) {
            const githubPath = element.getAttribute('data-github');
            if (!githubPath) continue;

            // Parse the github path (format: "owner/repo" or "owner/repo/path/to/folder")
            const parts = githubPath.split('/');
            const repo = `${parts[0]}/${parts[1]}`;
            const path = parts.length > 2 ? parts.slice(2).join('/') : null;

            let size;
            if (path) {
                size = await fetchFolderSize(repo, path);
            } else {
                size = await fetchRepoSize(repo);
            }
            element.textContent = size;
        }
    }

    // Update size info when the projects page is shown
    const projectsLink = document.querySelector('.filetree-link[data-page="projects"]');
    if (projectsLink) {
        projectsLink.addEventListener('click', function () {
            setTimeout(updateSizeInfo, 100);
        });
    }

    // Also update on page load if projects page is initially visible
    if (contentAreas.projects && contentAreas.projects.style.display !== 'none') {
        updateSizeInfo();
    }

    // Hide menu button when scrolling down, show only when at the top
    function handleScroll() {
        if (menuToggle && mainContent) {
            if (mainContent.scrollTop === 0) {
                menuToggle.style.opacity = '';
                menuToggle.style.visibility = '';
            } else {
                menuToggle.style.opacity = '0';
                menuToggle.style.visibility = 'hidden';
            }
        }
    }

    if (mainContent) {
        mainContent.addEventListener('scroll', handleScroll);
        handleScroll();
    }

    // Modal functionality for project details
    const modal = document.getElementById('project-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalLink = document.getElementById('modal-link');
    const modalSizeInfo = document.getElementById('modal-size-info');

    let lastFocusedElement = null;

    function trapFocus(container, event) {
        if (event.key !== 'Tab') return;
        const focusables = container.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    if (modal) {
        modal.addEventListener('keydown', function (e) {
            trapFocus(modal, e);
        });
    }

    let modalCloseTimeout = null;
    let modalClosing = false;

    function openModal(projectId) {
        const card = document.querySelector(`.project-card[data-project="${projectId}"]`);
        if (!card) return;

        if (modalCloseTimeout) {
            clearTimeout(modalCloseTimeout);
            modalCloseTimeout = null;
        }
        modalClosing = false;
        modal.classList.remove('closing');

        const title = card.querySelector('.project-title').textContent;
        const desc = card.querySelector('.project-desc').innerHTML;
        const link = card.querySelector('.project-link');
        const githubPath = card.getAttribute('data-github');

        modalTitle.textContent = title;
        modalDesc.innerHTML = desc;
        modalLink.href = link.href;
        modalLink.textContent = link.textContent;
        modalSizeInfo.textContent = 'Loading...';

        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lastFocusedElement = document.activeElement;
        if (modalClose) {
            modalClose.focus();
        }

        // Fetch and display size info
        if (githubPath) {
            const parts = githubPath.split('/');
            const repo = `${parts[0]}/${parts[1]}`;
            const path = parts.length > 2 ? parts.slice(2).join('/') : null;

            if (path) {
                fetchFolderSize(repo, path).then(size => {
                    modalSizeInfo.textContent = size;
                });
            } else {
                fetchRepoSize(repo).then(size => {
                    modalSizeInfo.textContent = size;
                });
            }
        } else {
            modalSizeInfo.textContent = '';
        }
    }

    // Make openModal globally accessible for projects.js
    window.openModal = openModal;

    function closeModal() {
        if (modal.getAttribute('aria-hidden') === 'true' || modalClosing) return;
        modalClosing = true;
        modal.classList.add('closing');
        modalCloseTimeout = setTimeout(function () {
            modal.setAttribute('aria-hidden', 'true');
            modal.classList.remove('closing');
            modalClosing = false;
            modalCloseTimeout = null;
            document.body.style.overflow = '';
            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
        }, 150);
    }

    // Modal close handlers
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeModal);
    }

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
            closeModal();
        }
        if (e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false') {
            closeLightbox();
        }
    });

    // Lightbox functionality for image enlargement
    const lightbox = document.getElementById('lightbox');
    const lightboxBackdrop = document.getElementById('lightbox-backdrop');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxImg = document.getElementById('lightbox-img');

    function openLightbox(imgSrc) {
        lightboxImg.src = imgSrc;
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lastFocusedElement = document.activeElement;
        if (lightboxClose) {
            lightboxClose.focus();
        }
    }

    function closeLightbox() {
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300);
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
    }

    if (lightbox) {
        lightbox.addEventListener('keydown', function (e) {
            trapFocus(lightbox, e);
        });
    }

    // Attach click handlers to images in modal descriptions
    function attachImageClickHandlers() {
        document.querySelectorAll('.modal-desc img').forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openLightbox(this.src);
            });
        });
    }

    // Call image click handlers after modal opens
    const originalOpenModal = window.openModal;
    window.openModal = function(projectId) {
        originalOpenModal(projectId);
        setTimeout(attachImageClickHandlers, 100);
    };

    // Lightbox close handlers
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxBackdrop) {
        lightboxBackdrop.addEventListener('click', closeLightbox);
    }

    // Handle URL hash: #page=X switches pages, #project=X / #projects=X deep-link a project
    function handleHash() {
        const hash = window.location.hash;
        if (!hash || hash === '#') {
            switchPage('home');
            return;
        }
        if (hash.startsWith('#page=')) {
            const page = hash.substring('#page='.length);
            if (contentAreas[page]) {
                switchPage(page);
            }
            return;
        }
        if (hash.startsWith('#project=') || hash.startsWith('#projects=')) {
            openProjectFromHash(hash);
            return;
        }
        switchPage('home');
    }

    function openProjectFromHash(hash) {
        const menuHintEl = document.querySelector('.menu-hint');
        if (menuHintEl) {
            menuHintEl.style.display = 'none';
        }

        const projectId = hash.replace('#project=', '').replace('#projects=', '');

        switchPage('projects', { silent: true });
        setActiveProject(projectId);

        // Poll for project card to appear (projects load asynchronously)
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds

        const checkForCard = setInterval(() => {
            attempts++;
            const card = document.querySelector(`.project-card[data-project="${projectId}"]`);

            if (card && window.openModal) {
                clearInterval(checkForCard);
                window.openModal(projectId);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkForCard);
            }
        }, 100);
    }

    // Resolve initial page from URL hash
    handleHash();

    // Check hash on hash change
    window.addEventListener('hashchange', handleHash);

    // Theme selection (cycling button)
    const themeBtn = document.getElementById('theme-btn');
    let themes = {};
    let currentThemeId = 'c64';

    function applyTheme(themeId) {
        const theme = themes[themeId];
        if (!theme) return;
        currentThemeId = themeId;
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
        if (themeBtn) {
            themeBtn.textContent = theme.name || themeId;
        }
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta && theme.colors['primary-color']) {
            themeColorMeta.setAttribute('content', theme.colors['primary-color']);
        }
        localStorage.setItem('theme', themeId);
    }

    function cycleTheme() {
        const ids = Object.keys(themes);
        if (ids.length === 0) return;
        const index = ids.indexOf(currentThemeId);
        applyTheme(ids[(index + 1) % ids.length]);
    }

    if (themeBtn) {
        fetch('themes.json')
            .then(response => response.json())
            .then(data => {
                themes = data.themes;
                const saved = localStorage.getItem('theme');
                if (saved && themes[saved]) {
                    applyTheme(saved);
                } else {
                    applyTheme('c64');
                }
            })
            .catch(error => {
                console.error('Failed to load themes:', error);
                if (themeBtn) {
                    themeBtn.textContent = 'c64';
                }
            });

        themeBtn.addEventListener('click', cycleTheme);
    }
});
