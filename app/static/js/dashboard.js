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

    allHubs = {
  // 1. Ariyalur
  "ariyalur-central": { coords: [11.1401, 79.0786], name: "Ariyalur Bus Stand", district: "Ariyalur", crowd: 6800, max: 10000, buses: 35, totalBuses: 48, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "ariyalur-jayankondam": { coords: [11.2127, 79.3637], name: "Jayankondam Bus Stand", district: "Ariyalur", crowd: 4200, max: 8000, buses: 22, totalBuses: 35, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "ariyalur-andimadam": { coords: [11.4000, 79.3667], name: "Andimadam Bus Stand", district: "Ariyalur", crowd: 1800, max: 5000, buses: 14, totalBuses: 25, color: '#10b981', icon: greenIcon, isMain: false },

  // 2. Chengalpattu
  "chengalpattu-central": { coords: [12.6819, 79.9888], name: "Chengalpattu Bus Stand", district: "Chengalpattu", crowd: 10500, max: 14000, buses: 65, totalBuses: 85, color: '#ef4444', icon: redIcon, isMain: true },
  "chengalpattu-maraimalai": { coords: [12.7904, 80.0255], name: "Maraimalai Nagar Bus Stop", district: "Chengalpattu", crowd: 7200, max: 11000, buses: 42, totalBuses: 60, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "chengalpattu-mamallapuram": { coords: [12.6269, 80.1927], name: "Mamallapuram Bus Stand", district: "Chengalpattu", crowd: 5600, max: 9000, buses: 30, totalBuses: 45, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 3. Chennai
  "chennai-cmbt": { coords: [13.0694, 80.1948], name: "CMBT Koyambedu", district: "Chennai", crowd: 14500, max: 20000, buses: 90, totalBuses: 100, color: '#ef4444', icon: redIcon, isMain: true },
  "chennai-broadway": { coords: [13.0925, 80.2865], name: "Broadway Bus Terminus", district: "Chennai", crowd: 11800, max: 16000, buses: 75, totalBuses: 90, color: '#ef4444', icon: redIcon, isMain: false },
  "chennai-tambaram": { coords: [12.9249, 80.1000], name: "Tambaram Bus Terminus", district: "Chennai", crowd: 12500, max: 18000, buses: 82, totalBuses: 95, color: '#ef4444', icon: redIcon, isMain: false },

  // 4. Coimbatore
  "coimbatore-gandhipuram": { coords: [11.0178, 76.9674], name: "Gandhipuram Central Bus Stand", district: "Coimbatore", crowd: 14000, max: 19000, buses: 88, totalBuses: 100, color: '#ef4444', icon: redIcon, isMain: true },
  "coimbatore-ukadams": { coords: [10.9910, 76.9610], name: "Ukkadam Bus Stand", district: "Coimbatore", crowd: 10800, max: 15000, buses: 70, totalBuses: 85, color: '#ef4444', icon: redIcon, isMain: false },
  "coimbatore-singanalur": { coords: [11.0000, 77.0280], name: "Singanallur Bus Stand", district: "Coimbatore", crowd: 7600, max: 12000, buses: 48, totalBuses: 65, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 5. Cuddalore
  "cuddalore-central": { coords: [11.7480, 79.7714], name: "Cuddalore Bus Stand", district: "Cuddalore", crowd: 8500, max: 12000, buses: 52, totalBuses: 70, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "cuddalore-chidambaram": { coords: [11.3993, 79.6936], name: "Chidambaram Bus Stand", district: "Cuddalore", crowd: 7900, max: 11500, buses: 48, totalBuses: 65, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "cuddalore-neyveli": { coords: [11.6120, 79.4780], name: "Neyveli Bus Stand", district: "Cuddalore", crowd: 6500, max: 10000, buses: 38, totalBuses: 55, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 6. Dharmapuri
  "dharmapuri-central": { coords: [12.1277, 78.1579], name: "Dharmapuri Bus Stand", district: "Dharmapuri", crowd: 7000, max: 10500, buses: 42, totalBuses: 60, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "dharmapuri-harur": { coords: [12.0527, 78.4800], name: "Harur Bus Stand", district: "Dharmapuri", crowd: 3500, max: 7000, buses: 22, totalBuses: 35, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "dharmapuri-palacode": { coords: [12.3000, 78.0700], name: "Palacode Bus Stand", district: "Dharmapuri", crowd: 2400, max: 6000, buses: 18, totalBuses: 30, color: '#10b981', icon: greenIcon, isMain: false },

  // 7. Dindigul
  "dindigul-central": { coords: [10.3673, 77.9803], name: "Dindigul Bus Stand", district: "Dindigul", crowd: 9000, max: 13000, buses: 55, totalBuses: 72, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "dindigul-palani": { coords: [10.4500, 77.5200], name: "Palani Bus Stand", district: "Dindigul", crowd: 11800, max: 16000, buses: 72, totalBuses: 90, color: '#ef4444', icon: redIcon, isMain: false },
  "dindigul-kodaikanal": { coords: [10.2381, 77.4892], name: "Kodaikanal Bus Stand", district: "Dindigul", crowd: 6500, max: 10000, buses: 35, totalBuses: 50, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 8. Erode
  "erode-central": { coords: [11.3410, 77.7172], name: "Erode Central Bus Stand", district: "Erode", crowd: 11500, max: 16000, buses: 72, totalBuses: 90, color: '#ef4444', icon: redIcon, isMain: true },
  "erode-gobichettipalayam": { coords: [11.4549, 77.4422], name: "Gobichettipalayam Bus Stand", district: "Erode", crowd: 5100, max: 8500, buses: 30, totalBuses: 45, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "erode-bhavani": { coords: [11.4455, 77.6820], name: "Bhavani Bus Stand", district: "Erode", crowd: 4400, max: 7500, buses: 26, totalBuses: 40, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 9. Kallakurichi
  "kallakurichi-central": { coords: [11.7401, 78.9597], name: "Kallakurichi Bus Stand", district: "Kallakurichi", crowd: 6500, max: 10000, buses: 38, totalBuses: 55, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "kallakurichi-ulundurpet": { coords: [11.6976, 79.3270], name: "Ulundurpet Bus Stand", district: "Kallakurichi", crowd: 5300, max: 8500, buses: 32, totalBuses: 48, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "kallakurichi-sankarapuram": { coords: [11.8870, 78.9160], name: "Sankarapuram Bus Stand", district: "Kallakurichi", crowd: 2200, max: 5500, buses: 16, totalBuses: 28, color: '#10b981', icon: greenIcon, isMain: false },

  // 10. Kancheepuram
  "kancheepuram-central": { coords: [12.8342, 79.7036], name: "Kancheepuram Bus Stand", district: "Kancheepuram", crowd: 10500, max: 14500, buses: 65, totalBuses: 82, color: '#ef4444', icon: redIcon, isMain: true },
  "kancheepuram-walajabad": { coords: [12.7910, 79.8230], name: "Walajabad Bus Stand", district: "Kancheepuram", crowd: 2600, max: 6000, buses: 18, totalBuses: 30, color: '#10b981', icon: greenIcon, isMain: false },
  "kancheepuram-sriperumbudur": { coords: [12.9675, 79.9410], name: "Sriperumbudur Bus Stand", district: "Kancheepuram", crowd: 8200, max: 12000, buses: 50, totalBuses: 68, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 11. Karur
  "karur-central": { coords: [10.9601, 78.0766], name: "Karur Central Bus Stand", district: "Karur", crowd: 7200, max: 10500, buses: 45, totalBuses: 62, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "karur-kulithalai": { coords: [10.9340, 78.4140], name: "Kulithalai Bus Stand", district: "Karur", crowd: 2900, max: 6000, buses: 18, totalBuses: 30, color: '#10b981', icon: greenIcon, isMain: false },
  "karur-aravakurichi": { coords: [10.5700, 77.9650], name: "Aravakurichi Bus Stand", district: "Karur", crowd: 1900, max: 5000, buses: 14, totalBuses: 25, color: '#10b981', icon: greenIcon, isMain: false },

  // 12. Krishnagiri
  "krishnagiri-central": { coords: [12.5186, 78.2137], name: "Krishnagiri Bus Stand", district: "Krishnagiri", crowd: 7400, max: 11000, buses: 45, totalBuses: 62, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "krishnagiri-hosur": { coords: [12.7409, 77.8253], name: "Hosur Bus Stand", district: "Krishnagiri", crowd: 12800, max: 17500, buses: 80, totalBuses: 95, color: '#ef4444', icon: redIcon, isMain: false },
  "krishnagiri-denkanikottai": { coords: [12.5050, 77.7900], name: "Denkanikottai Bus Stand", district: "Krishnagiri", crowd: 2300, max: 5500, buses: 16, totalBuses: 28, color: '#10b981', icon: greenIcon, isMain: false },

  // 13. Madurai
  "madurai-mattuthavani": { coords: [9.9391, 78.1400], name: "Mattuthavani Integrated Bus Terminus", district: "Madurai", crowd: 14500, max: 20000, buses: 92, totalBuses: 100, color: '#ef4444', icon: redIcon, isMain: true },
  "madurai-periyar": { coords: [9.9173, 78.1147], name: "Periyar Bus Stand", district: "Madurai", crowd: 13500, max: 18000, buses: 85, totalBuses: 95, color: '#ef4444', icon: redIcon, isMain: false },
  "madurai-tirumangalam": { coords: [9.8240, 77.9860], name: "Tirumangalam Bus Stand", district: "Madurai", crowd: 4600, max: 8000, buses: 28, totalBuses: 42, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 14. Mayiladuthurai
  "mayiladuthurai-central": { coords: [11.1025, 79.6520], name: "Mayiladuthurai New Bus Stand", district: "Mayiladuthurai", crowd: 6800, max: 10000, buses: 42, totalBuses: 58, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "mayiladuthurai-sirkazhi": { coords: [11.2373, 79.7350], name: "Sirkazhi Bus Stand", district: "Mayiladuthurai", crowd: 4100, max: 7500, buses: 25, totalBuses: 38, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "mayiladuthurai-tarangambadi": { coords: [11.0270, 79.8540], name: "Tharangambadi Bus Stand", district: "Mayiladuthurai", crowd: 1700, max: 4500, buses: 12, totalBuses: 22, color: '#10b981', icon: greenIcon, isMain: false },

  // 15. Nagapattinam
  "nagapattinam-central": { coords: [10.7672, 79.8449], name: "Nagapattinam Bus Stand", district: "Nagapattinam", crowd: 6200, max: 9500, buses: 38, totalBuses: 55, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "nagapattinam-velankanni": { coords: [10.6833, 79.8500], name: "Velankanni Bus Stand", district: "Nagapattinam", crowd: 8500, max: 12500, buses: 50, totalBuses: 68, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "nagapattinam-vedaranyam": { coords: [10.3720, 79.8500], name: "Vedaranyam Bus Stand", district: "Nagapattinam", crowd: 2600, max: 6000, buses: 18, totalBuses: 30, color: '#10b981', icon: greenIcon, isMain: false },

  // 16. Kanyakumari
  "kanyakumari-vadasery": { coords: [8.1817, 77.4340], name: "Vadasery Christopher Bus Stand", district: "Kanyakumari", crowd: 11500, max: 16000, buses: 72, totalBuses: 90, color: '#ef4444', icon: redIcon, isMain: true },
  "kanyakumari-marthandam": { coords: [8.3090, 77.2200], name: "Marthandam Bus Stand", district: "Kanyakumari", crowd: 7200, max: 11000, buses: 45, totalBuses: 62, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "kanyakumari-town": { coords: [8.0883, 77.5385], name: "Kanyakumari Bus Stand", district: "Kanyakumari", crowd: 8500, max: 12500, buses: 48, totalBuses: 65, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 17. Namakkal
  "namakkal-central": { coords: [11.2194, 78.1678], name: "Namakkal Bus Stand", district: "Namakkal", crowd: 6900, max: 10000, buses: 42, totalBuses: 58, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "namakkal-tiruchengode": { coords: [11.3800, 77.8940], name: "Tiruchengode Bus Stand", district: "Namakkal", crowd: 5700, max: 9000, buses: 35, totalBuses: 50, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "namakkal-rasipuram": { coords: [11.4600, 78.1860], name: "Rasipuram Bus Stand", district: "Namakkal", crowd: 3500, max: 7000, buses: 22, totalBuses: 35, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 18. Perambalur
  "perambalur-central": { coords: [11.2342, 78.8800], name: "Perambalur Bus Stand", district: "Perambalur", crowd: 5200, max: 8500, buses: 32, totalBuses: 48, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "perambalur-kunnam": { coords: [11.2500, 79.1000], name: "Kunnam Bus Stop", district: "Perambalur", crowd: 1700, max: 4500, buses: 12, totalBuses: 22, color: '#10b981', icon: greenIcon, isMain: false },
  "perambalur-veeraganur": { coords: [11.4800, 78.7400], name: "Veppanthattai Area Bus Stop", district: "Perambalur", crowd: 1400, max: 4000, buses: 10, totalBuses: 20, color: '#10b981', icon: greenIcon, isMain: false },

  // 19. Pudukkottai
  "pudukkottai-central": { coords: [10.3833, 78.8001], name: "Pudukkottai Bus Stand", district: "Pudukkottai", crowd: 6800, max: 10000, buses: 42, totalBuses: 58, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "pudukkottai-aranthangi": { coords: [10.1735, 78.9910], name: "Aranthangi Bus Stand", district: "Pudukkottai", crowd: 3900, max: 7000, buses: 24, totalBuses: 38, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "pudukkottai-alangudi": { coords: [10.3600, 78.9900], name: "Alangudi Bus Stand", district: "Pudukkottai", crowd: 2600, max: 6000, buses: 18, totalBuses: 30, color: '#10b981', icon: greenIcon, isMain: false },

  // 20. Ramanathapuram
  "ramanathapuram-central": { coords: [9.3639, 78.8395], name: "Ramanathapuram Bus Stand", district: "Ramanathapuram", crowd: 6100, max: 9500, buses: 38, totalBuses: 55, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "ramanathapuram-rameswaram": { coords: [9.2881, 79.3129], name: "Rameswaram Bus Stand", district: "Ramanathapuram", crowd: 10800, max: 15000, buses: 65, totalBuses: 82, color: '#ef4444', icon: redIcon, isMain: false },
  "ramanathapuram-paramakudi": { coords: [9.5460, 78.5900], name: "Paramakudi Bus Stand", district: "Ramanathapuram", crowd: 4700, max: 8000, buses: 28, totalBuses: 42, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 21. Ranipet
  "ranipet-central": { coords: [12.9273, 79.3330], name: "Ranipet Bus Stand", district: "Ranipet", crowd: 6200, max: 9500, buses: 38, totalBuses: 55, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "ranipet-arcot": { coords: [12.9050, 79.3180], name: "Arcot Bus Stand", district: "Ranipet", crowd: 4300, max: 7500, buses: 26, totalBuses: 40, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "ranipet-arakkonam": { coords: [13.0840, 79.6700], name: "Arakkonam Bus Stand", district: "Ranipet", crowd: 7500, max: 11000, buses: 45, totalBuses: 62, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 22. Salem
  "salem-central": { coords: [11.6643, 78.1460], name: "Salem Central Bus Stand", district: "Salem", crowd: 14500, max: 19500, buses: 92, totalBuses: 100, color: '#ef4444', icon: redIcon, isMain: true },
  "salem-old": { coords: [11.6530, 78.1620], name: "Salem Old Bus Stand", district: "Salem", crowd: 11000, max: 15500, buses: 70, totalBuses: 85, color: '#ef4444', icon: redIcon, isMain: false },
  "salem-attur": { coords: [11.5950, 78.6000], name: "Attur Bus Stand", district: "Salem", crowd: 4900, max: 8500, buses: 30, totalBuses: 45, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 23. Sivaganga
  "sivaganga-central": { coords: [9.8433, 78.4809], name: "Sivaganga Bus Stand", district: "Sivaganga", crowd: 4800, max: 8000, buses: 30, totalBuses: 45, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "sivaganga-karaikudi": { coords: [10.0730, 78.7800], name: "Karaikudi Bus Stand", district: "Sivaganga", crowd: 8300, max: 12000, buses: 50, totalBuses: 68, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "sivaganga-devakottai": { coords: [9.9470, 78.8230], name: "Devakottai Bus Stand", district: "Sivaganga", crowd: 3300, max: 6500, buses: 20, totalBuses: 34, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 24. Tenkasi
  "tenkasi-central": { coords: [8.9590, 77.3150], name: "Tenkasi Bus Stand", district: "Tenkasi", crowd: 7200, max: 10500, buses: 45, totalBuses: 62, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "tenkasi-sankarankovil": { coords: [9.1700, 77.5440], name: "Sankarankovil Bus Stand", district: "Tenkasi", crowd: 4900, max: 8000, buses: 30, totalBuses: 45, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "tenkasi-courtallam": { coords: [8.9340, 77.2750], name: "Courtallam Bus Stop", district: "Tenkasi", crowd: 6500, max: 10000, buses: 35, totalBuses: 50, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 25. Thanjavur
  "thanjavur-central": { coords: [10.7870, 79.1378], name: "Thanjavur New Bus Stand", district: "Thanjavur", crowd: 10000, max: 14500, buses: 62, totalBuses: 80, color: '#ef4444', icon: redIcon, isMain: true },
  "thanjavur-old": { coords: [10.7860, 79.1310], name: "Thanjavur Old Bus Stand", district: "Thanjavur", crowd: 8500, max: 12500, buses: 52, totalBuses: 70, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "thanjavur-kumbakonam": { coords: [10.9602, 79.3845], name: "Kumbakonam New Bus Stand", district: "Thanjavur", crowd: 9800, max: 14000, buses: 60, totalBuses: 78, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 26. Theni
  "theni-central": { coords: [10.0104, 77.4768], name: "Theni Bus Stand", district: "Theni", crowd: 7200, max: 10500, buses: 45, totalBuses: 62, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "theni-cumbum": { coords: [9.7360, 77.2840], name: "Cumbum Bus Stand", district: "Theni", crowd: 4900, max: 8000, buses: 30, totalBuses: 45, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "theni-periyakulam": { coords: [10.1230, 77.5430], name: "Periyakulam Bus Stand", district: "Theni", crowd: 3900, max: 7000, buses: 24, totalBuses: 38, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 27. Tiruvallur
  "tiruvallur-central": { coords: [13.1430, 79.9080], name: "Tiruvallur Bus Stand", district: "Tiruvallur", crowd: 6800, max: 10000, buses: 42, totalBuses: 58, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "tiruvallur-ponneri": { coords: [13.3210, 80.1950], name: "Ponneri Bus Stand", district: "Tiruvallur", crowd: 4100, max: 7500, buses: 25, totalBuses: 38, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "tiruvallur-tiruttani": { coords: [13.1820, 79.6280], name: "Tiruttani Bus Stand", district: "Tiruvallur", crowd: 5400, max: 8500, buses: 32, totalBuses: 48, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 28. Tiruvarur
  "tiruvarur-central": { coords: [10.7720, 79.6360], name: "Tiruvarur Bus Stand", district: "Tiruvarur", crowd: 5900, max: 9000, buses: 36, totalBuses: 52, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "tiruvarur-mannargudi": { coords: [10.6660, 79.4500], name: "Mannargudi Bus Stand", district: "Tiruvarur", crowd: 4800, max: 8000, buses: 30, totalBuses: 45, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "tiruvarur-thiruthuraipoondi": { coords: [10.5330, 79.6480], name: "Thiruthuraipoondi Bus Stand", district: "Tiruvarur", crowd: 2700, max: 6000, buses: 18, totalBuses: 30, color: '#10b981', icon: greenIcon, isMain: false },

  // 29. Thoothukudi
  "thoothukudi-central": { coords: [8.7642, 78.1348], name: "Thoothukudi New Bus Stand", district: "Thoothukudi", crowd: 10000, max: 14500, buses: 62, totalBuses: 80, color: '#ef4444', icon: redIcon, isMain: true },
  "thoothukudi-kovilpatti": { coords: [9.1710, 77.8690], name: "Kovilpatti Bus Stand", district: "Thoothukudi", crowd: 7400, max: 11000, buses: 45, totalBuses: 62, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "thoothukudi-tiruchendur": { coords: [8.4970, 78.1190], name: "Tiruchendur Bus Stand", district: "Thoothukudi", crowd: 8500, max: 12500, buses: 50, totalBuses: 68, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 30. Tiruchirappalli
  "trichy-central": { coords: [10.8050, 78.6856], name: "Chatram Bus Stand", district: "Tiruchirappalli", crowd: 11500, max: 16000, buses: 72, totalBuses: 90, color: '#ef4444', icon: redIcon, isMain: true },
  "trichy-central-mofussil": { coords: [10.7682, 78.6950], name: "Central Bus Stand", district: "Tiruchirappalli", crowd: 14000, max: 19000, buses: 90, totalBuses: 100, color: '#ef4444', icon: redIcon, isMain: false },
  "trichy-srirangam": { coords: [10.8620, 78.6940], name: "Srirangam Bus Stand", district: "Tiruchirappalli", crowd: 6800, max: 10000, buses: 42, totalBuses: 58, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 31. Tirunelveli
  "tirunelveli-new": { coords: [8.7280, 77.7080], name: "Tirunelveli New Bus Stand", district: "Tirunelveli", crowd: 12500, max: 17500, buses: 80, totalBuses: 95, color: '#ef4444', icon: redIcon, isMain: true },
  "tirunelveli-junction": { coords: [8.7310, 77.7060], name: "Tirunelveli Junction Bus Stand", district: "Tirunelveli", crowd: 9800, max: 14000, buses: 60, totalBuses: 78, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "tirunelveli-valliyur": { coords: [8.3830, 77.6130], name: "Valliyur Bus Stand", district: "Tirunelveli", crowd: 4400, max: 7500, buses: 26, totalBuses: 40, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 32. Tirupathur
  "tirupathur-central": { coords: [12.4960, 78.5730], name: "Tirupathur Bus Stand", district: "Tirupathur", crowd: 6500, max: 10000, buses: 40, totalBuses: 58, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "tirupathur-vaniyambadi": { coords: [12.6810, 78.6200], name: "Vaniyambadi Bus Stand", district: "Tirupathur", crowd: 6200, max: 9500, buses: 38, totalBuses: 55, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "tirupathur-ambur": { coords: [12.7900, 78.7160], name: "Ambur Bus Stand", district: "Tirupathur", crowd: 7600, max: 11000, buses: 45, totalBuses: 62, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 33. Tiruppur
  "tiruppur-central": { coords: [11.1085, 77.3411], name: "Tiruppur Central Bus Stand", district: "Tiruppur", crowd: 12500, max: 17500, buses: 80, totalBuses: 95, color: '#ef4444', icon: redIcon, isMain: true },
  "tiruppur-old": { coords: [11.1030, 77.3450], name: "Tiruppur Old Bus Stand", district: "Tiruppur", crowd: 9800, max: 14000, buses: 62, totalBuses: 80, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "tiruppur-udumalpet": { coords: [10.5880, 77.2470], name: "Udumalpet Bus Stand", district: "Tiruppur", crowd: 4700, max: 8000, buses: 28, totalBuses: 42, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 34. Tiruvannamalai
  "tiruvannamalai-central": { coords: [12.2253, 79.0747], name: "Tiruvannamalai Bus Stand", district: "Tiruvannamalai", crowd: 12000, max: 17000, buses: 75, totalBuses: 92, color: '#ef4444', icon: redIcon, isMain: true },
  "tiruvannamalai-arani": { coords: [12.6670, 79.2850], name: "Arani Bus Stand", district: "Tiruvannamalai", crowd: 5700, max: 9000, buses: 35, totalBuses: 50, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "tiruvannamalai-polur": { coords: [12.5130, 79.1260], name: "Polur Bus Stand", district: "Tiruvannamalai", crowd: 3200, max: 6500, buses: 20, totalBuses: 34, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 35. The Nilgiris
  "nilgiris-ooty": { coords: [11.4064, 76.6932], name: "Ooty Central Bus Stand", district: "The Nilgiris", crowd: 10500, max: 15000, buses: 62, totalBuses: 80, color: '#ef4444', icon: redIcon, isMain: true },
  "nilgiris-coonoor": { coords: [11.3540, 76.7950], name: "Coonoor Bus Stand", district: "The Nilgiris", crowd: 5700, max: 9000, buses: 35, totalBuses: 50, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "nilgiris-gudalur": { coords: [11.5010, 76.4910], name: "Gudalur Bus Stand", district: "The Nilgiris", crowd: 3900, max: 7000, buses: 24, totalBuses: 38, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 36. Vellore
  "vellore-central": { coords: [12.9165, 79.1325], name: "Vellore Bus Stand", district: "Vellore", crowd: 11000, max: 15500, buses: 68, totalBuses: 85, color: '#ef4444', icon: redIcon, isMain: true },
  "vellore-katpadi": { coords: [12.9690, 79.1370], name: "Katpadi Bus Stop", district: "Vellore", crowd: 6200, max: 9500, buses: 38, totalBuses: 55, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "vellore-gudiyatham": { coords: [12.9460, 78.8700], name: "Gudiyatham Bus Stand", district: "Vellore", crowd: 4300, max: 7500, buses: 26, totalBuses: 40, color: '#f59e0b', icon: orangeIcon, isMain: false },

  // 37. Viluppuram
  "viluppuram-central": { coords: [11.9401, 79.4861], name: "Viluppuram New Bus Stand", district: "Viluppuram", crowd: 10500, max: 15000, buses: 65, totalBuses: 82, color: '#ef4444', icon: redIcon, isMain: true },
  "viluppuram-tindivanam": { coords: [12.2340, 79.6550], name: "Tindivanam Bus Stand", district: "Viluppuram", crowd: 6900, max: 10000, buses: 42, totalBuses: 58, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "viluppuram-gingee": { coords: [12.2520, 79.4170], name: "Gingee Bus Stand", district: "Viluppuram", crowd: 2800, max: 6000, buses: 18, totalBuses: 30, color: '#10b981', icon: greenIcon, isMain: false },

  // 38. Virudhunagar
  "virudhunagar-central": { coords: [9.5851, 77.9570], name: "Virudhunagar Bus Stand", district: "Virudhunagar", crowd: 5800, max: 9000, buses: 36, totalBuses: 52, color: '#f59e0b', icon: orangeIcon, isMain: true },
  "virudhunagar-sivakasi": { coords: [9.4530, 77.7970], name: "Sivakasi Bus Stand", district: "Virudhunagar", crowd: 7500, max: 11000, buses: 45, totalBuses: 62, color: '#f59e0b', icon: orangeIcon, isMain: false },
  "virudhunagar-rajapalayam": { coords: [9.4520, 77.5540], name: "Rajapalayam Bus Stand", district: "Virudhunagar", crowd: 6800, max: 10000, buses: 42, totalBuses: 58, color: '#f59e0b', icon: orangeIcon, isMain: false }
};

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
