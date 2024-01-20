import * as fs from 'fs'

export const parseHARFile = (harFilePath: string) => {

  const harData = fs.readFileSync(harFilePath, 'utf-8');
  const harJson = JSON.parse(harData);

  return harJson
}

interface Mock {
  url: string,
  status: number,
  contentType: string,
  headers: Record<string, string>
  body?: Buffer
}

export const createMockFromEntries = (entries: any[]) => {
  return entries.map((entry: any) => {
        const url = new URL(entry.request.url)
        const pathname = entry.request.url.split(url.host)[1]
        const data: Mock = {
          url: pathname,
          status: entry.response.status,
          contentType: entry.response.content.mimeType,
          headers: entry.response.headers.reduce((acc: any, header: any) => {
              acc[header.name] = header.value;
              return acc;
          }, {})
        }

        if (entry.response.content?.text) {
          data.body = Buffer.from(entry.response.content.text)
        }

        return data
    })
}
