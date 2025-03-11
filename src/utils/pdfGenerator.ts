import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import dayjs from "dayjs";

// Register fonts for pdfMake
pdfMake.vfs = pdfFonts.vfs;

// Helper function to convert image to base64
export const getBase64Image = (
  imagePath: string,
  callback: (base64Data: string) => void
) => {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(img, 0, 0);

    const dataURL = canvas.toDataURL("image/png");
    callback(dataURL);
  };

  img.src = imagePath;
};

// Generate statement PDF definition
export const generateStatementPdfDefinition = (
  record: any,
  regulation: any,
  logoBase64?: string
) => {
  const studentName = record?.studentClass?.user?.student?.name || "Nama Siswa";
  const className =
    record?.studentClass?.class?.romanLevel +
      " " +
      record?.studentClass?.class?.expertise?.shortName +
      " " +
      record?.studentClass?.class?.alphabet || "Kelas";
  const violationName = record?.name || "Pelanggaran";
  const regulationName = regulation?.name || "Peraturan";
  const points = regulation?.point || record?.point || 0;
  const teacherName = record?.teacher?.name || "Guru";
  const date =
    dayjs(record?.createdAt).format("DD MMMM YYYY") ||
    dayjs().format("DD MMMM YYYY");

  const headerWithLogo = logoBase64
    ? {
        columns: [
          {
            image: logoBase64,
            width: 60,
            alignment: "left",
          },
          {
            stack: [
              { text: "SURAT PERNYATAAN", style: "header" },
              { text: "PELANGGARAN TATA TERTIB SEKOLAH", style: "subheader" },
            ],
            width: "*",
            alignment: "center",
          },
          { width: 60, text: "" }, // Empty space to balance the logo
        ],
      }
    : [
        { text: "SURAT PERNYATAAN", style: "header" },
        { text: "PELANGGARAN TATA TERTIB SEKOLAH", style: "subheader" },
      ];

  return {
    content: [
      headerWithLogo,
      { text: "\n\n" },
      { text: "Yang bertanda tangan di bawah ini:", style: "paragraph" },
      {
        layout: "noBorders",
        table: {
          widths: ["30%", "5%", "65%"],
          body: [
            ["Nama", ":", studentName],
            ["Kelas", ":", className],
            ["Pelanggaran", ":", violationName],
            ["Peraturan", ":", regulationName],
            ["Point", ":", points + " point"],
          ],
        },
      },
      { text: "\n" },
      {
        text: "Dengan ini saya menyatakan bahwa saya telah melakukan pelanggaran tata tertib sekolah sebagaimana disebutkan di atas. Saya berjanji tidak akan mengulangi pelanggaran tersebut dan akan mematuhi semua peraturan sekolah.",
        style: "paragraph",
      },
      { text: "\n\n" },
      {
        columns: [
          { width: "60%", text: "" },
          {
            width: "40%",
            text: [
              "Jakarta, " + date + "\n",
              "Yang membuat pernyataan,\n\n\n\n",
              studentName,
            ],
            alignment: "center",
          },
        ],
      },
      { text: "\n\n" },
      {
        columns: [
          {
            width: "40%",
            text: ["Mengetahui,\n", "Guru Pencatat\n\n\n\n", teacherName],
            alignment: "center",
          },
          { width: "20%", text: "" },
          {
            width: "40%",
            text: [
              "Mengetahui,\n",
              "Wali Kelas\n\n\n\n",
              "______________________",
            ],
            alignment: "center",
          },
        ],
      },
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        alignment: "center",
      },
      subheader: {
        fontSize: 14,
        bold: true,
        alignment: "center",
      },
      paragraph: {
        fontSize: 12,
        alignment: "justify",
      },
    },
  };
};

// Generate summons PDF definition
export const generateSummonsPdfDefinition = (
  record: any,
  regulation: any,
  logoBase64?: string
) => {
  const studentName = record?.studentClass?.user?.student?.name || "Nama Siswa";
  const className =
    record?.studentClass?.class?.romanLevel +
      " " +
      record?.studentClass?.class?.expertise?.shortName +
      " " +
      record?.studentClass?.class?.alphabet || "Kelas";
  const violationName = record?.name || "Pelanggaran";
  const regulationName = regulation?.name || "Peraturan";
  const points = regulation?.point || record?.point || 0;
  const date =
    dayjs(record?.createdAt).format("DD MMMM YYYY") ||
    dayjs().format("DD MMMM YYYY");

  const headerWithLogo = logoBase64
    ? {
        columns: [
          {
            image: logoBase64,
            width: 60,
            alignment: "left",
          },
          {
            stack: [{ text: "SURAT PANGGILAN ORANG TUA", style: "header" }],
            width: "*",
            alignment: "center",
          },
          { width: 60, text: "" }, // Empty space to balance the logo
        ],
      }
    : { text: "SURAT PANGGILAN ORANG TUA", style: "header" };

  return {
    content: [
      headerWithLogo,
      { text: "\n\n" },
      { text: "Kepada Yth,", style: "paragraph" },
      { text: "Orang Tua/Wali Murid", style: "paragraph" },
      { text: studentName, style: "paragraph", bold: true },
      { text: "Kelas " + className, style: "paragraph" },
      { text: "di Tempat", style: "paragraph" },
      { text: "\n" },
      { text: "Dengan hormat,", style: "paragraph" },
      {
        text: "Berdasarkan catatan pelanggaran tata tertib sekolah, dengan ini kami memberitahukan bahwa putra/putri Bapak/Ibu telah melakukan pelanggaran sebagai berikut:",
        style: "paragraph",
      },
      { text: "\n" },
      {
        layout: "noBorders",
        table: {
          widths: ["30%", "5%", "65%"],
          body: [
            ["Jenis Pelanggaran", ":", violationName],
            ["Peraturan", ":", regulationName],
            ["Point", ":", points + " point"],
            ["Tindakan yang diambil", ":", record?.actionTaken || "-"],
          ],
        },
      },
      { text: "\n" },
      {
        text: "Sehubungan dengan hal tersebut, kami mengharapkan kehadiran Bapak/Ibu pada:",
        style: "paragraph",
      },
      { text: "\n" },
      {
        layout: "noBorders",
        table: {
          widths: ["30%", "5%", "65%"],
          body: [
            ["Hari/Tanggal", ":", "___________________"],
            ["Waktu", ":", "___________________"],
            ["Tempat", ":", "Ruang BK / Ruang Kesiswaan"],
            ["Keperluan", ":", "Pembinaan dan Konsultasi"],
          ],
        },
      },
      { text: "\n" },
      {
        text: "Demikian surat panggilan ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.",
        style: "paragraph",
      },
      { text: "\n\n" },
      {
        columns: [
          { width: "60%", text: "" },
          {
            width: "40%",
            text: [
              "Jakarta, " + date + "\n",
              "Guru BK / Kesiswaan,\n\n\n\n",
              "______________________",
            ],
            alignment: "center",
          },
        ],
      },
      { text: "\n\n" },
      {
        columns: [
          {
            width: "40%",
            text: [
              "Mengetahui,\n",
              "Kepala Sekolah\n\n\n\n",
              "______________________",
            ],
            alignment: "center",
          },
          { width: "20%", text: "" },
          {
            width: "40%",
            text: [
              "Mengetahui,\n",
              "Wali Kelas\n\n\n\n",
              "______________________",
            ],
            alignment: "center",
          },
        ],
      },
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        alignment: "center",
      },
      paragraph: {
        fontSize: 12,
        alignment: "justify",
      },
    },
  };
};

import LogoImage from "@public/logo/logo-smkn-jenangan.png";
import logo from "../public/logo/logo-smkn-jenangan.png";

// Main function to generate and download PDF
export const generatePdf = (
  record: any,
  regulation: any,
  type: "statement" | "summons",
  callback?: (dataUrl: string) => void
) => {
  // Get the logo
  // const logoPath = "/logo/logo-smkn-jenangan.png"; // Path relative to the public folder
  const logoPath = LogoImage.src; // Access the src property of the imported image

  getBase64Image(logoPath, (logoBase64) => {
    // Generate the PDF definition based on type
    const docDefinition =
      type === "statement"
        ? generateStatementPdfDefinition(record, regulation, logoBase64)
        : generateSummonsPdfDefinition(record, regulation, logoBase64);

    const pdfDocGenerator = pdfMake.createPdf(
      docDefinition as TDocumentDefinitions
    );

    // If callback is provided, get data URL for preview
    if (callback) {
      pdfDocGenerator.getDataUrl((dataUrl: string) => {
        callback(dataUrl);
      });
    }

    // Return the pdfDocGenerator for direct use
    return pdfDocGenerator;
  });
};

// Function to directly download PDF
export const downloadPdf = (
  record: any,
  regulation: any,
  type: "statement" | "summons"
) => {
  const studentName = record?.studentClass?.user?.student?.name || "siswa";
  const fileName = `${
    type === "statement" ? "Pernyataan" : "Panggilan"
  }_${studentName}_${dayjs().format("YYYYMMDD")}.pdf`;

  // Get the logo
  const logoPath = LogoImage.src; // Access the src property of the imported image

  getBase64Image(logoPath, (logoBase64) => {
    // Generate the PDF definition based on type
    const docDefinition =
      type === "statement"
        ? generateStatementPdfDefinition(record, regulation, logoBase64)
        : generateSummonsPdfDefinition(record, regulation, logoBase64);

    pdfMake
      .createPdf(docDefinition as unknown as TDocumentDefinitions)
      .download(fileName);
  });
};
