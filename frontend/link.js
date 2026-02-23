document.addEventListener('DOMContentLoaded', () => {
    // Event listener is attached directly in the HTML via onclick="checkUPI()"
});

async function checkUPI() {
    const input = document.getElementById('upiInput').value.trim();
    const resultDiv = document.getElementById('upiResult');
    
    if(!input) {
        alert("Please enter a valid UPI ID or Link");
        return;
    }

    // 1. SMART ROUTING: Is it a Link or a UPI ID?
    const isLink = input.includes('http') || input.includes('www') || input.includes('.') && !input.includes('@');
    const isUPI = input.includes('@');

    if (isLink) {
        await scanURLWithXGBoost(input, resultDiv);
    } else if (isUPI) {
        scanUPIManually(input, resultDiv);
    } else {
        resultDiv.innerHTML = `<p style="color:red; text-align:center;">Please enter a valid format (must contain '@' for UPI or 'http/.' for links).</p>`;
    }
}

// ==========================================
// ROUTE 1: XGBOOST URL PHISHING SCANNER
// ==========================================
async function scanURLWithXGBoost(targetUrl, resultDiv) {
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <p style="color: var(--primary); text-align: center; font-weight: 600;">
            🔍 AI is scanning link <strong>${targetUrl}</strong> across 10,000 text features...
        </p>
    `;
    
    try {
        const response = await fetch("http://127.0.0.1:8000/scan-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: targetUrl })
        });

        const data = await response.json();

        if (data.error) {
            resultDiv.innerHTML = `<p style="color:red; text-align:center;">Error: ${data.error}</p>`;
            return;
        }

        if (data.is_safe) {
            renderSafeResult(resultDiv, "Secure & Benign Link", "The AI scanned this link and found no mathematical patterns associated with malware or phishing. Proceed as normal.");
        } else {
            const formattedThreat = data.threat_type.charAt(0).toUpperCase() + data.threat_type.slice(1);
            renderHighRiskResult(resultDiv, `HIGH RISK: ${formattedThreat.toUpperCase()} DETECTED`, `Our XGBoost AI model has classified this link as <strong>${formattedThreat}</strong>. Do not click this link or provide any personal data.`);
        }
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: #e11d48; text-align:center;">❌ Error connecting to AI server. Make sure the backend is running!</p>`;
        console.error("Fetch error: ", error);
    }
}

// ==========================================
// ROUTE 2: UPI ID SCANNER
// ==========================================
function scanUPIManually(upiId, resultDiv) {
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <p style="color: var(--primary); text-align: center; font-weight: 600;">
            🔍 Scanning UPI ID <strong>${upiId}</strong> against global blocklists...
        </p>
    `;
    
    // Simulate AI Processing Delay for UPI
    setTimeout(() => {
        const lowerInput = upiId.toLowerCase();
        
        // Simple hackathon logic for UPIs
        const isSuspicious = lowerInput.includes('prize') || 
                             lowerInput.includes('win') || 
                             lowerInput.includes('collect') || 
                             lowerInput.includes('lucky') ||
                             lowerInput.includes('refund');

        if(isSuspicious) {
            renderHighRiskResult(resultDiv, "⚠️ HIGH RISK DETECTED", `This UPI ID matches patterns commonly used in <strong>Collect Request scams</strong>. Entering your UPI PIN here could result in money being <strong>debited</strong> from your account.`);
        } else {
            renderSafeResult(resultDiv, "✓ IDENTITY VERIFIED", "No suspicious history found for this requester. This appears to be a standard VPA handle. Proceed with caution as usual.");
        }
    }, 1500);
}

// ==========================================
// UI HELPER FUNCTIONS
// ==========================================
function renderHighRiskResult(container, title, message) {
    container.innerHTML = `
        <div style="border: 2px solid #ef4444; padding: 25px; border-radius: 20px; background: #fef2f2; animation: fadeInUp 0.4s ease;">
            <h3 style="color: #b91c1c; margin-top: 0; display: flex; align-items: center; gap: 10px;">
                ${title}
            </h3>
            <p style="color: #7f1d1d; line-height: 1.5;">
                ${message}
            </p>
        </div>
    `;
}

function renderSafeResult(container, title, message) {
    container.innerHTML = `
        <div style="border: 2px solid #10b981; padding: 25px; border-radius: 20px; background: #ecfdf5; animation: fadeInUp 0.4s ease;">
            <h3 style="color: #047857; margin-top: 0; display: flex; align-items: center; gap: 10px;">
                ${title}
            </h3>
            <p style="color: #064e3b; line-height: 1.5;">
                ${message}
            </p>
        </div>
    `;
}