export default {
  type: 'object',
  properties: {
    channelId: { type: 'string' },
    text: { type: 'string' },
  },
  required: ['channelId', 'text'],
} as const;
