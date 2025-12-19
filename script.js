// --- Date Picker Setup ---
flatpickr("#endDate", {
    dateFormat: "d/m/Y"
});
flatpickr("#today", {
    dateFormat: "d/m/Y",
    defaultDate: "today"
});

// --- Add Comma Formatter ---
function formatNumber(num) {
    return Number(num).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Convert dd/mm/yyyy → JS Date
function parseDate(str) {
    const [d, m, y] = str.split("/");
    return new Date(`${y}-${m}-${d}`);
}

function formatDate(date) {
    let d = date.getDate().toString().padStart(2, "0");
    let m = (date.getMonth() + 1).toString().padStart(2, "0");
    let y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

function calculateLateFee() {
    const amount = Number(document.getElementById("amount").value);
    const endDate = parseDate(document.getElementById("endDate").value);
    const today = parseDate(document.getElementById("today").value);

    if (!amount || !endDate || !today) {
        alert("กรุณากรอกข้อมูลให้ครบ");
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

    // --- interest rate ---
    const rate = 15 / 36500;

    let periodStart = new Date(endDate);
    periodStart.setDate(periodStart.getDate() + 1);

    let totalInterest = 0;
    let breakdownHTML = `
        <h3>Breakdown</h3>
        <table>
            <tr>
                <th>Period</th>
                <th>Amount</th>
                <th>Days</th>
                <th>Interest</th>
            </tr>
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
                <td>Period ${i}</td>
                <td>${formatNumber(accAmount)}</td>
                <td>${days}</td>
                <td>${formatNumber(fee)}</td>
            </tr>
        `;

        periodStart = new Date(periodEnd);
        periodStart.setDate(periodStart.getDate() + 1);
    }

    breakdownHTML += "</table>";
    document.getElementById("breakdown").innerHTML = breakdownHTML;

    // Follow up fee
    const followFirst = 50;
    const followNext = 100;
    const followTotal = followFirst + (months - 1) * followNext;

    const accumulated = amount * months;
    const totalLate = totalInterest + followTotal;
    const totalDue = accumulated + totalLate;

    let summary = `
        <h3>Summary</h3>
        Room Fee: ${formatNumber(accumulated)} บาท<br>
        Follow-up Fee: ${formatNumber(followTotal)} บาท<br>
        Interest Fee: ${formatNumber(totalInterest)} บาท<br><br>
        <b>Total: ${formatNumber(totalDue)} บาท</b>
    `;

    document.getElementById("result").innerHTML = summary;
}
