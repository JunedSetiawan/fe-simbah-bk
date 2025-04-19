// utils/excelExport.ts
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

// Types for semester summary data
interface Student {
  name?: string;
  nis?: string;
  nisn?: string;
  class?: {
    romanLevel?: string;
    alphabet?: string;
    expertise?: {
      shortName?: string;
    };
  };
}

interface Regulation {
  name?: string;
}

interface ViolationOrAward {
  id: string;
  createdAt: string;
  regulation?: Regulation;
  description?: string;
  points: number;
}

interface SemesterSummaryData {
  student?: Student;
  violations?: ViolationOrAward[];
  awards?: ViolationOrAward[];
  totalPoints: number;
  totalAwardPoints: number;
  netPoints: number;
  semester: string;
  schoolYear: string;
  resetMessage?: string;
  nextSemesterPoints?: number;
}

/**
 * Exports semester summary data to Excel
 * @param data The semester summary data
 */
export const exportSemesterSummaryToExcel = (data: SemesterSummaryData) => {
  if (!data) return;

  const {
    student,
    violations,
    awards,
    totalPoints,
    totalAwardPoints,
    netPoints,
    semester,
    schoolYear,
  } = data;

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "School System";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Semester Summary");

  // Add title
  worksheet.mergeCells("A1:F1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "RINGKASAN PELANGGARAN SEMESTER";
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: "center" };

  // Add student info
  worksheet.mergeCells("A3:F3");
  worksheet.getCell("A3").value = "INFORMASI SISWA";
  worksheet.getCell("A3").font = { bold: true };

  worksheet.getCell("A4").value = "Nama";
  worksheet.getCell("B4").value = student?.name || "-";

  worksheet.getCell("A5").value = "NIS";
  worksheet.getCell("B5").value = student?.nis || "-";

  worksheet.getCell("A6").value = "NISN";
  worksheet.getCell("B6").value = student?.nisn || "-";

  worksheet.getCell("A7").value = "Kelas";
  worksheet.getCell("B7").value = student?.class
    ? `${student.class.romanLevel || ""} ${
        student.class.expertise?.shortName || ""
      } ${student.class.alphabet || ""}`
    : "-";

  worksheet.getCell("D4").value = "Semester";
  worksheet.getCell("E4").value = semester || "-";

  worksheet.getCell("D5").value = "Tahun Ajaran";
  worksheet.getCell("E5").value = schoolYear || "-";

  // Add point summary
  worksheet.mergeCells("A9:F9");
  worksheet.getCell("A9").value = "RINGKASAN POIN";
  worksheet.getCell("A9").font = { bold: true };

  worksheet.getCell("A10").value = "Poin Pelanggaran";
  worksheet.getCell("B10").value = totalPoints || 0;

  worksheet.getCell("A11").value = "Poin Penghargaan";
  worksheet.getCell("B11").value = totalAwardPoints || 0;

  worksheet.getCell("A12").value = "Total Poin";
  worksheet.getCell("B12").value = netPoints || 0;

  // Add violations
  if (violations && violations.length > 0) {
    worksheet.addRow([]);
    worksheet.mergeCells("A14:F14");
    worksheet.getCell("A14").value = "DAFTAR PELANGGARAN";
    worksheet.getCell("A14").font = { bold: true };

    // Add headers
    const violationHeaders = [
      "No.",
      "Tanggal",
      "Peraturan",
      "Deskripsi",
      "Poin",
    ];
    worksheet.addRow(violationHeaders);

    // Style header row
    worksheet.getRow(15).font = { bold: true };

    // Add data
    violations.forEach((violation, index) => {
      const date = violation.createdAt
        ? dayjs(violation.createdAt).format("DD MMM YYYY")
        : "-";

      worksheet.addRow([
        index + 1,
        date,
        violation.regulation?.name || "-",
        violation.description || "-",
        violation.points || 0,
      ]);
    });
  }

  // Add awards
  if (awards && awards.length > 0) {
    const startRow =
      violations && violations.length > 0 ? 17 + violations.length : 14;

    worksheet.addRow([]);
    worksheet.mergeCells(`A${startRow}:F${startRow}`);
    worksheet.getCell(`A${startRow}`).value = "DAFTAR PENGHARGAAN";
    worksheet.getCell(`A${startRow}`).font = { bold: true };

    // Add headers
    const awardHeaders = ["No.", "Tanggal", "Peraturan", "Deskripsi", "Poin"];
    worksheet.addRow(awardHeaders);

    // Style header row
    worksheet.getRow(startRow + 1).font = { bold: true };

    // Add data
    awards.forEach((award, index) => {
      const date = award.createdAt
        ? dayjs(award.createdAt).format("DD MMM YYYY")
        : "-";

      worksheet.addRow([
        index + 1,
        date,
        award.regulation?.name || "-",
        award.description || "-",
        award.points || 0,
      ]);
    });
  }

  // Auto width columns
  worksheet.columns.forEach((column) => {
    let maxColumnLength = 0;
    if (typeof column.eachCell === "function") {
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxColumnLength) {
          maxColumnLength = columnLength;
        }
      });
    }
    column.width = maxColumnLength < 10 ? 10 : maxColumnLength + 2;
  });

  // Generate file and trigger download
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const fileName = `Laporan_${student?.name || "Siswa"}_${
      schoolYear || ""
    }_Semester_${semester || ""}.xlsx`;
    saveAs(blob, fileName);
  });
};

/**
 * General purpose function to export any tabular data to Excel
 * @param worksheetName Name of the worksheet
 * @param title Title of the report
 * @param headers Column headers
 * @param data Array of data rows
 * @param fileName Name of the file to save
 */
export const exportTableDataToExcel = (
  worksheetName: string,
  title: string,
  headers: string[],
  data: any[][],
  fileName: string
) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "School System";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(worksheetName);

  // Add title
  worksheet.mergeCells(`A1:${String.fromCharCode(65 + headers.length - 1)}1`);
  const titleCell = worksheet.getCell("A1");
  titleCell.value = title;
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: "center" };

  // Add headers
  worksheet.addRow(headers);
  worksheet.getRow(2).font = { bold: true };

  // Add data rows
  data.forEach((row) => {
    worksheet.addRow(row);
  });

  // Auto width columns
  worksheet.columns.forEach((column) => {
    let maxColumnLength = 0;
    if (typeof column.eachCell === "function") {
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxColumnLength) {
          maxColumnLength = columnLength;
        }
      });
    }
    column.width = maxColumnLength < 10 ? 10 : maxColumnLength + 2;
  });

  // Generate file and trigger download
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, fileName);
  });
};

// utils/excelExport.ts
// Add this new function to your existing excelExport.ts file

/**
 * Interface for class summary data
 */
interface ClassData {
  romanLevel?: string;
  alphabet?: string;
  expertise?: {
    shortName?: string;
  };
}

interface StudentInClassSummary {
  id: string;
  student: {
    id: string;
    name: string;
    nis: string;
    nisn: string;
  };
  totalViolationPoints: number;
  totalAwardPoints: number;
  netPoints: number;
  violationCount: number;
  awardCount: number;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ClassSummaryData {
  class?: ClassData;
  students: StudentInClassSummary[];
  schoolYear: string;
  semester: string;
  dateRange?: DateRange;
}

/**
 * Exports class summary data to Excel
 * @param data The class summary data
 */
export const exportClassSummaryToExcel = (data: ClassSummaryData) => {
  if (!data || !data.students || data.students.length === 0) return;

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "School System";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Class Summary");

  // Add title
  worksheet.mergeCells("A1:I1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "RINGKASAN PELANGGARAN KELAS";
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: "center" };

  // Add class info
  worksheet.mergeCells("A3:I3");
  worksheet.getCell("A3").value = "INFORMASI KELAS";
  worksheet.getCell("A3").font = { bold: true };

  worksheet.getCell("A4").value = "Kelas";
  worksheet.getCell("B4").value = data.class
    ? `${data.class.romanLevel || ""} ${
        data.class.expertise?.shortName || ""
      } ${data.class.alphabet || ""}`
    : "-";

  worksheet.getCell("A5").value = "Tahun Ajaran";
  worksheet.getCell("B5").value = data.schoolYear || "-";

  worksheet.getCell("A6").value = "Semester";
  worksheet.getCell("B6").value = data.semester || "-";

  worksheet.getCell("D4").value = "Rentang Tanggal";
  worksheet.getCell("E4").value = data.dateRange
    ? `${dayjs(data.dateRange.startDate).format("DD MMM YYYY")} - ${dayjs(
        data.dateRange.endDate
      ).format("DD MMM YYYY")}`
    : "-";

  // Add student data table
  worksheet.mergeCells("A8:I8");
  worksheet.getCell("A8").value = "DAFTAR SISWA";
  worksheet.getCell("A8").font = { bold: true };

  // Add headers
  const headers = [
    "No.",
    "Nama Siswa",
    "NIS",
    "NISN",
    "Poin Pelanggaran",
    "Poin Penghargaan",
    "Total Poin",
    "Jumlah Pelanggaran",
    "Jumlah Penghargaan",
  ];
  worksheet.addRow(headers);

  // Style header row
  const headerRow = worksheet.getRow(9);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center" };

  // Add student data
  data.students.forEach((item, index) => {
    worksheet.addRow([
      index + 1,
      item.student.name || "-",
      item.student.nis || "-",
      item.student.nisn || "-",
      item.totalViolationPoints || 0,
      item.totalAwardPoints || 0,
      item.netPoints || 0,
      item.violationCount || 0,
      item.awardCount || 0,
    ]);
  });

  // Add summary statistics
  const lastRow = 10 + data.students.length;
  worksheet.addRow([]);

  const summaryRow = lastRow + 1;
  worksheet.mergeCells(`A${summaryRow}:C${summaryRow}`);
  worksheet.getCell(`A${summaryRow}`).value = "STATISTIK KELAS";
  worksheet.getCell(`A${summaryRow}`).font = { bold: true };

  // Calculate totals
  const totalViolationPoints = data.students.reduce(
    (sum, s) => sum + (s.totalViolationPoints || 0),
    0
  );
  const totalAwardPoints = data.students.reduce(
    (sum, s) => sum + (s.totalAwardPoints || 0),
    0
  );
  const totalNetPoints = data.students.reduce(
    (sum, s) => sum + (s.netPoints || 0),
    0
  );
  const totalViolations = data.students.reduce(
    (sum, s) => sum + (s.violationCount || 0),
    0
  );
  const totalAwards = data.students.reduce(
    (sum, s) => sum + (s.awardCount || 0),
    0
  );

  // Add total row
  worksheet.addRow([
    "",
    "TOTAL",
    "",
    "",
    totalViolationPoints,
    totalAwardPoints,
    totalNetPoints,
    totalViolations,
    totalAwards,
  ]);

  const totalRowIndex = summaryRow + 1;
  worksheet.getRow(totalRowIndex).font = { bold: true };
  worksheet.getCell(`B${totalRowIndex}`).alignment = { horizontal: "right" };

  // Add average row
  const studentCount = data.students.length;
  worksheet.addRow([
    "",
    "RATA-RATA",
    "",
    "",
    (totalViolationPoints / studentCount).toFixed(2),
    (totalAwardPoints / studentCount).toFixed(2),
    (totalNetPoints / studentCount).toFixed(2),
    (totalViolations / studentCount).toFixed(2),
    (totalAwards / studentCount).toFixed(2),
  ]);

  const avgRowIndex = totalRowIndex + 1;
  worksheet.getCell(`B${avgRowIndex}`).alignment = { horizontal: "right" };

  // Auto width columns
  worksheet.columns.forEach((column) => {
    let maxColumnLength = 0;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxColumnLength) {
        maxColumnLength = columnLength;
      }
    });
    column.width = maxColumnLength < 10 ? 10 : maxColumnLength + 2;
  });

  // Generate file and trigger download
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const fileName = `Laporan_Kelas_${
      data.class
        ? `${data.class.romanLevel || ""}${
            data.class.expertise?.shortName || ""
          }${data.class.alphabet || ""}`
        : "Unknown"
    }_${data.schoolYear || ""}_Semester_${data.semester || ""}.xlsx`;
    saveAs(blob, fileName);
  });
};
