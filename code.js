const summary = document.querySelector(".summary-data");
const buy = document.querySelector(".buy-total");
const sell = document.querySelector(".sell-total");

const buyList = document.querySelector(".buy-list");
const sellList = document.querySelector(".sell-list");

const swapXu = document.getElementById("swap-xu");
const swapAsa = document.getElementById("swap-asa");
const inputXu = document.getElementById("input-xu");

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

// Sum asa, xu
const sumValue = (sum, currentVal) => {
  sum[0] += parseFloat(currentVal[1]);
  sum[1] += parseFloat(currentVal[1]) * currentVal[0];
  return sum;
};

// Tinh luong mua ban
const swap = (inputVal, outputEl, arrayOrder) => {
  let total = 0;
  for (let i = 0; i < arrayOrder.length; i++) {
    total +=
      inputXu.checked === true
        ? arrayOrder[i][1] * arrayOrder[i][0]
        : parseFloat(arrayOrder[i][1]);
    if (total >= inputVal || i === arrayOrder.length - 1) {
      outputEl.value = parseFloat(arrayOrder[i][0]);
      break;
    }
  }
};

// Merge orderbook
const mergeOrderBook = (arr, num) => {
  let value = 0;
  // Kiem tra neu chia het thi lay gia tri goc, khong thi tru di gia tri gop
  let price = parseFloat(arr[0][0]);
  if (arr[0][0] % num !== 0) {
    price =
      num < 0
        ? arr[0][0] - (arr[0][0] % num)
        : arr[0][0] - (arr[0][0] % num) + num;
  }

  return arr.reduce((merge, currentVal) => {
    if ((currentVal[0] - price) * num > 0) {
      merge.push([price, value]);
      value = parseFloat(currentVal[1]);

      if (currentVal[0] % num == 0) {
        price = parseFloat(currentVal[0]);
      } else {
        price =
          num < 0
            ? currentVal[0] - (currentVal[0] % num)
            : currentVal[0] - (currentVal[0] % num) + num;
      }
    } else {
      value += parseFloat(currentVal[1]);
    }
    return merge;
  }, []);
};

// Display total asa, xu, order book
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

  // Tinh luong mua ban
  swapXu.addEventListener("input", ({ target }) => {
    const inputVal = target.value;
    if (inputXu.checked === true) {
      swap(inputVal, swapAsa, sellOrder);
    } else {
      swap(inputVal, swapAsa, buyOrder);
    }
  });
  inputXu.addEventListener("change", ({ target }) => {
    const checkVal = target.checked;
    const inputVal = swapXu.value;
    if (checkVal === true) {
      swap(inputVal, swapAsa, sellOrder);
    } else {
      swap(inputVal, swapAsa, buyOrder);
    }
  });

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
};

let amount;
let sum;
// Run first time
summaryMarket();
orderBook();

// Reload every 3 seconds
setInterval(() => {
  summaryMarket();
  orderBook(amount, sum);
}, 3000);

// Get amount from user
const sumList = document.querySelector("#sum-list");
sumList.addEventListener("input", ({ target }) => {
  sum = target.value;
  // amount = 20;
  // numberList.value = 20;
  orderBook(amount, sum);
});

const numberList = document.querySelector("#number-list");
numberList.addEventListener("input", ({ target }) => {
  amount = target.value;
  // sum = 1;
  // sumList.value = 1;
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
