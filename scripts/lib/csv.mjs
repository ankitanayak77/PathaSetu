// Minimal RFC 4180 CSV reader/writer: quoted fields, doubled quotes, commas and newlines inside quotes, CRLF, optional BOM.
export function parseCsv(text) {
  const src = String(text).replace(/^\uFEFF/, '');
  const rows = []; let row = []; let field = ''; let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') { if (src[i + 1] === '"') { field += '"'; i += 1; } else inQuotes = false; } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && src[i + 1] === '\n') i += 1; row.push(field); field = ''; if (row.length > 1 || row[0] !== '') rows.push(row); row = []; }
    else field += ch;
  }
  if (inQuotes) throw new Error('csv_unterminated_quote');
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return { header: [], records: [] };
  const [header, ...body] = rows;
  return { header, records: body.map((cells) => Object.fromEntries(header.map((name, index) => [name, cells[index] ?? '']))) };
}

export function toCsv(header, records) {
  const cell = (value) => { const text = String(value ?? ''); return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; };
  return `\uFEFF${[header.map(cell).join(','), ...records.map((record) => header.map((name) => cell(record[name])).join(','))].join('\r\n')}\r\n`;
}
