const puppeteer = require('puppeteer');
const _ = require('lodash');
var Datastore = require('nedb');

const db = new Datastore({ filename: './main.db' });
const rootURL = 'https://www.hyundaicommercial.com/ass/db/assdb0101page.hc#';
const waitTime = 3000;

db.loadDatabase(function(e) {
  if (Boolean(e)) return console.log(e);
  (async () => {
    console.log('starting');
    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
    const page = await browser.newPage();
    await page.goto(rootURL, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, waitTime));
  
    const firstSteps = await page.evaluate(() => {
      return Array.from(document.getElementsByTagName('td'))
        .map(x=>({
          onclick: x.getAttribute('onclick'),
          text: x.innerText,
          sibling: x.previousSibling?.innerText,
        }))
        .filter(x=>x.onclick && x.onclick.indexOf('searchStep2') > -1);
    });
  
    for (const firstStep of _.shuffle(firstSteps)) {
      console.log('1.', firstStep.sibling, firstStep.text);
      await page.evaluate(cmd => eval(cmd), firstStep.onclick);
      await new Promise(r => setTimeout(r, waitTime));
  
      const secondSteps = await page.evaluate(() => {
        return Array.from(document.getElementsByTagName('tr'))
          .map(x=>({
            onclick: x.getAttribute('onclick'),
            short: x.innerText.split('\t')[0],
            text: x.innerText.split('\t')[1],
          }))
          .filter(x=>x.onclick && x.onclick.indexOf('searchStep3') > -1);
      });
  
      for (const secondStep of _.shuffle(secondSteps)) {
        console.log('\t2.', secondStep.text, `(${secondStep.short})`);
        await page.evaluate(cmd => eval(cmd), secondStep.onclick);
        await new Promise(r => setTimeout(r, waitTime));
  
  
        const thirdSteps = await page.evaluate(() => {
          return Array.from(document.getElementsByTagName('tr'))
            .map(x=>({
              onclick: x.getAttribute('onclick'),
              text: x.innerText,
            }))
            .filter(x=>x.onclick && x.onclick.indexOf('searchStep4') > -1);
        });
  
        for (const thirdStep of _.shuffle(thirdSteps)) {
          console.log('\t\t3.', thirdStep.text);
          await page.evaluate(cmd => eval(cmd), thirdStep.onclick);
          await new Promise(r => setTimeout(r, waitTime));
  
  
          const fourthSteps = await page.evaluate(() => {
            return Array.from(document.getElementsByTagName('tr'))
              .map(x=>({
                onclick: x.getAttribute('onclick'),
                short: x.innerText.split('\t')[0],
                text: x.innerText.split('\t')[1],
              }))
              .filter(x=>x.onclick && x.onclick.indexOf('searchStep5') > -1);
          });
  
          for (const fourthStep of _.shuffle(fourthSteps)) {
            console.log('\t\t\t4.', fourthStep.text, `(${fourthStep.short})`);
            await page.evaluate(cmd => eval(cmd), fourthStep.onclick);
            await new Promise(r => setTimeout(r, waitTime));
  
            const fifthSteps = await page.evaluate(() => {
              return Array.from(document.getElementsByTagName('tr'))
                .map(x=>({
                  onclick: x.getAttribute('onclick'),
                  short: x.innerText.replaceAll('\n', '').split('\t')[0],
                  text: x.innerText.replaceAll('\n', '').split('\t')[1],
                }))
                .filter(x=>x.onclick && x.onclick.indexOf('searchStep6') > -1);
            });
  
            for (const fifthStep of _.shuffle(fifthSteps)) {
              console.log('\t\t\t\t5.', fifthStep.text, `(${fifthStep.short})`);
              await page.evaluate(cmd => eval(cmd), fifthStep.onclick);
              await new Promise(r => setTimeout(r, waitTime));
  
  
              const sixthSteps = await page.evaluate(() => {
                const id = 'rstArea6';
                return Array.from(document.getElementById(id).getElementsByTagName('tr'))
                  .map(x=>{
                    const texts = Array.from(x.getElementsByTagName('td')).map(y => y.innerText);
                    return {
                      year: texts[0],
                      mainPrice: texts[1],
                      privatePrice: texts[2],
                    };
                  });
              });
  
              console.log('sixthSteps', sixthSteps);
  
              for (const sixthStep of sixthSteps) {
                const item = {
                  _id: `${firstStep.sibling} ${firstStep.text} ${secondStep.text} (${secondStep.short}) ${thirdStep.text} ${fourthStep.text} (${fourthStep.short}) ${fifthStep.text} (${fifthStep.short}) ${sixthStep.year} ${sixthStep.mainPrice} ${sixthStep.privatePrice}`,
                  category1: firstStep.sibling,
                  category2: firstStep.text,
                  maker: `${secondStep.text} (${secondStep.short})`,
                  category3: thirdStep.text,
                  standard: `${fourthStep.text} (${fourthStep.short})`,
                  vehicleType: `${fifthStep.text} (${fifthStep.short})`,
                  ...sixthStep,
                };
                console.log('----trying to insert...');
                db.insert(item, function(err, doc) {
                  console.log('inside the db function');
                  if (Boolean(err)) return console.log(err);
                  console.log('Inserted', doc._id);
                });
                console.log('----trying to insert...');
              }
            }
          }
        }
      }
    }
    await browser.close();
    console.log('finished');
  })();
});

