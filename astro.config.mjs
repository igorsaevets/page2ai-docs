// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';

// https://astro.build/config
export default defineConfig({
  site: 'https://igorsaevets.github.io',
  base: '/page2ai-docs',
  integrations: [
    starlight({
      title: 'Page2AI',
      description:
        'Convert any web page to clean Markdown for AI. Chrome extension + MCP server + npm library.',
      logo: { src: './src/assets/logo.svg', replacesTitle: false },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/igorsaevets/page2ai-extension',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/igorsaevets/page2ai-docs/edit/main/',
      },
      lastUpdated: true,
      plugins: [starlightLlmsTxt()],
      sidebar: [
        { label: 'Overview', slug: 'index' },
        { label: 'Install', slug: 'install' },
        { label: 'MCP server', slug: 'mcp' },
        { label: 'Comparison', slug: 'comparison' },
        { label: 'Privacy', slug: 'privacy' },
      ],
    }),
  ],
});
