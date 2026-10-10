document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initChart();
    loadAIRecommendations();
    startRealTimeSimulation();
});

let map;
let localStopsLayerGroup;

function initMap() {
    // Center around Coimbatore region
    map = L.map('dashboard-map', {
        zoomControl: true,
        attributionControl: false
    }).setView([11.0168, 77.4558], 8);

    // Free OpenStreetMap tile layer (No API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const createIcon = (color, isStand = false, isSmall = false) => {
        let size = isStand ? 28 : (isSmall ? 12 : 16);
        let iconHtml = isStand ? '<span style="font-size: 12px; color: white;">🚍</span>' : '';
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: ${isSmall ? 1 : 3}px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${iconHtml}</div>`,
            iconSize: [size, size],
            iconAnchor: [size/2, size/2]
        });
    };

    const redIcon = createIcon('#ef4444', true);
    const orangeIcon = createIcon('#f59e0b', true);
    const greenIcon = createIcon('#10b981', true);
    const purpleIcon = createIcon('#8b5cf6', true);
    const blueDot = createIcon('#3b82f6', false);
    
    // Small dots for local stops
    const smallGreen = createIcon('#10b981', false, true);
    const smallOrange = createIcon('#f59e0b', false, true);

    const mainHubs = {
        gandhipuram: { coords: [11.0183, 76.9654], name: "Gandhipuram Bus Stand", crowd: "5,800 (110%)", buses: "42 / 45", color: '#ef4444', icon: redIcon, offset: [-130, -40], id: "crowd-gandhipuram" },
        ukkadam: { coords: [10.9926, 76.9613], name: "Ukkadam", crowd: "3,100 (85%)", buses: "15 / 18", color: '#f59e0b', icon: orangeIcon, offset: [15, 0], id: "crowd-ukkadam" },
        singanallur: { coords: [11.0026, 77.0270], name: "Singanallur", crowd: "2,400 (70%)", buses: "28 / 30", color: '#10b981', icon: greenIcon, offset: [15, -20], id: "crowd-singanallur" },
        tiruppur: { coords: [11.1085, 77.3411], name: "Tiruppur Old Stand", crowd: "4,200 (95%)", buses: "35 / 40", color: '#ef4444', icon: redIcon, offset: [15, -30], id: "crowd-tiruppur" },
        erode: { coords: [11.3410, 77.7172], name: "Erode Central", crowd: "2,800 (60%)", buses: "22 / 35", color: '#10b981', icon: greenIcon, offset: [-120, 0] },
        salem: { coords: [11.6643, 78.1460], name: "Salem New Stand", crowd: "3,500 (75%)", buses: "40 / 45", color: '#f59e0b', icon: orangeIcon, offset: [15, 0] },
        karur: { coords: [10.9601, 78.0766], name: "Karur Bus Stand", crowd: "1,500 (50%)", buses: "12 / 15", color: '#10b981', icon: greenIcon, offset: [15, 20] },
        pollachi: { coords: [10.6622, 77.0067], name: "Pollachi", crowd: "1,200 (45%)", buses: "8 / 10", color: '#10b981', icon: greenIcon, offset: [-100, 20] }
    };

    // Draw lines (Routes between hubs)
    const routes = [
        [mainHubs.gandhipuram.coords, mainHubs.tiruppur.coords, mainHubs.erode.coords, mainHubs.salem.coords],
        [mainHubs.gandhipuram.coords, mainHubs.pollachi.coords],
        [mainHubs.tiruppur.coords, mainHubs.karur.coords],
        [mainHubs.gandhipuram.coords, mainHubs.singanallur.coords],
        [mainHubs.gandhipuram.coords, mainHubs.ukkadam.coords]
    ];

    routes.forEach((route) => {
        L.polyline(route, { color: '#3b82f6', weight: 3, dashArray: '8, 8', opacity: 0.6 }).addTo(map);
    });

    Object.values(mainHubs).forEach(p => {
        let tooltipBg = '#ffffff';
        let tooltipBorder = p.color;
        let fontColor = '#0f172a';
        
        if (p.color === '#ef4444') {
            tooltipBg = '#ef4444';
            fontColor = 'white';
        }

        const tooltipContent = `
            <div style="background: ${tooltipBg}; color: ${fontColor}; padding: 8px 12px; border-radius: 6px; border: 1px solid ${tooltipBorder}; min-width: 140px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <strong>${p.name}</strong><br>
                <span style="font-size: 0.8rem;" id="${p.id || ''}">Crowd: ${p.crowd}</span><br>
                <span style="font-size: 0.8rem;">Buses: ${p.buses}</span>
            </div>
        `;
        
        const label = L.divIcon({
            className: 'custom-floating-label',
            html: tooltipContent,
            iconSize: null,
            iconAnchor: p.offset ? [-p.offset[0], -p.offset[1]] : [-15, 20]
        });
        
        L.marker(p.coords, { icon: p.icon }).addTo(map);
        L.marker(p.coords, { icon: label, interactive: false }).addTo(map);
    });

    // Zoom-in specific local stops (only visible when zoomed in)
    localStopsLayerGroup = L.layerGroup();
    
    const localStops = [
        { coords: [11.0250, 76.9450], name: "Cross Cut Road" },
        { coords: [11.0100, 76.9800], name: "Peelamedu" },
        { coords: [11.0400, 76.9950], name: "Hope College" },
        { coords: [11.0300, 76.9200], name: "RS Puram" },
        { coords: [10.9800, 76.9700], name: "Podanur" },
        { coords: [11.1150, 77.3500], name: "Tiruppur New Stand" },
        { coords: [11.1200, 77.3300], name: "PN Road" }
    ];

    localStops.forEach(stop => {
        let marker = L.marker(stop.coords, { icon: smallGreen });
        marker.bindTooltip(stop.name, { direction: 'top', className: 'custom-tooltip' });
        localStopsLayerGroup.addLayer(marker);
    });

    // Map Zoom event listener to show/hide local stops
    map.on('zoomend', function() {
        if (map.getZoom() >= 12) {
            map.addLayer(localStopsLayerGroup);
        } else {
            map.removeLayer(localStopsLayerGroup);
        }
    });
}

function initChart() {
    const ctx = document.getElementById('demandChart').getContext('2d');
    
    const surgeLinePlugin = {
        id: 'surgeLine',
        afterDraw: (chart) => {
            const ctx = chart.ctx;
            const xAxis = chart.scales.x;
            const yAxis = chart.scales.y;
            
            // X position for "7 PM" (index 2)
            const x = xAxis.getPixelForTick(2);
            
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.moveTo(x, yAxis.top);
            ctx.lineTo(x, yAxis.bottom);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#ef4444';
            ctx.stroke();
            
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.roundRect(x - 70, yAxis.top + 5, 140, 35, 4);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.font = '10px Inter';
            ctx.fillText('Expected Surge', x, yAxis.top + 17);
            ctx.font = 'bold 11px Inter';
            ctx.fillText('6:00 PM - 8:30 PM', x, yAxis.top + 31);
            
            ctx.restore();
        }
    };

    Chart.register(surgeLinePlugin);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM'],
            datasets: [
                {
                    label: 'Gandhipuram',
                    data: [2500, 3800, 5200, 6500, 5800, 3100],
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#ef4444'
                },
                {
                    label: 'Tiruppur',
                    data: [1800, 2200, 3500, 4200, 3900, 2100],
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#f59e0b'
                },
                {
                    label: 'Singanallur',
                    data: [1300, 1400, 1800, 2400, 1900, 1200],
                    borderColor: '#10b981',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#10b981'
                },
                {
                    label: 'Salem',
                    data: [2000, 2500, 2700, 3200, 2900, 1500],
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

function loadAIRecommendations() {
    const container = document.getElementById('ai-recs-container');
    
    let html = `
        <div class="ai-recommendation high-priority">
            <div class="ai-header">
                <span class="badge badge-danger">High Priority</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">6:15 PM</span>
            </div>
            <div class="ai-action">Move 5 buses from Erode ➔ Gandhipuram</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Gain: +5 buses (Gandhipuram)</span> | 
                <span style="color: var(--danger);">Loss: -5 buses (Erode)</span><br>
                <span>ETA: 90 min | Impact: Reduces critical crowd by ~25%</span>
            </div>
        </div>
        
        <div class="ai-recommendation medium-priority">
            <div class="ai-header">
                <span class="badge badge-warning" style="color: white;">Medium Priority</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">6:30 PM</span>
            </div>
            <div class="ai-action">Move 3 buses from Pollachi ➔ Ukkadam</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Gain: +3 buses (Ukkadam)</span> | 
                <span style="color: var(--danger);">Loss: -3 buses (Pollachi)</span><br>
                <span>ETA: 45 min | Impact: Balances load for southern routes</span>
            </div>
        </div>
        
        <div class="ai-recommendation plan-ahead">
            <div class="ai-header">
                <span class="badge badge-info">Plan Ahead</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">7:00 PM</span>
            </div>
            <div class="ai-action">Prepare 10 buses from CBE Depot for Tiruppur</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Gain: +10 buses (Tiruppur)</span> | 
                <span style="color: var(--text-muted);">Loss: -10 buses (Depot)</span><br>
                <span>ETA: 60 min | Impact: Prevents post-event surge in Tiruppur</span>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Simulate real-time data changes
function startRealTimeSimulation() {
    setInterval(() => {
        // Randomly fluctuate total passengers
        let currentTotal = parseInt(document.getElementById('total-passengers').innerText.replace(',', ''));
        let change = Math.floor(Math.random() * 50) - 20; // -20 to +30
        document.getElementById('total-passengers').innerText = (currentTotal + change).toLocaleString();
        
        // Randomly update Gandhipuram crowd on map
        let gpCrowd = 5800 + Math.floor(Math.random() * 100) - 40;
        let gpEl = document.getElementById('crowd-gandhipuram');
        if (gpEl) gpEl.innerHTML = `Crowd: ${gpCrowd.toLocaleString()} (${Math.round((gpCrowd/5200)*100)}%)`;
        
        // Randomly update Tiruppur crowd on map
        let tpCrowd = 4200 + Math.floor(Math.random() * 80) - 30;
        let tpEl = document.getElementById('crowd-tiruppur');
        if (tpEl) tpEl.innerHTML = `Crowd: ${tpCrowd.toLocaleString()} (${Math.round((tpCrowd/4400)*100)}%)`;
        
    }, 3000); // Update every 3 seconds
}
