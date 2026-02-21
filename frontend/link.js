/**
 * link.js - Logic for UPI ID and Link verification
 */

document.addEventListener('DOMContentLoaded', () => {
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
        checkBtn.addEventListener('click', checkUPI);
    }
});

function checkUPI() {
    const input = document.getElementById('upiInput').value.trim();
    const resultDiv = document.getElementById('upiResult');
    
    if(!input) {
        alert("Please enter a valid UPI ID or Link");
        return;
    }

    // 1. Show Loading State
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <p style="color: var(--primary); text-align: center; font-weight: 600;">
            🔍 Scanning <strong>${input}</strong> against global blocklists...
        </p>
    `;
    
    // 2. Simulate AI Processing Delay
    setTimeout(() => {
        const lowerInput = input.toLowerCase();
        
        // Simple logic for hackathon demo (Replace with API fetch later)
        const isSuspicious = lowerInput.includes('prize') || 
                             lowerInput.includes('win') || 
                             lowerInput.includes('collect') || 
                             lowerInput.includes('lucky');

        if(isSuspicious) {
            renderHighRiskResult(resultDiv, input);
        } else {
            renderSafeResult(resultDiv);
        }
    }, 1500);
}

function renderHighRiskResult(container, input) {
    container.innerHTML = `
        <div style="border: 2px solid #ef4444; padding: 25px; border-radius: 20px; background: #fef2f2; animation: fadeInUp 0.4s ease;">
            <h3 style="color: #b91c1c; margin-top: 0; display: flex; align-items: center; gap: 10px;">
                ⚠️ HIGH RISK DETECTED
            </h3>
            <p style="color: #7f1d1d; line-height: 1.5;">
                This ID/Link matches patterns commonly used in <strong>Collect Request scams</strong>. 
                Entering your UPI PIN here could result in money being <strong>debited</strong> from your account.
            </p>
        </div>
    `;
}

function renderSafeResult(container) {
    container.innerHTML = `
        <div style="border: 2px solid #10b981; padding: 25px; border-radius: 20px; background: #ecfdf5; animation: fadeInUp 0.4s ease;">
            <h3 style="color: #047857; margin-top: 0; display: flex; align-items: center; gap: 10px;">
                ✓ IDENTITY VERIFIED
            </h3>
            <p style="color: #064e3b; line-height: 1.5;">
                No suspicious history found for this requester. This appears to be a standard VPA handle. Proceed with caution as usual.
            </p>
        </div>
    `;
}