import * as xlsx from 'xlsx';

export const readXlsxFile = (filePath: string) => {
    const workbook = xlsx.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;

    const columnNames = ['customer_id', 'first_name', 'last_name', 'age', 'phone_number', 'monthly_salary', 'approved_limit', 'current_debt'];

    const customers = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], { header: columnNames });

    customers.shift();

    return customers;
}
