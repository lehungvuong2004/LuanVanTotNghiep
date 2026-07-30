import * as XLSX from "xlsx";

export function exportToExcel({ filename = "bao_cao_xuat.xlsx", sheetName = "Dữ liệu", data, columns }: any) {
  if (!data || data.length === 0) {
    return false;
  }

  let formattedData: any[] = [];

  if (columns && columns.length > 0) {
    formattedData = data.map((item: any) => {
      const row: any = {};
      columns.forEach((col: any) => {
        const rawValue = item[col.key];
        row[col.label] = col.formatter ? col.formatter(rawValue, item) : (rawValue ?? "");
      });
      return row;
    });
  } else {
    formattedData = data;
  }

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-fit column width calculation
  if (formattedData.length > 0) {
    const colWidths = Object.keys(formattedData[0]).map((key) => {
      const maxLen = Math.max(key.length, ...formattedData.map((row: any) => String(row[key] ?? "").length));
      return { wch: Math.min(Math.max(maxLen + 4, 12), 60) };
    });
    worksheet["!cols"] = colWidths;
  }

  const outputFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;

  try {
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", outputFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    // console.error("Lỗi khi xuất file Excel:", error);
    return false;
  }
}
