import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { startSeoTestServer } from './seo-test-server.mjs';
import { markAnalyticsTest } from './analytics-test-context.mjs';
const server = await startSeoTestServer(); let browser;
try {
 browser = await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH});
 for(const width of [390,1280]) {
  const context=await browser.newContext({viewport:{width,height:900}});
  await markAnalyticsTest(context,{fixture:true});
  await context.route('**/*',r=>new URL(r.request().url()).origin===server.base?r.continue():r.abort());
  let catalogRequests = 0;
  await context.route('**/api/**',r=>{
   const url = new URL(r.request().url());
   let payload = {data:[],hotels:[]};
   if(url.pathname === '/api/hotels' && url.searchParams.has('destination')) {
    catalogRequests++;
    payload = {hotelIds:['service-tabs-fixture'],total:1};
   } else if(url.pathname === '/api/hotels/rates') {
    payload = {data:[{hotelId:'service-tabs-fixture',roomTypes:[{offerId:'tabs-offer',suggestedSellingPrice:{amount:100,currency:'USD'},rates:[]}]}],hotels:[{id:'service-tabs-fixture',name:'Service tabs fixture hotel',stars:5}]};
   }
   return r.fulfill({json:payload});
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const path of ['/?lang=tr','/hotels?lang=tr']) {
   await page.goto(server.base+path);
   const tabs=page.locator('.travelServiceTabs');await tabs.waitFor();
   assert.equal(await tabs.getByRole('tab').count(),4);
   await page.locator('.travelSearchCard button[type=submit]').click();
   await page.locator('.travelHotelResults').waitFor({state:'visible'});
   assert.equal(await page.locator('.travelHotelResults .travelHotelCard').count(),1);
   const requestsAfterSearch = catalogRequests;
   for(const key of ['flights','cars','activities','hotels']) {
    await page.locator('#service-tab-'+key).click();
    assert.equal(await page.locator('#service-tab-'+key).getAttribute('aria-selected'),'true');
    await page.locator('#service-panel-'+key).waitFor({state:'visible'});
    assert.equal(await page.locator('[role=tabpanel]:visible').count(),1);
    assert.equal(await page.locator('.travelHotelResults:visible').count(),key === 'hotels' ? 1 : 0);
   }
   assert.equal(catalogRequests,requestsAfterSearch,'Returning to hotels preserves the existing results without a new search');
   await page.locator('#service-tab-hotels').press('ArrowRight');
   assert.equal(await page.locator('#service-tab-flights').getAttribute('aria-selected'),'true');
   await page.locator('#service-tab-hotels').click();
   assert.equal(await page.locator('.travelSearchCard:visible').count(),1);
   assert.equal(await page.locator('.hotelCatalogSearch:visible').count(),1);
  }
  assert.deepEqual(errors,[]);await context.close();console.log('All four service tabs and keyboard switching passed on homepage/hotels:',width);
 }
} finally {await browser?.close();await server.close();}
