/** Validate only explicitly supplied new or edited posts; never rewrites content. */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
const args=process.argv.slice(2),publish=args.includes('--publish');
const files=args.filter(a=>!a.startsWith('--'));
if(!files.length){console.error('Usage: node scripts/validate-post.mjs src/content/blog/slug.md [--publish]');process.exit(1);}
const destinations=new Set(['main','kerama','miyako','yaeyama','kume']);
const experiences=new Set(['ocean','culture','food','nature']);
let errors=0;
for(const filename of files){
 const fail=msg=>{console.error(`ERROR ${filename}: ${msg}`);errors++;};
 try{
  const absolute=path.resolve(filename),root=path.resolve('src/content/blog')+path.sep;
  if(!absolute.startsWith(root)||!filename.endsWith('.md')){fail('New automated posts must be .md files under src/content/blog/.');continue;}
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(path.basename(filename)))fail('Use a lowercase kebab-case English filename.');
  const {data:d,content}=matter(fs.readFileSync(absolute,'utf8'));
  for(const field of ['title','description','heroImage','heroAlt','imageCredit','imageSource'])if(typeof d[field]!=='string'||!d[field].trim())fail(`${field} is required.`);
  if(!destinations.has(d.destination))fail('destination must be main, kerama, miyako, yaeyama or kume.');
  if(!Array.isArray(d.experiences)||!d.experiences.length||d.experiences.some(x=>!experiences.has(x)))fail('experiences must contain ocean, culture, food and/or nature.');
  if(typeof d.draft!=='boolean')fail('draft must be an explicit boolean.');
  if(typeof d.pubDate!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:Z|[+-]\d\d:\d\d)$/.test(d.pubDate)||Number.isNaN(Date.parse(d.pubDate)))fail('pubDate must be a quoted ISO datetime with timezone.');
  if(publish&&d.draft)fail('Cannot publish a draft.');
  if(publish&&Date.parse(d.pubDate)>Date.now())fail('Future publication date. Wait and rebuild, or correct the date.');
  if(d.updatedDate&&Number.isNaN(Date.parse(d.updatedDate)))fail('updatedDate is invalid.');
  if(content.trim().split(/\s+/).length<100)fail('Article body is too short: provide at least 100 words.');
  if(/\b(TODO|PLACEHOLDER|LOREM IPSUM)\b/i.test(content))fail('Remove placeholder text.');
  if(/^#\s/m.test(content))fail('Start body headings at ##; the article title is already the h1.');
  if(typeof d.heroImage==='string'){
   const image=path.resolve(path.dirname(absolute),d.heroImage);
   if(!image.startsWith(path.resolve('src/assets')+path.sep))fail('heroImage must reference a local file under src/assets/.');
   else if(!fs.existsSync(image))fail(`Image does not exist: ${d.heroImage}`);
   else if(fs.statSync(image).size>2*1024*1024)fail('Compress the hero image to under 2 MiB.');
  }
  for(const url of [d.imageSource,...Object.values(d.affiliateLinks??{})].filter(Boolean)){
   try{if(new URL(url).protocol!=='https:')fail('Sources and affiliate links must use HTTPS.');}catch{fail(`Invalid URL: ${url}`);}
  }
  if(d.affiliateLinks&&Object.keys(d.affiliateLinks).some(k=>!['booking','viator','amazon','youtubeVideo'].includes(k)))fail('Unknown affiliateLinks key.');
  console.log(`Checked ${filename}`);
 }catch(error){fail(error.message);}
}
if(errors){console.error(`${errors} validation error(s). No files changed.`);process.exit(1);}
console.log('PASS. Next: npm run check && npm run build. Verify the generated article and listing before publishing.');
