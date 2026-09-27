import {getCollection} from 'astro:content';
import {published} from '../lib/editorial';
import {destinations,experiences} from '../data/destinations';
import type {APIRoute} from 'astro';
export const GET:APIRoute=async({site})=>{
 const escape=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
 const posts=(await getCollection('blog')).filter(published);
 const paths=['/','/blog/','/about/','/plan/',...destinations.map(d=>`/islands/${d.id}/`),...experiences.map(e=>`/experiences/${e.id}/`),...posts.map(p=>`/blog/${p.id}/`)];
 const base=site?.toString()??'http://localhost:4321';
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p=>`<url><loc>${escape(new URL(p,base).href)}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml'}});
};
