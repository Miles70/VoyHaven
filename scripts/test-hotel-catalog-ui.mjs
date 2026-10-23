import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { startSeoTestServer } from './seo-test-server.mjs';
import { markAnalyticsTest } from './analytics-test-context.mjs';
import copy from '../src/i18n/hotelCatalogTranslations.js';
import { supportedLanguages } from '../shared/languages.js';
assert.deepEqual(Object.keys(copy).sort(), [...supportedLanguages].sort());
const server = await startSeoTestServer(); let browser;
try {
 browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH });
 for (const [width, lang] of [[390,'tr'],[1280,'en'],[390,'ar']]) {
  const context = await browser.newContext({ viewport:{width,height:900} });
  await markAnalyticsTest(context,{fixture:true});
  const requests=[];
  await context.route('**/*',route=>new URL(route.request().url()).origin===server.base?route.continue():route.abort());
  await context.route('**/api/**',route=>{
   const url=new URL(route.request().url());
   let payload={data:[],hotels:[]};
   if(url.pathname==='/api/hotels/catalog-search'){
    requests.push(url); const offset=Number(url.searchParams.get('offset'));
    payload={data:[{id:offset?'lpsecond':'lpfirst',name:offset?'Second Hotel':'Fixture Hotel',city:'Tokyo',country:'JP'}],hasMore:offset===0,nextOffset:offset+20};
   }
   return route.fulfill({json:payload});
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(server.base+'/?lang='+lang);
  const root=page.locator('.hotelCatalogSearch');await root.waitFor();
  await root.getByRole('searchbox').fill('Fixture');
  assert.equal(requests.length,0);
  await root.getByRole('button',{name:copy[lang][2],exact:true}).click();
  await root.getByRole('link',{name:/Fixture Hotel/}).waitFor();
  assert.deepEqual([...requests[0].searchParams.keys()].sort(),['offset','q']);
  assert.equal(await root.locator('input[type=date]').count(),0);
  await root.getByRole('button',{name:copy[lang][7],exact:true}).click();
  await root.getByRole('link',{name:/Second Hotel/}).waitFor();
  assert.equal(requests[1].searchParams.get('offset'),'20');
  assert.equal(await root.getByRole('link',{name:/Second Hotel/}).getAttribute('href'),'/travel/hotels/lpsecond?lang='+lang);
  const bounds=await root.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1);
  assert.deepEqual(errors,[]);
  if(lang==='tr')await page.screenshot({path:'/tmp/hotel-catalog-mobile.png',fullPage:false});
  await context.close();console.log('Catalog name search without dates and pagination passed:',width,lang);
 }
} finally {await browser?.close();await server.close();}
