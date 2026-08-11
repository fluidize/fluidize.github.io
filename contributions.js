document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('github-contributions');
    if (!container) return;

    const API_URL = 'https://github-contributions-api.jogruber.de/v4/Fluidize';

    function isoDate(d) {
        return d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0');
    }

    function renderChart(byDate) {
        const cell = 10;
        const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chart-grid-gap')) || 4;
        const padTop = 18;
        const padLeft = 30;
        const padRight = 8;
        const padBottom = 8;
        const dayMs = 86400000;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = new Date(today.getTime() - 364 * dayMs);
        start.setDate(start.getDate() - start.getDay());

        const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const weeks = [];
        const monthColumns = [];
        let prevMonth = -1;
        for (let w = 0; w < 53; w++) {
            const column = [];
            for (let d = 0; d < 7; d++) {
                column.push(new Date(start.getTime() + (w * 7 + d) * dayMs));
            }
            const m = column[0].getMonth();
            if (m !== prevMonth) {
                monthColumns.push({ week: w, month: m });
                prevMonth = m;
            }
            weeks.push(column);
        }

        const width = padLeft + padRight + weeks.length * (cell + gap) - gap;
        const height = padTop + padBottom + 7 * (cell + gap) - gap;

        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        svg.classList.add('contrib-chart');

        ['', 'Mon', '', 'Wed', '', 'Fri', ''].forEach(function (label, di) {
            if (!label) return;
            const text = document.createElementNS(ns, 'text');
            text.textContent = label;
            text.setAttribute('x', padLeft - 4);
            text.setAttribute('y', padTop + di * (cell + gap) + cell - 1);
            text.setAttribute('text-anchor', 'end');
            text.setAttribute('font-size', 9);
            svg.appendChild(text);
        });

        monthColumns.forEach(function (item) {
            const text = document.createElementNS(ns, 'text');
            text.textContent = monthAbbr[item.month];
            text.setAttribute('x', padLeft + item.week * (cell + gap));
            text.setAttribute('y', padTop - 6);
            text.setAttribute('font-size', 10);
            svg.appendChild(text);
        });

        weeks.forEach(function (column, wi) {
            column.forEach(function (date, di) {
                const entry = byDate[isoDate(date)];
                const level = entry ? entry.level : 0;
                const rect = document.createElementNS(ns, 'rect');
                rect.setAttribute('x', padLeft + wi * (cell + gap));
                rect.setAttribute('y', padTop + di * (cell + gap));
                rect.setAttribute('width', cell);
                rect.setAttribute('height', cell);
                rect.classList.add('contrib-cell', 'l' + level);
                svg.appendChild(rect);
            });
        });

        container.innerHTML = '';
        container.appendChild(svg);
    }

    fetch(API_URL)
        .then(function (response) {
            if (!response.ok) throw new Error('Bad response');
            return response.json();
        })
        .then(function (data) {
            const byDate = {};
            data.contributions.forEach(function (c) {
                byDate[c.date] = c;
            });
            const totalEl = document.getElementById('contrib-total');
            if (totalEl && data.total) {
                const year = String(new Date().getFullYear());
                totalEl.textContent = data.total[year] !== undefined ? data.total[year] : '—';
            }
            renderChart(byDate);
        })
        .catch(function () {
            container.textContent = 'Could not load contribution data.';
        });
});
