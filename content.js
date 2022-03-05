const currencyIcons = {
    "USD":"$",
    "EUR":"€",
    "GBP":"£",
    "RUB":"₽",
}

// listen for changes
setInterval(function()
{
    classOnly();
}, 500);

async function classOnly() {
    while (true) {
        var eles = document.getElementsByClassName('f_Strong');
        if (eles === null || eles === undefined) {
            alert("kinda racey err")
        }
        if (eles.length === 0) {
            await new Promise(r => setTimeout(r, 500));
            eles = document.getElementsByClassName('f_Strong');
        } else {
            break
        }
    }

    for (let i =0; i < eles.length; i++) {
        let price = cleanPrice(eles[i].innerHTML)
        getCurrentCurrency().then(currency => {
            convertRMB(currency.currency, price)
                .then(price => {
                    // handle all elements that typically show up in lists and menus
                    let p = document.getElementsByClassName('f_Strong')[i].parentElement;
                    let li = p.parentElement;
                    li.style.minHeight = "240px";
                    if (li.tagName !== "LI" && li.tagName === "DIV") {
                        price = cleanPrice(document.getElementById("navbar-cash-amount").innerHTML)
                    }
                    btn = buildConvertedCurrency(price, currency)
                    if (!li.innerHTML.includes(btn.innerHTML)) {
                        li.appendChild(btn)
                    }
                }).catch(e => alert(e))
        }).catch(e => {
            alert(e)
        });
    }

    // handle inventory summary if present
    let bi = document.getElementsByClassName("brief-info")
    if (bi.length !== 0 && bi[0].innerHTML !== "") {
        let c = bi[0].innerHTML
        getCurrentCurrency().then(currency => {
            convertRMB(currency.currency, c.split("¥")[1].split("<")[0])
                .then(price => {
                    let btn2 = buildConvertedCurrency(price, currency)
                    btn2.style.textAlign = "right";
                    btn2.className = "c_Yellow"
                    if (!bi[0].innerHTML.includes(btn2.innerHTML)) {
                        bi[0].appendChild(btn2)
                    }
                }).catch(e => {alert(e)})
        }).catch(e => {alert(e)})
    }
}

function cleanPrice(price) {
    price = price.replace("<small>", "")
    price = price.replace("</small>", "")
    price = price.replace("¥", "")
    price = price.replace(" ", "")
    return price
}

function buildConvertedCurrency(price, currency) {
    let p = document.createElement("p")
    p.tagName = "convertedCurrency"
    let t = document.createTextNode(currencyIcons[currency.currency] + " " + price);
    p.appendChild(t);
    return p
}

function getCurrentCurrency() {
    return new Promise(resolve => {
        chrome.storage.local.get(['apiKey'], function(key){
            chrome.storage.local.get(['currency'], function(result) {
                resolve({currency: result.currency, key: key});
            });
        })
    })
}

function convertRMB(toCurrency, price) {
    return new Promise(resolve => {
        chrome.storage.local.get(['storageKey'], function (result) {
            let res = parseFloat(price) * result.storageKey
            resolve(Math.round((res + Number.EPSILON) * 100) / 100);
        })
    });
}