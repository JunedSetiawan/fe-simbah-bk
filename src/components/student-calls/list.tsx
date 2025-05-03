"use client";

import React, { useState } from "react";
import { BaseRecord, useApiUrl, useCustom, useSelect } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
} from "@refinedev/antd";
import {
  Table,
  Space,
  Typography,
  Tag,
  Grid,
  Form,
  notification,
  Card,
  Row,
  Col,
  Select,
  Button,
} from "antd";
import {
  ClearOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

export const StudentCallsList = () => {
  const { Text } = Typography;
  const apiUrl = useApiUrl();

  // State for filter values
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    classId: undefined,
    studentId: undefined,
  });

  // Form instance for the filter form
  const [form] = Form.useForm();

  const { tableProps } = useTable({
    syncWithLocation: true,
    filters: {
      initial: [
        {
          field: "studentClasses.class.id",
          operator: "eq",
          value: filters.classId,
        },
        {
          field: "studentClasses.user.student.id",
          operator: "eq",
          value: filters.studentId,
        },
      ],
      permanent: [
        {
          field: "studentClasses.class.id",
          operator: "eq",
          value: filters.classId,
        },
        {
          field: "studentClasses.user.student.id",
          operator: "eq",
          value: filters.studentId,
        },
      ],
    },
  });

  // Get class options
  const { options: classOptions } = useSelect({
    resource: "classes",
    optionLabel: "classname", // You may need to adjust this based on your API
    optionValue: "id",
  });

  // Fetch students when class is selected
  const { isLoading: isLoadingStudents } = useCustom<{ data: any[] }>({
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
            description: "Unexpected response format from the server",
          });
        }
      },
      onError: (error) => {
        notification.error({
          message: "Error: " + (error.message || "Unknown error"),
          description: "Failed to fetch students for this class",
        });
        setStudents([]);
      },
    },
  });

  // Create student options
  const studentOptions =
    students && students.length > 0
      ? students.map((student) => ({
          label: `${student.name} (${student.nis})`,
          value: student.student_id,
          user_id: student.user_id,
          nisn: student.nisn,
          nis: student.nis,
        }))
      : [];

  // Handle class selection
  const handleClassChange = (value: any) => {
    setSelectedClassId(value);
    form.setFieldsValue({ studentId: undefined }); // Reset student when class changes
  };

  // Handle search button click
  const handleSearch = (values: {
    classId: any;
    studentId: any;
    serviceField: any;
    serviceType: any;
  }) => {
    // Update filters
    setFilters({
      classId: values.classId,
      studentId: values.studentId,
    });
  };

  // Handle reset button click
  const handleReset = () => {
    form.resetFields();
    setSelectedClassId(null);
    setStudents([]);
    setFilters({
      classId: undefined,
      studentId: undefined,
    });
  };

  const formatDate = (dateValue: string) => {
    if (!dateValue) return "-";

    try {
      // Force interpret as local time by removing any timezone information
      const localDate = new Date(
        dateValue.replace("Z", "").replace(/\+.*$/, "")
      );
      return dayjs(localDate).format("DD MMM YYYY HH:mm");
    } catch (e) {
      return dateValue;
    }
  };

  const breakpoint = Grid.useBreakpoint();
  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;
  return (
    <List>
      {/* Filter Form */}
      <Card
        style={{ marginBottom: 16 }}
        title={
          <Space>
            <FilterOutlined />
            <span>Filter Pencarian</span>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSearch}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="classId" label="Kelas">
                <Select
                  placeholder="Pilih Kelas"
                  options={classOptions}
                  onChange={handleClassChange}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item name="studentId" label="Siswa">
                <Select
                  placeholder={
                    selectedClassId
                      ? "Pilih Siswa"
                      : "Pilih Kelas Terlebih Dahulu"
                  }
                  options={studentOptions}
                  disabled={!selectedClassId || isLoadingStudents}
                  loading={isLoadingStudents}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                >
                  Cari
                </Button>
                <Button onClick={handleReset} icon={<ClearOutlined />}>
                  Reset
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
      <Table {...tableProps} rowKey="id" bordered>
        {/* Nomor Urut */}
        <Table.Column
          title="No."
          width={60}
          render={(_, __, index) => {
            const { current = 1, pageSize = 10 } = tableProps.pagination || {};
            return (current - 1) * pageSize + index + 1;
          }}
        />

        {/* Nama Siswa dan Kelas */}
        <Table.Column
          dataIndex={["studentClasses", "user", "student", "name"]}
          render={(text, record) => {
            const studentName = text; // Nama siswa
            const className = record.studentClasses.class.romanLevel; // Kelas (XI)
            const prodyName = record.studentClasses.class.expertise.shortName; // Prodi (RPL)
            const classAlphabet = record.studentClasses.class.alphabet; // Kelas (B)

            // Gabungkan menjadi format "siswa - XI RPL B"
            const name = `${studentName} - ${className} ${prodyName} ${classAlphabet}`;

            return <span style={{ fontWeight: 500 }}>{name}</span>;
          }}
          title="Siswa & Kelas"
        />

        <Table.Column
          title="Text & Jadwal"
          key="textAndDate"
          render={(record) => (
            <div>
              <span>{record.text} pada - </span>
              {record.date && (
                <Tag color={"default"} style={{ marginTop: 4 }}>
                  {formatDate(record.date)}
                </Tag>
              )}
            </div>
          )}
          sorter={(a, b) => {
            if (!a.date || !b.date) return 0;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }}
        />
        <Table.Column
          dataIndex={["createdBy"]}
          title="Dibuat Oleh"
          width={150}
          render={(value) => (
            <Text strong ellipsis style={{ maxWidth: 150 }} title={value}>
              {value.teacher.name || value.username || "-"}
            </Text>
          )}
        />
        {/* Tanggal Dibuat */}
        <Table.Column
          dataIndex={["createdAt"]}
          title="Dibuat Pada"
          sorter
          render={(value: any) => (
            <Space>
              <ClockCircleOutlined />
              <DateField value={value} format="DD MMM YYYY" />
            </Space>
          )}
        />

        <Table.Column
          title="Actions"
          dataIndex="actions"
          fixed={isMobile ? undefined : "right"}
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
