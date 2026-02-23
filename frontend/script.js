document.addEventListener("DOMContentLoaded", function () {

    if (!localStorage.getItem("user_email")) {
        window.location.href = "login.html";
    }

    const form = document.getElementById("fraudForm");
    const askAiBtn = document.getElementById("askAiBtn");
    const aiExplanationBox = document.getElementById("aiExplanationBox");
    const aiExplanationText = document.getElementById("aiExplanationText");

    // ==========================================
    // 1. TRANSACTION FRAUD FORM LOGIC
    // ==========================================
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const data = {
                user_email: localStorage.getItem("user_email"),
                amount: parseFloat(document.getElementById("amount").value),
                issue_type: document.getElementById("issue_type").value,
                bank_sender: document.getElementById("bank_sender").value,
                bank_receiver: document.getElementById("bank_receiver").value,
                date: document.getElementById("date").value,
                time: document.getElementById("time").value
            };

            fetch("http://127.0.0.1:8000/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(result => {
                    if (result.error) {
                        document.getElementById("result").innerHTML =
                            `<p style="color:red;">Error: ${result.error}</p>`;
                        return;
                    }

                    let explanationHTML = "";
                    result.explanation.forEach(reason => {
                        explanationHTML += `<li>${reason}</li>`;
                    });

                    document.getElementById("result").innerHTML =
                        `<h2>Risk Score: ${result.risk_score}%</h2>
                        <h3>Status: ${result.risk_level}</h3>
                        <h4>Why?</h4>
                        <ul>${explanationHTML}</ul>`;
                });
        });
    }

    // ==========================================
    // 2. GEMINI AI EXPLANATION BUTTON LOGIC
    // ==========================================
    if (askAiBtn) {
        askAiBtn.addEventListener("click", async function () {
            // Hide button, show loading text
            askAiBtn.style.display = "none";
            aiExplanationBox.style.display = "block";
            aiExplanationText.innerText = "AI is analyzing the message structure...";

            try {
                const response = await fetch("http://127.0.0.1:8000/explain-risk", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: askAiBtn.dataset.message,
                        ml_output: askAiBtn.dataset.label,
                        spam_probability: parseFloat(askAiBtn.dataset.score)
                    })
                });

                const data = await response.json();

                // Display the result
                if (data.status === "success") {
                    aiExplanationText.innerText = data.explanation;
                } else {
                    // THIS WILL PRINT THE ACTUAL PYTHON ERROR ON YOUR SCREEN!
                    aiExplanationText.innerText = "Backend Error: " + (data.error || "Endpoint not found or server crashed.");
                }
            } catch (error) {
                console.error("API Error:", error);
                aiExplanationText.innerText = "Network error connecting to the AI backend.";
            }
        });
    }
});

// ==========================================
// 3. MESSAGE SPAM CHECKER FUNCTION
// ==========================================
function checkSpam() {
    const message = document.getElementById("message").value;

    // Grab the AI elements so we can make them visible later
    const askAiBtn = document.getElementById("askAiBtn");
    const aiExplanationBox = document.getElementById("aiExplanationBox");

    fetch("http://127.0.0.1:8000/detect-spam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
    })
        .then(res => res.json())
        .then(data => {

            if (data.error) {
                document.getElementById("spamResult").innerHTML =
                    `<p style="color:red;">${data.error}</p>`;
                return;
            }

            // Display the regular XGBoost result
            document.getElementById("spamResult").innerHTML =
                `<h3>Result: ${data.label}</h3>
                <h4>Spam Probability: ${data.spam_score}%</h4>`;

            // Setup the AI button with the newly scanned data
            if (askAiBtn) {
                askAiBtn.dataset.message = message;
                askAiBtn.dataset.label = data.label;
                askAiBtn.dataset.score = data.spam_score;

                // Show the "Ask AI" button and hide any previous explanations
                askAiBtn.style.display = "block";
                aiExplanationBox.style.display = "none";
            }
        });
}