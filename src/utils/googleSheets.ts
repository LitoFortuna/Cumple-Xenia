import {
  CHARACTERS_SHEET_TITLE,
  CHARACTER_HEADERS,
  DEFAULT_SPREADSHEET_TITLE,
  RUMORS_SHEET_TITLE,
  RUMOR_HEADERS,
  findMissingSheetTitles,
  quoteSheetRange,
} from './sheetsLogic';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export interface ConnectedSpreadsheet {
  spreadsheetId: string;
  title: string;
  sheetTitles: string[];
}

export interface SheetCounts {
  charactersCount: number;
  rumorsCount: number;
}

export class SheetsAuthExpiredError extends Error {
  constructor(message = 'Tu sesión de Google ha caducado. Vuelve a iniciar sesión para guardar en Google Sheets.') {
    super(message);
    this.name = 'SheetsAuthExpiredError';
  }
}

async function sheetsFetch<T>(
  url: string,
  accessToken: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  if (response.status === 401) {
    throw new SheetsAuthExpiredError();
  }

  if (!response.ok) {
    let errorDetail = 'No se pudo completar la operación con Google Sheets.';
    try {
      const errJson = (await response.json()) as { error?: { message?: string } };
      if (errJson.error?.message) {
        errorDetail = errJson.error.message;
      }
    } catch {
      // Fall back to default message
    }
    throw new Error(errorDetail);
  }

  return (await response.json()) as T;
}

interface SpreadsheetMetadataResponse {
  spreadsheetId: string;
  properties?: { title?: string };
  sheets?: Array<{ properties?: { title?: string } }>;
}

/**
 * Creates a brand-new Google Sheet pre-configured with both Órbita-X tabs and header rows.
 */
export async function createOrbitaSpreadsheet(
  accessToken: string,
  title: string = DEFAULT_SPREADSHEET_TITLE
): Promise<ConnectedSpreadsheet> {
  const created = await sheetsFetch<SpreadsheetMetadataResponse>(SHEETS_API_BASE, accessToken, {
    method: 'POST',
    body: JSON.stringify({
      properties: { title },
      sheets: [
        { properties: { title: CHARACTERS_SHEET_TITLE } },
        { properties: { title: RUMORS_SHEET_TITLE } },
      ],
    }),
  });

  const spreadsheetId = created.spreadsheetId;

  await sheetsFetch(
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values:batchUpdate`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: quoteSheetRange(CHARACTERS_SHEET_TITLE, 'A1:F1'),
            values: [[...CHARACTER_HEADERS]],
          },
          {
            range: quoteSheetRange(RUMORS_SHEET_TITLE, 'A1:F1'),
            values: [[...RUMOR_HEADERS]],
          },
        ],
      }),
    }
  );

  return {
    spreadsheetId,
    title: created.properties?.title || title,
    sheetTitles: [CHARACTERS_SHEET_TITLE, RUMORS_SHEET_TITLE],
  };
}

/**
 * Fetches spreadsheet metadata (title and actual tab names) without hardcoding "Sheet1".
 */
export async function inspectSpreadsheet(
  accessToken: string,
  spreadsheetId: string
): Promise<ConnectedSpreadsheet> {
  const url = `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}?fields=spreadsheetId,properties.title,sheets.properties.title`;
  const data = await sheetsFetch<SpreadsheetMetadataResponse>(url, accessToken);

  const sheetTitles = (data.sheets || [])
    .map((sheet) => sheet.properties?.title)
    .filter((title): title is string => Boolean(title));

  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Hoja de cálculo sin título',
    sheetTitles,
  };
}

/**
 * Ensures the connected spreadsheet has both Órbita-X tabs and header rows.
 */
export async function ensureOrbitaTabs(
  accessToken: string,
  spreadsheetId: string
): Promise<ConnectedSpreadsheet> {
  const metadata = await inspectSpreadsheet(accessToken, spreadsheetId);
  const missingTitles = findMissingSheetTitles(metadata.sheetTitles);

  if (missingTitles.length > 0) {
    await sheetsFetch(
      `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({
          requests: missingTitles.map((title) => ({
            addSheet: { properties: { title } },
          })),
        }),
      }
    );
  }

  // Verify header rows on both tabs and write them only if row 1 is currently empty
  const headerChecks = await Promise.all([
    sheetsFetch<{ values?: string[][] }>(
      `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(
        quoteSheetRange(CHARACTERS_SHEET_TITLE, 'A1:F1')
      )}`,
      accessToken
    ),
    sheetsFetch<{ values?: string[][] }>(
      `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(
        quoteSheetRange(RUMORS_SHEET_TITLE, 'A1:F1')
      )}`,
      accessToken
    ),
  ]);

  const headerUpdates: Array<{ range: string; values: string[][] }> = [];
  if (!headerChecks[0].values || headerChecks[0].values.length === 0) {
    headerUpdates.push({
      range: quoteSheetRange(CHARACTERS_SHEET_TITLE, 'A1:F1'),
      values: [[...CHARACTER_HEADERS]],
    });
  }
  if (!headerChecks[1].values || headerChecks[1].values.length === 0) {
    headerUpdates.push({
      range: quoteSheetRange(RUMORS_SHEET_TITLE, 'A1:F1'),
      values: [[...RUMOR_HEADERS]],
    });
  }

  if (headerUpdates.length > 0) {
    await sheetsFetch(
      `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values:batchUpdate`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: headerUpdates,
        }),
      }
    );
  }

  return {
    spreadsheetId: metadata.spreadsheetId,
    title: metadata.title,
    sheetTitles: Array.from(new Set([...metadata.sheetTitles, ...missingTitles])),
  };
}

/**
 * Appends a single row to the specified tab in the connected Google Sheet.
 */
export async function appendRowToSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  row: string[]
): Promise<void> {
  const range = encodeURIComponent(quoteSheetRange(sheetTitle, 'A:F'));
  const url = `${SHEETS_API_BASE}/${encodeURIComponent(
    spreadsheetId
  )}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  await sheetsFetch(url, accessToken, {
    method: 'POST',
    body: JSON.stringify({
      values: [row],
    }),
  });
}

/**
 * Reads row counts from both Órbita-X tabs to reflect live persisted records.
 */
export async function readSheetCounts(
  accessToken: string,
  spreadsheetId: string
): Promise<SheetCounts> {
  const charRange = encodeURIComponent(quoteSheetRange(CHARACTERS_SHEET_TITLE, 'A2:A'));
  const rumorRange = encodeURIComponent(quoteSheetRange(RUMORS_SHEET_TITLE, 'A2:A'));

  const [charRes, rumorRes] = await Promise.all([
    sheetsFetch<{ values?: string[][] }>(
      `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${charRange}`,
      accessToken
    ).catch(() => ({ values: [] })),
    sheetsFetch<{ values?: string[][] }>(
      `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${rumorRange}`,
      accessToken
    ).catch(() => ({ values: [] })),
  ]);

  return {
    charactersCount: charRes.values?.length ?? 0,
    rumorsCount: rumorRes.values?.length ?? 0,
  };
}
