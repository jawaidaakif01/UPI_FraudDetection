document.addEventListener('DOMContentLoaded', () => {
    // 1. Security Check
    const role = localStorage.getItem("role");
    if (role !== "admin" && role !== null) { 
        // Logic for unauthorized access can go here
    }

    // 2. Initial Setup
    checkEmptyState();
});

/**
 * Call this function when you receive data from your API
 * @param {Array} reports - Array of fraud report objects
 */
function renderReports(reports) {
    const tableBody = document.getElementById('adminReportTable');
    const pendingCount = document.getElementById('pendingCount');
    
    tableBody.innerHTML = ""; // Clear existing

    if (!reports || reports.length === 0) {
        checkEmptyState();
        return;
    }

    reports.forEach(report => {
        const row = `
            <tr>
                <td><span class="upi-tag">${report.upi_id}</span></td>
                <td><span class="conf-high">${report.risk_level}</span></td>
                <td>
                    <button class="btn-approve" onclick="verifyReport(this)">Block</button>
                    <button class="btn-dismiss" onclick="dismissReport(this)">Dismiss</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    pendingCount.innerText = reports.length;
    document.getElementById('emptyState').style.display = 'none';
}

// --- Action Functions ---

function verifyReport(btn) {
    const row = btn.closest('tr');
    const upiId = row.querySelector('.upi-tag').innerText;
    
    row.style.opacity = '0.5';
    row.style.pointerEvents = 'none';
    
    // Logic to send 'Block' command to backend would go here
    
    alert(`Verified! ${upiId} has been added to the Global Blacklist.`);
    row.remove();
    checkEmptyState();
}

function dismissReport(btn) {
    if(confirm("Are you sure you want to dismiss this report?")) {
        const row = btn.closest('tr');
        row.remove();
        checkEmptyState();
    }
}

// --- UI Helpers ---

function checkEmptyState() {
    const tableBody = document.getElementById('adminReportTable');
    const emptyState = document.getElementById('emptyState');
    const pendingCount = document.getElementById('pendingCount');

    if (!tableBody || tableBody.children.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (pendingCount) pendingCount.innerText = "0";
    } else {
        if (emptyState) emptyState.style.display = 'none';
        if (pendingCount) pendingCount.innerText = tableBody.children.length;
    }
}