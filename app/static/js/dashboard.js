document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

let map;
let markerLayer;
let stopsData = null;
let eventsData = null;
let currentMarkers = {};
let selectedStopId = null;
let currentDistrict = 'all';

// Fleet Tracking State
let fleetState = {
    statewide: {
        total: 1500,
        mainHubs: 314,
        localStops: 152,
        onRoute: 938,
        inDepot: 48
    },
    district: null
};

// Live Event Stream State
let liveEventLogs = [];

const districtRTO = {
    'Ariyalur': '61', 'Chengalpattu': '19', 'Chennai': '01', 'Coimbatore': '38',
    'Cuddalore': '31', 'Dharmapuri': '29', 'Dindigul': '57', 'Erode': '33',
    'Kallakurichi': '15', 'Kanchipuram': '21', 'Kanyakumari': '74', 'Karur': '47',
    'Krishnagiri': '24', 'Madurai': '58', 'Mayiladuthurai': '82', 'Nagapattinam': '51',
    'Namakkal': '28', 'Nilgiris': '43', 'Perambalur': '46', 'Pudukkottai': '55',
    'Ramanathapuram': '65', 'Ranipet': '73', 'Salem': '30', 'Sivaganga': '63',
    'Tenkasi': '79', 'Thanjavur': '49', 'Theni': '60', 'Thoothukudi': '69',
    'Tiruchirappalli': '45', 'Tirunelveli': '72', 'Tirupathur': '83', 'Tiruppur': '39',
    'Tiruvallur': '20', 'Tiruvannamalai': '25', 'Tiruvarur': '50', 'Vellore': '23',
    'Viluppuram': '32', 'Virudhunagar': '67'
};

async function initDashboard() {
    initMap();
    initChart();
    await loadData();
    populateDistrictSelector();
    renderMarkers();
    loadAIRecommendations();
    initLiveEventLog();
    updateFleetStatus();
    updateSystemStatus();
    startRealTimeSimulation();
}

function initMap() {
    map = L.map('dashboard-map', {
        zoomControl: true,
        attributionControl: false
    }).setView([10.8505, 78.6569], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    markerLayer = L.layerGroup().addTo(map);

    map.on('click', (e) => {
        if (!e.originalEvent.target.closest('.leaflet-marker-icon')) {
            selectedStopId = null;
            if (currentDistrict === 'all') {
                updateKPIsForStatewide();
            } else if (stopsData && stopsData.by_district[currentDistrict]) {
                updateKPIsForDistrict(currentDistrict);
            }
        }
    });
}

function createIcon(color, size = 24, label = '🚍') {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="font-size: ${size / 2.3}px; color: white;">${label}</span></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });
}

async function loadData() {
    try {
        const [stopsRes, eventsRes] = await Promise.all([
            fetch('/static/data/bus_stops.json'),
            fetch('/static/data/events.json')
        ]);
        stopsData = await stopsRes.json();
        eventsData = await eventsRes.json();
        
        // Add dynamic simulation properties to each stop
        stopsData.stops.forEach(s => {
            const ratio = s.type === 'main_terminus' ? 0.72 : (s.type === 'town_stand' ? 0.58 : 0.42);
            s.crowd = Math.round(s.capacity * ratio);
            s.max = s.capacity;
            s.totalBuses = s.type === 'main_terminus' ? 85 : (s.type === 'town_stand' ? 40 : 15);
            s.buses = Math.round(s.totalBuses * (0.8 + Math.random() * 0.15));
        });
    } catch (err) {
        console.error('Error loading static data:', err);
    }
}

function populateDistrictSelector() {
    const selector = document.getElementById('district-selector');
    if (!selector || !stopsData) return;

    selector.innerHTML = '<option value="all">🗺️ All 38 Districts (Statewide)</option>';
    stopsData.districts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        const count = stopsData.by_district[d] ? stopsData.by_district[d].total_stops : 0;
        opt.textContent = `${d} (${count} stops)`;
        selector.appendChild(opt);
    });

    selector.addEventListener('change', (e) => {
        currentDistrict = e.target.value;
        renderMarkers();
        updateFleetStatus();
        updateSystemStatus();
    });
}

function renderMarkers() {
    if (!stopsData || !markerLayer) return;

    markerLayer.clearLayers();
    currentMarkers = {};

    let stopsToRender = [];
    const counterBadge = document.getElementById('map-stop-counter');

    if (currentDistrict === 'all') {
        stopsToRender = stopsData.stops.filter(s => s.type === 'main_terminus' || s.type === 'town_stand');
        if (counterBadge) counterBadge.textContent = `${stopsToRender.length} Main Hubs (Statewide)`;
        map.setView([10.8505, 78.6569], 7);
        updateKPIsForStatewide();
    } else {
        stopsToRender = stopsData.stops.filter(s => s.district === currentDistrict);
        if (counterBadge) counterBadge.textContent = `${stopsToRender.length} Stops in ${currentDistrict}`;
        
        if (stopsToRender.length > 0) {
            const bounds = L.latLngBounds(stopsToRender.map(s => [s.lat, s.lng]));
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
        }
        updateKPIsForDistrict(currentDistrict);
    }

    stopsToRender.forEach(s => {
        const ratio = s.crowd / s.max;
        let color = '#10b981';
        let label = '📍';
        let size = 18;

        if (s.type === 'main_terminus') {
            size = 28;
            label = '🏢';
            color = ratio > 0.85 ? '#ef4444' : (ratio > 0.65 ? '#f59e0b' : '#3b82f6');
        } else if (s.type === 'town_stand') {
            size = 22;
            label = '🚏';
            color = ratio > 0.85 ? '#ef4444' : (ratio > 0.65 ? '#f59e0b' : '#10b981');
        } else {
            color = ratio > 0.85 ? '#ef4444' : (ratio > 0.65 ? '#f59e0b' : '#64748b');
        }

        const icon = createIcon(color, size, label);
        const marker = L.marker([s.lat, s.lng], { icon: icon }).addTo(markerLayer);
        currentMarkers[s.id] = { marker, data: s };

        const typeBadge = s.type === 'main_terminus' 
            ? '<span class="badge badge-danger">Main Terminus</span>' 
            : (s.type === 'town_stand' ? '<span class="badge badge-warning" style="color:white;">Town Stand</span>' : '<span class="badge badge-info">Local Stop</span>');

        const popupContent = `
            <div style="min-width: 200px; font-family: 'Inter', sans-serif;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
                    <span style="font-size:0.75rem; color:#64748b; font-weight:600;">${s.id}</span>
                    ${typeBadge}
                </div>
                <strong style="font-size: 1.05rem; display: block; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">${s.name}</strong>
                <div style="font-size:0.85rem; color:#475569; margin-bottom:4px;"><strong>Town:</strong> ${s.town} (${s.district})</div>
                <div style="margin-bottom: 6px;">
                    <span style="color: #64748b; font-size: 0.85rem;">Live Crowd:</span><br>
                    <strong style="font-size: 1rem; color: ${color};" id="popup-${s.id}">${s.crowd.toLocaleString()} / ${s.max.toLocaleString()} (${Math.round(ratio * 100)}%)</strong>
                </div>
                <div style="margin-bottom: 8px;">
                    <span style="color: #64748b; font-size: 0.85rem;">Active Fleet:</span>
                    <strong style="font-size: 0.95rem; margin-left: 4px;">${s.buses} buses</strong>
                </div>
                <div style="margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
                    <a href="/optimization" class="badge badge-info" style="text-decoration: none; display: block; text-align: center; padding: 5px;">⚡ AI Fleet Allocation</a>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent, { className: 'custom-popup' });

        marker.on('click', () => {
            selectedStopId = s.id;
            updateKPIsForStop(s);
        });
    });
}

function updateKPIsForStop(stop) {
    const ratio = stop.crowd / stop.max;
    document.getElementById('kpi-title-passengers').innerText = `Live Crowd (${stop.name})`;
    document.getElementById('total-passengers').innerText = stop.crowd.toLocaleString();
    document.getElementById('kpi-subtitle-passengers').innerText = `Location: ${stop.town}, ${stop.district} (${stop.tier} Tier)`;

    document.getElementById('kpi-title-buses').innerText = `Active Fleet (${stop.name})`;
    document.getElementById('total-buses').innerText = stop.buses.toLocaleString();
    document.getElementById('kpi-subtitle-buses').innerText = `Capacity: ${stop.max.toLocaleString()} pax`;
    document.getElementById('kpi-progress-buses').style.width = `${Math.min(100, Math.round(ratio * 100))}%`;

    const isCritical = ratio > 0.85;
    document.getElementById('kpi-title-critical').innerText = `Status Level`;
    document.getElementById('critical-stops-count').innerText = isCritical ? "CRITICAL" : (ratio > 0.65 ? "BUSY" : "NORMAL");
    document.getElementById('kpi-subtitle-critical').innerText = `Load: ${Math.round(ratio * 100)}% of capacity`;

    document.getElementById('kpi-title-surge').innerText = `Stop Type & ID`;
    document.getElementById('surge-time').innerText = `${stop.id}`;
    document.getElementById('kpi-subtitle-surge').innerText = stop.type.replace('_', ' ').toUpperCase();
}

function updateKPIsForDistrict(district) {
    if (!stopsData) return;
    const districtStops = stopsData.stops.filter(s => s.district === district);
    const totalCrowd = districtStops.reduce((sum, s) => sum + s.crowd, 0);
    const totalCap = districtStops.reduce((sum, s) => sum + s.max, 0);
    const totalBuses = districtStops.reduce((sum, s) => sum + s.buses, 0);
    const critical = districtStops.filter(s => (s.crowd / s.max) > 0.85).length;
    const ratio = totalCap > 0 ? (totalCrowd / totalCap) : 0;

    document.getElementById('kpi-title-passengers').innerText = `Total Passengers (${district})`;
    document.getElementById('total-passengers').innerText = totalCrowd.toLocaleString();
    document.getElementById('kpi-subtitle-passengers').innerText = `Across ${districtStops.length} stops in ${district}`;

    document.getElementById('kpi-title-buses').innerText = `Active Buses (${district})`;
    document.getElementById('total-buses').innerText = totalBuses.toLocaleString();
    document.getElementById('kpi-subtitle-buses').innerText = `Total Capacity: ${totalCap.toLocaleString()}`;
    document.getElementById('kpi-progress-buses').style.width = `${Math.min(100, Math.round(ratio * 100))}%`;

    document.getElementById('kpi-title-critical').innerText = `Critical Stops (${district})`;
    document.getElementById('critical-stops-count').innerText = critical;
    document.getElementById('kpi-subtitle-critical').innerText = `(> 85% capacity)`;

    document.getElementById('kpi-title-surge').innerText = `District Terminus`;
    const terminus = districtStops.find(s => s.type === 'main_terminus');
    document.getElementById('surge-time').innerText = terminus ? terminus.town : district;
    document.getElementById('kpi-subtitle-surge').innerText = `${districtStops.length} total transport stops`;
}

function updateKPIsForStatewide() {
    if (!stopsData) return;
    const totalCrowd = stopsData.stops.reduce((sum, s) => sum + s.crowd, 0);
    const critical = stopsData.stops.filter(s => (s.crowd / s.max) > 0.85).length;

    document.getElementById('kpi-title-passengers').innerText = `Total Passengers (Statewide)`;
    document.getElementById('total-passengers').innerText = totalCrowd.toLocaleString();
    document.getElementById('kpi-subtitle-passengers').innerText = `👥 Across 38 Districts (852 Stops)`;

    document.getElementById('kpi-title-buses').innerText = `Active Buses (Statewide)`;
    document.getElementById('total-buses').innerText = "1,452";
    document.getElementById('kpi-subtitle-buses').innerText = `of 1,500 registered fleet`;
    document.getElementById('kpi-progress-buses').style.width = `96.8%`;

    document.getElementById('kpi-title-critical').innerText = `Critical Stops`;
    document.getElementById('critical-stops-count').innerText = critical;
    document.getElementById('kpi-subtitle-critical').innerText = `(> 85% capacity)`;

    document.getElementById('kpi-title-surge').innerText = `Next Major Festival`;
    document.getElementById('surge-time').innerText = "Deepavali (Nov 8, 2026)";
    document.getElementById('kpi-subtitle-surge').innerText = "Statewide MAXIMUM Alert";
}

/* ========================================================
   FLEET STATUS DYNAMIC UPDATE
   ======================================================== */
function updateFleetStatus() {
    const titleEl = document.getElementById('fleet-panel-title');
    const mainEl = document.getElementById('fleet-main-hubs');
    const localEl = document.getElementById('fleet-local-stops');
    const routeEl = document.getElementById('fleet-route');
    const depotEl = document.getElementById('fleet-depot');
    const labelMain = document.getElementById('fleet-label-main');
    const labelLocal = document.getElementById('fleet-label-local');

    if (!mainEl || !localEl || !routeEl || !depotEl) return;

    if (currentDistrict === 'all') {
        if (titleEl) titleEl.innerText = '🚍 Statewide Fleet Status';
        if (labelMain) labelMain.innerText = 'At Main Hubs';
        if (labelLocal) labelLocal.innerText = 'At Local Stops';

        // Fluctuating statewide active distribution
        mainEl.innerText = fleetState.statewide.mainHubs.toLocaleString();
        localEl.innerText = fleetState.statewide.localStops.toLocaleString();
        routeEl.innerText = fleetState.statewide.onRoute.toLocaleString();
        depotEl.innerText = fleetState.statewide.inDepot.toLocaleString();
    } else {
        if (!stopsData) return;
        const districtStops = stopsData.stops.filter(s => s.district === currentDistrict);
        const terminus = districtStops.find(s => s.type === 'main_terminus');
        const terminusName = terminus ? terminus.town : currentDistrict;

        if (titleEl) titleEl.innerText = `🚍 ${currentDistrict} Fleet Status`;
        if (labelMain) labelMain.innerText = `At ${terminusName}`;
        if (labelLocal) labelLocal.innerText = 'At Town/Local Stops';

        // Compute district fleet based on stop count
        const stopCount = districtStops.length;
        const totalDistrictFleet = Math.round(stopCount * 4.2) + 20;
        const mainCount = Math.round(totalDistrictFleet * 0.38);
        const localCount = Math.round(totalDistrictFleet * 0.22);
        const routeCount = Math.round(totalDistrictFleet * 0.35);
        const depotCount = Math.max(2, totalDistrictFleet - mainCount - localCount - routeCount);

        mainEl.innerText = mainCount.toLocaleString();
        localEl.innerText = localCount.toLocaleString();
        routeEl.innerText = routeCount.toLocaleString();
        depotEl.innerText = depotCount.toLocaleString();
    }
}

/* ========================================================
   SYSTEM STATUS DYNAMIC UPDATE
   ======================================================== */
function updateSystemStatus() {
    const titleEl = document.getElementById('system-status-title');
    const textEl = document.getElementById('system-status-text');
    const subtextEl = document.getElementById('system-status-subtext');

    if (!titleEl || !textEl || !subtextEl) return;

    if (currentDistrict === 'all') {
        titleEl.innerText = '💡 System Status';
        textEl.innerText = '✓ Statewide AI Active';
        subtextEl.innerText = 'Real-time tracking for all 38 districts of Tamil Nadu (852 stops active).';
    } else {
        const stopCount = stopsData ? stopsData.stops.filter(s => s.district === currentDistrict).length : 22;
        titleEl.innerText = `💡 ${currentDistrict} Live Status`;
        textEl.innerText = `✓ ${currentDistrict} AI Active`;
        subtextEl.innerText = `Connected to ${stopCount} bus stops and depot corridors across ${currentDistrict}.`;
    }
}

/* ========================================================
   LIVE EVENT LOG STREAMING
   ======================================================== */
function initLiveEventLog() {
    // Initial events based on authentic Tamil Nadu transport data
    liveEventLogs = [
        {
            icon: 'green',
            symbol: '🚍',
            secondsAgo: 5,
            title: 'TN-45-N-3821',
            text: 'arrived at Chatram Bus Stand (Tiruchirappalli)'
        },
        {
            icon: 'red',
            symbol: '⚠️',
            secondsAgo: 85,
            title: 'Crowd Alert',
            text: 'Chennai CMBT Koyambedu crossed 92% capacity'
        },
        {
            icon: 'blue',
            symbol: '🚐',
            secondsAgo: 210,
            title: 'Fleet Dispatch',
            text: '12 Extra buses deployed to Gandhipuram (Coimbatore)'
        },
        {
            icon: 'purple',
            symbol: '🌧️',
            secondsAgo: 450,
            title: 'Weather Alert',
            text: 'Rain forecast for Madurai corridor – speeds moderated'
        }
    ];

    renderEventLog();
}

function renderEventLog() {
    const container = document.getElementById('activity-log');
    if (!container) return;

    let html = '';
    liveEventLogs.slice(0, 6).forEach(ev => {
        let timeStr = 'Just now';
        if (ev.secondsAgo >= 60) {
            timeStr = `${Math.floor(ev.secondsAgo / 60)}m ago`;
        }

        html += `
            <li style="animation: fadeIn 0.4s ease;">
                <div class="activity-icon ${ev.icon}">${ev.symbol}</div>
                <div class="auto-style-39760">
                    <span class="activity-time">${timeStr}</span>
                    <span><strong>${ev.title}</strong> ${ev.text}</span>
                </div>
            </li>
        `;
    });

    container.innerHTML = html;
}

function pushLiveEvent(newEvent) {
    liveEventLogs.unshift(newEvent);
    if (liveEventLogs.length > 8) liveEventLogs.pop();
    renderEventLog();

    const badge = document.getElementById('event-log-badge');
    if (badge) {
        badge.style.background = '#10b981';
        badge.innerText = '● UPDATE RECEIVED';
        setTimeout(() => {
            badge.innerText = '● LIVE UPDATES';
        }, 1500);
    }
}

function generateDynamicEvent() {
    if (!stopsData || !stopsData.stops.length) return;

    // Filter candidate stops
    let pool = stopsData.stops;
    if (currentDistrict !== 'all') {
        const districtPool = stopsData.stops.filter(s => s.district === currentDistrict);
        if (districtPool.length > 0) pool = districtPool;
    }

    const randomStop = pool[Math.floor(Math.random() * pool.length)];
    const rto = districtRTO[randomStop.district] || '38';
    const regNum = `TN-${rto}-N-${Math.floor(Math.random() * 8999 + 1000)}`;
    const ratio = randomStop.crowd / randomStop.max;

    const eventTypes = ['arrival', 'departure', 'dispatch', 'crowd', 'transit'];
    const chosenType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    let eventObj = null;

    if (chosenType === 'crowd' && ratio > 0.70) {
        eventObj = {
            icon: 'red',
            symbol: '⚠️',
            secondsAgo: 0,
            title: 'High Load Alert',
            text: `Crowd at ${randomStop.name} (${randomStop.town}) reached ${Math.round(ratio * 100)}%`
        };
    } else if (chosenType === 'dispatch') {
        const busCount = Math.floor(Math.random() * 6) + 3;
        eventObj = {
            icon: 'blue',
            symbol: '🚐',
            secondsAgo: 0,
            title: 'AI Re-allocation',
            text: `${busCount} Standby buses diverted to ${randomStop.name} (${randomStop.district})`
        };
    } else if (chosenType === 'departure') {
        eventObj = {
            icon: 'green',
            symbol: '🚍',
            secondsAgo: 0,
            title: regNum,
            text: `departed from ${randomStop.name} on scheduled route`
        };
    } else if (chosenType === 'transit') {
        eventObj = {
            icon: 'purple',
            symbol: '🛣️',
            secondsAgo: 0,
            title: regNum,
            text: `en route through ${randomStop.town} junction (Clear traffic)`
        };
    } else {
        eventObj = {
            icon: 'green',
            symbol: '🚍',
            secondsAgo: 0,
            title: regNum,
            text: `arrived at ${randomStop.name} (${randomStop.town})`
        };
    }

    pushLiveEvent(eventObj);
}

function initChart() {
    const chartEl = document.getElementById('demandChart');
    if (!chartEl) return;
    const ctx = chartEl.getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Pongal', 'Thaipusam', 'Tamil New Year', 'Chithirai Vizha', 'Aadi Perukku', 'Vinayagar Chathurthi', 'Deepavali'],
            datasets: [
                {
                    label: 'Predicted Crowd (Millions)',
                    data: [8.5, 4.2, 3.8, 5.4, 5.1, 6.2, 9.8],
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#3b82f6', '#8b5cf6', '#ef4444'],
                    borderRadius: 5
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
                y: { grid: { color: '#e2e8f0' }, ticks: { callback: v => v + 'M' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function loadAIRecommendations() {
    const container = document.getElementById('ai-recs-container');
    if (!container) return;

    let html = `
        <div class="ai-recommendation high-priority">
            <div class="ai-header">
                <span class="badge badge-danger">High Priority Event</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Pongal Festival (Jan 14-17, 2026)</span>
            </div>
            <div class="ai-action">AI Prediction: Massive outbound travel from Chennai (CMBT & Tambaram)</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Action: Allocate +500 Reserve Buses to Chennai & Trichy</span><br>
                <span>Impact: Prevents 90% of expected congestion</span>
            </div>
        </div>
        
        <div class="ai-recommendation medium-priority">
            <div class="ai-header">
                <span class="badge badge-warning" style="color: white;">Regional Alert</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Chithirai Festival (May 2026)</span>
            </div>
            <div class="ai-action">AI Prediction: Heavy influx of 1.2M devotees to Madurai District</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Action: Divert 180 buses from Dindigul & Sivaganga depots</span><br>
                <span>Impact: Maintains queue clearance under 12 mins</span>
            </div>
        </div>
        
        <div class="ai-recommendation plan-ahead">
            <div class="ai-header">
                <span class="badge badge-info">Statewide Plan</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Deepavali (Nov 08, 2026)</span>
            </div>
            <div class="ai-action">AI Prediction: Statewide peak travel across all 38 districts</div>
            <div class="ai-impact">
                <span style="color: var(--success);">Action: 100% Fleet Utilization & Standby Crews Active</span><br>
                <span>Impact: Zero stranded passengers across all 38 main terminuses</span>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function startRealTimeSimulation() {
    let tickCount = 0;

    setInterval(() => {
        tickCount++;
        if (!stopsData) return;

        // 1. Simulate crowd fluctuation across stops
        stopsData.stops.forEach(s => {
            const delta = Math.floor(Math.random() * 25) - 12;
            s.crowd = Math.max(10, Math.min(s.max, s.crowd + delta));

            const popupEl = document.getElementById(`popup-${s.id}`);
            if (popupEl) {
                const ratio = s.crowd / s.max;
                const percent = Math.round(ratio * 100);
                let color = ratio > 0.85 ? '#ef4444' : (ratio > 0.65 ? '#f59e0b' : '#10b981');
                popupEl.style.color = color;
                popupEl.innerHTML = `${s.crowd.toLocaleString()} / ${s.max.toLocaleString()} (${percent}%)`;
            }
        });

        // 2. Fluctuate statewide fleet distribution slightly
        if (currentDistrict === 'all') {
            const shift = Math.floor(Math.random() * 7) - 3;
            fleetState.statewide.mainHubs = Math.max(290, Math.min(340, fleetState.statewide.mainHubs + shift));
            fleetState.statewide.localStops = Math.max(140, Math.min(170, fleetState.statewide.localStops - Math.floor(shift / 2)));
            fleetState.statewide.onRoute = Math.max(910, Math.min(960, fleetState.statewide.onRoute - Math.ceil(shift / 2)));
            fleetState.statewide.inDepot = 1500 - (fleetState.statewide.mainHubs + fleetState.statewide.localStops + fleetState.statewide.onRoute);
        }

        // 3. Update active KPIs and Fleet Status
        if (selectedStopId) {
            const stop = stopsData.stops.find(s => s.id === selectedStopId);
            if (stop) updateKPIsForStop(stop);
        } else if (currentDistrict !== 'all') {
            updateKPIsForDistrict(currentDistrict);
        } else {
            updateKPIsForStatewide();
        }

        updateFleetStatus();

        // 4. Update age of live event logs
        liveEventLogs.forEach(ev => {
            ev.secondsAgo += 3;
        });

        // 5. Generate a new live event every ~4 seconds (alternate ticks)
        if (tickCount % 2 === 0) {
            generateDynamicEvent();
        } else {
            renderEventLog();
        }

    }, 3000);
}
