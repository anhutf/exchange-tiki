const summary = document.querySelector(".summary");
const orderList = document.querySelector(".order-list");
const buy = document.querySelector(".buy-order");
const sell = document.querySelector(".sell-order");

// Get exchange.tiki data
const fetchData = async function (url) {
  const res = await axios.get(url);
  return res.data;
};

// Display summary
const summaryMarket = async () => {
  const data = await fetchData(
    "https://api.tiki.vn/sandseel/api/v2/public/markets/astra/summary"
  );
  const ticker = data.ticker;
  summary.innerHTML = `
    <div class="current-price">
        <div class="last-price">${ticker.last}</div>
        <div class="change-percent">${ticker.price_change_percent}</div>
    </div>
    <div class="high-price">24h High<br><span>${ticker.high}</span></div>
    <div class="asa-amount">24h Vol (ASA)<br><span>${ticker.amount}</span></div>
    <div class="low-price">24h Low<br><span>${ticker.low}</span></div>
    <div class="xu-volume">24h Vol (XU)<br><span>${ticker.volume}</span></div>
  `;
};

// Display order book
const orderBook = async (amount = 20) => {
  const order = await fetchData(
    "https://api.tiki.vn/sandseel/api/v2/public/markets/asaxu/depth"
  );
  const buyOrder = order.bids;
  const sellOrder = order.asks;
  const orderLength =
    buyOrder.length >= sellOrder.length ? buyOrder.length : sellOrder.length;
  let sumSellAsa = 0;
  let sumSellXu = 0;
  let sumBuyAsa = 0;
  let sumBuyXu = 0;

  const table = document.createElement("table");
  for (let i = 0; i < orderLength; i++) {
    if (!buyOrder[i]) {
      sumBuyAsa = sumBuyAsa;
    } else {
      sumBuyAsa += parseFloat(buyOrder[i][1]);
      sumBuyXu += parseFloat(buyOrder[i][1]) * buyOrder[i][0];
    }

    if (!sellOrder[i]) {
      sumSellAsa = sumSellAsa;
    } else {
      sumSellAsa += parseFloat(sellOrder[i][1]);
      sumSellXu += parseFloat(sellOrder[i][1]) * sellOrder[i][0];
    }

    const tr = document.createElement("tr");
    if (i < amount) {
      tr.innerHTML = `
        <th class="left">${i + 1}</th>
        <td class="left">${buyOrder[i][1]}</td>
        <td class="buy-order right pad">${buyOrder[i][0]}</td>
        <td class="sell-order left">${sellOrder[i][0]}</td>
        <td class="right">${sellOrder[i][1]}</td>
        <th class="right">${i + 1}</th>
      `;
      table.appendChild(tr);
    }
  }

  buy.innerText = `${sumBuyAsa} ASA ~ ${sumBuyXu} XU`;
  sell.innerText = `${sumSellAsa} ASA ~ ${sumSellXu} XU`;
  orderList.innerHTML = "";
  orderList.append(table);
};

let amount;
// Run first time
summaryMarket();
orderBook();

// Reload every 3 seconds
setInterval(() => {
  summaryMarket();
  orderBook(amount);
}, 3000);

// Get amount from user
const numberList = document.querySelector("#number-list");
numberList.addEventListener("input", ({ target }) => {
  amount = target.value;
  orderBook(amount);
});
