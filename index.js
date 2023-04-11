const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const scrapeResults = [
    {
        name: "Men's Relaxed Fit Strapback Hat",
        brand: "Falari",
        price: 8.5,
        url: "https://www.amazon.com/Falari-Baseball-Adjustable-Solid-G001-01-Black/dp/B074CN1RF8/ref=sr_1_5?crid=17SO003E1ZBDD&keywords=baseball%2Bcaps&qid=1680956026&sprefix=baseball%2Bcaps%2Caps%2C118&sr=8-5&th=1",
        rating: 4.7,
    },
];

(async () => {
    const link =
        "https://www.amazon.com/s?k=baseball+caps&crid=17SO003E1ZBDD&sprefix=baseball+caps%2Caps%2C118&ref=nb_sb_noss_1";

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(link);

    const html = await page.content();
    const $ = cheerio.load(html);

    //$(".a-price").each((index, element) => {
    //extract the price only
    //var priceArray = $(element).text().split("$");
    //var price = priceArray[1];
    //console.log("Price: " + price);
    //});

    // cent price
    // $(".a-price-fraction").each((index, element) =>
    //     console.log($(element).text())
    // );

    // $(
    //     ".a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal"
    // ).each((index, element) => {
    //     // begin each url with "amazon.com"
    //     // var url = "amazon.com" + $(element).attr("href");
    //     //console.log(url, "\n");
    // });

    // The brand
    // $(".s-line-clamp-1").each((index, element) => {
    //     var brand = $(element).text();
    //     console.log("Brand: " + brand);
    // });

    // The name of the item
    // $(".a-size-mini.a-spacing-none.a-color-base.s-line-clamp-2").each(
    //     (index, element) => {
    //         var name = $(element).text();
    //         console.log("Name: " + name);
    //     }
    // );

    // $(".a-row.a-size-small").each((index, element) => {
    //     // Extract just the first 3 characters (4.7, 3.8, etc)
    //     var rating = $(element).text().slice(0, 3);
    //     //console.log("Rating: " + rating);
    // });

    const results = $(".a-section.a-spacing-base.a-text-center")
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

            return { name, brand, price, rating, image, url };
        })
        .get();

    console.log(results);

    await browser.close();
})();
