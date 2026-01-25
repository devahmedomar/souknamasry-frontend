import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { generateSitemap } from './sitemap';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = join(serverDistFolder, '../browser');
const indexHtml = join(browserDistFolder, 'index.html');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Sitemap generator
 */
app.get('/sitemap.xml', async (req, res) => {
  try {
    const host = req.get('host') || 'https://souknamasry.vercel.app/';
    // Use the production API URL or getting from environment if possible, but strict referencing env from server needs care.
    // We will use the known URL.
    const apiUrl = 'https://souknamasry-be.vercel.app/api/';
    const sitemap = await generateSitemap(apiUrl, host);
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (err) {
    console.error('Sitemap generation error', err);
    res.status(500).send('Error generating sitemap');
  }
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  // Skip SSR for admin routes - serve static HTML for client-side rendering
  // This avoids hydration issues with PrimeNG components and ensures localStorage access
  if (req.url.startsWith('/admin')) {
    res.sendFile(indexHtml, (err) => {
      if (err) {
        // If file doesn't exist (e.g., dev mode), fall back to SSR
        console.log('Index file not found for admin route, using SSR fallback');
        angularApp
          .handle(req)
          .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
          .catch(next);
      }
    });
    return;
  }

  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
