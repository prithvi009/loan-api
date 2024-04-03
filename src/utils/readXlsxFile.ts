import * as xlsx from 'xlsx';

export const readXlsxFile = (filePath: string, columnNames: Array<string>) => {
    const workbook = xlsx.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;

    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], { header: columnNames });

    data.shift();

    return data;
}
