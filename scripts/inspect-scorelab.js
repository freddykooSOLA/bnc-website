const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('scorelab_sample.html', 'utf8');
const $ = cheerio.load(html);

// 查找 __NEXT_DATA__
const nextData = $('#__NEXT_DATA__').html();
if (nextData) {
  const data = JSON.parse(nextData);
  const pp = data.props?.pageProps || {};
  console.log('pageProps keys:', Object.keys(pp));
  fs.writeFileSync('scorelab_pageprops.json', JSON.stringify(pp, null, 2));
  console.log('Saved pageProps to scorelab_pageprops.json');
} else {
  console.log('No __NEXT_DATA__ found');
}

// 查找表格
const tables = $('table');
console.log('Tables found:', tables.length);
tables.each((i, el) => {
  const headers = [];
  $(el).find('th').each((_, th) => headers.push($(th).text().trim()));
  console.log(`Table ${i}: headers=`, headers.slice(0, 10));
});
