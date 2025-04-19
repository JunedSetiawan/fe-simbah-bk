// ClassSummaryList.tsx
"use client";

import React, { useState } from "react";
import {
  useCustom,
  useApiUrl,
  useSelect,
  useGo,
  CanAccess,
} from "@refinedev/core";
import { List, DateField } from "@refinedev/antd";
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
  Spin,
  Card,
  Tag,
  Tabs,
  Empty,
  Popover,
  Alert,
} from "antd";
import dayjs from "dayjs";
import {
  ClockCircleOutlined,
  DownloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import UnauthorizedPage from "@app/unauthorized";
import { exportClassSummaryToExcel } from "@utils/exportExcel";

interface ClassSummaryData {
  class: {
    romanLevel: string;
    expertise: {
      shortName: string;
    };
    alphabet: string;
  };
  schoolYear: string;
  semester: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  students: Array<{
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
  }>;
}

const { Text } = Typography;

export const ViolationSummaryClassList = () => {
  const [form] = Form.useForm();
  const [classId, setClassId] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [semester, setSemester] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const apiUrl = useApiUrl();
  const go = useGo();

  // Fetch class data for filter dropdown
  const { options: classesOptionSelect } = useSelect({
    resource: "classes",
    optionLabel: "classname",
    optionValue: "id",
  });

  // Fetch school years for dropdown
  const { options: schoolYearOptions } = useSelect({
    resource: "school-years",
    optionLabel: "year",
    optionValue: "year",
  });

  // Get class summary data
  const {
    data: classSummaryData,
    isLoading: classSummaryLoading,
    refetch,
  } = useCustom({
    url: `${apiUrl}/violation-summary/class`,
    method: "get",
    config: {
      query: {
        class_id: classId,
        year,
        semester,
      },
    },
    queryOptions: {
      enabled: !!classId && !!year && !!semester && filterApplied,
      onSettled: () => {
        setIsLoading(false);
        setDataFetched(true);
      },
    },
  });

  // Handle filter submission
  const handleFilter = (values: any) => {
    setIsLoading(true);
    setClassId(values.class || null);
    setYear(values.year || null);
    setSemester(values.semester || null);
    setFilterApplied(true);

    if (values.class && values.year && values.semester) {
      refetch();
    } else {
      setIsLoading(false);
    }
  };

  // Handle filter reset
  const handleReset = () => {
    form.resetFields();
    setClassId(null);
    setYear(null);
    setSemester(null);
    setFilterApplied(false);
    setDataFetched(false);
  };

  const handleViewDetails = (studentId: string) => {
    if (semester && year) {
      go({
        to: {
          resource: "student-violations",
          action: "show",
          id: studentId,
        },
        query: {
          semester,
          year,
        },
        type: "push",
      });
    }
  };

  const handleExportToExcel = () => {
    if (!classSummaryData?.data) return;
    exportClassSummaryToExcel(classSummaryData.data as ClassSummaryData);
  };

  const renderEmptyState = () => {
    if (!filterApplied) {
      return (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                <Text strong>Silakan pilih filter terlebih dahulu</Text>
                <br />
                <Text type="secondary">
                  Silakan pilih kelas, tahun ajaran, dan semester untuk melihat
                  data
                </Text>
              </span>
            }
          ></Empty>
        </div>
      );
    }

    if (
      dataFetched &&
      (!classSummaryData || !classSummaryData.data?.students?.length)
    ) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Empty
            description={
              <Text type="secondary">
                Tidak ada data untuk filter yang dipilih. Silakan coba kriteria
                yang berbeda.
              </Text>
            }
          />
        </div>
      );
    }

    return null;
  };

  return (
    <CanAccess
      resource="violations"
      action="list"
      fallback={<UnauthorizedPage />}
    >
      <List title="Ringkasan Pelanggaran & Penghargaan Siswa filter Kelas">
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
                  rules={[{ required: true, message: "Kelas wajib dipilih" }]}
                >
                  <Select
                    placeholder="Pilih Kelas"
                    allowClear
                    options={classesOptionSelect}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={6}>
                <Form.Item
                  name="year"
                  label="Tahun Ajaran"
                  rules={[
                    { required: true, message: "Tahun ajaran wajib dipilih" },
                  ]}
                >
                  <Select
                    placeholder="Pilih Tahun Ajaran"
                    allowClear
                    options={schoolYearOptions}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={6}>
                <Form.Item
                  name="semester"
                  label="Semester"
                  rules={[
                    { required: true, message: "Semester wajib dipilih" },
                  ]}
                >
                  <Select
                    placeholder="Pilih Semester"
                    allowClear
                    options={[
                      { label: "Ganjil (1)", value: "1" },
                      { label: "Genap (2)", value: "2" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                sm={4}
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

        {renderEmptyState() ||
          (isLoading || classSummaryLoading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin />
              <div style={{ marginTop: "10px" }}>Memuat ringkasan kelas...</div>
            </div>
          ) : classSummaryData?.data?.students?.length > 0 ? (
            <div>
              <Card style={{ marginBottom: 16 }}>
                <Row gutter={24}>
                  <Col span={12}>
                    <Text strong>Kelas: </Text>
                    <Text>
                      {classSummaryData?.data?.class?.romanLevel}{" "}
                      {classSummaryData?.data?.class?.expertise?.shortName}{" "}
                      {classSummaryData?.data?.class?.alphabet}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Tahun Ajaran: </Text>
                    <Text>{classSummaryData?.data?.schoolYear}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Semester: </Text>
                    <Text>{classSummaryData?.data?.semester}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Rentang Tanggal: </Text>
                    <Text>
                      <DateField
                        value={classSummaryData?.data?.dateRange?.startDate}
                        format="DD MMM YYYY"
                      />{" "}
                      -{" "}
                      <DateField
                        value={classSummaryData?.data?.dateRange?.endDate}
                        format="DD MMM YYYY"
                      />
                    </Text>
                  </Col>
                  <Col span={24} style={{ textAlign: "right", marginTop: 16 }}>
                    <Popover
                      content={
                        <Alert
                          message={<strong>Info</strong>}
                          description={
                            <span>
                              Dalam Export Excel sudah terdapat juga untuk data
                              rekap poin Penghargaan
                            </span>
                          }
                          type="info"
                          showIcon
                        />
                      }
                    >
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleExportToExcel}
                        disabled={!classSummaryData?.data?.students?.length}
                      >
                        Export Excel
                      </Button>
                    </Popover>
                  </Col>
                </Row>
              </Card>

              <Table
                dataSource={classSummaryData?.data?.students}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              >
                <Table.Column
                  title="No."
                  width={60}
                  render={(_, __, index) => index + 1}
                />
                <Table.Column
                  dataIndex={["student", "name"]}
                  title="Nama Siswa"
                />
                <Table.Column dataIndex={["student", "nis"]} title="NIS" />
                <Table.Column dataIndex={["student", "nisn"]} title="NISN" />
                <Table.Column
                  dataIndex="totalViolationPoints"
                  title="Poin Pelanggaran"
                  render={(value) => <Tag color="red">{value} poin</Tag>}
                  sorter={(a, b) =>
                    a.totalViolationPoints - b.totalViolationPoints
                  }
                />
                <Table.Column
                  dataIndex="totalAwardPoints"
                  title="Poin Penghargaan"
                  render={(value) => <Tag color="green">{value} poin</Tag>}
                  sorter={(a, b) => a.totalAwardPoints - b.totalAwardPoints}
                />
                <Table.Column
                  dataIndex="netPoints"
                  title="Total Poin"
                  render={(value) => <Tag color="blue">{value} poin</Tag>}
                  sorter={(a, b) => a.netPoints - b.netPoints}
                />
                <Table.Column
                  dataIndex="violationCount"
                  title="Jumlah Pelanggaran"
                  render={(value) => <Text>{value}</Text>}
                />
                <Table.Column
                  dataIndex="awardCount"
                  title="Jumlah Penghargaan"
                  render={(value) => <Text>{value}</Text>}
                />
                <Table.Column
                  fixed="right"
                  title="Aksi"
                  dataIndex="actions"
                  render={(_, record) => (
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleViewDetails(record.student.id)}
                    >
                      Lihat Detail
                    </Button>
                  )}
                />
              </Table>
            </div>
          ) : null)}
      </List>
    </CanAccess>
  );
};
