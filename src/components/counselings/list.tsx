"use client";

import React, { useState, useEffect } from "react";
import { BaseRecord, useApiUrl, useCustom, useSelect } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
  FilterDropdown,
  rangePickerFilterMapper,
} from "@refinedev/antd";
import {
  Table,
  Space,
  Tooltip,
  Tag,
  Grid,
  Form,
  Select,
  Button,
  Row,
  Col,
  Card,
  Input,
  Radio,
  Divider,
  notification,
  DatePicker,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";

export const CounselingList = () => {
  const apiUrl = useApiUrl();

  // State for filter values
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    classId: undefined,
    studentId: undefined,
    serviceField: undefined,
    serviceType: undefined,
  });

  // Form instance for the filter form
  const [form] = Form.useForm();

  // Table with filters
  const { tableProps, searchFormProps } = useTable({
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
        {
          field: "serviceField",
          operator: "eq",
          value: filters.serviceField,
        },
        {
          field: "serviceType",
          operator: "eq",
          value: filters.serviceType,
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
        {
          field: "serviceField",
          operator: "eq",
          value: filters.serviceField,
        },
        {
          field: "serviceType",
          operator: "eq",
          value: filters.serviceType,
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

  // Options for bidang layanan
  const bidangLayananOptions = [
    { label: "Pribadi", value: "Pribadi" },
    { label: "Sosial", value: "Sosial" },
    { label: "Belajar", value: "Belajar" },
    { label: "Karir", value: "Karir" },
  ];

  // Options for jenis layanan
  const jenisLayananOptions = [
    { label: "Orientasi", value: "Orientasi" },
    { label: "Informasi", value: "Informasi" },
    { label: "Konseling Perorangan", value: "Konseling Perorangan" },
    { label: "Konseling Kelompok", value: "Konseling Kelompok" },
    { label: "Bimbingan Kelompok", value: "Bimbingan Kelompok" },
    { label: "Konseling Individual", value: "Konseling Individual" },
    { label: "Bimbingan Individual", value: "Bimbingan Individual" },
    { label: "Konsultasi", value: "Konsultasi" },
    { label: "Mediasi", value: "Mediasi" },
    { label: "Advokasi", value: "Advokasi" },
    { label: "Konferensi Kasus", value: "Konferensi Kasus" },
    { label: "Alih Tangan Kasus", value: "Alih Tangan Kasus" },
  ];

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
      serviceField: values.serviceField,
      serviceType: values.serviceType,
    });

    // Trigger table refresh
    searchFormProps.form?.submit();
  };

  // Handle reset button click
  const handleReset = () => {
    form.resetFields();
    setSelectedClassId(null);
    setStudents([]);
    setFilters({
      classId: undefined,
      studentId: undefined,
      serviceField: undefined,
      serviceType: undefined,
    });

    // Trigger table refresh
    searchFormProps.form?.submit();
  };

  const breakpoint = Grid.useBreakpoint();
  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  return (
    <List title="Daftar Konseling">
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

            <Col xs={24} sm={12} md={6}>
              <Form.Item name="serviceField" label="Bidang Layanan">
                <Select
                  placeholder="Pilih Bidang Layanan"
                  options={bidangLayananOptions}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item name="serviceType" label="Jenis Layanan">
                <Select
                  placeholder="Pilih Jenis Layanan"
                  options={jenisLayananOptions}
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

      {/* Table */}
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

        {/* Tanggal Dibuat */}
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

        {/* Service Field */}
        <Table.Column
          dataIndex="serviceField"
          title="Bidang Layanan"
          render={(value: string) => <Tag color="blue">{value}</Tag>}
        />

        {/* Service Type */}
        <Table.Column
          dataIndex="serviceType"
          title="Jenis Layanan"
          render={(value: string) => <Tag color="green">{value}</Tag>}
        />

        {/* Case */}
        <Table.Column dataIndex="case" title="Kasus" />

        {/* Guru Konselor */}
        <Table.Column
          dataIndex={["teacher", "name"]}
          title="Guru Konselor"
          render={(value: string) => (
            <Tooltip title={`Konselor: ${value}`}>
              <span style={{ fontWeight: 500 }}>{value}</span>
            </Tooltip>
          )}
        />

        {/* Actions */}
        <Table.Column
          title="Aksi"
          dataIndex="actions"
          fixed={isMobile ? undefined : "right"}
          render={(_, record: BaseRecord) => (
            <Space style={{ zIndex: 1, position: "relative" }}>
              <ShowButton
                hideText
                size="small"
                recordItemId={record.id}
                icon={<EyeOutlined />}
                style={{ touchAction: "manipulation" }}
              />

              <EditButton
                hideText
                size="small"
                recordItemId={record.id}
                icon={<EditOutlined />}
                style={{ touchAction: "manipulation" }}
              />

              <Tooltip title="Hapus">
                <DeleteButton
                  hideText
                  size="small"
                  recordItemId={record.id}
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
