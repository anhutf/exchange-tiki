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

// Sum asa, xu
const sumValue = (sum, currentVal) => {
  sum[0] += parseFloat(currentVal[1]);
  sum[1] += parseFloat(currentVal[1]) * currentVal[0];
  return sum;
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

  return arr.reduce((merge, currentVal, currentIndex, array) => {
    if ((currentVal[0] - price) * num > 0) {
      merge.push([price, value]);
      value = parseFloat(currentVal[1]);

      if (currentVal[0] % num == 0) {
        price = parseFloat(currentVal[0]);
        // Kiem tra neu la gia tri cuoi cung thi push vo merge luon
        if (currentIndex == array.length - 1) {
          merge.push([parseFloat(currentVal[0]), value]);
        }
      } else {
        price =
          num < 0
            ? currentVal[0] - (currentVal[0] % num)
            : currentVal[0] - (currentVal[0] % num) + num;
      }
    } else {
      value += parseFloat(currentVal[1]);
      // Kiem tra neu la gia tri cuoi cung thi push vo merge luon
      if (currentIndex == array.length - 1) {
        merge.push([parseFloat(currentVal[0]), value]);
      }
    }
    return merge;
  }, []);
};
