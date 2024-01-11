#!/usr/bin/env node
const fs = require('fs');

async function createMockingScript(harFilePath) {
  const harData = fs.readFileSync(harFilePath, 'utf-8');
  const harJson = JSON.parse(harData);

  const playwrightScript = `
    const mocks = [
    ${harJson.log.entries.map(entry => {
    const url = new URL(entry.request.url)
    const pathname = entry.request.url.split(url.host)[1]

    return `{
              url: "${pathname}",
              response: {
                status: ${entry.response.status},
                body: ${JSON.stringify(entry.response.content.text)},
                headers: ${JSON.stringify(entry.response.headers)}
              },
            }`
  }).join(',')}
  ];

  await page.route('**/*', async (route) => {
    const matchingMockIndex = mocks.findIndex(mock =>
      route.request().url().includes(mock.url)
    );

    if (matchingMockIndex !== -1) {
      const matchingMock = mocks[matchingMockIndex];

      route.fulfill({
        status: matchingMock.response.status,
        body: matchingMock.response.body,
        headers: matchingMock.response.headers,
      });

      mocks.splice(matchingMockIndex, 1);
    } else {
      route.continue();
    }
  });
`;

  console.log(`The Playwright script have been generated with success :\n\n${playwrightScript}`);
}

if (require.main === module) {
  const harFilePath = process.argv[2];

  if (!harFilePath) {
    console.error('har-to-playwright-mock <chemin_fichier_har>');
    process.exit(1);
  }

  createMockingScript(harFilePath);
} else {
  console.error('har-to-playwright-mock <chemin_fichier_har>');
  process.exit(1);
}

module.exports = createMockingScript;