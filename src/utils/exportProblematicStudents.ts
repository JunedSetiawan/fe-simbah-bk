// excelUtils.ts
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Helper function to convert a date to a formatted string
const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format current date for filename
const getFormattedCurrentDate = (): string => {
  const now = new Date();
  return now.toISOString().split("T")[0]; // Returns YYYY-MM-DD
};

// Export problematic students data to Excel
export const exportProblematicStudentsToExcel = async (
  data: any[],
  filters: any,
  meta: any,
  classOptions: Array<{ label: string; value: string | number }>
) => {
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Siswa Bermasalah");

  // Set worksheet columns
  worksheet.columns = [
    { header: "No.", key: "no", width: 5 },
    { header: "Nama Siswa", key: "student_name", width: 25 },
    { header: "NIS", key: "nis", width: 12 },
    { header: "NISN", key: "nisn", width: 15 },
    { header: "Kelas", key: "class", width: 15 },
    { header: "Total Poin", key: "total_points", width: 12 },
    { header: "Jumlah Pelanggaran", key: "violation_count", width: 18 },
    {
      header: "Pelanggaran Semester Ini",
      key: "semester_violations",
      width: 22,
    },
  ];

  // Set header row style
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Add data rows
  data.forEach((student, index) => {
    worksheet.addRow({
      no: index + 1,
      student_name: student.student_name,
      nis: student.nis || "",
      nisn: student.nisn || "",
      class:
        `${student.roman_level} ${student.expertise} ${student.alphabet}`.trim(),
      total_points: student.total_points,
      violation_count: student.violation_count,
      semester_violations: student.semester_violations,
    });
  });

  // Apply border to all cells with data
  for (let i = 1; i <= data.length + 1; i++) {
    worksheet.getRow(i).eachCell({ includeEmpty: true }, function (cell) {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  }

  // Add a details worksheet for violations
  const violationsSheet = workbook.addWorksheet("Detail Pelanggaran");
  violationsSheet.columns = [
    { header: "No.", key: "no", width: 5 },
    { header: "Nama Siswa", key: "student_name", width: 25 },
    { header: "Kelas", key: "class", width: 15 },
    { header: "Pelanggaran", key: "violation", width: 30 },
    { header: "Poin", key: "point", width: 8 },
    { header: "Tanggal", key: "date", width: 20 },
    { header: "Deskripsi", key: "description", width: 40 },
  ];

  // Set header row style for violations sheet
  violationsSheet.getRow(1).font = { bold: true };
  violationsSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Add violations data
  let violationIndex = 1;
  data.forEach((student) => {
    if (student.violations && student.violations.length > 0) {
      student.violations.forEach((violation: any) => {
        violationsSheet.addRow({
          no: violationIndex++,
          student_name: student.student_name,
          class:
            `${student.roman_level} ${student.expertise} ${student.alphabet}`.trim(),
          violation: violation.regulation,
          point: violation.point,
          date: formatDate(violation.createdAt),
          description: violation.description || "-",
        });
      });
    }
  });

  // Apply border to all cells with data in violations sheet
  for (let i = 1; i <= violationIndex; i++) {
    violationsSheet.getRow(i).eachCell({ includeEmpty: true }, function (cell) {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  }

  // Add filter information at the top of the workbook
  const summarySheet = workbook.addWorksheet("Informasi", {
    properties: { tabColor: { argb: "FF97CBFF" } },
  });

  summarySheet.columns = [
    { header: "", key: "label", width: 25 },
    { header: "", key: "value", width: 40 },
  ];

  // Add report title
  summarySheet.addRow(["Laporan Siswa Bermasalah", ""]);
  summarySheet.getRow(1).font = { bold: true, size: 16 };
  summarySheet.addRow(["Tanggal Laporan", formatDate(new Date().toString())]);
  summarySheet.addRow(["", ""]);

  // Add filter criteria
  summarySheet.addRow(["Kriteria Filter:", ""]);
  summarySheet.getRow(4).font = { bold: true };

  summarySheet.addRow([
    "Minimum Poin",
    meta?.filters?.point_threshold || filters.pointThreshold,
  ]);
  summarySheet.addRow([
    "Minimum Pelanggaran",
    meta?.filters?.min_violations || filters.minViolations,
  ]);

  // School year info
  let schoolYearText = "";
  if (meta?.school_year) {
    schoolYearText = `${meta.school_year}`;
    if (meta?.semester && meta.semester !== "all") {
      schoolYearText += ` (Semester ${meta.semester})`;
    } else if (meta?.semester === "all") {
      schoolYearText += " (Semua Semester)";
    }
  } else if (meta?.year_range) {
    schoolYearText = meta.year_range;
    if (meta?.semester_range) {
      schoolYearText += ` (Semester ${meta.semester_range})`;
    }
  } else if (filters.startYear && filters.endYear) {
    schoolYearText = `${filters.startYear}-${filters.endYear}`;
    schoolYearText += ` (Semester ${filters.startSemester || "1"}-${
      filters.endSemester || "2"
    })`;
  } else if (filters.year) {
    schoolYearText = `${filters.year}`;
    if (filters.semester === "all") {
      schoolYearText += " (Semua Semester)";
    } else {
      schoolYearText += ` (Semester ${filters.semester})`;
    }
  }

  summarySheet.addRow(["Tahun Ajaran", schoolYearText]);

  // Class info if filtered
  if (meta?.filters?.class_id || filters.classId) {
    const classId = meta?.filters?.class_id || filters.classId;
    const className =
      classOptions.find((c) => c.value === classId)?.label || classId;
    summarySheet.addRow(["Kelas", className]);
  } else {
    summarySheet.addRow(["Kelas", "Semua Kelas"]);
  }

  summarySheet.addRow(["", ""]);
  summarySheet.addRow(["Jumlah Siswa Bermasalah", data.length]);
  summarySheet.getRow(summarySheet.rowCount).font = { bold: true };

  // Format summary sheet
  for (let i = 1; i <= summarySheet.rowCount; i++) {
    if (i !== 1) {
      summarySheet.getRow(i).height = 20;
    }
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Create a Blob and save file
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Generate filename based on date and some filter info
  let filename = `siswa_bermasalah_${getFormattedCurrentDate()}`;

  // Add class info to filename if present
  if (meta?.filters?.class_id || filters.classId) {
    const classId = meta?.filters?.class_id || filters.classId;
    const className =
      classOptions.find((c) => c.value === classId)?.label || classId;
    filename += `_${className.replace(/\s+/g, "_")}`;
  }

  filename += ".xlsx";

  saveAs(blob, filename);

  return true;
};
