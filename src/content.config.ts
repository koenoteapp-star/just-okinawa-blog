import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { editorialFields } from './lib/editorial-schema';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			affiliateLinks: z
				.object({
					booking: z.string().url().optional(),
					viator: z.string().url().optional(),
					amazon: z.string().url().optional(),
					youtubeVideo: z.string().url().optional(),
				})
				.optional(),
		}).extend(editorialFields),
});

export const collections = { blog };
