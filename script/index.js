// Display summary
const summary = document.querySelector(".summary-data");

const summaryMarket = async () => {
  const data = await fetchData(
    "https://api.tiki.vn/sandseel/api/v2/public/markets/astra/summary"
  );
  const ticker = data.ticker;

  // Set color of change percent
  const percent = parseFloat(ticker.price_change_percent);
  let classColor = "buy-color";
  if (percent < 0) {
    classColor = "sell-color";
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

// Display total asa, xu, order book
const buy = document.querySelector(".buy-total");
const sell = document.querySelector(".sell-total");

const buyList = document.querySelector(".buy-list");
const sellList = document.querySelector(".sell-list");

const swapXu = document.getElementById("swap-xu");
const swapAsa = document.getElementById("swap-asa");
const outputAsa = document.getElementById("output-asa");
const outputXu = document.getElementById("output-xu");

const orderBook = async (amount = 20, num = 1) => {
  const order = await fetchData(
    "https://api.tiki.vn/sandseel/api/v2/public/markets/asaxu/depth"
  );
  const buyOrder = order.bids;
  const sellOrder = order.asks;

  // Sum asa, xu
  const sumBuy = buyOrder.reduce(sumValue, [0, 0]);
  const sumSell = sellOrder.reduce(sumValue, [0, 0]);

  buy.innerHTML = `
    <div class="total-asa buy-color">${separateThousand(sumBuy[0])}A</div>
    <div class="total-xu">${separateThousand(sumBuy[1])}đ</div>
  `;
  sell.innerHTML = `
    <div class="total-asa sell-color">${separateThousand(sumSell[0])}A</div>
    <div class="total-xu">${separateThousand(sumSell[1])}đ</div>
  `;

  // Merge orderbook
  const mergeBuy = mergeOrderBook(buyOrder, -num);
  const mergeSell = mergeOrderBook(sellOrder, +num);

  // Get total asa on list
  if (amount > mergeBuy.length || amount > mergeSell.length) {
    amount = Math.min(mergeBuy.length, mergeSell.length);
  }
  let totalAsaBuy = 0;
  let totalAsaSell = 0;
  for (let i = 0; i < amount; i++) {
    totalAsaBuy = mergeBuy[i][1] > totalAsaBuy ? mergeBuy[i][1] : totalAsaBuy;
    totalAsaSell =
      mergeSell[i][1] > totalAsaSell ? mergeSell[i][1] : totalAsaSell;
  }
  const totalAsaHigh = totalAsaBuy >= totalAsaSell ? totalAsaBuy : totalAsaSell;

  buyList.innerHTML = "";
  sellList.innerHTML = "";
  for (let i = 0; i < amount; i++) {
    const divBuy = document.createElement("div");
    const divSell = document.createElement("div");

    divBuy.innerHTML = ` 
      <div class="buy-amount">${separateThousand(mergeBuy[i][1])}</div>
      <div class="buy-order">${separateThousand(mergeBuy[i][0])}</div>
      <div class="chart-item-buy" style="--percent: ${
        (100 * mergeBuy[i][1]) / totalAsaHigh
      }%"></div>
    `;
    divSell.innerHTML = `
      <div class="chart-item-sell" style="--percent: ${
        (100 * mergeSell[i][1]) / totalAsaHigh
      }%"></div>
      <div class="sell-order">${separateThousand(mergeSell[i][0])}</div>
      <div class="sell-amount">${separateThousand(mergeSell[i][1])}</div>
    `;

    buyList.appendChild(divBuy);
    sellList.appendChild(divSell);
  }

  // Tinh luong mua ban
  swapXu.addEventListener("input", ({ target }) => {
    const inputVal = target.value;
    swapXuFunc(inputVal, outputAsa, sellOrder);
  });
  swapAsa.addEventListener("input", ({ target }) => {
    const inputVal = target.value;
    swapAsaFunc(inputVal, outputXu, buyOrder);
  });
};

// Display swap asa xu
const swapFunc = async () => {
  const order = await fetchData(
    "https://api.tiki.vn/sandseel/api/v2/public/markets/asaxu/depth"
  );
  const buyOrder = order.bids;
  const sellOrder = order.asks;

  swapXuFunc(10000000, outputAsa, sellOrder);
  swapAsaFunc(1000, outputXu, buyOrder);
};

let amount;
let sum;
// Run first time
summaryMarket();
orderBook();
swapFunc();

// Reload every 3 seconds
setInterval(() => {
  summaryMarket();
  orderBook(amount, sum);
}, 3000);

// Get amount from user
const sumList = document.querySelector("#sum-list");
sumList.addEventListener("input", ({ target }) => {
  sum = target.value;
  orderBook(amount, sum);
});

const numberList = document.querySelector("#number-list");
numberList.addEventListener("input", ({ target }) => {
  amount = target.value;
  orderBook(amount, sum);
});

// Volume chart
const volumeChart = async (url, element) => {
  const data = await fetchData(url);

  const amountMax = data.reduce((max, currentVal) => {
    return Math.max(max, currentVal[5]);
  }, 0);

  element.innerHTML = ``;
  for (let dateData of data) {
    const dataColumn = document.createElement("div");
    const date = new Date(dateData[0] * 1000);
    dataColumn.innerHTML = `
      <p class="value">${(dateData[5] / 1000000).toFixed(1)}M</p>
      <div class="chart-column" style="--percent: ${
        (dateData[5] * 10) / amountMax
      }rem"></div>
      <p class="date">${date.getDate()}/${date.getMonth() + 1}</p>
    `;
    element.appendChild(dataColumn);
  }
};
volumeChart(
  "https://api.tiki.vn/sandseel/api/v2/public/markets/asaxu/klines?period=10_080",
  document.querySelector(".week")
);
volumeChart(
  "https://api.tiki.vn/sandseel/api/v2/public/markets/asaxu/klines?period=1440",
  document.querySelector(".day")
);
