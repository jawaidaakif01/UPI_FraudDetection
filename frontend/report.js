document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('reportForm');
    const statusDiv = document.getElementById('reportStatus');
    const submitBtn = document.getElementById('submitBtn');

    if (reportForm) {
        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Capture Data
            const formData = {
                upi_id: document.getElementById('fraud_upi').value,
                type: document.getElementById('scam_type').value,
                desc: document.getElementById('description').value,
                timestamp: new Date().toISOString()
            };

            // 2. Visual Loading State
            submitBtn.disabled = true;
            submitBtn.innerText = "Processing Report...";
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = `<p style="color: var(--primary); text-align:center;">🔍 AI analyzing report data...</p>`;

            try {
                // 3. Simulation of API Call (Replace with your actual backend URL)
                // const response = await fetch('http://127.0.0.1:5000/report', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(formData)
                // });

                // Simulate network delay
                setTimeout(() => {
                    // 4. Success UI
                    statusDiv.innerHTML = `
                        <div style="border: 2px solid #10b981; padding: 20px; border-radius: 20px; background: #ecfdf5; text-align: center; animation: fadeInUp 0.5s ease;">
                            <h3 style="color: #047857; margin-top: 0;">✓ Report Logged</h3>
                            <p style="color: #064e3b;"><strong>${formData.upi_id}</strong> has been flagged. Our neural network is updating the global database.</p>
                        </div>
                    `;
                    
                    reportForm.reset();
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Submit Fraud Report";
                }, 2000);

            } catch (error) {
                // 5. Error UI
                statusDiv.innerHTML = `<p style="color: #e11d48; text-align:center;">❌ Error connecting to server. Try again.</p>`;
                submitBtn.disabled = false;
            }
        });
    }
});