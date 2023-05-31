const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

async function scrapeJobOffers() {
  const url =
    "https://www.externatic.fr/offre-emploi/?keywords=&region=&distance=5&facet_offrescategories=php%2Cautres-technologies";
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);

  const jobOffers = [];

  $(".offer-search--item").each(async (index, element) => {
    const jobTitle = $(element).find(".offer-search--item--text strong").text();
    const location = $(element)
      .find(".offer-search--item--text")
      .contents()
      .last()
      .text()
      .trim();
    const offerLink = $(element)
      .find(".offer-search--item--title a")
      .attr("href");

    try {
      const offerResponse = await axios.get(offerLink);
      const offerHtml = offerResponse.data;
      const $offer = cheerio.load(offerHtml);
      let description = $offer(".offer-content--body").text();
      description = description.replace(/\n|\t|\r/g, "").trim();

      const jobOffer = {
        jobTitle,
        location,
        offerLink,
        description,
      };

      jobOffers.push(jobOffer);
      saveJobOffersToFile(jobOffers);
    } catch (error) {
      console.error(`Failed to fetch description for job offer: ${jobTitle}`);
      console.error(error);
    }
  });
}

function saveJobOffersToFile(jobOffers) {
  const json = JSON.stringify(jobOffers, null, 2);
  fs.writeFile("job-offers.json", json, "utf8", (error) => {
    if (error) {
      console.error("Failed to save job offers to file.");
    } else {
      console.log("Job offers saved to file.");
    }
  });
}

scrapeJobOffers();
