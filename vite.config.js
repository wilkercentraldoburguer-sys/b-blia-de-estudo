import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      visualEditAgent: true
    }),
    react(),
    // PWA / Service Worker: faz o app funcionar online e offline (pedido
    // do usuário em 25/08/2026 - "preciso que o app pegue tanto online
    // como offline tipo em segundo plano"). O que isso faz na prática:
    //  1) Baixa o "esqueleto" do app (HTML/JS/CSS) no primeiro acesso e
    //     guarda em cache, então o app ABRE mesmo sem internet depois.
    //  2) Guarda automaticamente, em segundo plano, cada capítulo da
    //     Bíblia (dataset local /bible/aa/**) que o usuário efetivamente
    //     abrir - não precisa mais usar o botão "Baixar para Offline" pra
    //     esse capítulo continuar disponível depois.
    //  3) 'autoUpdate' garante que, quando eu publicar uma correção, o
    //     app pega a versão nova sozinho na próxima vez que abrir com
    //     internet, sem o usuário ficar preso numa versão antiga em cache.
    // IMPORTANTE: isso não foi testado contra o hospedeiro de produção
    // real do Base44 (só validado localmente com `npm run build` +
    // `npm run preview`) - Service Worker depende de HTTPS em produção,
    // que o Base44 já fornece, mas vale confirmar depois de publicar.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Abba Estudos',
        short_name: 'Abba Estudos',
        description: 'Sua jornada espiritual - leitura bíblica, estudos, planos de leitura e quiz.',
        theme_color: '#232A45',
        background_color: '#232A45',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Não pré-carrega os ~1200 arquivos de capítulos da Bíblia no
        // primeiro acesso (isso obrigaria a baixar ~7MB antes do app
        // abrir). Em vez disso, cada capítulo é guardado em cache
        // automaticamente QUANDO o usuário o abre (ver runtimeCaching
        // abaixo) - mais rápido no primeiro acesso, e ainda assim cada
        // capítulo já lido funciona offline depois, sem precisar clicar
        // em "Baixar para Offline".
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Dataset local da Bíblia (texto real, nunca muda) - guarda
            // pra sempre no cache assim que o capítulo é aberto uma vez.
            urlPattern: ({ url }) => url.pathname.startsWith('/bible/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'bible-text-v1',
              expiration: { maxEntries: 1300, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Fallback público (getbible.net) usado só pra KJV e AA
            // quando falta algum capítulo no dataset local.
            urlPattern: ({ url }) => url.hostname === 'api.getbible.net',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'getbible-api-v1',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // ABíbliaDigital (busca de versículos e capítulos com token).
            urlPattern: ({ url }) => url.hostname === 'www.abibliadigital.com.br',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'abibliadigital-api-v1',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Comentário bíblico real (Matthew Henry, domínio público).
            urlPattern: ({ url }) => url.hostname === 'bible.helloao.org',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'commentary-api-v1',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
          // Chamadas ao backend do próprio Base44 (login, progresso,
          // anotações etc.) ficam de fora de propósito: são dados do
          // usuário que mudam o tempo todo, então continuam exigindo
          // internet em vez de arriscar mostrar informação desatualizada
          // ou travada em cache.
        ]
      }
    }),
  ]
});