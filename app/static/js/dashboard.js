document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initChart();
    loadAIRecommendations();
});

function initMap() {
    const map = L.map('dashboard-map', {
        zoomControl: true,
        attributionControl: false
    }).setView([10.2289, 78.4326], 8);

    // Free OpenStreetMap tile layer (No API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const createIcon = (color, isStand = false) => {
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color}; width: ${isStand ? '28px' : '16px'}; height: ${isStand ? '28px' : '16px'}; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${isStand ? '<span style="font-size: 12px; color: white;">🚍</span>' : ''}</div>`,
            iconSize: isStand ? [28, 28] : [16, 16],
            iconAnchor: isStand ? [14, 14] : [8, 8]
        });
    };

    const redIcon = createIcon('#ef4444', true);
    const orangeIcon = createIcon('#f59e0b', true);
    const greenIcon = createIcon('#10b981', true);
    const purpleIcon = createIcon('#8b5cf6', true);
    const blueDot = createIcon('#3b82f6', false);

    const points = {
        main: { coords: [10.2, 78.1], name: "Main Bus Stand", crowd: "4,200 (105%)", buses: "12 / 12", color: '#ef4444', icon: redIcon, offset: [-120, -40] },
        east: { coords: [10.6, 78.9], name: "East Stop", crowd: "320 (40%)", buses: "4 / 4", color: '#10b981', icon: greenIcon, offset: [15, -40] },
        periyar: { coords: [9.9, 78.6], name: "Periyar Bus Stand", crowd: "1,200 (85%)", buses: "6 / 8", color: '#f59e0b', icon: orangeIcon, offset: [15, 0] },
        west: { coords: [10.5, 77.4], name: "West Stop", crowd: "450 (55%)", buses: "3 / 4", color: '#10b981', icon: greenIcon, offset: [-100, 0] },
        temple: { coords: [9.4, 78.2], name: "Temple Exit", crowd: "800 (70%)", buses: "2 / 3", color: '#8b5cf6', icon: purpleIcon, offset: [15, 20] }
    };

    const routes = [
        [points.main.coords, [10.4, 78.5], points.east.coords],
        [points.main.coords, [10.0, 78.3], points.periyar.coords],
        [points.main.coords, [10.3, 77.8], points.west.coords],
        [points.main.coords, [9.7, 78.1], points.temple.coords]
    ];

    routes.forEach((route, idx) => {
        L.polyline(route, { color: '#3b82f6', weight: 3, dashArray: '8, 8', opacity: 0.6 }).addTo(map);
        // Add some blue dots along the route to match image
        if (idx === 0) L.marker([10.4, 78.5], {icon: blueDot}).addTo(map);
        if (idx === 1) L.marker([10.0, 78.3], {icon: blueDot}).addTo(map);
    });

    Object.values(points).forEach(p => {
        const marker = L.marker(p.coords, { icon: p.icon }).addTo(map);
        
        let tooltipBg = '#ffffff';
        let tooltipBorder = p.color;
        
        // Special case for Main Stand red box in light theme
        if (p.name === "Main Bus Stand") {
            tooltipBg = '#ef4444';
            tooltipBorder = '#ef4444';
        }

        const tooltipContent = `
            <div style="background: ${tooltipBg}; color: ${p.name === 'Main Bus Stand' ? 'white' : '#0f172a'}; padding: 8px 12px; border-radius: 6px; border: 1px solid ${tooltipBorder}; min-width: 140px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <strong>${p.name}</strong><br>
                <span style="font-size: 0.8rem;">Crowd: ${p.crowd}</span><br>
                <span style="font-size: 0.8rem;">Buses: ${p.buses}</span>
            </div>
        `;
        
        // Use a divIcon for the floating label instead of tooltip for better styling control
        const label = L.divIcon({
            className: 'custom-floating-label',
            html: tooltipContent,
            iconSize: null,
            iconAnchor: p.offset ? [-p.offset[0], -p.offset[1]] : [-15, 20]
        });
        
        L.marker(p.coords, { icon: label, interactive: false }).addTo(map);
    });
}

function initChart() {
    const ctx = document.getElementById('demandChart').getContext('2d');
    
    // Add custom plugin for the vertical line and annotation
    const surgeLinePlugin = {
        id: 'surgeLine',
        afterDraw: (chart) => {
            const ctx = chart.ctx;
            const xAxis = chart.scales.x;
            const yAxis = chart.scales.y;
            
            // X position for "8 PM" (index 3)
            const x = xAxis.getPixelForTick(3);
            
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.moveTo(x, yAxis.top);
            ctx.lineTo(x, yAxis.bottom);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#ef4444';
            ctx.stroke();
            
            // Draw annotation box
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.roundRect(x - 60, yAxis.top + 10, 120, 35, 4);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.font = '10px Inter';
            ctx.fillText('Expected Surge', x, yAxis.top + 22);
            ctx.font = 'bold 11px Inter';
            ctx.fillText('7:45 PM - 8:30 PM', x, yAxis.top + 36);
            
            ctx.restore();
        }
    };

    Chart.register(surgeLinePlugin);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM'],
            datasets: [
                {
                    label: 'Main Stand',
                    data: [1500, 2000, 2800, 4500, 3200, 1800],
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#ef4444'
                },
                {
                    label: 'Periyar Stand',
                    data: [800, 1200, 1500, 2200, 1900, 1100],
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#f59e0b'
                },
                {
                    label: 'East Stop',
                    data: [300, 400, 600, 900, 700, 400],
                    borderColor: '#10b981',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#10b981'
                },
                {
                    label: 'West Stop',
                    data: [400, 500, 700, 1200, 900, 500],
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#3b82f6'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#64748b', boxWidth: 12, usePointStyle: true, pointStyle: 'line' }
                }
            },
            scales: {
                y: {
                    grid: { color: '#e2e8f0', drawBorder: false },
                    ticks: { color: '#64748b', callback: (val) => val >= 1000 ? (val/1000) + 'K' : val }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b' }
                }
            }
        }
    });
}

async function loadAIRecommendations() {
    const container = document.getElementById('ai-recs-container');
    
    let html = `
        <div class="ai-recommendation high-priority">
            <div class="ai-header">
                <span class="badge badge-danger">High Priority</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">7:45 PM</span>
            </div>
            <div class="ai-action">Move 1 bus from East Stop ➔ Main Bus Stand</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Gain: +1 bus (Main Stand)</span> | 
                <span style="color: var(--danger);">Loss: -1 bus (East Stop)</span><br>
                <span>ETA: 7 min | Impact: Reduces crowding by ~15%</span>
            </div>
        </div>
        
        <div class="ai-recommendation medium-priority">
            <div class="ai-header">
                <span class="badge badge-warning" style="color: white;">Medium Priority</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">8:10 PM</span>
            </div>
            <div class="ai-action">Move 1 bus from West Stop ➔ Periyar Stand</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Gain: +1 bus (Periyar)</span> | 
                <span style="color: var(--danger);">Loss: -1 bus (West Stop)</span><br>
                <span>ETA: 8 min | Impact: Balances load across stops</span>
            </div>
        </div>
        
        <div class="ai-recommendation plan-ahead">
            <div class="ai-header">
                <span class="badge badge-info">Plan Ahead</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">8:40 PM</span>
            </div>
            <div class="ai-action">Prepare 2 buses from Depot for Main Stand</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Gain: +2 buses (Main Stand)</span> | 
                <span style="color: var(--text-muted);">Loss: -2 buses (Depot)</span><br>
                <span>ETA: 15 min | Impact: Prevents post-event surge</span>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}
