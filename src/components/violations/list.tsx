"use client";

import React, { useState } from "react";
import {
  BaseRecord,
  useMany,
  useCustom,
  useApiUrl,
  useSelect,
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
  FilterDropdown,
  getDefaultFilter,
  rangePickerFilterMapper,
  MapValueEvent,
  FilterDropdownProps,
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
  Modal,
  Input,
} from "antd";
import dayjs from "dayjs";
import { ClockCircleOutlined, FilePdfOutlined } from "@ant-design/icons";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
// import type { FilterDropdownProps } from "antd/lib/table/interface";

import { generatePdf, downloadPdf } from "@utils/pdfGenerator";
import UnauthorizedPage from "@app/unauthorized";

// Register fonts for pdfMake
pdfMake.vfs = pdfFonts.vfs;

const { Text } = Typography;
const { RangePicker } = DatePicker;

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
  const [isFiltering, setIsFiltering] = useState(false);

  // Fetch class data for filter dropdown
  const { options: classesOptionSelect } = useSelect({
    resource: "classes",
    optionLabel: "classname",
    optionValue: "id",
  });

  // Standard violations table (index method)
  const { tableProps, tableQuery, filters, setFilters } = useTable({
    resource: "violations",
    syncWithLocation: true,
    pagination: {
      pageSize: 10,
    },
    filters: {
      initial: [
        {
          field: "createdAt",
          operator: "between",
          value: undefined,
        },
        {
          field: "name",
          operator: "contains",
          value: undefined,
        },
        {
          field: "regulation.name",
          operator: "contains",
          value: undefined,
        },
        {
          field: "studentClass.user.student.name",
          operator: "contains",
          value: undefined,
        },
      ],
    },
  });

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

  // Fetch regulations for the regulations filter dropdown
  const { options: regulationsOptions } = useSelect({
    resource: "regulations",
    optionLabel: "name",
    optionValue: "id",
  });

  // Handle filter submission
  const handleFilter = (values: any) => {
    const selectedDate = values.date ? dayjs(values.date) : null;

    setIsFiltering(true);

    setClassId(values.class || null);
    setMonth(selectedDate ? selectedDate.format("MM") : null);
    setYear(selectedDate ? selectedDate.format("YYYY") : null);

    if (values.class && selectedDate) {
      setActiveTab("filtered");
    } else {
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

  const go = useGo();

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
    const categoryColors = {
      kedisiplinan: "blue",
      akademik: "purple",
      kehadiran: "cyan",
      kebersihan: "green",
      komunikasi: "orange",
      sikap: "magenta",
      pakaian: "gold",
      "kegiatan pembelajaran": "purple",
      "pakaian seragam": "gold",
      perilaku: "magenta",
      "makan dan minum": "red",
      "izin meninggalkan sekolah": "blue",
      "tindakan kenakalan dan kriminalitas": "red",
      "interaksi dengan teman, guru/karyawan dan pihak lain": "orange",
      prakerin: "geekblue",
      "data dan administrasi sekolah": "volcano",
      "pembelajaran daring": "purple",
      "lain-lain": "default",
      default: "default",
    };

    const key = category?.toLowerCase() as keyof typeof categoryColors;
    return categoryColors[key] || categoryColors.default;
  };

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
  // Helper function to determine statement level from actionTaken
  const getStatementLevel = (actionTaken: string) => {
    if (actionTaken?.includes("Surat Pernyataan 1")) return 1;
    if (actionTaken?.includes("Surat Pernyataan 2")) return 2;
    if (actionTaken?.includes("Surat Pernyataan 3")) return 3;
    return 0;
  };

  // Helper function to get button color based on statement level
  const getStatementButtonColor = (level: number) => {
    switch (level) {
      case 1:
        return ""; // Default color for level 1
      case 2:
        return "#faad14"; // Orange color for level 2
      case 3:
        return "#f5222d"; // Red color for level 3
      default:
        return "";
    }
  };
  return (
    <CanAccess
      resource="violations"
      action="list"
      fallback={<UnauthorizedPage />}
    >
      <List title="Daftar Pelanggaran Ketertiban">
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
                  label="Kelas"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Pilih Kelas"
                    allowClear
                    options={classesOptionSelect}
                  ></Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="date"
                  label="Bulan/Tahun"
                  rules={[{ required: true }]}
                >
                  <DatePicker
                    picker="month"
                    placeholder="Pilih Bulan/Tahun"
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
                    filterDropdown={(props) => (
                      <FilterDropdown
                        {...props}
                        mapValue={(selectedKeys, event) => {
                          return rangePickerFilterMapper(selectedKeys, event);
                        }}
                      >
                        <DatePicker.RangePicker />
                      </FilterDropdown>
                    )}
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
                    dataIndex={["regulation", "name"]}
                    title="Peraturan yang Dilanggar"
                    // filterDropdown={(props: FilterDropdownProps) => (
                    //   <FilterDropdown {...props}>
                    //     <Input
                    //       placeholder="Search regulation"
                    //       style={{ width: "100%" }}
                    //     />
                    //   </FilterDropdown>
                    // )}
                    defaultFilteredValue={getDefaultFilter(
                      "regulation.name",
                      filters,
                      "contains"
                    )}
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
                              {regulation.category}
                            </Tag>
                          )}
                        </Space>
                      );
                    }}
                  />
                  <Table.Column
                    dataIndex={["studentClass", "user", "student", "name"]}
                    title="Nama Siswa yang Melanggar"
                    // filterDropdown={(props: FilterDropdownProps) => (
                    //   <FilterDropdown {...props}>
                    //     <Input
                    //       placeholder="Search student"
                    //       style={{ width: "100%" }}
                    //     />
                    //   </FilterDropdown>
                    // )}
                    defaultFilteredValue={getDefaultFilter(
                      "studentClass.user.student.name",
                      filters,
                      "contains"
                    )}
                    render={(text, record) => {
                      const studentName = text; // Nama siswa
                      const className = record.studentClass.class.romanLevel; // Kelas (XI)
                      const prodyName =
                        record.studentClass.class.expertise.shortName; // Prody (RPL)
                      const classAlphabet = record.studentClass.class.alphabet; // Kelas (B)

                      // Gabungkan menjadi format "siswa - XI RPL B"
                      return `${studentName} - ${className} ${prodyName} ${classAlphabet}`;
                    }}
                  />

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
                    // teacher name make bold
                    render={(text) => <Text strong>{text || "N/A"}</Text>}
                  />

                  <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    fixed="right"
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
                      </Space>
                    )}
                  />
                  <Table.Column
                    title="Cetak Surat"
                    dataIndex="actions"
                    fixed="right"
                    render={(_, record: BaseRecord) => {
                      const regulation =
                        record.regulation ||
                        regulationData?.data?.find(
                          (item) => item.id === record.regulationId
                        );

                      const actionTaken = regulation?.actionTaken || "";
                      const showStatementButton =
                        actionTaken.includes("Surat Pernyataan");
                      const showSummonsButton = actionTaken.includes(
                        "Panggilan Orang Tua"
                      );
                      const statementLevel = getStatementLevel(actionTaken);
                      const statementColor =
                        getStatementButtonColor(statementLevel);

                      // If neither button should be shown, return null
                      if (!showStatementButton && !showSummonsButton) {
                        return null;
                      }

                      return (
                        <CanAccess
                          resource="violations"
                          action="generatePdf"
                          fallback={null}
                        >
                          <Space>
                            {showStatementButton && (
                              <Button
                                icon={<FilePdfOutlined />}
                                size="small"
                                onClick={() =>
                                  handleGeneratePdf(record, "statement")
                                }
                                title={`Surat Pernyataan ${statementLevel}`}
                                style={
                                  statementLevel > 1
                                    ? {
                                        background: statementColor,
                                        borderColor: statementColor,
                                      }
                                    : {}
                                }
                                type={
                                  statementLevel > 0 ? "primary" : "default"
                                }
                              >
                                {statementLevel > 0
                                  ? `SP-${statementLevel}`
                                  : "SP"}
                              </Button>
                            )}
                            {showSummonsButton && (
                              <Button
                                icon={<FilePdfOutlined />}
                                size="small"
                                onClick={() =>
                                  handleGeneratePdf(record, "summons")
                                }
                                danger
                                title="Surat Panggilan Orang Tua"
                              >
                                SP Ortu
                              </Button>
                            )}
                          </Space>
                        </CanAccess>
                      );
                    }}
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
                      fixed="right"
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
