import {z} from 'astro:content';
/** Merge into the existing blog schema. Defaults preserve older articles. */
export const editorialFields={
 destination:z.enum(['main','kerama','miyako','yaeyama','kume']).optional(),
 experiences:z.array(z.enum(['ocean','culture','food','nature'])).optional(),
 heroAlt:z.string().optional(),
 draft:z.boolean().default(false),
 featured:z.boolean().default(false),
 imageCredit:z.string().optional(),
 imageSource:z.string().url().optional(),
};
