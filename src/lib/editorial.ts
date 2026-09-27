import type {CollectionEntry} from 'astro:content';
export type EditorialData = { destination?: string; experiences?: string[]; heroAlt?: string; featured?: boolean; draft?: boolean; imageCredit?: string; imageSource?: string; };
export const meta=(post:CollectionEntry<'blog'>)=>post.data as CollectionEntry<'blog'>['data'] & EditorialData;
export const published=(post:CollectionEntry<'blog'>)=>!meta(post).draft && post.data.pubDate.valueOf()<=Date.now();

export const publicationMonth=(date:Date)=>new Intl.DateTimeFormat('sv-SE',{year:'numeric',month:'2-digit',timeZone:'Asia/Tokyo'}).format(date);
