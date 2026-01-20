// ====================
// API وبيانات العملات
// ====================
const API_URL = 'https://api.exchangerate.host/latest?base=DZD';
let rates = {};
let blackMarket = {};
let currencyList = ["USD","EUR","GBP","JPY","SAR","CAD","AUD"];

// ====================
// Theme toggle
// ====================
document.getElementById("toggle-theme").addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
});

// ====================
// Fetch API
// ====================
async function fetchRates() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        rates = data.rates;
        showCurrencies();
        populateConverter();
        drawChart();
    } catch (err) { console.error("API Error:", err); }
}

// ====================
// عرض العملات الرسمية
// ====================
function showCurrencies() {
    const container = document.getElementById("currency-section");
    container.innerHTML = "";
    currencyList.forEach(code => {
        const rate = rates[code];
        if (!rate) return;
        const bm = blackMarket[code] || { buy: "-", sell: "-" };
        const diff = (bm.buy && rate) ? (bm.buy - rate).toFixed(2) : 0;
        const diffColor = diff > 0 ? "#4caf50" : diff < 0 ? "#f44336" : "#fff";
        const diffSymbol = diff > 0 ? "↑" : diff < 0 ? "↓" : "-";

        const card = document.createElement("div");
        card.className = "currency-card";
        card.innerHTML = `
            <h2>${code}</h2>
            <p>سعر البنك: ${rate.toFixed(2)} دج</p>
            <p>سعر السوق غير الرسمي: شراء ${bm.buy} | بيع ${bm.sell}</p>
            <p style="color:${diffColor}">فرق السعر: ${diff} ${diffSymbol}</p>
        `;
        container.appendChild(card);
    });
}

// ====================
// إدارة السوق غير الرسمي
// ====================
function saveBlackMarket() {
    const c = document.getElementById("bm-currency").value.toUpperCase();
    const buy = document.getElementById("bm-buy").value;
    const sell = document.getElementById("bm-sell").value;
    if (!c || !buy || !sell) return alert("املأ الحقول");

    blackMarket[c] = { buy, sell };
    showCurrencies();
    drawChart();
}

// ====================
// محول العملات
// ====================
function populateConverter() {
    const from = document.getElementById("from-currency");
    const to = document.getElementById("to-currency");
    from.innerHTML = "";
    to.innerHTML = "";
    currencyList.forEach(c => {
        from.innerHTML += `<option>${c}</option>`;
        to.innerHTML += `<option>${c}</option>`;
    });
}

function convert() {
    const amount = parseFloat(document.getElementById("amount").value);
    const from = document.getElementById("from-currency").value;
    const to = document.getElementById("to-currency").value;
    if (!amount) return;
    const result = (amount / rates[from]) * rates[to];
    document.getElementById("result").innerText = `النتيجة: ${result.toFixed(2)} ${to}`;
}

// ====================
// الرسم البياني
// ====================
function drawChart() {
    const ctx = document.getElementById("priceChart").getContext("2d");
    const labels = Object.keys(blackMarket);
    const data = Object.values(blackMarket).map(x => parseFloat(x.buy));
    if(window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label:'سعر السوق غير الرسمي',
                data:data,
                backgroundColor:'#ff9800'
            }]
        },
        options: {
            responsive:true,
            plugins:{ legend:{display:false} },
            scales:{ y:{beginAtZero:true} }
        }
    });
}

// ====================
// Footer ديناميكي
// ====================
function createFooter() {
    const footer = document.createElement("footer");
    footer.innerHTML = `
        <p>تم التطوير بواسطة فريق مبتكر • كل شيء مجاني باستخدام Exchangerate.host</p>
        <p class="developer">تم التطوير من قبل <span>عتروس عبد القادر</span></p>
    `;
    document.body.appendChild(footer);
}

// إضافة CSS ديناميكي للـ Footer
const footerStyle = document.createElement("style");
footerStyle.innerHTML = `
footer {
    text-align: center;
    margin-top: 30px;
    padding: 15px 10px;
    font-size: 0.95em;
    color: #ccc;
    background: rgba(0,0,0,0.2);
    border-radius: 10px;
    transition: background 0.3s, color 0.3s;
}
footer .developer {
    margin-top: 5px;
    font-weight: bold;
    font-size: 1em;
    color: #ffdd57;
}
footer .developer span {
    color: #4caf50;
    transition: color 0.3s, transform 0.3s;
}
footer .developer span:hover {
    color: #ff6b6b;
    transform: scale(1.05);
}
/* Light Mode Footer */
body.light-mode footer {
    background: rgba(0,0,0,0.05);
    color: #333;
}
body.light-mode footer .developer {
    color: #ff9800;
}
body.light-mode footer .developer span:hover {
    color: #36d1dc;
}
`;
document.head.appendChild(footerStyle);

// إنشاء Footer بعد تحميل الصفحة
window.addEventListener("DOMContentLoaded", createFooter);

// ====================
// تحديث دوري للبيانات
// ====================
setInterval(fetchRates, 10000);
fetchRates();
