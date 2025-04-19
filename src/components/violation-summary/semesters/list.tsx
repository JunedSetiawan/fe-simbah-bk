// SemesterSummary.tsx
"use client";

import React, { useState } from "react";
import { useCustom, useApiUrl, useSelect, CanAccess } from "@refinedev/core";
import { List, DateField } from "@refinedev/antd";
import {
  Table,
  Space,
  Form,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Spin,
  Card,
  Tag,
  Divider,
  Descriptions,
  Tabs,
  notification,
  Empty,
  Popover,
  Alert,
} from "antd";
import dayjs from "dayjs";
import UnauthorizedPage from "@app/unauthorized";
import { SelectProps } from "antd/lib";
import { DownloadOutlined, FilterOutlined } from "@ant-design/icons";
import { exportSemesterSummaryToExcel } from "@utils/exportExcel";

const { Text, Title } = Typography;

interface Student {
  user_id: string;
  student_id: string;
  name: string;
  nis: string;
  nisn: string;
}

export interface SemesterSummaryData {
  student: {
    name: string;
    nis: string;
    nisn: string;
    class: {
      romanLevel: string;
      expertise?: { shortName: string };
      alphabet: string;
    };
  };
  semester: string;
  schoolYear: string;
  totalPoints: number;
  totalAwardPoints: number;
  netPoints: number;
  resetMessage?: string;
  nextSemesterPoints?: number;
  violations: {
    id: string;
    createdAt: string;
    regulation: { name: string };
    description: string;
    points: number;
  }[];
  awards: {
    id: string;
    createdAt: string;
    regulation: { name: string };
    description: string;
    points: number;
  }[];
}

export const ViolationSummarySemesterList = () => {
  const [form] = Form.useForm();
  const [year, setYear] = useState<string | null>(null);
  const [semester, setSemester] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = useApiUrl();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filterApplied, setFilterApplied] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  // Class select
  const { options: classSelectProps } = useSelect({
    resource: "classes",
    optionLabel: "classname",
    optionValue: "id",
  });

  const { isLoading: isLoadingStudents } = useCustom<{ data: Student[] }>({
    url: selectedClassId ? `${apiUrl}/classes/${selectedClassId}/students` : "",
    method: "get",
    queryOptions: {
      enabled: !!selectedClassId,
      onSuccess: (response) => {
        // Handle different response structures
        if (response.data && Array.isArray(response.data)) {
          setStudents(response.data);
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          setStudents(response.data.data);
        } else {
          // Fallback if the structure is unexpected
          setStudents([]);
          notification.error({
            message: "Error",
            description: "Format respon dari server tidak sesuai",
          });
        }
      },
      onError: (error) => {
        notification.error({
          message: "Error: " + (error.message || "Kesalahan tidak diketahui"),
          description: "Gagal mengambil data siswa untuk kelas ini",
        });
        setStudents([]);
      },
    },
  });

  // Create safe student options
  const studentOptions =
    students && students.length > 0
      ? students.map((student) => ({
          label: `${student.name} (${student.nis})`,
          value: student.student_id,
          // Include additional data that might be needed
          user_id: student.user_id,
          nisn: student.nisn,
          nis: student.nis,
        }))
      : [];

  const handleClassChange = (value: string) => {
    setSelectedClassId(value);
    // Reset student selection when class changes
    form.setFieldsValue({ student_id: undefined });
  };

  // Fix TypeScript issue by creating a properly typed merge of props
  const classSelectMergedProps: SelectProps = {
    options: classSelectProps,
    onChange: (value: any) => {
      handleClassChange(value);
    },
    placeholder: "Pilih Kelas",
  };

  // Fetch school years for dropdown
  const { options: schoolYearOptions } = useSelect({
    resource: "school-years",
    optionLabel: "year",
    optionValue: "year",
  });

  // Get semester summary data
  const {
    data: semesterSummaryData,
    isLoading: semesterSummaryLoading,
    refetch,
  } = useCustom({
    url: `${apiUrl}/violation-summary/semester`,
    method: "get",
    config: {
      query: {
        student_id: selectedStudentId,
        year,
        semester,
      },
    },
    queryOptions: {
      enabled: !!selectedStudentId && !!year && !!semester && filterApplied,
      onSettled: () => {
        setIsLoading(false);
        setDataFetched(true);
      },
    },
  });

  const handleStudentChange = (value: string) => {
    setSelectedStudentId(value);
  };

  // Handle filter submission
  const handleFilter = (values: any) => {
    setIsLoading(true);
    setSelectedStudentId(values.student_id || null);
    setSelectedClassId(values.class_id || null);
    setYear(values.year || null);
    setSemester(values.semester || null);
    setFilterApplied(true);

    if (values.student_id && values.year && values.semester) {
      refetch();
    } else {
      setIsLoading(false);
    }
  };

  // Handle filter reset
  const handleReset = () => {
    form.resetFields();
    setSelectedStudentId(null);
    setSelectedClassId(null);
    setYear(null);
    setSemester(null);
    setFilterApplied(false);
    setDataFetched(false);
  };

  const handleExportToExcel = () => {
    if (!semesterSummaryData?.data) return;
    exportSemesterSummaryToExcel(
      semesterSummaryData.data as SemesterSummaryData
    );
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
                  Silakan pilih siswa, tahun ajaran, dan semester untuk melihat
                  data
                </Text>
              </span>
            }
          ></Empty>
        </div>
      );
    }

    if (dataFetched && (!semesterSummaryData || !semesterSummaryData.data)) {
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
      <List title="Ringkasan Pelanggaran & Penghargaan Siswa (filter Semester)">
        <Card style={{ marginBottom: 16 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFilter}
            initialValues={{}}
          >
            <Row gutter={24}>
              <Col xs={24} sm={8}>
                <h1>Pilih Siswa</h1>
                <Form.Item
                  label="Kelas"
                  name={["class_id"]}
                  rules={[
                    {
                      required: true,
                      message: "Kelas wajib dipilih",
                    },
                  ]}
                >
                  <Select {...classSelectMergedProps} />
                </Form.Item>
                <Form.Item
                  label="Siswa"
                  name={["student_id"]}
                  rules={[
                    {
                      required: true,
                      message: "Siswa wajib dipilih",
                    },
                  ]}
                >
                  <Select
                    loading={isLoadingStudents}
                    disabled={!selectedClassId || isLoadingStudents}
                    placeholder={
                      !selectedClassId
                        ? "Pilih kelas terlebih dahulu"
                        : "Pilih siswa"
                    }
                    options={studentOptions}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={handleStudentChange}
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
          (isLoading || semesterSummaryLoading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin />
              <div style={{ marginTop: "10px" }}>
                Memuat ringkasan semester...
              </div>
            </div>
          ) : semesterSummaryData?.data ? (
            <div>
              <Card style={{ marginBottom: 16 }}>
                <Row gutter={24}>
                  <Col span={24}>
                    <Title level={4}>Informasi Siswa</Title>
                  </Col>
                  <Col span={12}>
                    <Text strong>Nama: </Text>
                    <Text>{semesterSummaryData?.data?.student?.name}</Text>
                  </Col>
                  <Col span={6}>
                    <Text strong>NIS: </Text>
                    <Text>{semesterSummaryData?.data?.student?.nis}</Text>
                  </Col>
                  <Col span={6}>
                    <Text strong>NISN: </Text>
                    <Text>{semesterSummaryData?.data?.student?.nisn}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Kelas: </Text>
                    <Text>
                      {semesterSummaryData?.data?.student?.class?.romanLevel}{" "}
                      {
                        semesterSummaryData?.data?.student?.class?.expertise
                          ?.shortName
                      }{" "}
                      {semesterSummaryData?.data?.student?.class?.alphabet}
                    </Text>
                  </Col>
                  <Col span={6}>
                    <Text strong>Semester: </Text>
                    <Text>{semesterSummaryData?.data?.semester}</Text>
                  </Col>
                  <Col span={6}>
                    <Text strong>Tahun Ajaran: </Text>
                    <Text>{semesterSummaryData?.data?.schoolYear}</Text>
                  </Col>
                </Row>

                <Divider />
                <Row gutter={24}>
                  <Col span={24}>
                    <Title level={4}>Ringkasan Poin</Title>
                  </Col>
                  <Col span={8}>
                    <Descriptions column={1}>
                      <Descriptions.Item label="Poin Pelanggaran">
                        <Tag color="red">
                          {semesterSummaryData?.data?.totalPoints}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Poin Penghargaan">
                        <Tag color="green">
                          {semesterSummaryData?.data?.totalAwardPoints}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Total Poin">
                        <Tag color="blue">
                          {semesterSummaryData?.data?.netPoints}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                  <Col span={16}>
                    {semesterSummaryData?.data?.resetMessage && (
                      <Card type="inner" title="Status Poin">
                        <Text>{semesterSummaryData?.data?.resetMessage}</Text>
                        <div>
                          <Text strong>Poin Semester Berikutnya: </Text>
                          <Tag color="purple">
                            {semesterSummaryData?.data?.nextSemesterPoints}
                          </Tag>
                        </div>
                      </Card>
                    )}
                  </Col>
                  <Col span={24} style={{ textAlign: "right" }}>
                    <Popover
                      content={
                        <Alert
                          message={<strong>Info</strong>}
                          description={
                            <span>
                              Dalam Export Excel sudah terdapat juga untuk data
                              rekap Penghargaan
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
                        disabled={!semesterSummaryData?.data}
                      >
                        Export Excel
                      </Button>
                    </Popover>
                  </Col>
                </Row>
              </Card>

              <Tabs
                defaultActiveKey="violations"
                items={[
                  {
                    key: "violations",
                    label: "Pelanggaran",
                    children: (
                      <Table
                        dataSource={semesterSummaryData?.data?.violations || []}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                      >
                        <Table.Column
                          title="No."
                          width={60}
                          render={(_, __, index) => index + 1}
                        />
                        <Table.Column
                          dataIndex="createdAt"
                          title="Tanggal"
                          render={(value) => (
                            <DateField value={value} format="DD MMM YYYY" />
                          )}
                          sorter={(a, b) =>
                            new Date(a.createdAt).getTime() -
                            new Date(b.createdAt).getTime()
                          }
                        />
                        <Table.Column
                          dataIndex={["regulation", "name"]}
                          title="Peraturan"
                        />
                        <Table.Column
                          dataIndex="description"
                          title="Deskripsi"
                        />
                        <Table.Column
                          dataIndex="points"
                          title="Poin"
                          render={(value) => (
                            <Tag color="red">{value} poin</Tag>
                          )}
                          sorter={(a, b) => a.points - b.points}
                        />
                      </Table>
                    ),
                  },
                  {
                    key: "awards",
                    label: "Penghargaan",
                    children: (
                      <Table
                        dataSource={semesterSummaryData?.data?.awards || []}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                      >
                        <Table.Column
                          title="No."
                          width={60}
                          render={(_, __, index) => index + 1}
                        />
                        <Table.Column
                          dataIndex="createdAt"
                          title="Tanggal"
                          render={(value) => (
                            <DateField value={value} format="DD MMM YYYY" />
                          )}
                          sorter={(a, b) =>
                            new Date(a.createdAt).getTime() -
                            new Date(b.createdAt).getTime()
                          }
                        />
                        <Table.Column
                          dataIndex={["regulation", "name"]}
                          title="Peraturan"
                        />
                        <Table.Column
                          dataIndex="description"
                          title="Deskripsi"
                        />
                        <Table.Column
                          dataIndex="points"
                          title="Poin"
                          render={(value) => (
                            <Tag color="green">{value} poin</Tag>
                          )}
                          sorter={(a, b) => a.points - b.points}
                        />
                      </Table>
                    ),
                  },
                ]}
              />
            </div>
          ) : null)}
      </List>
    </CanAccess>
  );
};
