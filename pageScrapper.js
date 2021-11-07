const Product = require('./Schema/product')

const validation = (str, config) => {
  switch (config) {
    case 'num': {
      return str.replace(/\D/g, "")
    }
    case 'str': {
      return str.replace(/\d/g, "")
    }
    default: {
      return str
    }
  }
}

const getDOMList = (arrSelectors, replaceConfig) => {
  const result = [];
  arrSelectors.forEach(selector => {
    const nodeElements = document.querySelectorAll(selector);
    if (nodeElements) {
      for (const node of nodeElements) {
        const innerNode = node.innerText;
        result.push(validation(innerNode, replaceConfig))
      }
    }
  })

  return result
};


const startScrapper = async (browser, arrReq, startFunc, index) => {
  const page = await browser.newPage();

  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  await page.setRequestInterception(true);
  page.on('request', (interceptedRequest) => {
    if (
      interceptedRequest.url().endsWith('.png') ||
      interceptedRequest.url().endsWith('.jpg')
    )
      interceptedRequest.abort();
    else {
      interceptedRequest.continue()
    }
    ;
  });

  let countPosition = 1
  const saveToMongoDB = (obj) => {
    if (!obj) return;

    if (obj.data.products){

     const findItemIndex = obj.data.products.findIndex(item => {
       return  item.id === arrReq[index].id
      })

      if (findItemIndex !== -1){
        const newProduct = new Product({
          product: obj.data.products[findItemIndex],
          position: countPosition + findItemIndex
        })
        newProduct.save((err, data) => {
          if (err) return res.json({Error: err});
          return obj.data;
        })
        countPosition = 0
        page.close()
      } else {
        countPosition += 100
      }
    } else return
  }

  await page.on('response', async (response) => {
    const url = await response.url()
    if (url.includes('=popular') || url.includes('preset=')) {
      const bodyString = await response.text()
      const body = JSON.parse(bodyString)
      await saveToMongoDB(body)
    }
  })

  await page.goto(arrReq[index].url);
  return page
}

const arrAndrey = [
  {
    url:'https://www.wildberries.ru/catalog/0/search.aspx?search=%D1%84%D0%BE%D1%80%D0%BC%D0%B0+%D0%B4%D0%BB%D1%8F+%D0%B2%D1%8B%D0%BF%D0%B5%D1%87%D0%BA%D0%B8',
    id: 9670277,
  },
  {
    url:'https://www.wildberries.ru/catalog/0/search.aspx?sort=popular&search=%D0%BA%D0%BE%D1%80%D0%B7%D0%B8%D0%BD%D0%B0+%D0%B4%D0%BB%D1%8F+%D1%82%D0%B5%D1%81%D1%82%D0%B0',
    id: 30396942,
  },
  {
    url:'https://www.wildberries.ru/catalog/0/search.aspx?sort=popular&search=%D0%B6%D0%B5%D0%BD%D1%81%D0%BA%D0%B0%D1%8F+%D1%80%D1%83%D0%B1%D0%B0%D1%88%D0%BA%D0%B0+%D0%B2+%D0%BA%D0%BB%D0%B5%D1%82%D0%BA%D1%83',
    id: 46205196,
  },
  {
    url:'https://www.wildberries.ru/catalog/0/search.aspx?sort=popular&search=%D0%BF%D0%B5%D0%BA%D0%B0%D1%80%D1%81%D0%BA%D0%B8%D0%B9+%D0%BD%D0%BE%D0%B6',
    id: 27098160,
  },
  {
    url:'https://www.wildberries.ru/catalog/0/search.aspx?search=%D1%80%D1%83%D1%87%D0%BD%D0%B0%D1%8F+%D0%BE%D0%B2%D0%BE%D1%89%D0%B5%D1%80%D0%B5%D0%B7%D0%BA%D0%B0',
    id: 45461976,
  },
  {
    url:'https://www.wildberries.ru/catalog/0/search.aspx?search=%D1%80%D1%83%D1%87%D0%BD%D0%B0%D1%8F+%D0%BE%D0%B2%D0%BE%D1%89%D0%B5%D1%80%D0%B5%D0%B7%D0%BA%D0%B0',
    id: 45461976,
  },
]



const scraperObject = {
  url: 's',
  async scraper(browser, index = 0) {

    const page = await startScrapper(browser, arrAndrey, this.scraper, index)
    let flag = true
    while (flag) {

      await page.waitForSelector(".product-card-list .price-commission__current-price", {visible: true}).then(() => {
      }).catch(() => {
        page.close()
      })

      await page.waitForSelector('.pagination-next.pagination__next', {visible: true, timeout: 2000})
        .then(() => {
        }).catch(() => {
          page.close();
          this.scraper(browser, index += 1)
        })

      await Promise.all([
        page.waitFor(700),
        page.waitForNavigation({waitUntil: "domcontentloaded", timeout: 2000}).catch(() => {
          // page.close()
          // this.scraper(browser,i)
        }),
        page.click('.pagination-next.pagination__next'),
      ]);
    }
  }
}

module.exports = scraperObject;
