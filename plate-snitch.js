var Horseman = require('node-horseman'),
    cheerio = require('cheerio');

module.exports = {
    // Open form and submit enquire for `rego`
    getInfo: function (rego, res, callback) {
        var horseman = new Horseman();
        horseman
            .userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0')
            .open('https://www.vicroads.vic.gov.au/registration/buy-sell-or-transfer-a-vehicle/buy-a-vehicle/check-vehicle-registration/vehicle-registration-enquiry')
            .waitForSelector('.btn-holder input')
            .type('#registration-number-ctrl input[type=text]', rego)
            .click('.btn-holder input')
            .waitForNextPage({ timeout: 20000 })
            .waitForSelector('.ctrl-holder.ctrl-readonly')
            .html()
            .then(function (body) {
                var pInfo = module.exports.processInfo(body, rego);
                //console.log(pInfo);
                callback(res, pInfo);
                return horseman.close();
            });
    },
    // Scrape the results for key info
    processInfo: function processInfo(html, rego) {
        var $ = cheerio.load(html);
        var vehicle = $('label.label').filter(function () {
            return $(this).text().trim() === 'Vehicle:';
        }).next().text().trim();

        var stolen = $('label.label').filter(function () {
            return $(this).text().trim() === 'Stolen status:';
        }).next().text().trim();

        var registration = $('label.label').filter(function () {
            return $(this).text().trim() === 'Registration status & expiry date:';
        }).next().text().trim();

        return {
            rego,
            vehicle,
            stolen,
            registration
        };
    }
}