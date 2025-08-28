export function DataTransformerCSV(csvData: string): (string | number | boolean | Date)[][] {
  const rows: string[] = csvData.split('\n');
  const transformedData: (string | number | boolean | Date)[][] = [];

  rows.forEach((row) => {
    const columns: string[] = row.split(',');
    const transformedRow: (string | number | boolean | Date)[] = [];

    columns.forEach((column) => {
      transformedRow.push(coerceCellValue(column.trim()));
    });

    transformedData.push(transformedRow);
  });

  return transformedData;
}

function coerceCellValue(value: string): string | number | boolean | Date {
  const numValue: number = parseFloat(value);
  const intNumValue: number = parseInt(value, 10);

  if (!isNaN(numValue) && !isNaN(intNumValue) && numValue === intNumValue) {
    return intNumValue;
  }

  const lowerCaseValue: string = value.toLowerCase();

  if (lowerCaseValue === 'true' || lowerCaseValue === 'false') {
    return lowerCaseValue === 'true';
  }

  try {
    const dateValue: Date = new Date(value);
    if (!isNaN(dateValue.getTime())) {
      return dateValue;
    }
  } catch (error) {
    console.error(error);
  }

  return value;
}
