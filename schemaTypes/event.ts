export default {
  name: 'event',
  title: 'Platform Event',
  type: 'document',
  fields: [
    {
      name: 'title_fr',
      title: 'Event Title (French) *',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'title_ar',
      title: 'Event Title (Arabic) *',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'title_en',
      title: 'Event Title (English)',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Event Identifier Slug *',
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
      name: 'date',
      title: 'Event Start Date *',
      type: 'date',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'endDate',
      title: 'Event End Date (Optional)',
      type: 'date',
    },
    {
      name: 'category',
      title: 'Event Category *',
      type: 'string',
      options: {
        list: [
          { title: 'National', value: 'national' },
          { title: 'Islamic', value: 'islamic' },
          { title: 'Tech & Dev', value: 'tech' },
          { title: 'Tourism', value: 'tourism' },
          { title: 'Sport', value: 'sport' },
          { title: 'Culture', value: 'culture' },
          { title: 'Trade', value: 'trade' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'status',
      title: 'Event Live Status *',
      type: 'string',
      options: {
        list: [
          { title: 'Upcoming', value: 'upcoming' },
          { title: 'Happening Now', value: 'happening-now' },
          { title: 'Past Event', value: 'past' },
        ],
      },
      initialValue: 'upcoming',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'location_fr',
      title: 'Venue Location (French) *',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'location_ar',
      title: 'Venue Location (Arabic) *',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'location_en',
      title: 'Venue Location (English)',
      type: 'string',
    },
    {
      name: 'description_fr',
      title: 'Detailed Description (French)',
      type: 'text',
    },
    {
      name: 'description_ar',
      title: 'Detailed Description (Arabic)',
      type: 'text',
    },
    {
      name: 'description_en',
      title: 'Detailed Description (English)',
      type: 'text',
    },
    {
      name: 'imageUrl',
      title: 'Featured Image URL',
      type: 'url',
    },
    {
      name: 'isFeatured',
      title: 'Featured (Pushed to top of Calendar)',
      type: 'boolean',
      initialValue: false,
    },
  ],
}
