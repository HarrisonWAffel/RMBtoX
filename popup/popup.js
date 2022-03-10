// setup buttons
const sendMessageId = document.getElementById("sendmessageid");
if (sendMessageId) {
  sendMessageId.onclick = function(e) {
    let k = document.getElementById("api_key")
    chrome.storage.local.set({apiKey: k.value}, function() {
      document.getElementById("noApiKey").hidden = true;
      document.getElementById("detail").removeAttribute("open");
      document.getElementById("complete").hidden = false;

    });
  };
}

const clearApiKey = document.getElementById("clearApiKey");
if (clearApiKey) {
  clearApiKey.onclick = function () {
    chrome.storage.local.set({"apiKey": null}, function() {
      alert('API key deleted, please re-open the popup to enter a new one.');
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

const submitCurrency = document.getElementById("submitCurrency")
if (submitCurrency) {
  submitCurrency.onclick = function () {
    chrome.storage.local.set({"currency": currency.value}, function() {
      submitCurrency.textContent = "Saved!"
      chrome.storage.local.get([currency.value+'toRMB'], function (res) {
        if (res === undefined || JSON.stringify(res) === "{}") {
          // get fetch
          chrome.storage.local.get(['apiKey'], function(key) {
            fetch("https://free.currconv.com/api/v7/convert?q="+currency.value+"_CNY,CNY_"+currency.value+"&compact=ultra&apiKey="+key.apiKey)
                .then(res => res.json())
                .then(data => {
                  // save to local storage
                  chrome.storage.local.set({conversionValue: data["CNY_"+currency.value]}, function() {});
                  chrome.tabs.reload();
              }).catch(e => alert(e))
          });
        }
      })
    });
  }
}

const update = document.getElementById("update")
if (update) {
  update.onclick = function () {
    chrome.storage.local.get(['currency'], function (currency) {
      chrome.storage.local.get([currency.value+'toRMB'], function (res) {
        if (res === undefined || JSON.stringify(res) === "{}") {
          // get fetch
          chrome.storage.local.get(['apiKey'], function(key) {
            fetch("https://free.currconv.com/api/v7/convert?q="+currency.value+"_CNY,CNY_"+currency.value+"&compact=ultra&apiKey="+key.apiKey)
                .then(res => res.json())
                .then(data => {
                  // save to local storage
                  chrome.storage.local.set({conversionValue: data["CNY_"+currency.value]}, function() {});
                  chrome.tabs.reload();
                }).catch(e => alert(e))
          });
        }
      })
    })
  }
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

