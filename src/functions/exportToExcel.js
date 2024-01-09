// exportToExcel.js
const fs = require('file-saver');
const ExcelJS = require('exceljs');

const ExportToExcel = async (data, fileName = 'Sheet.xlsx') => {
   
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');
  worksheet.columns = [
    { header: 'NDC', key: 'NDC', width: 10 },
    { header: 'Manufacturer', key: 'Manufacturer', width: 10 },
    { header: 'Medicine', key: 'Medicine', width: 10 },
    { header: 'Lot', key: 'Lot', width: 10 },
    { header: 'Expiry', key: 'Expiry', width: 10 },
    { header: 'mg', key: 'mg', width: 10 },
    { header: 'QTY', key: 'QTY', width: 10 },
  ];

  data.forEach((element) => {
    worksheet.addRow(element);
  });
  const stream = fs.createWriteStream(fileName);
  try {
    await workbook.xlsx.write(stream);
    console.log(`File "${fileName}" created successfully.`);
  } catch (err) {
    console.error(err);
  } finally {
    stream.end();
  }
};

module.exports = ExportToExcel;
