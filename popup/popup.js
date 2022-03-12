// setup buttons
const submitAPIKey = document.getElementById("submitAPIKey");
if (submitAPIKey) {
  submitAPIKey.onclick = function(e) {
    let k = document.getElementById("api_key")
    chrome.storage.local.set({apiKey: k.value}, async function() {
      document.getElementById("noApiKey").hidden = true;
      document.getElementById("detail").removeAttribute("open");
      document.getElementById("complete").hidden = false;
      await updateExchangeRates(k.value);
    });
  };
}

const clearApiKey = document.getElementById("clearApiKey");
if (clearApiKey) {
  clearApiKey.onclick = function () {
    chrome.storage.local.set({"apiKey": null}, function() {
      alert('API key deleted, however you can still use the extension with the currency saved exchange rates.');
    });
  }
}

const currency = document.getElementById("currency")
if (currency) {
  if (currency.value === "") {
    currency.value = "USD"
  }
  chrome.storage.local.get(['currency'], function(result) {
    currency.value = result.currency;
  });
}

let currencies = ["USD", "GBP", "EUR", "RUB"];

const currencyIcons = {
  "USD":"$",
  "EUR":"€",
  "GBP":"£",
  "RUB":"₽",
}

const currencyIndexes = {
  "USD": 0,
  "GBP": 1,
  "EUR": 2,
  "RUB": 3
}

// conversion calculator
const calculatorInput = document.getElementById("calculatorInput")
if (calculatorInput) {
  calculatorInput.oninput = function (e) {
    updateCurrencyCalculator(e.target.value);
  }
}

const calculatorDetails = document.getElementById("calculator")
if (calculatorDetails) {
  calculatorDetails.onclick = function() {
    updateCalculatorPlaceholder();
  }
}

function updateCalculatorPlaceholder() {
  chrome.storage.local.get(['currency'], function (currencyResult) {
    document.getElementById("calculatorInput").placeholder = "Enter an RMB value to be converted to " + currencyResult.currency;
  });
}

function updateCurrencyCalculator(value) {
  if (value === "") {document.getElementById("calculatorOutput").innerHTML = ""; return}
  document.getElementById("calculatorOutput").innerHTML = "";
  chrome.storage.local.get(['conversionValues'], function(result) {
    let values = result.conversionValues;
    for (let i = 0; i < currencies.length; i++) {
      let res = parseFloat(value) * values[i];
      let convertedFloat = Math.round((res + Number.EPSILON) * 100) / 100;
      let convertedString = convertedFloat.toLocaleString();
      if (convertedString === "NaN") {
        continue;
      }
      if (document.getElementById("calculatorOutput").innerHTML  === "") {
        document.getElementById("calculatorOutput").innerHTML = "¥" + value + " = " + currencyIcons[currencies[i]] + convertedString;
      } else {
        document.getElementById("calculatorOutput").innerHTML = document.getElementById("calculatorOutput").innerHTML + "<br/>" +
            "¥" + value + " = " + currencyIcons[currencies[i]] + convertedString;
      }
    }
  });
}

const submitCurrency = document.getElementById("submitCurrency")
if (submitCurrency) {
  submitCurrency.onclick = function () {
    chrome.storage.local.set({"currency": currency.value}, function() {
      submitCurrency.textContent = "Saved!"
      chrome.tabs.reload();
    });
    updateCalculatorPlaceholder();
  }
}

const update = document.getElementById("update")
if (update) {
  update.onclick = async function () {
    chrome.storage.local.get(['apiKey'], async function(key) {
      await updateExchangeRates(key)
    });
  }
}

// gets the exchange rate for all supported currencies 
async function updateExchangeRates(key) {
  let conversionRates = [];
  for (let i =0; i < currencies.length; i++) {
    let url = "https://free.currconv.com/api/v7/convert?q="+currencies[i]+"_CNY,CNY_"+currencies[i]+"&compact=ultra&apiKey="+key.apiKey;
    let result = await fetch(url)
        .then(res => {
          if (!res.ok) {
            throw new Error("API is down, please try again later.")
            return
          }
          return res.json()})
        .then(data => {
          return data;
        }).catch(e => {
          alert(e);
        })
    conversionRates[i] = result["CNY_"+currencies[i]];
  }
  chrome.storage.local.set({conversionValues: conversionRates});
}

// determine content
window.addEventListener('load', function () {
  chrome.storage.local.get(['apiKey'], function(result) {
    let notification = document.getElementById("noApiKey")
    if (result.apiKey === null || result.apiKey === undefined) {
      notification.hidden = false;
    } else {
      notification.hidden = true
      let k = document.getElementById("api_key")
      k.value = result.apiKey;
      let congrats = document.getElementById("complete")
      congrats.hidden = false;
    }
  });
})

