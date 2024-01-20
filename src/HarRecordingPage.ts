import {  type Page } from  '@playwright/test';
import { createMockFromEntries, parseHARFile } from './utils';

interface HarRecordingPageOptions {
    harFilePath: string
    urlToRecordOrReplay: string | RegExp
}

export class HarRecordingPage {
    readonly page: Page; 
    readonly options: HarRecordingPageOptions; 

    constructor(page: Page, options: HarRecordingPageOptions) {
        this.page = page;
        this.options = options;
    }

    async record() {
        await this.page.routeFromHAR(this.options.harFilePath, {
            url: this.options.urlToRecordOrReplay,
            updateContent: 'embed',
            update: true,
        });
    }

    async replay() {
        const harJson = parseHARFile(this.options.harFilePath)
        const mocks = createMockFromEntries(harJson.log.entries)
   
        await this.page.route('**/*', async (route, request) => {
            const matchingMockIndex = mocks.findIndex(mock =>
                route.request().url().includes(mock.url)
            );
        
            if (matchingMockIndex !== -1) {
                const matchingMock = mocks[matchingMockIndex];
                

                await route.fulfill({
                    status: matchingMock.status,
                    body: matchingMock.body,
                    headers: matchingMock.headers
                });
        
                mocks.splice(matchingMockIndex, 1);
            } else {
                await route.continue({ headers: request.headers() });
            }
        });
    }
};

