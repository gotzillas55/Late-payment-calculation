// --- Date Picker Setup ---
flatpickr("#endDate", {
    dateFormat: "d/m/Y",
    disableMobile: "true" // ใช้ Native picker บนมือถือเพื่อให้ใช้ง่ายขึ้น
});
flatpickr("#today", {
    dateFormat: "d/m/Y",
    defaultDate: "today",
    disableMobile: "true"
});

function formatNumber(num) {
    return Number(num).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function parseDate(str) {
    const [d, m, y] = str.split("/");
    return new Date(`${y}-${m}-${d}`);
}

function calculateLateFee() {
    const amount = Number(document.getElementById("amount").value);
    const endDateStr = document.getElementById("endDate").value;
    const todayStr = document.getElementById("today").value;

    const endDate = parseDate(endDateStr);
    const today = parseDate(todayStr);

    if (!amount || !endDateStr || !todayStr) {
        alert("Please input all informations");
        return;
    }

    // --- Calculate Months Overdue ---
    let months = 0;
    let start = new Date(endDate);
    start.setDate(start.getDate() + 1);

    while (start <= today) {
        months++;
        let next = new Date(start);
        next.setMonth(next.getMonth() + 1);
        next.setDate(start.getDate() - 1);
        start = new Date(next);
        start.setDate(start.getDate() + 1);
    }

    // --- Interest Rate ---
    const rate = 15 / 36500;
    let periodStart = new Date(endDate);
    periodStart.setDate(periodStart.getDate() + 1);

    let totalInterest = 0;
    let breakdownHTML = `
        <h3>📋 Period informations (Breakdown)</h3>
        <table>
            <thead>
                <tr>
                    <th>Periods</th>
                    <th>Amount</th>
                    <th>Days</th>
                    <th>Interest</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 1; i <= months; i++) {
        let periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        periodEnd.setDate(periodStart.getDate() - 1);

        if (periodEnd > today) periodEnd = new Date(today);

        const days = Math.round((periodEnd - periodStart) / 86400000) + 1;
        const accAmount = amount * i;
        const fee = accAmount * rate * days;

        totalInterest += fee;

        breakdownHTML += `
            <tr>
                <td>${i}</td>
                <td>${formatNumber(accAmount)}</td>
                <td>${days} Days</td>
                <td>${formatNumber(fee)}</td>
            </tr>
        `;

        periodStart = new Date(periodEnd);
        periodStart.setDate(periodStart.getDate() + 1);
    }

    breakdownHTML += "</tbody></table>";
    document.getElementById("breakdown").innerHTML = breakdownHTML;

    // Follow up fee
    const followFirst = 50;
    const followNext = 100;
    const followTotal = followFirst + (months - 1) * followNext;

    const accumulated = amount * months;
    const totalLate = totalInterest + followTotal;
    const totalDue = accumulated + totalLate;

    // --- Updated Summary HTML Structure ---
    let summary = `
        <h3>💰 Summary</h3>
        
        <div class="summary-row">
            <span>Monthly rate (${months} Months)</span>
            <span>${formatNumber(accumulated)} Baht</span>
        </div>
        <div class="summary-row">
            <span>Follow-up fee</span>
            <span>${formatNumber(followTotal)} Baht</span>
        </div>
        <div class="summary-row">
            <span>Interest fee</span>
            <span>${formatNumber(totalInterest)} Baht</span>
        </div>

        <div class="summary-total">
            <span>Total amount</span>
            <span>${formatNumber(totalDue)} Baht</span>
        </div>
    `;

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = summary;
    resultDiv.classList.remove("hidden"); // แสดงผลเมื่อคำนวณเสร็จ
}
