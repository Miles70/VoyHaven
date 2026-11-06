import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { startSeoTestServer } from './seo-test-server.mjs';
import { markAnalyticsTest } from './analytics-test-context.mjs';
import copy from '../src/i18n/accommodationTranslations.js';
import { supportedLanguages } from '../shared/languages.js';
const server=await startSeoTestServer();let browser;
try {
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-gpu','--disable-software-rasterizer','--no-zygote','--single-process']});
  const context=await browser.newContext({viewport:{width:390,height:844}});
  await markAnalyticsTest(context,{fixture:true});
  await context.addInitScript(()=>Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition(success){success({coords:{latitude:36.9,longitude:30.7}});}}}));
  await context.route('**/*',r=>new URL(r.request().url()).origin===server.base?r.continue():r.abort());
  const calls=[];const types=new Map();
  await context.route('**/api/**',async r=>{
    const url=new URL(r.request().url());let payload={data:[],hotels:[]};
    if(url.pathname==='/api/hotels'&&(url.searchParams.has('destination')||url.searchParams.has('latitude'))){
      calls.push(url);
      if (url.searchParams.get('destination') === 'Emptyville') { await r.fulfill({json:{hotelIds:'',total:0,data:[]}}); return; }
      const type=Number(url.searchParams.get('hotelTypeIds'))||204;
      const ids=[0,1,2].map(i=>`${type}-${url.searchParams.get('offset')||0}-${i}`);
      ids.forEach(id=>types.set(id,type));
      payload={hotelIds:ids,total:6,data:ids.map(id=>({id,hotelTypeId:type})),location:{...(url.searchParams.has('latitude')?{latitude:36.9,longitude:30.7,radius:10000}:{}),hotelTypeIds:url.searchParams.get('hotelTypeIds')||undefined}};
    } else if(url.pathname==='/api/hotels/rates') {
      const body=r.request().postDataJSON();
      payload={data:body.hotelIds.map((id,i)=>({hotelId:id,roomTypes:[{offerId:`offer-${id}`,suggestedSellingPrice:{amount:[100,9,35][i],currency:'USD'},rates:[]}]})),hotels:body.hotelIds.map(id=>({id,name:`Fixture ${id}`,stars:4,rating:8.5}))};
    }
    await r.fulfill({json:payload});
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const lang of supportedLanguages){
    await page.goto(`${server.base}/?lang=${lang}`);
    const field=page.getByLabel(copy[lang].label,{exact:true});await page.locator('.travelSearchCard').waitFor({timeout:5000}).catch(async error=>{console.log({errors,body:(await page.locator('body').innerText()).slice(0,1000),url:page.url()});throw error;});
    await field.waitFor();
    assert.equal(await field.locator('option').count(),16);
    assert.equal(await page.locator('.travelStayCategories button').count(),8);
    assert.equal(await page.locator('.travelStayCategories button[aria-pressed="true"]').count(),1);
    assert.equal(await field.locator('option[value="219"]').textContent(),copy[lang].types[219]);
    assert.equal(await page.evaluate(()=>globalThis.document.documentElement.scrollWidth<=globalThis.innerWidth),true,`${lang} mobile overflow`);
  }
  for(const width of [390,1280]){
    await page.setViewportSize({width,height:900});
    await page.goto(`${server.base}/?lang=tr`);
    const field=page.getByLabel(copy.tr.label,{exact:true});
    const destination=page.locator('.travelSearchCard input[type=text]');
    assert.equal(await destination.inputValue(),'');
    const savedCheckout=await page.locator('.travelSearchCard input[type=date]').nth(1).inputValue();
    await page.locator('.travelSearchCard input[type=date]').nth(1).fill('');

    await page.locator('.travelStayCategories').getByRole('button',{name:copy.tr.types[219],exact:true}).click();
    await page.locator('.travelResultDestination input[type=search]').waitFor();
    assert.equal(new URL(page.url()).pathname,'/');
    assert.equal(await destination.inputValue(),'');
    assert.equal(await page.locator('.travelHotelCard').count(),0);
    const initialSort=page.locator('.travelResultControls select').last();
    await initialSort.selectOption('priceAsc');
    await page.locator('.travelFilterFields input[type=number]').fill('50');
    await page.locator('.travelFilterFields input[type=search]').fill('Fixture');
    await page.locator('.travelFilterFields select').nth(0).selectOption('4');
    await page.locator('.travelFilterFields select').nth(1).selectOption('8');
    assert.equal(await page.locator('.travelResultDestination input[type=date]').count(),2);
    assert.equal(await page.locator('.travelResultDestination input[type=date]').nth(1).inputValue(),'');
    await page.locator('.travelResultDestination input[type=date]').nth(1).fill(savedCheckout);
    await page.locator('.travelResultDestination input[type=search]').fill('Antalya');
    await page.locator('.travelResultDestination input[type=search]').press('Enter');
    await page.locator('.travelHotelCard').first().waitFor();
    assert.equal(await field.inputValue(),'219');
    assert.equal(new URL(page.url()).pathname,'/');
    assert.equal(calls.at(-1).searchParams.get('hotelTypeIds'),'219');
    await page.waitForFunction(() => { const top=globalThis.document.querySelector('.travelHotelResults').getBoundingClientRect().top; return top >= 0 && top < 250; });
    assert.equal(await page.locator('.travelHotelCard').count(),2);
    assert.equal(await page.locator('.travelFilterFields input[type=number]').inputValue(),'50');
    assert.equal(await page.locator('.travelFilterFields input[type=search]').inputValue(),'Fixture');
    assert.equal(await page.locator('.travelFilterFields select').nth(0).inputValue(),'4');
    assert.equal(await page.locator('.travelFilterFields select').nth(1).inputValue(),'8');
    await page.locator('.travelFilterFields input[type=number]').fill('');
    await page.locator('.travelFilterFields input[type=search]').fill('');
    await page.locator('.travelFilterFields select').nth(0).selectOption('');
    await page.locator('.travelFilterFields select').nth(1).selectOption('');
    assert.deepEqual(await page.locator('.travelAccommodationBadge').allTextContents(),Array(3).fill(copy.tr.types[219]));
    const sort=page.locator('.travelResultControls select').last();
    assert.equal(await sort.inputValue(),'priceAsc');
    assert.match(await page.locator('.travelHotelPrice strong').first().innerText(),/9/);
    const formSort=page.locator('.travelSearchCard select').filter({has:page.locator('option[value="priceAsc"]')});
    const callsBeforeSorting=calls.length;
    await formSort.selectOption('priceDesc');
    assert.equal(await sort.inputValue(),'priceDesc');
    assert.match(await page.locator('.travelHotelPrice strong').first().innerText(),/100/);
    await formSort.selectOption('priceAsc');
    assert.equal(await sort.inputValue(),'priceAsc');
    assert.match(await page.locator('.travelHotelPrice strong').first().innerText(),/9/);
    assert.equal(calls.length,callsBeforeSorting,'Sorting loaded results must not issue a new search');
    await sort.selectOption('priceDesc');
    assert.equal(await formSort.inputValue(),'priceDesc');
    assert.match(await page.locator('.travelHotelPrice strong').first().innerText(),/100/);
    await sort.selectOption('priceAsc');
    assert.match(await page.locator('.travelHotelPrice strong').first().innerText(),/9/);
    const cityField=page.locator('.travelResultDestination input[type=search]');
    await cityField.fill('Barcelona');
    await cityField.press('Enter');
    await page.locator('.travelHotelCard').first().waitFor();
    assert.equal(calls.at(-1).searchParams.get('destination'),'Barcelona');
    assert.equal(calls.at(-1).searchParams.get('hotelTypeIds'),'219');
    assert.equal(await formSort.inputValue(),'priceAsc');
    assert.equal(await sort.inputValue(),'priceAsc');
    assert.match(await page.locator('.travelHotelPrice strong').first().innerText(),/9/);
    await cityField.fill('Paris');
    await page.locator('.travelResultDestination button').click();
    await page.locator('.travelHotelCard').first().waitFor();
    assert.equal(calls.at(-1).searchParams.get('destination'),'Paris');
    assert.equal(calls.at(-1).searchParams.get('hotelTypeIds'),'219');
    await page.locator('.travelLoadMoreButton').click();
    await page.waitForFunction(()=>globalThis.document.querySelectorAll('.travelHotelCard').length===6);
    assert.equal(calls.at(-1).searchParams.get('hotelTypeIds'),'219');
    assert.equal(calls.at(-1).searchParams.get('offset'),'3');
    assert.deepEqual(await page.locator('.travelAccommodationBadge').allTextContents(),Array(6).fill(copy.tr.types[219]));
    await field.selectOption('201');
    await page.locator('.travelNearbyButton').click();
    await page.waitForFunction(()=>globalThis.document.querySelector('.travelAccommodationBadge')?.textContent==='Daire');
    assert.equal(calls.at(-1).searchParams.get('hotelTypeIds'),'201');
    assert.equal(calls.at(-1).searchParams.get('latitude'),'36.9');
    assert.deepEqual(await page.locator('.travelAccommodationBadge').allTextContents(),Array(3).fill(copy.tr.types[201]));
    await page.locator('.travelFilterSummary button').click();
    assert.equal(await sort.inputValue(),'recommended');
    assert.equal(await formSort.inputValue(),'recommended');
    assert.equal(await field.inputValue(),'201');
    // Every visible category uses the same isolated search and price controls.
    for (const type of ['', '204', '219', '201', '203', '216', '213', '206']) {
      await page.locator('.travelStayCategories').getByRole('button',{name:type ? copy.tr.types[type] : copy.tr.all,exact:true}).click();
      assert.equal(await field.inputValue(),type);
      await page.waitForFunction(expected => globalThis.document.querySelector('.travelAccommodationBadge')?.textContent === expected, copy.tr.types[type || '204']);
      assert.equal(calls.at(-1).searchParams.get('hotelTypeIds'),type || null);
      await sort.selectOption('priceDesc');
      assert.match(await page.locator('.travelHotelPrice strong').first().innerText(),/100/);
      await sort.selectOption('priceAsc');
      assert.match(await page.locator('.travelHotelPrice strong').first().innerText(),/9/);
    }
    await cityField.fill('Emptyville');
    await cityField.press('Enter');
    await page.locator('.travelFilterEmpty').waitFor();
    assert.match(await page.locator('.travelFilterEmpty').innerText(),/müsait yer bulunamadı/);
    assert.equal(await page.locator('.travelHotelCard').count(),0);
    assert.equal(await cityField.isVisible(),true);
    await cityField.fill('Paris');
    await cityField.press('Enter');
    await page.locator('.travelHotelCard').first().waitFor();
    await page.screenshot({path:`/tmp/voyhaven-accommodation-${width}.png`,fullPage:true});
    console.log(`Passed ${width}px: type request, URL, metadata, pagination, nearby, both price orders and reset.`);
  }
  assert.deepEqual(errors,[]);console.log('All 18 languages render without overflow or runtime errors.');
} finally {await browser?.close();await server.close();}
