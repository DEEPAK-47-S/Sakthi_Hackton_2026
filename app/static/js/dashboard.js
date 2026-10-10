document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initChart();
    loadAIRecommendations();
    startRealTimeSimulation();
});

let map;
let allHubs = {};
let selectedHubId = null;

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

    const createIcon = (color, size = 24) => {
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="font-size: ${size/2.5}px; color: white;">🚍</span></div>`,
            iconSize: [size, size],
            iconAnchor: [size/2, size/2]
        });
    };

    const redIcon = createIcon('#ef4444');
    const orangeIcon = createIcon('#f59e0b');
    const greenIcon = createIcon('#10b981');
    const smallRed = createIcon('#ef4444', 16);
    const smallOrange = createIcon('#f59e0b', 16);
    const smallGreen = createIcon('#10b981', 16);

    // 3-4 Bus Stands per Major District
    allHubs = {
        // Coimbatore District
        'cbe-gandhipuram': { coords: [11.0183, 76.9654], name: "Gandhipuram", district: "Coimbatore", crowd: 8800, max: 9000, buses: 65, totalBuses: 70, color: '#ef4444', icon: redIcon, isMain: true },
        'cbe-ukkadam': { coords: [10.9926, 76.9613], name: "Ukkadam", district: "Coimbatore", crowd: 4100, max: 5000, buses: 25, totalBuses: 30, color: '#f59e0b', icon: smallOrange },
        'cbe-singanallur': { coords: [11.0026, 77.0270], name: "Singanallur", district: "Coimbatore", crowd: 3200, max: 4000, buses: 20, totalBuses: 25, color: '#10b981', icon: smallGreen },
        'cbe-mettupalayam': { coords: [11.3000, 76.9333], name: "Mettupalayam Stand", district: "Coimbatore", crowd: 1500, max: 2000, buses: 12, totalBuses: 15, color: '#10b981', icon: smallGreen },

        // Chennai District
        'chn-cmbt': { coords: [13.0674, 80.1923], name: "CMBT Koyambedu", district: "Chennai", crowd: 14500, max: 15000, buses: 120, totalBuses: 140, color: '#ef4444', icon: redIcon, isMain: true },
        'chn-broadway': { coords: [13.0883, 80.2833], name: "Broadway", district: "Chennai", crowd: 8200, max: 9000, buses: 60, totalBuses: 65, color: '#ef4444', icon: smallRed },
        'chn-tambaram': { coords: [12.9249, 80.1000], name: "Tambaram", district: "Chennai", crowd: 6500, max: 8000, buses: 45, totalBuses: 50, color: '#f59e0b', icon: smallOrange },
        'chn-tnagar': { coords: [13.0418, 80.2341], name: "T. Nagar Stand", district: "Chennai", crowd: 5100, max: 6000, buses: 35, totalBuses: 40, color: '#f59e0b', icon: smallOrange },

        // Madurai District
        'mdu-mattuthavani': { coords: [9.9533, 78.1504], name: "Mattuthavani", district: "Madurai", crowd: 7200, max: 8000, buses: 50, totalBuses: 60, color: '#f59e0b', icon: redIcon, isMain: true },
        'mdu-arappalayam': { coords: [9.9298, 78.1065], name: "Arappalayam", district: "Madurai", crowd: 4500, max: 5000, buses: 30, totalBuses: 35, color: '#ef4444', icon: smallRed },
        'mdu-periyar': { coords: [9.9173, 78.1130], name: "Periyar Stand", district: "Madurai", crowd: 3100, max: 4000, buses: 20, totalBuses: 25, color: '#10b981', icon: smallGreen },

        // Trichy District
        'try-central': { coords: [10.8050, 78.6856], name: "Trichy Central", district: "Trichy", crowd: 6500, max: 7000, buses: 45, totalBuses: 50, color: '#ef4444', icon: redIcon, isMain: true },
        'try-chatram': { coords: [10.8286, 78.6942], name: "Chatram Stand", district: "Trichy", crowd: 3800, max: 4500, buses: 25, totalBuses: 30, color: '#f59e0b', icon: smallOrange },
        'try-thiruverumbur': { coords: [10.7675, 78.7831], name: "Thiruverumbur", district: "Trichy", crowd: 1200, max: 2000, buses: 10, totalBuses: 15, color: '#10b981', icon: smallGreen },

        // Salem District
        'slm-new': { coords: [11.6643, 78.1460], name: "Salem New Stand", district: "Salem", crowd: 4500, max: 6000, buses: 35, totalBuses: 45, color: '#10b981', icon: redIcon, isMain: true },
        'slm-old': { coords: [11.6500, 78.1500], name: "Salem Old Stand", district: "Salem", crowd: 2800, max: 4000, buses: 20, totalBuses: 25, color: '#10b981', icon: smallGreen },
        'slm-attur': { coords: [11.5950, 78.6010], name: "Attur Stand", district: "Salem", crowd: 1800, max: 3000, buses: 12, totalBuses: 18, color: '#10b981', icon: smallGreen },

        // Erode District
        'erd-central': { coords: [11.3410, 77.7172], name: "Erode Central", district: "Erode", crowd: 2100, max: 3500, buses: 18, totalBuses: 25, color: '#10b981', icon: redIcon, isMain: true },
        'erd-solar': { coords: [11.2990, 77.7490], name: "Solar Stand", district: "Erode", crowd: 1100, max: 2000, buses: 8, totalBuses: 12, color: '#10b981', icon: smallGreen },
        'erd-bhavani': { coords: [11.4500, 77.6833], name: "Bhavani Stand", district: "Erode", crowd: 1400, max: 2500, buses: 10, totalBuses: 15, color: '#10b981', icon: smallGreen },
        
        // Tiruppur District
        'tup-old': { coords: [11.1085, 77.3411], name: "Tiruppur Old Stand", district: "Tiruppur", crowd: 3800, max: 4500, buses: 30, totalBuses: 35, color: '#f59e0b', icon: redIcon, isMain: true },
        'tup-new': { coords: [11.1350, 77.3350], name: "PN Road New Stand", district: "Tiruppur", crowd: 2900, max: 4000, buses: 22, totalBuses: 30, color: '#10b981', icon: smallGreen },
        'tup-kangeyam': { coords: [11.0000, 77.5667], name: "Kangeyam Stand", district: "Tiruppur", crowd: 1100, max: 2000, buses: 8, totalBuses: 12, color: '#10b981', icon: smallGreen }
    };

    // Draw lines between Main Hubs only
    const routes = [
        [allHubs['chn-cmbt'].coords, allHubs['try-central'].coords, allHubs['mdu-mattuthavani'].coords],
        [allHubs['chn-cmbt'].coords, allHubs['slm-new'].coords, allHubs['erd-central'].coords, allHubs['tup-old'].coords, allHubs['cbe-gandhipuram'].coords],
        [allHubs['cbe-gandhipuram'].coords, allHubs['mdu-mattuthavani'].coords],
        [allHubs['try-central'].coords, allHubs['slm-new'].coords]
    ];

    routes.forEach((route) => {
        L.polyline(route, { color: '#3b82f6', weight: 2, dashArray: '5, 5', opacity: 0.4 }).addTo(map);
    });

    Object.keys(allHubs).forEach(key => {
        let p = allHubs[key];
        p.id = key;
        
        let marker = L.marker(p.coords, { icon: p.icon }).addTo(map);
        
        const popupContent = `
            <div style="min-width: 180px; font-family: 'Inter', sans-serif;">
                <strong style="font-size: 1.1rem; display: block; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 8px;">${p.name} (${p.district})</strong>
                <div style="margin-bottom: 5px;">
                    <span style="color: #64748b; font-size: 0.85rem;">Live Crowd:</span><br>
                    <strong style="font-size: 1rem; color: ${p.color};" id="popup-${p.id}">${p.crowd.toLocaleString()} (${Math.round((p.crowd/p.max)*100)}%)</strong>
                </div>
                <div>
                    <span style="color: #64748b; font-size: 0.85rem;">Active Buses:</span><br>
                    <strong style="font-size: 0.95rem;">${p.buses} / ${p.totalBuses}</strong>
                </div>
            </div>
        `;
        
        marker.bindPopup(popupContent, { className: 'custom-popup' });
        
        // When clicking a bus stand, update the top KPIs to show data for THIS specific stand
        marker.on('click', () => {
            selectedHubId = key;
            updateKPIsForHub(p);
        });
    });

    // Reset to statewide if clicking on the map background
    map.on('click', (e) => {
        if(!e.originalEvent.target.closest('.leaflet-marker-icon')) {
            selectedHubId = null;
            updateKPIsForStatewide();
        }
    });
}

function updateKPIsForHub(hub) {
    document.getElementById('kpi-title-passengers').innerText = `Total Passengers (${hub.name})`;
    document.getElementById('total-passengers').innerText = hub.crowd.toLocaleString();
    document.getElementById('kpi-subtitle-passengers').innerText = `Location: ${hub.district} District`;
    
    document.getElementById('kpi-title-buses').innerText = `Active Buses (${hub.name})`;
    document.getElementById('total-buses').innerText = hub.buses.toLocaleString();
    document.getElementById('kpi-subtitle-buses').innerText = `of ${hub.totalBuses} allocated`;
    document.getElementById('kpi-progress-buses').style.width = `${Math.round((hub.buses/hub.totalBuses)*100)}%`;
    
    let isCritical = (hub.crowd/hub.max) > 0.9;
    document.getElementById('kpi-title-critical').innerText = `Status Level`;
    document.getElementById('critical-stops-count').innerText = isCritical ? "CRITICAL" : "NORMAL";
    document.getElementById('kpi-subtitle-critical').innerText = `Capacity: ${Math.round((hub.crowd/hub.max)*100)}%`;
    
    document.getElementById('kpi-title-surge').innerText = `Next Surge (${hub.name})`;
    document.getElementById('surge-time').innerText = "In ~45 mins";
    document.getElementById('kpi-subtitle-surge').innerText = "Based on historical trend";
}

function updateKPIsForStatewide() {
    document.getElementById('kpi-title-passengers').innerText = `Total Passengers (Statewide)`;
    // The interval function will naturally update this to the aggregate sum
    
    document.getElementById('kpi-title-buses').innerText = `Active Buses`;
    document.getElementById('total-buses').innerText = "1,452";
    document.getElementById('kpi-subtitle-buses').innerText = `of 1,500 available`;
    document.getElementById('kpi-progress-buses').style.width = `96%`;
    
    document.getElementById('kpi-title-critical').innerText = `Critical Stops`;
    document.getElementById('critical-stops-count').innerText = "4";
    document.getElementById('kpi-subtitle-critical').innerText = `(> 90% capacity)`;
    
    document.getElementById('kpi-title-surge').innerText = `Next Major Surge`;
    document.getElementById('surge-time').innerText = "7:45 PM - 9:00 PM";
    document.getElementById('kpi-subtitle-surge').innerText = "(Chennai & Coimbatore)";
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
                    label: 'Chennai',
                    data: [8500, 10000, 11500, 14000, 12500, 9500],
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#f59e0b'
                },
                {
                    label: 'Coimbatore',
                    data: [5000, 6800, 8200, 10500, 9000, 6100],
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
            <div class="ai-action">Move 15 buses from Erode ➔ CBE Gandhipuram</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Gain: +15 buses (CBE)</span> | 
                <span style="color: var(--danger);">Loss: -15 buses (Erode)</span><br>
                <span>ETA: 1.5 hrs | Impact: Resolves critical crowd in CBE</span>
            </div>
        </div>
        
        <div class="ai-recommendation high-priority">
            <div class="ai-header">
                <span class="badge badge-danger" style="background: var(--danger); color: white;">High Priority</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Live</span>
            </div>
            <div class="ai-action">Move 10 buses from Tambaram ➔ CMBT Koyambedu</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Gain: +10 buses (CMBT)</span> | 
                <span style="color: var(--danger);">Loss: -10 buses (Tambaram)</span><br>
                <span>ETA: 45 mins | Impact: Balances heavy load at Chennai Main Hub</span>
            </div>
        </div>
        
        <div class="ai-recommendation plan-ahead">
            <div class="ai-header">
                <span class="badge badge-info">Plan Ahead</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">8:30 PM</span>
            </div>
            <div class="ai-action">Deploy 20 Reserve Buses to Madurai Mattuthavani</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Gain: +20 buses (Madurai)</span> | 
                <span style="color: var(--text-muted);">Loss: -20 buses (Depot)</span><br>
                <span>ETA: 30 min | Impact: Prevents massive night surge in South TN</span>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Simulate real-time data changes across Tamil Nadu
function startRealTimeSimulation() {
    setInterval(() => {
        let totalStatewideCrowd = 0;
        
        // Loop through all hubs and randomly update their crowd values
        Object.keys(allHubs).forEach(key => {
            let hub = allHubs[key];
            let fluctuation = Math.floor(Math.random() * 80) - 35; // small fluctuation
            hub.crowd = Math.max(0, hub.crowd + fluctuation);
            totalStatewideCrowd += hub.crowd;
            
            let percent = Math.round((hub.crowd / hub.max) * 100);
            
            // Update popup if open
            let popupEl = document.getElementById(`popup-${hub.id}`);
            if (popupEl) {
                popupEl.innerHTML = `${hub.crowd.toLocaleString()} (${percent}%)`;
            }
        });

        // Add an arbitrary base for unlisted stops to look realistic
        totalStatewideCrowd += 85000;
        
        // Update top KPIs based on what is selected
        if (selectedHubId) {
            let hub = allHubs[selectedHubId];
            document.getElementById('total-passengers').innerText = hub.crowd.toLocaleString();
            let isCritical = (hub.crowd/hub.max) > 0.9;
            document.getElementById('critical-stops-count').innerText = isCritical ? "CRITICAL" : "NORMAL";
            document.getElementById('kpi-subtitle-critical').innerText = `Capacity: ${Math.round((hub.crowd/hub.max)*100)}%`;
        } else {
            document.getElementById('total-passengers').innerText = totalStatewideCrowd.toLocaleString();
        }
        
    }, 3000); // Update every 3 seconds
}
