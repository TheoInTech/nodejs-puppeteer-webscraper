const puppeteer = require("puppeteer");

(async () => {
    // Extract partners on the page, recursively check the next page in the URL pattern
    const extractPartners = async url => {
        // Scrape the data we want
        const page = await browser.newPage();
        await page.goto(url);
        const partnersOnPage = await page.evaluate(() =>
            Array.from(document.querySelectorAll("div.product-item")).map(
                compact => ({
                    title: compact
                        .querySelector("div.info a.name")
                        .innerText.trim(),
                    thumbnail: compact.querySelector(".photo-box img").src,
                    price: compact.querySelector("span.price").innerText.trim()
                })
            )
        );
        await page.close();

        // Recursively scrape the next page
        if (partnersOnPage.length < 1) {
            // Terminate if no partners exist
            return partnersOnPage;
        } else {
            // Go fetch the next page ?page=X+1
            const nextPageNumber = parseInt(url.match(/p=(\d+)$/)[1], 10) + 1;
            const nextUrl = `https://www.harveynorman.com.au/computers-tablets/computers/laptops?p=${nextPageNumber}`;

            return partnersOnPage.concat(await extractPartners(nextUrl));
        }
    };

    const browser = await puppeteer.launch();
    const firstUrl =
        "https://www.harveynorman.com.au/computers-tablets/computers/laptops?p=1";
    const partners = await extractPartners(firstUrl);

    // Todo: Update database with partners
    console.log(partners);

    await browser.close();
})();
