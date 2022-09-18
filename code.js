const summary = document.querySelector(".summary");
const orderList = document.querySelector(".order-list");
const buy = document.querySelector(".buy-order");
const sell = document.querySelector(".sell-order");

// Get exchange.tiki data
const fetchData = async function (url) {
  const res = await axios.get(url);
  return res.data;
};

// Separate thousand
const separateThousand = (value) => {
  return value
    .toString()
    .replace(/(\.\d{2})\d*/, "$1")
    .replace(/(\d)(?=(\d{3})+\b)/g, "$1,");
};

// Display summary
const summaryMarket = async () => {
  const data = await fetchData(
    "https://api.tiki.vn/sandseel/api/v2/public/markets/astra/summary"
  );
  const ticker = data.ticker;

  // Set color of change percent
  const percent = parseFloat(ticker.price_change_percent);
  let classColor = "buy-order";
  if (percent < 0) {
    classColor = "sell-order";
  }

  summary.innerHTML = `
    <div class="current-price">
        <div class="last-price">${separateThousand(ticker.last)}</div>
        <div class="change-percent ${classColor}">${
    ticker.price_change_percent
  }</div>
    </div>
    <div class="high-price">Cao 24h<br><span>${separateThousand(
      ticker.high
    )}</span></div>
    <div class="asa-amount">KL 24h(ASA)<br><span>${separateThousand(
      ticker.amount
    )}</span></div>
    <div class="low-price">Thấp 24h<br><span>${separateThousand(
      ticker.low
    )}</span></div>
    <div class="xu-volume">KL 24h(XU)<br><span>${separateThousand(
      ticker.volume
    )}</span></div>
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
        <td class="left">${separateThousand(buyOrder[i][1])}</td>
        <td class="buy-order right pad">${separateThousand(buyOrder[i][0])}</td>
        <td class="sell-order left">${separateThousand(sellOrder[i][0])}</td>
        <td class="right">${separateThousand(sellOrder[i][1])}</td>
      `;
      table.appendChild(tr);
    }
  }

  buy.innerHTML = `
    <div class="total-asa">${separateThousand(sumBuyAsa)}A</div>
    <div class="total-xu">${separateThousand(sumBuyXu)}đ</div>
  `;
  sell.innerHTML = `
  <div class="total-asa">${separateThousand(sumSellAsa)}A</div>
  <div class="total-xu">${separateThousand(sumSellXu)}đ</div>
`;
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
