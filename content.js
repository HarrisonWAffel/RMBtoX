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

// constantly check for new
// RMB values to be converted.
setInterval(function() {
    getCurrentCurrency().then(currency => {
        if (currency !== null) {
            AppendConvertedValue(currency)
                .catch(e => {
                    console.log(e)
                });
        }
    });
}, 1250);

async function AppendConvertedValue(currency) {

    var eles = document.getElementsByClassName('f_Strong');
    if (eles.length === 0) {return}

    for (let i =0; i < eles.length; i++) {
        let popup = false;
        let price = cleanPrice(eles[i].innerHTML)
        if (!eles[i].innerHTML.includes("¥")) {
            continue
        }
        let cur = document.getElementsByClassName('f_Strong')[i];
        let p = document.getElementsByClassName('f_Strong')[i].parentElement;
        if (cur.parentElement !== null) {
            if (p.parentElement !== null) {
                if (p.className === "l_Clearfix") {
                    // handle mouse hover over listing dialog
                    price = cleanPrice(cur.innerHTML)
                    popup = true
                }
            }
        }


        convertRMB(currency.currency, price)
            .then(price => {
                // handle all elements that typically show up in lists and menus, including popups
                if (cur.parentElement !== null) {
                    if (p.parentElement !== null) {
                        let li = p.parentElement;
                        let h3 = li.getElementsByTagName("h3");
                        if (h3.length > 0) {
                            li.getElementsByTagName("h3")[0].style.margin = "8px 12px 1px" // reduce spacing of elements to maintain given card size
                        }
                        if (li.tagName !== "LI" && li.tagName === "DIV") {
                            if (!popup) {
                                price = cleanPrice(document.getElementById("navbar-cash-amount").innerHTML)
                            }
                        }
                    }
                }

                var btn = buildConvertedCurrency(price, currency)
                if (btn === null) {return}
                if (!btn.innerHTML.includes("undefined") && btn.innerHTML !== "$0" && !btn.innerHTML.includes("NaN")) { // currency conversion error
                    if (!cur.innerHTML.includes(btn.innerHTML)  // converted currency has already been added
                        && !(cur.innerHTML.includes(currencyIcons["USD"])
                            || cur.innerHTML.includes(currencyIcons["GBP"])
                            || cur.innerHTML.includes(currencyIcons["EUR"])
                            || cur.innerHTML.includes(currencyIcons["RUB"]))
                        ){
                            if (p.innerHTML.includes("on sale") || p.innerHTML.includes("Bargain") ) { // formatting based on card size
                                cur.innerHTML = cur.innerHTML + "</br>" + btn.innerHTML;
                            } else {
                                cur.innerHTML = cur.innerHTML + " | " + btn.innerHTML;
                            }
                        }
                }
            }).catch(e => alert(e))
        }

    // handle inventory summary if present
    let bi = document.getElementsByClassName("brief-info")
    if (bi.length !== 0 && bi[0].innerHTML !== "") {
        convertRMB(currency.currency, bi[0].innerHTML.split("¥")[1].split("<")[0])
            .then(price => {
                let btn2 = buildConvertedCurrency(price, currency)
                if (btn2 === null) {return}
                btn2.style.textAlign = "right";
                btn2.className = "c_Yellow"
                if (!btn2.innerHTML.includes("undefined") && !bi[0].innerHTML.includes(btn2.innerHTML)) {
                    bi[0].appendChild(btn2)
                }
            }).catch(e => {
                console.log(e)
            })
    }


    // handle relative goods if present
    let rg = document.getElementsByClassName("relative-goods")
    if (rg.length > 0) {
        for (let i =0; i < rg[0].children.length; i++) {
            let cur = rg[0].children[i].innerHTML
            let price = cleanPrice(cur.split("¥")[1])
            convertRMB(currency.currency, price)
                .then(price => {
                    let p = buildConvertedCurrency(price, currency)
                    if (!cur.includes(p.innerHTML)) {
                        let x = rg[0].children[i]
                        let left = x.innerHTML.split("¥")[0]
                        rg[0].children[i].innerHTML = left + p.innerHTML
                    }
                })
        }
    }
}

function cleanPrice(price) {
    price = price.replace("<small>", "")
    price = price.replace("</small>", "")
    price = price.replace("<big>", "")
    price = price.replace("</big>", "")
    price = price.replace("¥", "")
    price = price.replace(" ", "")
    return price
}

function buildConvertedCurrency(price, currency) {
    if (price.toLocaleString() === "0") {
        return null
    }
    let p = document.createElement("p")
    p.tagName = "convertedCurrency"
    let t = document.createTextNode(currencyIcons[currency.currency] + "" + price.toLocaleString());
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
        chrome.storage.local.get(['conversionValues'], function (result) {
            let res = parseFloat(price) * result.conversionValues[currencyIndexes[toCurrency]]
            let convertedFloat = Math.round((res + Number.EPSILON) * 100) / 100
            resolve(convertedFloat);
        })
    });
}