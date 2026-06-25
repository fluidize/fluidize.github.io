document.addEventListener('DOMContentLoaded', function () {
    const inspiredBtn = document.getElementById('inspired-btn');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const menuHint = document.querySelector('.menu-hint');
    const mainContent = document.querySelector('.main-content');

    // Pop sound on click using Web Audio API
    function playPopSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.02);

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.02);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.02);
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    // Add pop sound to all clickable elements
    document.addEventListener('click', function () {
        playPopSound();
    });

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
        socials: document.getElementById('socials-content'),
        projects: document.getElementById('projects-content'),
    };

    const navSelector = '.filetree-link';

    function switchPage(page) {
        Object.values(contentAreas).forEach(function (area) {
            if (area) area.style.display = 'none';
        });
        if (contentAreas[page]) {
            contentAreas[page].style.display = 'block';
        }
        document.querySelectorAll(navSelector).forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('data-page') === page && !link.getAttribute('data-project'));
        });
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
        
        switchPage(page);
        
        if (project) {
            setActiveProject(project);
            setTimeout(function() {
                const projectCards = document.querySelectorAll('.project-card');
                projectCards.forEach(function(card, index) {
                    const titleElement = card.querySelector('.project-title');
                    if (!titleElement) return;
                    
                    const title = titleElement.textContent.trim();
                    const abbreviation = generateAbbreviation(title);
                    
                    if (abbreviation === project) {
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            }, 100);
        }
        
        closeMenu();
    }

    // Attach initial listeners to existing nav links
    document.querySelectorAll(navSelector).forEach(function (link) {
        link.addEventListener('click', handleNavClick);
    });

    switchPage('home');

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
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'filetree-item';
            
            const link = document.createElement('a');
            link.href = 'javascript:void(0)';
            link.className = 'filetree-link';
            link.setAttribute('data-page', 'projects');
            link.setAttribute('data-project', abbreviation);
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

    // Generate project items when DOM is ready
    generateProjectItems();

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

    // Fetch folder size from GitHub API
    async function fetchFolderSize(repo, path) {
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

            // Convert bytes to appropriate unit (always one decimal place)
            if (totalSize === 0) return '0.0 B';
            if (totalSize < 1024) return `${totalSize.toFixed(1)} B`;
            if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(1)} KB`;
            return `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
            
        } catch (error) {
            console.error('Error fetching folder size:', error);
            return 'N/A';
        }
    }

    // Fetch repository size from GitHub API
    async function fetchRepoSize(repo) {
        try {
            const response = await fetch(`https://api.github.com/repos/${repo}`);
            if (!response.ok) {
                throw new Error('Failed to fetch repository info');
            }
            const data = await response.json();
            
            if (data.size !== undefined) {
                // Convert KB to appropriate unit (always one decimal place)
                const sizeInBytes = data.size * 1024;
                if (sizeInBytes < 1024 * 1024) return `${data.size.toFixed(1)} KB`;
                return `${(data.size / 1024).toFixed(1)} MB`;
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
        const sizeCache = {}; // Cache sizes to avoid duplicate API calls

        for (const element of sizeInfoElements) {
            const githubPath = element.getAttribute('data-github');
            if (!githubPath) continue;

            // Parse the github path (format: "owner/repo" or "owner/repo/path/to/folder")
            const parts = githubPath.split('/');
            const repo = `${parts[0]}/${parts[1]}`;
            const path = parts.length > 2 ? parts.slice(2).join('/') : null;

            const cacheKey = githubPath;

            if (sizeCache[cacheKey]) {
                element.textContent = sizeCache[cacheKey];
            } else {
                let size;
                if (path) {
                    size = await fetchFolderSize(repo, path);
                } else {
                    size = await fetchRepoSize(repo);
                }
                sizeCache[cacheKey] = size;
                element.textContent = size;
            }
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
});
