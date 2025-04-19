// YearlySummary.tsx
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
  Statistic,
  notification,
  Empty,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import UnauthorizedPage from "@app/unauthorized";
import { SelectProps } from "antd/lib";

const { Text, Title } = Typography;

interface Student {
  user_id: string;
  student_id: string;
  name: string;
  nis: string;
  nisn: string;
}

export const ViolationSummaryYearlyList = () => {
  const [form] = Form.useForm();

  const [year, setYear] = useState<string | null>(null);
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
            description: "Format respons dari server tidak sesuai",
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

  // Get yearly summary data
  const {
    data: yearlySummaryData,
    isLoading: yearlySummaryLoading,
    refetch,
  } = useCustom({
    url: `${apiUrl}/violation-summary/yearly`,
    method: "get",
    config: {
      query: {
        student_id: selectedStudentId,
        year,
      },
    },
    queryOptions: {
      enabled: !!selectedStudentId && !!year && filterApplied,
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
    setFilterApplied(true);

    if (values.student_id && values.year) {
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
    setFilterApplied(false);
    setDataFetched(false);
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
                  Silakan pilih siswa dan tahun ajaran untuk melihat data
                </Text>
              </span>
            }
          >
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => {
                const filterSection = document.querySelector("form");
                filterSection?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Atur Filter
            </Button>
          </Empty>
        </div>
      );
    }

    if (dataFetched && (!yearlySummaryData || !yearlySummaryData.data)) {
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
      <List title="Ringkasan Pelanggaran Tahunan">
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
              <Col xs={24} sm={8}>
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

        {renderEmptyState() ||
          (isLoading || yearlySummaryLoading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin />
              <div style={{ marginTop: "10px" }}>
                Memuat ringkasan tahunan...
              </div>
            </div>
          ) : yearlySummaryData?.data ? (
            <div>
              <Card style={{ marginBottom: 16 }}>
                <Row gutter={24}>
                  <Col span={24}>
                    <Title level={4}>Informasi Siswa</Title>
                  </Col>
                  <Col span={12}>
                    <Text strong>Nama: </Text>
                    <Text>{yearlySummaryData?.data?.student?.name}</Text>
                  </Col>
                  <Col span={6}>
                    <Text strong>NIS: </Text>
                    <Text>{yearlySummaryData?.data?.student?.nis}</Text>
                  </Col>
                  <Col span={6}>
                    <Text strong>NISN: </Text>
                    <Text>{yearlySummaryData?.data?.student?.nisn}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Kelas: </Text>
                    <Text>
                      {yearlySummaryData?.data?.student?.class?.romanLevel}{" "}
                      {
                        yearlySummaryData?.data?.student?.class?.expertise
                          ?.shortName
                      }{" "}
                      {yearlySummaryData?.data?.student?.class?.alphabet}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Tahun Ajaran: </Text>
                    <Text>{yearlySummaryData?.data?.schoolYear}</Text>
                  </Col>
                </Row>
                <Divider />

                <Row gutter={24}>
                  <Col span={24}>
                    <Title level={4}>Ringkasan Akhir Tahun</Title>
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                      <Statistic
                        title="Total Poin Akhir"
                        value={yearlySummaryData?.data?.yearEndTotal}
                        valueStyle={{
                          color:
                            yearlySummaryData?.data?.yearEndTotal > 60
                              ? "#cf1322"
                              : "#3f8600",
                        }}
                        prefix={
                          yearlySummaryData?.data?.yearEndTotal > 60 ? (
                            <ArrowUpOutlined />
                          ) : (
                            <ArrowDownOutlined />
                          )
                        }
                        suffix="poin"
                      />
                    </div>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col span={12}>
                    <Card
                      type="inner"
                      title="Semester 1 (Ganjil)"
                      extra={
                        <Tag
                          color={
                            yearlySummaryData?.data?.semester1?.netPoints > 60
                              ? "red"
                              : "green"
                          }
                        >
                          {yearlySummaryData?.data?.semester1?.netPoints} poin
                        </Tag>
                      }
                    >
                      <Descriptions column={1}>
                        <Descriptions.Item label="Rentang Tanggal">
                          <DateField
                            value={
                              yearlySummaryData?.data?.semester1?.startDate
                            }
                            format="DD MMM YYYY"
                          />{" "}
                          -{" "}
                          <DateField
                            value={yearlySummaryData?.data?.semester1?.endDate}
                            format="DD MMM YYYY"
                          />
                        </Descriptions.Item>
                        <Descriptions.Item label="Poin Pelanggaran">
                          <Tag color="red">
                            {
                              yearlySummaryData?.data?.semester1
                                ?.totalViolationPoints
                            }
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Poin Penghargaan">
                          <Tag color="green">
                            {
                              yearlySummaryData?.data?.semester1
                                ?.totalAwardPoints
                            }
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                          {yearlySummaryData?.data?.semester1?.pointStatus}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      type="inner"
                      title="Semester 2 (Genap)"
                      extra={
                        <Tag
                          color={
                            yearlySummaryData?.data?.semester2?.netPoints > 60
                              ? "red"
                              : "green"
                          }
                        >
                          {yearlySummaryData?.data?.semester2?.netPoints} poin
                        </Tag>
                      }
                    >
                      <Descriptions column={1}>
                        <Descriptions.Item label="Rentang Tanggal">
                          <DateField
                            value={
                              yearlySummaryData?.data?.semester2?.startDate
                            }
                            format="DD MMM YYYY"
                          />{" "}
                          -{" "}
                          <DateField
                            value={yearlySummaryData?.data?.semester2?.endDate}
                            format="DD MMM YYYY"
                          />
                        </Descriptions.Item>
                        <Descriptions.Item label="Poin Awal">
                          <Tag color="purple">
                            {yearlySummaryData?.data?.semester2?.initialPoints}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Poin Pelanggaran">
                          <Tag color="red">
                            {
                              yearlySummaryData?.data?.semester2
                                ?.totalViolationPoints
                            }
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Poin Penghargaan">
                          <Tag color="green">
                            {
                              yearlySummaryData?.data?.semester2
                                ?.totalAwardPoints
                            }
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </div>
          ) : null)}
      </List>
    </CanAccess>
  );
};
