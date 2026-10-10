document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initChart();
    loadAIRecommendations();
    startRealTimeSimulation();
});

let map;
let allHubs = {};

function initMap() {
    // Center around Tamil Nadu
    map = L.map('dashboard-map', {
        zoomControl: true,
        attributionControl: false
    }).setView([10.8505, 78.6569], 7);

    // Free OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const createIcon = (color) => {
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="font-size: 10px; color: white;">🚍</span></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    };

    const redIcon = createIcon('#ef4444');
    const orangeIcon = createIcon('#f59e0b');
    const greenIcon = createIcon('#10b981');

    // All major district hubs across Tamil Nadu
    allHubs = {
        chennai: { coords: [13.0674, 80.1923], name: "Chennai Koyambedu (CMBT)", crowd: 12500, max: 15000, buses: "120 / 140", color: '#f59e0b', icon: orangeIcon, id: "crowd-chennai" },
        coimbatore: { coords: [11.0183, 76.9654], name: "Coimbatore Gandhipuram", crowd: 8800, max: 9000, buses: "65 / 70", color: '#ef4444', icon: redIcon, id: "crowd-coimbatore" },
        madurai: { coords: [9.9533, 78.1504], name: "Madurai Mattuthavani", crowd: 7200, max: 8000, buses: "50 / 60", color: '#f59e0b', icon: orangeIcon, id: "crowd-madurai" },
        trichy: { coords: [10.8050, 78.6856], name: "Trichy Central", crowd: 6500, max: 7000, buses: "45 / 50", color: '#ef4444', icon: redIcon, id: "crowd-trichy" },
        salem: { coords: [11.6643, 78.1460], name: "Salem New Stand", crowd: 4500, max: 6000, buses: "35 / 45", color: '#10b981', icon: greenIcon, id: "crowd-salem" },
        tirunelveli: { coords: [8.7275, 77.7369], name: "Tirunelveli Junction", crowd: 3200, max: 5000, buses: "25 / 35", color: '#10b981', icon: greenIcon, id: "crowd-tirunelveli" },
        vellore: { coords: [12.9340, 79.1469], name: "Vellore New Stand", crowd: 2800, max: 4000, buses: "20 / 30", color: '#10b981', icon: greenIcon, id: "crowd-vellore" },
        erode: { coords: [11.3410, 77.7172], name: "Erode Central", crowd: 2100, max: 3500, buses: "18 / 25", color: '#10b981', icon: greenIcon, id: "crowd-erode" },
        tiruppur: { coords: [11.1085, 77.3411], name: "Tiruppur Old Stand", crowd: 3800, max: 4500, buses: "30 / 35", color: '#f59e0b', icon: orangeIcon, id: "crowd-tiruppur" },
        thanjavur: { coords: [10.7818, 79.1352], name: "Thanjavur New Stand", crowd: 1500, max: 3000, buses: "12 / 20", color: '#10b981', icon: greenIcon, id: "crowd-thanjavur" },
        kanyakumari: { coords: [8.0883, 77.5385], name: "Kanyakumari Stand", crowd: 900, max: 2000, buses: "8 / 15", color: '#10b981', icon: greenIcon, id: "crowd-kanyakumari" },
        dindigul: { coords: [10.3673, 77.9803], name: "Dindigul Stand", crowd: 1800, max: 3000, buses: "15 / 22", color: '#10b981', icon: greenIcon, id: "crowd-dindigul" },
        tuticorin: { coords: [8.7832, 78.1256], name: "Tuticorin Stand", crowd: 1100, max: 2500, buses: "10 / 18", color: '#10b981', icon: greenIcon, id: "crowd-tuticorin" },
        cuddalore: { coords: [11.7480, 79.7714], name: "Cuddalore Stand", crowd: 1400, max: 2800, buses: "12 / 20", color: '#10b981', icon: greenIcon, id: "crowd-cuddalore" }
    };

    // Draw lines (Major National Highway Routes connecting districts)
    const routes = [
        [allHubs.chennai.coords, allHubs.vellore.coords],
        [allHubs.chennai.coords, allHubs.trichy.coords, allHubs.madurai.coords, allHubs.tirunelveli.coords, allHubs.kanyakumari.coords],
        [allHubs.chennai.coords, allHubs.cuddalore.coords, allHubs.thanjavur.coords, allHubs.trichy.coords],
        [allHubs.vellore.coords, allHubs.salem.coords, allHubs.erode.coords, allHubs.tiruppur.coords, allHubs.coimbatore.coords],
        [allHubs.coimbatore.coords, allHubs.dindigul.coords, allHubs.madurai.coords],
        [allHubs.madurai.coords, allHubs.tuticorin.coords]
    ];

    routes.forEach((route) => {
        L.polyline(route, { color: '#3b82f6', weight: 2, dashArray: '5, 5', opacity: 0.4 }).addTo(map);
    });

    Object.keys(allHubs).forEach(key => {
        let p = allHubs[key];
        
        let marker = L.marker(p.coords, { icon: p.icon }).addTo(map);
        
        // Popup opens when user touches/clicks the bus stop
        const popupContent = `
            <div style="min-width: 180px; font-family: 'Inter', sans-serif;">
                <strong style="font-size: 1.1rem; display: block; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 8px;">${p.name}</strong>
                <div style="margin-bottom: 5px;">
                    <span style="color: #64748b; font-size: 0.85rem;">Live Crowd:</span><br>
                    <strong style="font-size: 1rem; color: ${p.color};" id="popup-${p.id}">${p.crowd.toLocaleString()} (${Math.round((p.crowd/p.max)*100)}%)</strong>
                </div>
                <div>
                    <span style="color: #64748b; font-size: 0.85rem;">Active Buses:</span><br>
                    <strong style="font-size: 0.95rem;">${p.buses}</strong>
                </div>
            </div>
        `;
        
        marker.bindPopup(popupContent, {
            className: 'custom-popup'
        });
        
        // Open the most critical ones by default so the map doesn't look completely empty of data
        if(p.color === '#ef4444') {
            // Use setTimeout to allow map to render first
            setTimeout(() => {
                let tempMarker = L.marker(p.coords, { icon: L.divIcon({className: 'hidden-icon'})}).addTo(map);
                tempMarker.bindTooltip(`
                    <div style="background: white; border: 1px solid ${p.color}; padding: 4px 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <strong>${p.name}</strong><br>
                        <span style="color: ${p.color};" id="tooltip-${p.id}">${p.crowd.toLocaleString()}</span>
                    </div>
                `, { permanent: true, direction: 'right', offset: [15, 0], className: 'custom-tooltip' });
            }, 500);
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
            
            const x = xAxis.getPixelForTick(3); // 8 PM
            
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
            ctx.fillText('7:45 PM - 9:00 PM', x, yAxis.top + 31);
            
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
                    label: 'Chennai CMBT',
                    data: [8500, 10000, 11500, 14000, 12500, 9500],
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#f59e0b'
                },
                {
                    label: 'CBE Gandhipuram',
                    data: [5000, 6800, 8200, 10500, 9000, 6100],
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#ef4444'
                },
                {
                    label: 'Trichy Central',
                    data: [4000, 5200, 6100, 7800, 6500, 4200],
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#ef4444'
                },
                {
                    label: 'Madurai',
                    data: [4500, 5500, 6800, 8500, 7200, 5500],
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
                <span style="font-size: 0.8rem; color: var(--text-muted);">Live</span>
            </div>
            <div class="ai-action">Move 12 buses from Salem ➔ Coimbatore</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Gain: +12 buses (CBE)</span> | 
                <span style="color: var(--danger);">Loss: -12 buses (Salem)</span><br>
                <span>ETA: 2.5 hrs | Impact: Resolves 97% critical crowd in CBE</span>
            </div>
        </div>
        
        <div class="ai-recommendation high-priority">
            <div class="ai-header">
                <span class="badge badge-danger" style="background: var(--danger); color: white;">High Priority</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Live</span>
            </div>
            <div class="ai-action">Move 8 buses from Thanjavur ➔ Trichy</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Gain: +8 buses (Trichy)</span> | 
                <span style="color: var(--danger);">Loss: -8 buses (Thanjavur)</span><br>
                <span>ETA: 1 hr | Impact: Balances heavy load at Trichy Central</span>
            </div>
        </div>
        
        <div class="ai-recommendation plan-ahead">
            <div class="ai-header">
                <span class="badge badge-info">Plan Ahead</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">8:30 PM</span>
            </div>
            <div class="ai-action">Deploy 25 Reserve Buses to Chennai Koyambedu</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Gain: +25 buses (CMBT)</span> | 
                <span style="color: var(--text-muted);">Loss: -25 buses (Depot)</span><br>
                <span>ETA: 30 min | Impact: Prevents massive night surge</span>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Simulate real-time data changes across Tamil Nadu
function startRealTimeSimulation() {
    setInterval(() => {
        // Randomly fluctuate total state passengers
        let currentTotal = parseInt(document.getElementById('total-passengers').innerText.replace(/,/g, ''));
        let change = Math.floor(Math.random() * 500) - 200; // -200 to +300
        document.getElementById('total-passengers').innerText = (currentTotal + change).toLocaleString();
        
        // Loop through all hubs and randomly update their crowd values
        Object.keys(allHubs).forEach(key => {
            let hub = allHubs[key];
            let fluctuation = Math.floor(Math.random() * 60) - 25; // small fluctuation
            hub.crowd = hub.crowd + fluctuation;
            let percent = Math.round((hub.crowd / hub.max) * 100);
            
            // Update popup if open
            let popupEl = document.getElementById(`popup-${hub.id}`);
            if (popupEl) {
                popupEl.innerHTML = `${hub.crowd.toLocaleString()} (${percent}%)`;
            }
            
            // Update tooltip if exists (for critical hubs)
            let tooltipEl = document.getElementById(`tooltip-${hub.id}`);
            if (tooltipEl) {
                tooltipEl.innerHTML = `${hub.crowd.toLocaleString()}`;
            }
        });
        
    }, 3000); // Update every 3 seconds
}
