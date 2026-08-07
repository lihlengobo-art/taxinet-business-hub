import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Taxinet Connect',
    short_name: 'Taxinet Connect',
    description:
      'Community Wi-Fi at the taxi rank — services, opportunities and weekly updates for passengers, drivers, vendors and rank marshals.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#013b8c',
    icons: [
      {
        src: '/images/taxinet-icon.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/taxinet-icon.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
