const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const ObjectsToCsv = require("objects-to-csv");
const fs = require("fs");

// Data Structure
const scrapeResults = [
    {
        name: "Men's Relaxed Fit Strapback Hat",
        brand: "Falari",
        price: 8.5,
        url: "https://www.amazon.com/Falari-Baseball-Adjustable-Solid-G001-01-Black/dp/B074CN1RF8/ref=sr_1_5?crid=17SO003E1ZBDD&keywords=baseball%2Bcaps&qid=1680956026&sprefix=baseball%2Bcaps%2Caps%2C118&sr=8-5&th=1",
        rating: 4.7,
    },
];

let results = [];

async function scrape() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(
        "https://www.amazon.com/s?k=baseball+caps&crid=17SO003E1ZBDD&qid=1681236643&sprefix=baseball+caps%2Caps%2C118&ref=sr_pg_"
    );

    while (
        await page.$(
            ".s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator"
        )
    ) {
        const html = await page.content();
        await sleep(1000); // 1 second sleep
        const $ = cheerio.load(html);

        // using cheerio to scrape the necessary data
        $(".a-section.a-spacing-base.a-text-center")
            .map((index, element) => {
                const nameElement = $(element).find(
                    ".a-size-mini.a-spacing-none.a-color-base.s-line-clamp-2"
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
                results.push(item);
            })
            .get();

        // clicking the next button to deal with pagination scraping
        await page.click(
            ".s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator"
        );
        await page
            .waitForSelector(
                ".s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator",
                { timeout: 2000 } // increase timeout to 10 seconds
            )
            .catch(() => {}); // catch timeout error and continue
    }
    console.log(results);
    await browser.close();
}

// adding a delay
async function sleep(miliseconds) {
    return new Promise((resolve) => setTimeout(resolve, miliseconds));
}

async function createCSV(data) {
    let csv = new ObjectsToCsv(data);

    await csv.toDisk("./baseballCaps.csv");
}

async function createJSON(data) {
    const jsonData = JSON.stringify(data);

    fs.writeFileSync("baseballCaps.json", jsonData);
}

async function scrapeAmazon() {
    await scrape();
    //await createCSV(results);
    await createJSON(results);
}

scrapeAmazon();
