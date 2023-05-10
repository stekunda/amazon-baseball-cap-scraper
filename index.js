const cheerio = require("cheerio");
const puppeteerExtra = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");

const ObjectsToCsv = require("objects-to-csv");
const fs = require("fs");

let results = [];

async function timeout(delayInterval) {
    console.log(`Delaying for ${delayInterval} ms...`);
    return new Promise((resolve) => setTimeout(resolve, delayInterval));
}

async function scrape() {
    puppeteerExtra.use(stealthPlugin());
    const browser = await puppeteerExtra.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(
        "https://www.amazon.com/s?k=baseball+caps&crid=17SO003E1ZBDD&qid=1681275046&sprefix=baseball+caps%2Caps%2C118&ref=sr_pg_1"
    );

    while (
        await page.$(
            ".s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator"
        )
    ) {
        const html = await page.content();

        // Choose a random delay interval from the provided options
        const delayOptions = [
            1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 15000,
            20000, 25000, 30000,
        ];
        const delayInterval =
            delayOptions[Math.floor(Math.random() * delayOptions.length)];

        await timeout(delayInterval); // Sleeps for a random amount of time
        const $ = cheerio.load(html);

        // using cheerio to scrape the necessary data
        $(".sg-col-inner")
            .map((index, element) => {
                const nameElement = $(element).find(
                    ".a-size-base-plus.a-color-base.a-text-normal"
                );
                const brandElement = $(element).find(".s-line-clamp-1");
                const priceElement = $(element).find(".a-price");
                const urlElement = $(element).find(
                    ".a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal"
                );
                const ratingElement = $(element).find(".a-row.a-size-small");
                const imgElement = $(element).find(".s-image");

                const name = $(nameElement).text();
                const brand = $(brandElement).text();
                const priceArray = $(priceElement).text().split("$");
                const price = priceArray[1];
                const url = "amazon.com" + $(urlElement).attr("href");
                const rating = $(ratingElement).text().slice(0, 3);
                const image = $(imgElement).attr("src");

                const item = { name, brand, price, rating, image, url };

                if (item.name != "") {
                    results.push(item);
                }
            })
            .get();

        // clicking the next button to deal with pagination scraping
        await page.click(
            ".s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator"
        );
        await page
            .waitForSelector(
                ".s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator",
                { timeout: 2000 } // increase timeout to 2 seconds
            )
            .catch(() => {}); // catch timeout error and continue
    }
    console.log(results);
    await browser.close();
}

async function createCSV(data) {
    let csv = new ObjectsToCsv(data);

    await csv.toDisk("./data.csv");
}

async function createJSON(data) {
    const jsonData = JSON.stringify(data);

    fs.writeFileSync("data.json", jsonData);
}

async function scrapeAmazon() {
    await scrape();
    //await createCSV(results);
    await createJSON(results);
}

scrapeAmazon();
