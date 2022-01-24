const puppeteer = require('puppeteer');
const path = require('path');
const downloadPath = path.resolve('./paaps_timeout');
const paapsJSON = require('./paaps.json');

const paapsStringify = JSON.stringify(paapsJSON);
const paaps = JSON.parse(paapsStringify);
console.log(paaps.length);

// verify if there are duplicates
if (paaps.length !== [...new Set(paaps.map(pap => pap.paapId))].length) {
	throw new Error('There are duplicates');
};

async function getPaps() {
	const browser = await puppeteer.launch({
		headless: false
	});
	
	const downloadPdfFromRoute = async (id) => {
		const page = await browser.newPage();

		await page.goto(
			`http://e-licitatie.ro/pub/acquisition-plan/view/${id}`, 
			{ waitUntil: 'networkidle2' }
		);
		
		await page._client.send('Page.setDownloadBehavior', {
			behavior: 'allow',
			downloadPath: downloadPath,
			waitUntil: 'networkidle2'
		});
	
		await page.click('button[button-type="Print"]');
		await page.waitForTimeout(2500);
		await page.close();
	}

	for (const paap of paaps) {
		let paapId = paap.paapId;

		await downloadPdfFromRoute(paapId);
	}

	await page.waitForTimeout(10000);

	browser.close();
}

getPaps();