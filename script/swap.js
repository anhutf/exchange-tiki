// Tinh luong mua ban
const swapXuFunc = (inputVal, outputEl, arrayOrder) => {
  let total = 0;
  let sum = 0;

  for (let i = 0; i < arrayOrder.length; i++) {
    total += arrayOrder[i][1] * arrayOrder[i][0];
    sum += parseFloat(arrayOrder[i][1]);

    if (total >= inputVal || i === arrayOrder.length - 1) {
      sum =
        total >= inputVal
          ? sum -
            parseFloat(arrayOrder[i][1]) +
            (inputVal - total + arrayOrder[i][1] * arrayOrder[i][0]) /
              arrayOrder[i][0]
          : sum;

      outputEl.innerHTML = `
      <div class="item-swap">
        <div class="item-name">Số lượng</div>
        <div class="item-value">${separateThousand(sum.toFixed(2))} ASA</div>
      </div>
      <div class="item-swap">
        <div class="item-name">Giá ASA sau mua</div>
        <div class="item-value">${separateThousand(
          parseFloat(arrayOrder[i][0])
        )} XU</div>
      </div>
      <div class="item-swap">
        <div class="item-name">Số dư</div>
        <div class="item-value">${
          inputVal > total ? separateThousand(inputVal - total) : 0
        } XU</div>
      </div>
      `;
      break;
    }
  }
};

const swapAsaFunc = (inputVal, outputEl, arrayOrder) => {
  let total = 0;
  let sum = 0;

  for (let i = 0; i < arrayOrder.length; i++) {
    total += parseFloat(arrayOrder[i][1]);
    sum += arrayOrder[i][1] * arrayOrder[i][0];

    if (total >= inputVal || i === arrayOrder.length - 1) {
      sum =
        total >= inputVal
          ? sum -
            arrayOrder[i][1] * arrayOrder[i][0] +
            (inputVal - total + parseFloat(arrayOrder[i][1])) * arrayOrder[i][0]
          : sum;

      outputEl.innerHTML = `
      <div class="item-swap">
        <div class="item-name">Số lượng</div>
        <div class="item-value">${separateThousand(sum.toFixed(2))} XU</div>
      </div>
      <div class="item-swap">
        <div class="item-name">Giá ASA sau bán</div>
        <div class="item-value">${separateThousand(
          parseFloat(arrayOrder[i][0])
        )} XU</div>
      </div>
      <div class="item-swap">
        <div class="item-name">Số dư</div>
        <div class="item-value">${
          inputVal > total ? separateThousand(inputVal - total) : 0
        } ASA</div>
      </div>
      `;
      break;
    }
  }
};
