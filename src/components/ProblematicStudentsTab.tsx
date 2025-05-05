import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  InputNumber,
  Button,
  Space,
  Table,
  Tag,
  Row,
  Col,
  Typography,
  Spin,
  Collapse,
  List,
  Tooltip,
  notification,
  Radio,
} from "antd";
import { useApiUrl, useCustom, useSelect } from "@refinedev/core";
import {
  FilterOutlined,
  FileTextOutlined,
  WarningOutlined,
  UserOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { exportProblematicStudentsToExcel } from "@utils/exportProblematicStudents";

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

interface ProblematicStudentsTabProps {
  classOptions: Array<{ label: string; value: string | number }>;
}

export const ProblematicStudentsTab: React.FC<ProblematicStudentsTabProps> = ({
  classOptions,
}) => {
  const apiUrl = useApiUrl();

  // Form instance
  const [form] = Form.useForm();

  // State to track filter type
  const [filterType, setFilterType] = useState<"single" | "range">("single");

  // State for filters
  const [filters, setFilters] = useState<{
    pointThreshold: number;
    minViolations: number;
    year: number | undefined;
    semester: string | undefined;
    startYear: number | undefined;
    startSemester: string | undefined;
    endYear: number | undefined;
    endSemester: string | undefined;
    classId: string | number | undefined;
  }>({
    pointThreshold: 30,
    minViolations: 3,
    // For single year filter
    year: new Date().getFullYear(),
    semester: "all",
    // For year range filter
    startYear: undefined,
    startSemester: undefined,
    endYear: undefined,
    endSemester: undefined,
    classId: undefined,
  });

  // Get school years for filter
  const { options: schoolYearOptions } = useSelect({
    resource: "school-years",
    optionLabel: "year",
    optionValue: "year",
  });

  // Generate years for school year dropdown if schoolYearOptions is not available
  const currentYear = new Date().getFullYear();
  const fallbackYearOptions = [];
  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    fallbackYearOptions.push({
      label: `${year}/${year + 1}`,
      value: year,
    });
  }

  // Use available options or fallback
  const yearOptions = schoolYearOptions?.length
    ? schoolYearOptions
    : fallbackYearOptions;

  // State for tracking if a search has been performed
  const [hasSearched, setHasSearched] = useState(false);
  // State to track if we're currently filtering
  const [isFiltering, setIsFiltering] = useState(false);
  // State to track if we're currently exporting
  const [isExporting, setIsExporting] = useState(false);
  // Add a unique key to force refetch even with same parameters
  const [filterKey, setFilterKey] = useState(0);

  // Update form values when filter type changes
  useEffect(() => {
    if (filterType === "single") {
      form.setFieldsValue({
        filterType: "single",
        startYear: undefined,
        startSemester: undefined,
        endYear: undefined,
        endSemester: undefined,
      });
    } else if (filterType === "range") {
      form.setFieldsValue({
        filterType: "range",
        schoolYear: undefined,
        semester: undefined,
      });
    }
  }, [filterType, form]);

  // Fetch problematic students data
  const { data, isLoading, refetch } = useCustom({
    url: `${apiUrl}/violation/problematic/students`,
    method: "get",
    config: {
      query: {
        ...filters,
        key: filterKey,
        // Send the appropriate filters based on filter type
        ...(filterType === "single"
          ? {
              year: filters.year,
              semester: filters.semester,
              startYear: undefined,
              startSemester: undefined,
              endYear: undefined,
              endSemester: undefined,
            }
          : {
              year: undefined,
              semester: undefined,
              startYear: filters.startYear,
              startSemester: filters.startSemester,
              endYear: filters.endYear,
              endSemester: filters.endSemester,
            }),
      },
    },
    queryOptions: {
      enabled: hasSearched,
      onSuccess: () => {
        setIsFiltering(false);
      },
      onError: (error) => {
        setIsFiltering(false);
        notification.error({
          message: "Error fetching problematic students",
          description: error.message || "An unknown error occurred",
        });
      },
    },
  });

  // Reset isFiltering if the component unmounts while loading
  useEffect(() => {
    return () => {
      setIsFiltering(false);
      setIsExporting(false);
    };
  }, []);

  // Filter the data to only include students with violations
  const filteredData =
    data?.data?.data?.filter(
      (student: { violations: string | any[] }) =>
        student.violations && student.violations.length > 0
    ) || [];

  // Handler for form submission
  const handleSearch = (values: any) => {
    setIsFiltering(true);

    const baseFilters = {
      pointThreshold: values.pointThreshold || 30,
      minViolations: values.minViolations || 3,
      classId: values.classId,
    };

    let newFilters;

    if (values.filterType === "single") {
      newFilters = {
        ...baseFilters,
        year: values.year || new Date().getFullYear(),
        semester: values.semester || "all",
        startYear: undefined,
        startSemester: undefined,
        endYear: undefined,
        endSemester: undefined,
      };
    } else {
      // range
      newFilters = {
        ...baseFilters,
        year: undefined,
        semester: undefined,
        startYear: values.startYear,
        startSemester: values.startSemester || "1",
        endYear: values.endYear,
        endSemester: values.endSemester || "2",
      };
    }

    // Increment the filter key to force a refetch even with the same parameters
    setFilterKey((prevKey) => prevKey + 1);
    setFilters(newFilters);
    setHasSearched(true);
  };

  // Handler for resetting the form
  const handleReset = () => {
    form.resetFields();
    setFilterType("single");
    form.setFieldsValue({
      filterType: "single",
      pointThreshold: 30,
      minViolations: 3,
      semester: "all",
    });
    setHasSearched(false);
    setIsFiltering(false);
  };

  // Handler for manual refresh
  const handleRefresh = () => {
    if (hasSearched) {
      setIsFiltering(true);
      setFilterKey((prevKey) => prevKey + 1); // Force refetch by incrementing key
      refetch();
    }
  };

  // Handler for exporting to Excel
  const handleExportExcel = async () => {
    if (!filteredData.length) {
      notification.warning({
        message: "Tidak ada data",
        description: "Tidak ada data untuk diexport",
      });
      return;
    }

    try {
      setIsExporting(true);
      await exportProblematicStudentsToExcel(
        filteredData,
        filters,
        data?.data?.meta,
        classOptions
      );

      notification.success({
        message: "Export berhasil",
        description: "Data berhasil diexport ke format Excel",
      });
    } catch (error) {
      console.error("Export error:", error);
      notification.error({
        message: "Export gagal",
        description: "Terjadi kesalahan saat mengexport data",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatSemesterText = (semesterValue: string) => {
    if (semesterValue === "all") return "Semua Semester";
    if (semesterValue === "1") return "Semester 1";
    if (semesterValue === "2") return "Semester 2";
    return "Semua Semester"; // Default fallback
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
          initialValues={{
            pointThreshold: 30,
            minViolations: 3,
            semester: "all",
            filterType: "single",
          }}
        >
          <Row gutter={24}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="pointThreshold"
                label="Batas Minimum Poin"
                tooltip="Siswa dengan total poin pelanggaran di atas nilai ini akan ditampilkan"
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="minViolations"
                label="Minimum Pelanggaran"
                tooltip="Siswa dengan jumlah pelanggaran di atas nilai ini akan ditampilkan"
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          {/* School Year Filter Section */}
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item name="filterType" label="Filter Tahun Ajaran">
                <Radio.Group
                  onChange={(e) => setFilterType(e.target.value)}
                  value={filterType}
                  style={{ width: "100%" }}
                >
                  <Radio value="single">Tahun Ajaran Tunggal</Radio>
                  <Radio value="range">Rentang Tahun Ajaran</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          {/* Single Year Filter */}
          {filterType === "single" && (
            <Row gutter={24}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="year" label="Tahun Ajaran">
                  <Select
                    placeholder="Pilih Tahun Ajaran"
                    style={{ width: "100%" }}
                    allowClear
                  >
                    {yearOptions?.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label ||
                          `${option.value}/${Number(option.value) + 1}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="semester" label="Semester">
                  <Select style={{ width: "100%" }}>
                    <Option value="all">Semua Semester</Option>
                    <Option value="1">Semester 1</Option>
                    <Option value="2">Semester 2</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* Year Range Filter */}
          {filterType === "range" && (
            <Row gutter={24}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="startYear" label="Tahun Ajaran Awal">
                  <Select
                    placeholder="Pilih Tahun Ajaran Awal"
                    style={{ width: "100%" }}
                    allowClear
                  >
                    {yearOptions?.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label ||
                          `${option.value}/${Number(option.value) + 1}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="startSemester" label="Semester Awal">
                  <Select
                    placeholder="Pilih Semester Awal"
                    style={{ width: "100%" }}
                    allowClear
                  >
                    <Option value="1">Semester 1</Option>
                    <Option value="2">Semester 2</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="endYear" label="Tahun Ajaran Akhir">
                  <Select
                    placeholder="Pilih Tahun Ajaran Akhir"
                    style={{ width: "100%" }}
                    allowClear
                  >
                    {yearOptions
                      ?.filter((option) => {
                        const startYear = form.getFieldValue("startYear");
                        return (
                          !startYear ||
                          Number(option.value) >= Number(startYear)
                        );
                      })
                      .map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label ||
                            `${option.value}/${Number(option.value) + 1}`}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="endSemester" label="Semester Akhir">
                  <Select
                    placeholder="Pilih Semester Akhir"
                    style={{ width: "100%" }}
                    allowClear
                  >
                    <Option value="1">Semester 1</Option>
                    <Option value="2">Semester 2</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* Class Filter */}
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12}>
              <Form.Item name="classId" label="Kelas">
                <Select
                  placeholder="Pilih Kelas"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label)
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  options={classOptions}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item style={{ marginTop: 29 }}>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<FilterOutlined />}
                    loading={isFiltering}
                    disabled={isFiltering}
                  >
                    Filter
                  </Button>
                  <Button onClick={handleReset} disabled={isFiltering}>
                    Reset
                  </Button>
                  {hasSearched && (
                    <Button
                      onClick={handleRefresh}
                      icon={<ReloadOutlined />}
                      disabled={isFiltering}
                    >
                      Refresh
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Only show loading state when filtering has been initiated */}
      {hasSearched && (isLoading || isFiltering) ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Memperbarui data...</div>
        </div>
      ) : hasSearched && data?.data?.data ? (
        <>
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Title level={5}>
                Hasil Pencarian: {filteredData.length} Siswa Bermasalah
              </Title>

              <Space size="small" wrap>
                {filterType === "single" ? (
                  <>
                    <Tag color="blue">
                      Tahun Ajaran: {data.data.meta.school_year || filters.year}{" "}
                    </Tag>
                    <Tag color="purple">
                      {formatSemesterText(
                        data.data.meta.semester || filters.semester
                      )}
                    </Tag>
                  </>
                ) : (
                  <>
                    <Tag color="blue">
                      Tahun Ajaran:{" "}
                      {data.data.meta.year_range ||
                        `${filters.startYear}-${filters.endYear}`}{" "}
                      {data.data.meta.semester_range
                        ? `(${data.data.meta.semester_range})`
                        : `(${filters.startSemester || "1"}-${
                            filters.endSemester || "2"
                          })`}
                    </Tag>
                  </>
                )}
                <Tag color="orange">
                  Point ≥ {data.data.meta.filters.point_threshold}
                </Tag>
                <Tag color="cyan">
                  Min. Pelanggaran: {data.data.meta.filters.min_violations}
                </Tag>
                {data.data.meta.filters.class_id && (
                  <Tag color="green">
                    Kelas:{" "}
                    {classOptions.find(
                      (c) => c.value === data.data.meta.filters.class_id
                    )?.label || data.data.meta.filters.class_id}
                  </Tag>
                )}
              </Space>
            </div>

            {/* Export Button */}
            {filteredData.length > 0 && (
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
                loading={isExporting}
                disabled={isExporting}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
              >
                Export Excel
              </Button>
            )}
          </div>

          {filteredData.length > 0 ? (
            <Table
              dataSource={filteredData}
              rowKey="student_id"
              pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender: (record) => (
                  <Collapse ghost>
                    <Panel
                      header={`${
                        (record as any).violations.length
                      } Pelanggaran`}
                      key="1"
                    >
                      <List
                        size="small"
                        dataSource={(record as any).violations}
                        renderItem={(violation: any) => (
                          <List.Item>
                            <List.Item.Meta
                              title={
                                <Space>
                                  <FileTextOutlined />
                                  <Text strong>{violation.regulation}</Text>
                                  <Tag color="red">{violation.point} Poin</Tag>
                                </Space>
                              }
                              description={
                                <>
                                  <div>
                                    <Text type="secondary">
                                      {new Date(
                                        violation.createdAt
                                      ).toLocaleDateString("id-ID", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </Text>
                                  </div>
                                  {violation.description && (
                                    <div style={{ marginTop: 4 }}>
                                      <Text>{violation.description}</Text>
                                    </div>
                                  )}
                                </>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </Panel>
                  </Collapse>
                ),
              }}
            >
              <Table.Column
                title="No."
                width={60}
                render={(_, __, index) => index + 1}
              />
              <Table.Column
                title="Nama Siswa"
                dataIndex="student_name"
                render={(text) => (
                  <Space>
                    <UserOutlined />
                    <Text strong>{text}</Text>
                  </Space>
                )}
                sorter={(a, b) => a.student_name.localeCompare(b.student_name)}
              />
              <Table.Column
                title="NIS/NISN"
                render={(record) => (
                  <>
                    {record.nis && <div>NIS: {record.nis}</div>}
                    {record.nisn && <div>NISN: {record.nisn}</div>}
                  </>
                )}
              />
              <Table.Column
                title="Kelas"
                render={(record) => (
                  <Text>
                    {record.roman_level} {record.expertise} {record.alphabet}
                  </Text>
                )}
              />
              <Table.Column
                title="Total Poin"
                dataIndex="total_points"
                sorter={(a, b) => a.total_points - b.total_points}
                render={(points) => (
                  <Tooltip title="Total poin pelanggaran">
                    <Tag
                      color={
                        points > 75 ? "red" : points > 50 ? "orange" : "purple"
                      }
                      icon={<WarningOutlined />}
                    >
                      {points} Poin
                    </Tag>
                  </Tooltip>
                )}
              />
              <Table.Column
                title="Jumlah Pelanggaran"
                dataIndex="violation_count"
                sorter={(a, b) => a.violation_count - b.violation_count}
                render={(count) => <Tag color="blue">{count} Pelanggaran</Tag>}
              />
              <Table.Column
                title="Pelanggaran Semester Ini"
                dataIndex="semester_violations"
                sorter={(a, b) => a.semester_violations - b.semester_violations}
                render={(count) => <Tag color="green">{count} Pelanggaran</Tag>}
              />
            </Table>
          ) : (
            <Card>
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Text type="secondary">
                  Tidak ada siswa bermasalah yang ditemukan dengan kriteria ini.
                </Text>
              </div>
            </Card>
          )}
        </>
      ) : hasSearched ? (
        <Card>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <Text type="secondary">
              Tidak ada siswa bermasalah yang ditemukan dengan kriteria ini.
            </Text>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <FilterOutlined
              style={{ fontSize: 40, color: "#d9d9d9", marginBottom: 16 }}
            />
            <div>
              <Text type="secondary">
                Silahkan gunakan filter di atas untuk menemukan siswa
                bermasalah.
              </Text>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
