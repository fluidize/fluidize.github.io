document.addEventListener('DOMContentLoaded', function() {
    // Load projects from JSON and generate cards
    async function loadProjects() {
        try {
            const response = await fetch('projects.json');
            const projects = await response.json();
            const projectsList = document.querySelector('.projects-list');
            
            projects.forEach(project => {
                const card = document.createElement('li');
                card.className = 'project-card';
                card.dataset.project = project.id;
                card.dataset.github = project.github;
                card.innerHTML = `
                    <h2 class="project-title">${project.title}</h2>
                    <p class="project-basic-desc">${project.basicDesc}</p>
                    <div class="project-meta">
                        ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                    </div>
                    <button class="view-more-btn" data-project="${project.id}">View More</button>
                    <div class="project-desc">
                        ${Array.isArray(project.desc) ? project.desc.map(item => item.startsWith('\n') ? `<p></p><p>${item.replace(/^\n/, '')}</p>` : `<p>${item}</p>`).join('') : `<p>${project.desc.replace(/\n/g, '<br>')}</p>`}
                    </div>
                    <a class="project-link" href="${project.link}" target="_blank">${project.link.replace('https://github.com/fluidize', '').replace('/tree/main', '')}/ →</a>
                `;
                projectsList.appendChild(card);
            });

            // Re-attach view more button event listeners after generating cards
            attachViewMoreListeners();

            // Generate project items in filetree navigation
            if (window.generateProjectItems) {
                window.generateProjectItems();
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    }

    function attachViewMoreListeners() {
        document.querySelectorAll('.view-more-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const projectId = this.getAttribute('data-project');
                openModal(projectId);
            });
        });
    }

    // Load projects from JSON
    loadProjects();
});
