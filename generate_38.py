import json

districts = [
    {"name": "Ariyalur", "lat": 11.1400, "lng": 79.0786},
    {"name": "Chengalpattu", "lat": 12.6939, "lng": 79.9756},
    {"name": "Chennai", "lat": 13.0827, "lng": 80.2707},
    {"name": "Coimbatore", "lat": 11.0168, "lng": 76.9558},
    {"name": "Cuddalore", "lat": 11.7480, "lng": 79.7714},
    {"name": "Dharmapuri", "lat": 12.1211, "lng": 78.1582},
    {"name": "Dindigul", "lat": 10.3673, "lng": 77.9803},
    {"name": "Erode", "lat": 11.3410, "lng": 77.7172},
    {"name": "Kallakurichi", "lat": 11.7383, "lng": 78.9639},
    {"name": "Kanchipuram", "lat": 12.8185, "lng": 79.6947},
    {"name": "Kanyakumari", "lat": 8.0883, "lng": 77.5385},
    {"name": "Karur", "lat": 10.9601, "lng": 78.0766},
    {"name": "Krishnagiri", "lat": 12.5186, "lng": 78.2137},
    {"name": "Madurai", "lat": 9.9252, "lng": 78.1198},
    {"name": "Mayiladuthurai", "lat": 11.1085, "lng": 79.6534},
    {"name": "Nagapattinam", "lat": 10.7672, "lng": 79.8449},
    {"name": "Namakkal", "lat": 11.2189, "lng": 78.1674},
    {"name": "Nilgiris", "lat": 11.4916, "lng": 76.7337},
    {"name": "Perambalur", "lat": 11.2342, "lng": 78.8821},
    {"name": "Pudukkottai", "lat": 10.3797, "lng": 78.8205},
    {"name": "Ramanathapuram", "lat": 9.3639, "lng": 78.8320},
    {"name": "Ranipet", "lat": 12.9272, "lng": 79.3331},
    {"name": "Salem", "lat": 11.6643, "lng": 78.1460},
    {"name": "Sivaganga", "lat": 9.8433, "lng": 78.4809},
    {"name": "Tenkasi", "lat": 8.9564, "lng": 77.3151},
    {"name": "Thanjavur", "lat": 10.7818, "lng": 79.1352},
    {"name": "Theni", "lat": 10.0104, "lng": 77.4768},
    {"name": "Thoothukudi", "lat": 8.7642, "lng": 78.1348},
    {"name": "Tiruchirappalli", "lat": 10.7905, "lng": 78.7047},
    {"name": "Tirunelveli", "lat": 8.7139, "lng": 77.7567},
    {"name": "Tirupathur", "lat": 12.4984, "lng": 78.5670},
    {"name": "Tiruppur", "lat": 11.1085, "lng": 77.3411},
    {"name": "Tiruvallur", "lat": 13.1419, "lng": 79.9071},
    {"name": "Tiruvannamalai", "lat": 12.2253, "lng": 79.0747},
    {"name": "Tiruvarur", "lat": 10.7719, "lng": 79.6366},
    {"name": "Vellore", "lat": 12.9165, "lng": 79.1325},
    {"name": "Viluppuram", "lat": 11.9401, "lng": 79.4861},
    {"name": "Virudhunagar", "lat": 9.5872, "lng": 77.9616}
]

js_code = """document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initChart();
    loadAIRecommendations();
    startRealTimeSimulation();
});

let map;
let allHubs = {};
let selectedHubId = null;

function initMap() {
    map = L.map('dashboard-map', {
        zoomControl: true,
        attributionControl: false
    }).setView([10.8505, 78.6569], 7);

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

    const districts = """ + json.dumps(districts) + """;
    
    // Generate hubs for all 38 districts
    districts.forEach((d, i) => {
        let baseCrowd = Math.floor(Math.random() * 8000) + 2000;
        if(['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'].includes(d.name)) {
            baseCrowd += 5000;
        }
        
        let crowd = baseCrowd;
        let max = baseCrowd + Math.floor(Math.random() * 2000) + 500;
        let ratio = crowd / max;
        let color = ratio > 0.85 ? '#ef4444' : (ratio > 0.6 ? '#f59e0b' : '#10b981');
        let icon = ratio > 0.85 ? redIcon : (ratio > 0.6 ? orangeIcon : greenIcon);

        // Main Stand
        allHubs[d.name.toLowerCase() + '-main'] = {
            coords: [d.lat, d.lng],
            name: d.name + " Main Stand",
            district: d.name,
            crowd: crowd,
            max: max,
            buses: Math.floor(crowd / 100),
            totalBuses: Math.floor(max / 100) + 5,
            color: color,
            icon: icon,
            isMain: true
        };

        // 2 Sub stands per district
        for(let j=1; j<=2; j++) {
            let subCrowd = Math.floor(crowd * 0.4);
            let subMax = Math.floor(max * 0.4);
            let subRatio = subCrowd / subMax;
            let subColor = subRatio > 0.85 ? '#ef4444' : (subRatio > 0.6 ? '#f59e0b' : '#10b981');
            let subIcon = subRatio > 0.85 ? smallRed : (subRatio > 0.6 ? smallOrange : smallGreen);
            
            // Offset coordinates slightly for sub stands
            let offsetLat = d.lat + (Math.random() * 0.08 - 0.04);
            let offsetLng = d.lng + (Math.random() * 0.08 - 0.04);
            
            allHubs[d.name.toLowerCase() + '-sub-' + j] = {
                coords: [offsetLat, offsetLng],
                name: d.name + " Local Stand " + j,
                district: d.name,
                crowd: subCrowd,
                max: subMax,
                buses: Math.floor(subCrowd / 100),
                totalBuses: Math.floor(subMax / 100) + 2,
                color: subColor,
                icon: subIcon,
                isMain: false
            };
        }
    });

    Object.keys(allHubs).forEach(key => {
        let p = allHubs[key];
        p.id = key;
        
        let marker = L.marker(p.coords, { icon: p.icon }).addTo(map);
        
        const popupContent = `
            <div style="min-width: 180px; font-family: 'Inter', sans-serif;">
                <strong style="font-size: 1.1rem; display: block; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 8px;">\${p.name} (\${p.district})</strong>
                <div style="margin-bottom: 5px;">
                    <span style="color: #64748b; font-size: 0.85rem;">Live Crowd:</span><br>
                    <strong style="font-size: 1rem; color: \${p.color};" id="popup-\${p.id}">\${p.crowd.toLocaleString()} (\${Math.round((p.crowd/p.max)*100)}%)</strong>
                </div>
                <div>
                    <span style="color: #64748b; font-size: 0.85rem;">Active Buses:</span><br>
                    <strong style="font-size: 0.95rem;">\${p.buses} / \${p.totalBuses}</strong>
                </div>
                <div style="margin-top: 10px;">
                    <a href="/optimization" class="badge badge-info" style="text-decoration: none; display: block; text-align: center;">View AI Allocations</a>
                </div>
            </div>
        `;
        
        marker.bindPopup(popupContent, { className: 'custom-popup' });
        
        marker.on('click', () => {
            selectedHubId = key;
            updateKPIsForHub(p);
        });
    });

    map.on('click', (e) => {
        if(!e.originalEvent.target.closest('.leaflet-marker-icon')) {
            selectedHubId = null;
            updateKPIsForStatewide();
        }
    });
}

function updateKPIsForHub(hub) {
    document.getElementById('kpi-title-passengers').innerText = `Total Passengers (\${hub.name})`;
    document.getElementById('total-passengers').innerText = hub.crowd.toLocaleString();
    document.getElementById('kpi-subtitle-passengers').innerText = `Location: \${hub.district} District`;
    
    document.getElementById('kpi-title-buses').innerText = `Active Buses (\${hub.name})`;
    document.getElementById('total-buses').innerText = hub.buses.toLocaleString();
    document.getElementById('kpi-subtitle-buses').innerText = `of \${hub.totalBuses} allocated`;
    document.getElementById('kpi-progress-buses').style.width = `\${Math.round((hub.buses/hub.totalBuses)*100)}%`;
    
    let isCritical = (hub.crowd/hub.max) > 0.85;
    document.getElementById('kpi-title-critical').innerText = `Status Level`;
    document.getElementById('critical-stops-count').innerText = isCritical ? "CRITICAL" : "NORMAL";
    document.getElementById('kpi-subtitle-critical').innerText = `Capacity: \${Math.round((hub.crowd/hub.max)*100)}%`;
    
    document.getElementById('kpi-title-surge').innerText = `Next Surge (\${hub.name})`;
    document.getElementById('surge-time').innerText = "In ~45 mins";
    document.getElementById('kpi-subtitle-surge').innerText = "Based on historical trend";
}

function updateKPIsForStatewide() {
    document.getElementById('kpi-title-passengers').innerText = `Total Passengers (Statewide)`;
    document.getElementById('kpi-title-buses').innerText = `Active Buses (Statewide)`;
    document.getElementById('total-buses').innerText = "4,250";
    document.getElementById('kpi-subtitle-buses').innerText = `of 4,500 available`;
    document.getElementById('kpi-progress-buses').style.width = `94%`;
    
    document.getElementById('kpi-title-critical').innerText = `Critical Stops`;
    document.getElementById('critical-stops-count').innerText = "28";
    document.getElementById('kpi-subtitle-critical').innerText = `(> 90% capacity)`;
    
    document.getElementById('kpi-title-surge').innerText = `Next Major Festival`;
    document.getElementById('surge-time').innerText = "Pongal (Jan 14)";
    document.getElementById('kpi-subtitle-surge').innerText = "Statewide High Alert";
}

function initChart() {
    const ctx = document.getElementById('demandChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Pongal', 'Thaipusam', 'Tamil New Year', 'Aadi Perukku', 'Vinayagar Chaturthi', 'Deepavali'],
            datasets: [
                {
                    label: 'Predicted Crowd (Millions)',
                    data: [8.5, 4.2, 3.8, 5.1, 6.2, 9.8],
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'],
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { grid: { color: '#e2e8f0' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function loadAIRecommendations() {
    const container = document.getElementById('ai-recs-container');
    
    let html = `
        <div class="ai-recommendation high-priority">
            <div class="ai-header">
                <span class="badge badge-danger">High Priority Event</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Pongal Festival (Jan 14-17)</span>
            </div>
            <div class="ai-action">AI Prediction: Massive outbound travel from Chennai</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Action: Allocate +500 Reserve Buses to CMBT</span><br>
                <span>Impact: Prevents 90% of expected congestion</span>
            </div>
        </div>
        
        <div class="ai-recommendation medium-priority">
            <div class="ai-header">
                <span class="badge badge-warning" style="color: white;">Regional Alert</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Chithirai Festival (May)</span>
            </div>
            <div class="ai-action">AI Prediction: Heavy influx to Madurai District</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Action: Divert 150 buses from Trichy/Dindigul</span><br>
                <span>Impact: Balances Madurai Mattuthavani load</span>
            </div>
        </div>
        
        <div class="ai-recommendation plan-ahead">
            <div class="ai-header">
                <span class="badge badge-info">Statewide Plan</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Deepavali (Nov)</span>
            </div>
            <div class="ai-action">AI Prediction: Highest state-wide travel volume</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Action: 100% Fleet Utilization Required</span><br>
                <span>Impact: All depots must suspend maintenance</span>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function startRealTimeSimulation() {
    setInterval(() => {
        let totalStatewideCrowd = 0;
        let criticalCount = 0;
        
        Object.keys(allHubs).forEach(key => {
            let hub = allHubs[key];
            let fluctuation = Math.floor(Math.random() * 80) - 35;
            hub.crowd = Math.max(0, hub.crowd + fluctuation);
            totalStatewideCrowd += hub.crowd;
            
            let ratio = hub.crowd / hub.max;
            if (ratio > 0.85) criticalCount++;
            
            let percent = Math.round(ratio * 100);
            let popupEl = document.getElementById(`popup-\${hub.id}`);
            if (popupEl) {
                popupEl.innerHTML = `\${hub.crowd.toLocaleString()} (\${percent}%)`;
            }
        });

        if (selectedHubId) {
            let hub = allHubs[selectedHubId];
            document.getElementById('total-passengers').innerText = hub.crowd.toLocaleString();
            let isCritical = (hub.crowd/hub.max) > 0.85;
            document.getElementById('critical-stops-count').innerText = isCritical ? "CRITICAL" : "NORMAL";
            document.getElementById('kpi-subtitle-critical').innerText = `Capacity: \${Math.round((hub.crowd/hub.max)*100)}%`;
        } else {
            document.getElementById('total-passengers').innerText = totalStatewideCrowd.toLocaleString();
            document.getElementById('critical-stops-count').innerText = criticalCount;
        }
        
    }, 3000);
}
"""

with open('app/static/js/dashboard.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("dashboard.js updated successfully with all 38 districts.")
