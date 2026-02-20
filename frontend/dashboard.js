let riskChart;
let hourChart;

async function fetchStats() {

    const totalElement = document.getElementById("totalTx");
    if (!totalElement) return;

    const response = await fetch("http://127.0.0.1:8000/stats");
    const data = await response.json();

    totalElement.innerText =
        "Total Transactions: " + data.total_transactions;

    updateCharts(data);
}

function updateCharts(data) {

    const riskData = data.risk_distribution;
    const hourData = data.hour_distribution;

    if (riskChart) riskChart.destroy();
    if (hourChart) hourChart.destroy();

    const ctx1 = document.getElementById('riskChart');
    riskChart = new Chart(ctx1, {
        type: 'pie',
        data: {
            labels: ['Low', 'Medium', 'High'],
            datasets: [{
                data: [riskData.low, riskData.medium, riskData.high],
                backgroundColor: ['green', 'orange', 'red']
            }]
        }
    });

    const ctx2 = document.getElementById('hourChart');
    hourChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['Night', 'Morning', 'Afternoon', 'Evening'],
            datasets: [{
                label: 'Transactions',
                data: [
                    hourData.night,
                    hourData.morning,
                    hourData.afternoon,
                    hourData.evening
                ],
                backgroundColor: 'blue'
            }]
        }
    });
}

setInterval(fetchStats, 5000);
fetchStats();
