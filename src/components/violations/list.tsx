"use client";

import React, { useState } from "react";
import {
  BaseRecord,
  useMany,
  useCustom,
  useApiUrl,
  useSelect,
  useNavigation,
  useGetToPath,
  useGo,
  CanAccess,
} from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
  CreateButton,
} from "@refinedev/antd";
import {
  Table,
  Space,
  Form,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Typography,
  Tabs,
  Tag,
  Spin,
  Card,
  Badge,
  Modal,
} from "antd";
import dayjs from "dayjs";
import { ClockCircleOutlined, FilePdfOutlined } from "@ant-design/icons";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { generatePdf, downloadPdf } from "@utils/pdfGenerator";
import UnauthorizedPage from "@app/unauthorized";

// Register fonts for pdfMake
pdfMake.vfs = pdfFonts.vfs;

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

export const ViolationsList = () => {
  const [form] = Form.useForm();
  const [classId, setClassId] = useState<string | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const apiUrl = useApiUrl();
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfType, setPdfType] = useState<"statement" | "summons" | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<any>(null);

  // const { data: canEdit } = useCan({
  //   resource: "regulations",
  //   action: "edit",
  // });

  // Fetch class data for filter dropdown
  const { options: classesOptionSelect } = useSelect({
    resource: "classes",
    optionLabel: "classname",
    optionValue: "id",
  });

  // Standard violations table (index method)
  const { tableProps, tableQuery } = useTable({
    resource: "violations",
    syncWithLocation: true,
    pagination: {
      pageSize: 10,
    },
  });
  const [isFiltering, setIsFiltering] = useState(false);
  // Student violations data (studentViolations method)
  const { data: studentViolationsData, isLoading: studentViolationsLoading } =
    useCustom({
      url: `${apiUrl}/violations/students`,
      method: "get",
      config: {
        query: {
          class: classId,
          month,
          year,
        },
      },
      queryOptions: {
        enabled: !!classId && !!month && !!year,
        onSettled: () => {
          // Set isFiltering ke false ketika data berhasil diambil atau terjadi error
          setIsFiltering(false);
        },
      },
    });

  // Fetch regulation data for display
  const { data: regulationData, isLoading: regulationIsLoading } = useMany({
    resource: "regulations",
    ids: tableProps?.dataSource?.map((item) => item?.regulationId) ?? [],
    queryOptions: {
      enabled: !!tableProps?.dataSource,
    },
  });

  // Handle filter submission
  const handleFilter = (values: any) => {
    const selectedDate = values.date ? dayjs(values.date) : null;

    // Aktifkan loading state dulu
    setIsFiltering(true);

    // Update filter values
    setClassId(values.class || null);
    setMonth(selectedDate ? selectedDate.format("MM") : null);
    setYear(selectedDate ? selectedDate.format("YYYY") : null);

    if (values.class && selectedDate) {
      setActiveTab("filtered");
    } else {
      // Jika tidak ada filter yang valid, berhenti loading
      setIsFiltering(false);
      setActiveTab("all");
    }
  };

  // Handle filter reset
  const handleReset = () => {
    form.resetFields();
    setClassId(null);
    setMonth(null);
    setYear(null);
    setActiveTab("all");
    setIsFiltering(false);
  };

  // Handle student detail view
  const navigate = useNavigation();
  const getToPath = useGetToPath();
  const go = useGo();
  const { show } = useNavigation();

  const handleViewDetails = (studentId: string) => {
    if (month && year) {
      go({
        to: {
          resource: "student-violations",
          action: "show",
          id: studentId,
        },
        query: {
          month: month,
          year: year,
        },
        type: "push",
      });
    }
  };

  // Get color based on regulation category
  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      kedisiplinan: "blue",
      akademik: "purple",
      kehadiran: "cyan",
      kebersihan: "green",
      komunikasi: "orange",
      sikap: "magenta",
      pakaian: "gold",
      default: "default",
    };

    return categoryColors[category?.toLowerCase()] || categoryColors.default;
  };

  console.log(tableQuery, tableProps);

  // Generate PDF for statement or summons
  // const generatePdf = (record: any, type: "statement" | "summons") => {
  //   setSelectedViolation(record);
  //   setPdfType(type);

  //   const regulation =
  //     record.regulation ||
  //     regulationData?.data?.find((item) => item.id === record.regulationId);

  //   const studentName =
  //     record?.studentClass?.user?.student?.name || "Nama Siswa";
  //   const className =
  //     record?.studentClass?.class?.romanLevel +
  //       " " +
  //       record?.studentClass?.class?.expertise?.shortName +
  //       " " +
  //       record?.studentClass?.class?.alphabet || "Kelas";
  //   const violationName = record?.name || "Pelanggaran";
  //   const regulationName = regulation?.name || "Peraturan";
  //   const points = regulation?.point || record?.point || 0;
  //   const teacherName = record?.teacher?.name || "Guru";
  //   const date =
  //     dayjs(record?.createdAt).format("DD MMMM YYYY") ||
  //     dayjs().format("DD MMMM YYYY");

  //   // Create document definition based on type
  //   let docDefinition;

  //   if (type === "statement") {
  //     docDefinition = {
  //       content: [
  //         { text: "SURAT PERNYATAAN", style: "header" },
  //         { text: "PELANGGARAN TATA TERTIB SEKOLAH", style: "subheader" },
  //         { text: "\n\n" },
  //         { text: "Yang bertanda tangan di bawah ini:", style: "paragraph" },
  //         {
  //           layout: "noBorders",
  //           table: {
  //             widths: ["30%", "5%", "65%"],
  //             body: [
  //               ["Nama", ":", studentName],
  //               ["Kelas", ":", className],
  //               ["Pelanggaran", ":", violationName],
  //               ["Peraturan", ":", regulationName],
  //               ["Point", ":", points + " point"],
  //             ],
  //           },
  //         },
  //         { text: "\n" },
  //         {
  //           text: "Dengan ini saya menyatakan bahwa saya telah melakukan pelanggaran tata tertib sekolah sebagaimana disebutkan di atas. Saya berjanji tidak akan mengulangi pelanggaran tersebut dan akan mematuhi semua peraturan sekolah.",
  //           style: "paragraph",
  //         },
  //         { text: "\n\n" },
  //         {
  //           columns: [
  //             { width: "60%", text: "" },
  //             {
  //               width: "40%",
  //               text: [
  //                 "Jakarta, " + date + "\n",
  //                 "Yang membuat pernyataan,\n\n\n\n",
  //                 studentName,
  //               ],
  //               alignment: "center",
  //             },
  //           ],
  //         },
  //         { text: "\n\n" },
  //         {
  //           columns: [
  //             {
  //               width: "40%",
  //               text: ["Mengetahui,\n", "Guru Pencatat\n\n\n\n", teacherName],
  //               alignment: "center",
  //             },
  //             { width: "20%", text: "" },
  //             {
  //               width: "40%",
  //               text: [
  //                 "Mengetahui,\n",
  //                 "Wali Kelas\n\n\n\n",
  //                 "______________________",
  //               ],
  //               alignment: "center",
  //             },
  //           ],
  //         },
  //       ],
  //       styles: {
  //         header: {
  //           fontSize: 16,
  //           bold: true,
  //           alignment: "center",
  //         },
  //         subheader: {
  //           fontSize: 14,
  //           bold: true,
  //           alignment: "center",
  //         },
  //         paragraph: {
  //           fontSize: 12,
  //           alignment: "justify",
  //         },
  //       },
  //     };
  //   } else {
  //     // summons
  //     docDefinition = {
  //       content: [
  //         { text: "SURAT PANGGILAN ORANG TUA", style: "header" },
  //         { text: "\n\n" },
  //         { text: "Kepada Yth,", style: "paragraph" },
  //         { text: "Orang Tua/Wali Murid", style: "paragraph" },
  //         { text: studentName, style: "paragraph", bold: true },
  //         { text: "Kelas " + className, style: "paragraph" },
  //         { text: "di Tempat", style: "paragraph" },
  //         { text: "\n" },
  //         { text: "Dengan hormat,", style: "paragraph" },
  //         {
  //           text: "Berdasarkan catatan pelanggaran tata tertib sekolah, dengan ini kami memberitahukan bahwa putra/putri Bapak/Ibu telah melakukan pelanggaran sebagai berikut:",
  //           style: "paragraph",
  //         },
  //         { text: "\n" },
  //         {
  //           layout: "noBorders",
  //           table: {
  //             widths: ["30%", "5%", "65%"],
  //             body: [
  //               ["Jenis Pelanggaran", ":", violationName],
  //               ["Peraturan", ":", regulationName],
  //               ["Point", ":", points + " point"],
  //               ["Tindakan yang diambil", ":", record?.actionTaken || "-"],
  //             ],
  //           },
  //         },
  //         { text: "\n" },
  //         {
  //           text: "Sehubungan dengan hal tersebut, kami mengharapkan kehadiran Bapak/Ibu pada:",
  //           style: "paragraph",
  //         },
  //         { text: "\n" },
  //         {
  //           layout: "noBorders",
  //           table: {
  //             widths: ["30%", "5%", "65%"],
  //             body: [
  //               ["Hari/Tanggal", ":", "___________________"],
  //               ["Waktu", ":", "___________________"],
  //               ["Tempat", ":", "Ruang BK / Ruang Kesiswaan"],
  //               ["Keperluan", ":", "Pembinaan dan Konsultasi"],
  //             ],
  //           },
  //         },
  //         { text: "\n" },
  //         {
  //           text: "Demikian surat panggilan ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.",
  //           style: "paragraph",
  //         },
  //         { text: "\n\n" },
  //         {
  //           columns: [
  //             { width: "60%", text: "" },
  //             {
  //               width: "40%",
  //               text: [
  //                 "Jakarta, " + date + "\n",
  //                 "Guru BK / Kesiswaan,\n\n\n\n",
  //                 "______________________",
  //               ],
  //               alignment: "center",
  //             },
  //           ],
  //         },
  //         { text: "\n\n" },
  //         {
  //           columns: [
  //             {
  //               width: "40%",
  //               text: [
  //                 "Mengetahui,\n",
  //                 "Kepala Sekolah\n\n\n\n",
  //                 "______________________",
  //               ],
  //               alignment: "center",
  //             },
  //             { width: "20%", text: "" },
  //             {
  //               width: "40%",
  //               text: [
  //                 "Mengetahui,\n",
  //                 "Wali Kelas\n\n\n\n",
  //                 "______________________",
  //               ],
  //               alignment: "center",
  //             },
  //           ],
  //         },
  //       ],
  //       styles: {
  //         header: {
  //           fontSize: 16,
  //           bold: true,
  //           alignment: "center",
  //         },
  //         paragraph: {
  //           fontSize: 12,
  //           alignment: "justify",
  //         },
  //       },
  //     };
  //   }

  //   const pdfDocGenerator = pdfMake.createPdf(
  //     docDefinition as TDocumentDefinitions
  //   );

  //   // Open PDF preview in modal
  //   pdfDocGenerator.getDataUrl((dataUrl: any) => {
  //     setPdfPreviewUrl(dataUrl);
  //     setPdfPreviewVisible(true);
  //   });
  // };'

  const handleGeneratePdf = (record: any, type: "statement" | "summons") => {
    setSelectedViolation(record);
    setPdfType(type);

    const regulation =
      record.regulation ||
      regulationData?.data?.find((item) => item.id === record.regulationId);

    generatePdf(record, regulation, type, (dataUrl: string) => {
      setPdfPreviewUrl(dataUrl);
      setPdfPreviewVisible(true);
    });
  };

  return (
    <CanAccess
      resource="violations"
      action="list"
      fallback={<UnauthorizedPage />}
    >
      <List>
        <Card style={{ marginBottom: 16 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFilter}
            initialValues={{}}
          >
            <Row gutter={24}>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="class"
                  label="Class"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Select Class"
                    allowClear
                    options={classesOptionSelect}
                  ></Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="date"
                  label="Month and Year"
                  rules={[{ required: true }]}
                >
                  <DatePicker
                    picker="month"
                    placeholder="Select Month/Year"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                sm={8}
                style={{ display: "flex", alignItems: "center" }}
              >
                <Space>
                  <Button type="primary" htmlType="submit">
                    Filter
                  </Button>
                  <Button onClick={handleReset}>Reset</Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "all",
              label: "All Violations",
              children: (
                // All Violations Tab Content
                <Table {...tableProps} rowKey="id">
                  <Table.Column
                    title="No."
                    width={60}
                    render={(_, __, index) => {
                      const { current = 1, pageSize = 10 } =
                        tableProps.pagination || {};
                      return (current - 1) * pageSize + index + 1;
                    }}
                  />
                  <Table.Column
                    dataIndex={["createdAt"]}
                    title="Dibuat Pada"
                    sorter
                    render={(value: any) => (
                      <Space>
                        <ClockCircleOutlined style={{ color: "#8c8c8c" }} />
                        <DateField
                          value={value}
                          format="DD MMM YYYY"
                          style={{ color: "#8c8c8c" }}
                        />
                      </Space>
                    )}
                  />
                  <Table.Column
                    dataIndex={["regulation"]}
                    title="Peraturan yang Dilanggar"
                    render={(value, record: any) => {
                      if (regulationIsLoading) return <Spin size="small" />;

                      const regulation =
                        record.regulation ||
                        regulationData?.data?.find(
                          (item) => item.id === record.regulationId
                        );

                      if (!regulation) return "Unknown regulation";

                      return (
                        <Space direction="vertical" size={0}>
                          <Text>{regulation.name}</Text>
                          {regulation.category && (
                            <Tag color={getCategoryColor(regulation.category)}>
                              {regulation.category} - {regulation.type}
                            </Tag>
                          )}
                        </Space>
                      );
                    }}
                  />
                  <Table.Column
                    dataIndex={["studentClass", "user", "student", "name"]}
                    title="Nama siswa yang melanggar"
                  />
                  <Table.Column dataIndex="name" title="Nama Pelanggaran" />

                  <Table.Column
                    dataIndex={["regulation", "actionTaken"]}
                    title="Tindakan yang diambil"
                  />
                  <Table.Column
                    title="Point"
                    render={(_, record: any) => {
                      const regulation =
                        record.regulation ||
                        regulationData?.data?.find(
                          (item) => item.id === record.regulationId
                        );

                      const point = regulation?.point || record.point || 0;

                      return (
                        <Tag
                          color={
                            point > 20
                              ? "red"
                              : point > 10
                              ? "default"
                              : "default"
                          }
                        >
                          {point} points
                        </Tag>
                      );
                    }}
                  />
                  <Table.Column
                    dataIndex={["teacher", "name"]}
                    title="Guru Pencatat"
                  />

                  <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record: BaseRecord) => (
                      <Space>
                        <EditButton
                          hideText
                          size="small"
                          recordItemId={record.id}
                        />
                        <ShowButton
                          hideText
                          size="small"
                          recordItemId={record.id}
                        />
                        <DeleteButton
                          hideText
                          size="small"
                          recordItemId={record.id}
                        />
                        <CanAccess
                          resource="violations"
                          action="generatePdf"
                          fallback={null}
                        >
                          <Button
                            icon={<FilePdfOutlined />}
                            size="small"
                            onClick={() =>
                              handleGeneratePdf(record, "statement")
                            }
                            title="Surat Pernyataan"
                          />
                          <Button
                            icon={<FilePdfOutlined />}
                            size="small"
                            onClick={() => handleGeneratePdf(record, "summons")}
                            danger
                            title="Surat Panggilan Orang Tua"
                          />
                        </CanAccess>
                      </Space>
                    )}
                  />
                </Table>
              ),
            },
            {
              key: "filtered",
              label: "Filtered Violations",
              disabled: !classId || !month || !year,
              children:
                studentViolationsLoading || isFiltering ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spin />
                    <div style={{ marginTop: "10px" }}>
                      Loading student violations...
                    </div>
                  </div>
                ) : studentViolationsData?.data?.length > 0 ? (
                  <Table
                    dataSource={
                      Array.isArray(studentViolationsData?.data)
                        ? studentViolationsData?.data
                        : []
                    }
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  >
                    <Table.Column
                      title="No."
                      width={60}
                      render={(_, __, index) => index + 1}
                    />
                    <Table.Column dataIndex="name" title="Nama Siswa" />
                    <Table.Column dataIndex="nis" title="NIS" />
                    <Table.Column dataIndex="nisn" title="NISN" />
                    <Table.Column
                      title="Kelas"
                      render={(record) => {
                        const classData = record.class;
                        if (!classData) return "N/A";

                        return `${classData.romanLevel} ${classData.expertise.shortName} ${classData.alphabet} - ${classData.expertise.prody.faculty.schoolYear.year}`;
                      }}
                    />
                    <Table.Column
                      dataIndex="totalPoints"
                      title="Total Points"
                      render={(value) => <Tag color="pink">{value} points</Tag>}
                      sorter={(a: any, b: any) => a.totalPoints - b.totalPoints}
                    />
                    <Table.Column
                      title="Actions"
                      dataIndex="actions"
                      render={(_, record: BaseRecord) => (
                        <Button
                          type="primary"
                          size="small"
                          onClick={() =>
                            record.id !== undefined &&
                            handleViewDetails(String(record.id))
                          }
                        >
                          View Details
                        </Button>
                      )}
                    />
                  </Table>
                ) : (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Text type="secondary">
                      No violations found for the selected filters. Please try
                      different criteria.
                    </Text>
                  </div>
                ),
            },
          ]}
        ></Tabs>

        {/* PDF Preview Modal */}
        <Modal
          title={
            pdfType === "statement"
              ? "Surat Pernyataan"
              : "Surat Panggilan Orang Tua"
          }
          open={pdfPreviewVisible}
          onCancel={() => setPdfPreviewVisible(false)}
          width={800}
          footer={[
            <Button key="close" onClick={() => setPdfPreviewVisible(false)}>
              Close
            </Button>,
            <Button
              key="download"
              type="primary"
              onClick={() => {
                if (selectedViolation && pdfType) {
                  const regulation =
                    selectedViolation.regulation ||
                    regulationData?.data?.find(
                      (item) => item.id === selectedViolation.regulationId
                    );

                  downloadPdf(selectedViolation, regulation, pdfType);
                }
              }}
            >
              Download
            </Button>,
          ]}
        >
          {pdfPreviewUrl && (
            <iframe
              src={pdfPreviewUrl}
              style={{ width: "100%", height: "500px" }}
              frameBorder="0"
            ></iframe>
          )}
        </Modal>
      </List>
    </CanAccess>
  );
};
