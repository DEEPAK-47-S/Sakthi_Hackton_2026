document.addEventListener('DOMContentLoaded', () => {
    const runBtn = document.getElementById('run-optimization-btn');
    if (runBtn) {
        runBtn.addEventListener('click', runOptimization);
    }
});

async function runOptimization() {
    const btn = document.getElementById('run-optimization-btn');
    btn.disabled = true;
    btn.textContent = "Running Optimization...";
    
    try {
        const response = await apiFetch('/api/v1/optimization/run', {
            method: 'POST',
            body: JSON.stringify({})
        });
        
        displayResults(response);
    } catch (error) {
        alert("Optimization failed: " + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "Run Fleet Optimization";
    }
}

function displayResults(data) {
    document.getElementById('optimization-results').style.display = 'block';
    const tbody = document.querySelector('#transfers-table tbody');
    tbody.innerHTML = '';
    
    if (data.transfers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No transfers recommended (Optimal allocation achieved).</td></tr>';
        return;
    }
    
    data.transfers.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.source}</td>
            <td>${t.destination}</td>
            <td>Bus #${t.vehicle_id}</td>
            <td style="color: red;">-${t.source_capacity_reduction} capacity</td>
            <td style="color: green;">+${t.destination_capacity_improvement} capacity</td>
            <td><strong>Demand met earlier</strong></td>
            <td><button class="btn btn-primary btn-sm" onclick="approveTransfer(${t.vehicle_id})">Approve</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function approveTransfer(vehicleId) {
    alert(`Transfer for Bus #${vehicleId} approved!`);
    // In real implementation, calls an API to persist approval.
}
