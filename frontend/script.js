document.addEventListener("DOMContentLoaded", function () {

    if (!localStorage.getItem("user_email")) {
        window.location.href = "login.html";
    }

    const form = document.getElementById("fraudForm");

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
                `
                <h2>Risk Score: ${result.risk_score}%</h2>
                <h3>Status: ${result.risk_level}</h3>
                <h4>Why?</h4>
                <ul>${explanationHTML}</ul>
                `;
        });
    });

});

function checkSpam() {

    const message = document.getElementById("message").value;

    fetch("http://127.0.0.1:8000/detect-spam", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ message: message })
    })
    .then(res => res.json())
    .then(data => {

        if (data.error) {
            document.getElementById("spamResult").innerHTML =
                `<p style="color:red;">${data.error}</p>`;
            return;
        }

        document.getElementById("spamResult").innerHTML =
            `
            <h3>Result: ${data.label}</h3>
            <h4>Spam Probability: ${data.spam_score}%</h4>
            `;
    });
}
