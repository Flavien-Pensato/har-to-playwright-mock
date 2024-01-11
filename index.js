#!/usr/bin/env node
const fs = require('fs');

async function createMockingScript(harFilePath) {
    // Lire le fichier HAR
    const harData = fs.readFileSync(harFilePath, 'utf-8');
    const harJson = JSON.parse(harData);

    // Générer le script Playwright pour mocker chaque URL
    const playwrightScript = `
  // Créer des mocks pour chaque route dans le fichier HAR
  let mocks = [
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

  // Créer et activer les mocks dans le contexte de la page
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

      // Supprimer le mock utilisé de la liste
      mocks.splice(matchingMockIndex, 1);
    } else {
      route.continue();
    }
  });
`;

    console.log(`Le script Playwright a été généré avec succès:\n\n${playwrightScript}`);
}

// Si le script est exécuté directement depuis la ligne de commande
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

// Exporter la fonction pour pouvoir l'utiliser dans un autre script si nécessaire
module.exports = createMockingScript;