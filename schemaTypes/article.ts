export default {
  name: 'article',
  title: 'Editorial Article',
  type: 'document',
  fields: [
    {
      name: 'title_fr',
      title: 'Title (French) *',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'title_ar',
      title: 'Title (Arabic) *',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'title_en',
      title: 'Title (English)',
      type: 'string',
    },
    {
      name: 'slug_fr',
      title: 'Slug (French) *',
      type: 'slug',
      options: {
        source: 'title_fr',
        maxLength: 96,
        slugify: (input: string) => input
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\p{L}\p{N}-]/gu, '') // Preserves French accents
          .replace(/-+/g, '-')
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug_ar',
      title: 'Slug (Arabic) *',
      type: 'slug',
      options: {
        source: 'title_ar',
        maxLength: 96,
        slugify: (input: string) => input
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\p{L}\p{N}-]/gu, '') // Preserves Native Arabic Script
          .replace(/-+/g, '-')
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug_en',
      title: 'Slug (English)',
      type: 'slug',
      options: {
        source: 'title_en',
        maxLength: 96,
        slugify: (input: string) => input
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\p{L}\p{N}-]/gu, '')
          .replace(/-+/g, '-')
      },
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Politique', value: 'politique' },
          { title: 'Économie', value: 'energie-economie' },
          { title: 'Tech & Innovation', value: 'tech-innovation' },
          { title: 'Culture', value: 'culture-gaming' },
          { title: 'Médias Sociaux', value: 'medias-sociaux' },
          { title: 'Sport', value: 'sport' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'lang',
      title: 'Primary Language',
      type: 'string',
      options: {
        list: [
          { title: 'Français', value: 'fr' },
          { title: 'العربية', value: 'ar' },
          { title: 'English', value: 'en' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'excerpt_fr',
      title: 'Excerpt (French)',
      type: 'text',
      rows: 3,
    },
    {
      name: 'excerpt_ar',
      title: 'Excerpt (Arabic)',
      type: 'text',
      rows: 3,
    },
    {
      name: 'excerpt_en',
      title: 'Excerpt (English)',
      type: 'text',
      rows: 3,
    },
    {
      name: 'content_fr',
      title: 'Content (French)',
      type: 'text',
    },
    {
      name: 'content_ar',
      title: 'Content (Arabic)',
      type: 'text',
    },
    {
      name: 'content_en',
      title: 'Content (English)',
      type: 'text',
    },
    {
      name: 'source',
      title: 'Publisher Source',
      type: 'string',
    },
    {
      name: 'sourceUrl',
      title: 'Original Source URL',
      type: 'url',
    },
    {
      name: 'imageUrl',
      title: 'Featured Image URL',
      type: 'url',
    },
    {
      name: 'publishedAt',
      title: 'Publication Date',
      type: 'datetime',
    },
    {
      name: 'isPremium',
      title: 'Premium Paywalled Content',
      type: 'boolean',
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    },
  ],
}
