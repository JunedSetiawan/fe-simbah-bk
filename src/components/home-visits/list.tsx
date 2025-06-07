"use client";

import React, { useRef, useState } from "react";
import {
  BaseRecord,
  CanAccess,
  useApiUrl,
  useCustom,
  useCustomMutation,
  useNavigation,
  useSelect,
} from "@refinedev/core";
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
  Tag,
  Typography,
  Badge,
  Card,
  Tabs,
  Button,
  Popconfirm,
  Grid,
  Form,
  Row,
  Col,
  Select,
  notification,
  Alert,
} from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  ClockCircleTwoTone,
  CloseCircleOutlined,
  ExclamationOutlined,
  FilterOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import UnauthorizedPage from "@app/unauthorized";

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = "Asia/Jakarta";
const { Paragraph, Text } = Typography;

export const HomeVisitsList = () => {
  const { replace } = useNavigation();
  const apiUrl = useApiUrl();

  // References to store refetch functions
  const refetchFunctionsRef = useRef<
    Record<"pending" | "completed" | "cancelled", (() => void) | null>
  >({
    pending: null,
    completed: null,
    cancelled: null,
  });

  // Function to register refetch functions from child components
  const registerRefetch = (
    status: "pending" | "completed" | "cancelled",
    refetchFn: any
  ) => {
    refetchFunctionsRef.current[status] = refetchFn;
  };

  // Function to refetch multiple tables
  const refetchTables = (
    statuses: ("pending" | "completed" | "cancelled")[]
  ) => {
    statuses.forEach((status) => {
      if (refetchFunctionsRef.current[status]) {
        refetchFunctionsRef.current[status]!();
      }
    });
  };

  // Common table props
  const commonTableProps = {
    rowKey: "id",
    bordered: true,
    scroll: { x: 800 },
    pagination: {
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50", "100"],
    },
  };

  // Format date without timezone conversion
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

  // Status badge configuration
  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { color: string; text: string; icon?: React.ReactNode }
    > = {
      pending: {
        color: "warning",
        text: "Menunggu",
        icon: <ClockCircleOutlined />,
      },
      completed: {
        color: "success",
        text: "Selesai",
        icon: <CheckCircleOutlined />,
      },
      cancelled: {
        color: "error",
        text: "Dibatalkan",
        icon: <CloseCircleOutlined />,
      },
      approved: {
        color: "success",
        text: "Disetujui",
        icon: <CheckCircleOutlined />,
      },
      rejected: {
        color: "error",
        text: "Ditolak",
        icon: <CloseCircleOutlined />,
      },
    };

    return (
      statusMap[status?.toLowerCase()] || {
        color: "blue",
        text: status || "Pending",
      }
    );
  };

  // Tab configuration
  const tabs = [
    {
      key: "pending",
      label: (
        <span>
          <ExclamationOutlined style={{ color: "red", marginRight: "5px" }} />
          Kunjungan Menunggu
        </span>
      ),
      children: (
        <VisitTable
          status="pending"
          tableProps={commonTableProps}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          registerRefetch={registerRefetch}
          refetchTables={refetchTables}
        />
      ),
    },
    {
      key: "completed",
      label: (
        <span>
          <CheckOutlined style={{ color: "green", marginRight: "5px" }} />
          Kunjungan Selesai
        </span>
      ),
      children: (
        <VisitTable
          status="completed"
          tableProps={commonTableProps}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          registerRefetch={registerRefetch}
          refetchTables={refetchTables}
        />
      ),
    },
    {
      key: "cancelled",
      label: (
        <span>
          <CloseCircleOutlined style={{ color: "red", marginRight: "5px" }} />
          Kunjungan Dibatalkan
        </span>
      ),
      children: (
        <VisitTable
          status="cancelled"
          tableProps={commonTableProps}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          registerRefetch={registerRefetch}
          refetchTables={refetchTables}
        />
      ),
    },
  ];

  return (
    <List
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <CalendarOutlined style={{ fontSize: 24, marginRight: 12 }} />
          <Text strong style={{ fontSize: 20 }}>
            Manajemen Kunjungan Rumah
          </Text>
        </div>
      }
      headerButtons={({ defaultButtons }) => <>{defaultButtons}</>}
    >
      <Card bordered={false}>
        <Tabs
          defaultActiveKey="pending"
          items={tabs}
          tabBarStyle={{ marginBottom: 24 }}
        />
      </Card>
    </List>
  );
};

// Separate component for each visit table
const VisitTable = ({
  status,
  tableProps,
  formatDate,
  getStatusBadge,
  registerRefetch,
  refetchTables,
}: any) => {
  const [filters, setFilters] = useState({
    classId: undefined,
    studentId: undefined,
  });

  const {
    tableProps: filteredTableProps,
    tableQuery: { refetch, data },
  } = useTable({
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
        {
          field: "status",
          operator: "eq",
          value: status,
        },
      ],
    },
  });

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const apiUrl = useApiUrl();

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

  // Form instance for the filter form
  const [form] = Form.useForm();

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

    // // Trigger table refresh
    // searchFormProps.form?.submit();
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

    // Trigger table refresh
    // searchFormProps.form?.submit();
  };

  // Register this table's refetch function
  React.useEffect(() => {
    if (refetch && registerRefetch) {
      registerRefetch(status, refetch);
    }

    return () => {
      // Clear the refetch function when the component unmounts
      if (registerRefetch) {
        registerRefetch(status, null);
      }
    };
  }, [refetch, status, registerRefetch]);

  const { list, show, edit } = useNavigation();
  const { mutate: cancelVisit, isLoading: cancelLoading } = useCustomMutation();

  const handleCancelVisit = (id: number) => {
    cancelVisit(
      {
        url: `${apiUrl}/home-visits/${id}/cancel`,
        method: "put",
        values: {},
        successNotification: {
          message: "Kunjungan berhasil dibatalkan",
          description: "Status kunjungan telah diubah menjadi dibatalkan",
          type: "success",
        },
      },
      {
        onSuccess: () => {
          // Refetch both pending and cancelled tables
          refetchTables(["pending", "cancelled"]);
        },
      }
    );
  };

  const breakpoint = Grid.useBreakpoint();
  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const mergedTableProps = {
    ...tableProps,
    ...filteredTableProps,
    pagination: {
      ...tableProps.pagination,
      ...filteredTableProps.pagination,
    },
  };

  return (
    <CanAccess
      resource="home-visits"
      action="list"
      fallback={<UnauthorizedPage />}
    >
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
      <Table {...mergedTableProps}>
        {/* Nomor Urut */}
        <Table.Column
          title="No."
          width={60}
          render={(_, __, index) => {
            const { current = 1, pageSize = 10 } =
              mergedTableProps.pagination || {};
            return (current - 1) * pageSize + index + 1;
          }}
        />

        {/* Nama Siswa dan Kelas */}
        <Table.Column
          dataIndex={["studentClasses", "user", "student", "name"]}
          render={(text, record) => {
            const studentName = text;
            const className = record.studentClasses?.class?.romanLevel;
            const prodyName =
              record.studentClasses?.class?.expertise?.shortName;
            const classAlphabet = record.studentClasses?.class?.alphabet;

            return (
              <Space direction="vertical" size={0}>
                <Text strong>{studentName || "-"}</Text>
                <Tag color="blue" style={{ marginTop: 4 }}>
                  {`${className || ""} ${prodyName || ""} ${
                    classAlphabet || ""
                  }`}
                </Tag>
              </Space>
            );
          }}
          title="Siswa & Kelas"
          width={180}
          sorter={(a, b) => {
            const nameA = a.studentClasses?.user?.student?.name || "";
            const nameB = b.studentClasses?.user?.student?.name || "";
            return nameA.localeCompare(nameB);
          }}
        />

        {/* Jadwal Kunjungan */}
        <Table.Column
          dataIndex="date"
          title="Jadwal"
          width={150}
          render={(value) => (
            <Tag color={status === "pending" ? "cyan" : "default"}>
              {formatDate(value)}
            </Tag>
          )}
          sorter={(a, b) => {
            if (!a.date || !b.date) return 0;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }}
        />

        {/*Status Orang Tua */}
        <Table.Column
          dataIndex="statusApprovalByParent"
          title="Status Persetujuan Orang Tua"
          width={120}
          render={(value) => {
            const status = getStatusBadge(value);
            return (
              <Badge
                status={status.color}
                text={
                  <>
                    {status.icon}{" "}
                    {(status.text === "Menunggu" &&
                      "Menunggu Persetujuan Orang Tua Siswa") ||
                      status.text}
                  </>
                }
              />
            );
          }}
        />

        {/* Alamat */}
        <Table.Column
          dataIndex="address"
          title="Alamat"
          width={250}
          render={(value) => (
            <Paragraph
              ellipsis={{ rows: 2, tooltip: value }}
              style={{ margin: 0 }}
            >
              {value || "-"}
            </Paragraph>
          )}
        />
        {/* CreatedBy */}
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
        {/* Status Kunjungan */}
        <Table.Column
          dataIndex="status"
          title="Status Kunjungan"
          width={120}
          render={(value) => {
            const status = getStatusBadge(value);
            return (
              <Badge
                status={status.color}
                text={
                  <>
                    {status.icon}{" "}
                    {(status.text === "Menunggu" &&
                      "Menunggu Kunjungan diselesaikan") ||
                      status.text}
                  </>
                }
              />
            );
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
        {/* Actions */}
        <Table.Column
          title="Aksi"
          dataIndex="actions"
          width={220}
          fixed={isMobile ? undefined : "right"}
          render={(_, record) => {
            const isPending = record.status?.toLowerCase() === "pending";
            const parentApprovalStatus =
              record.statusApprovalByParent?.toLowerCase();

            return (
              <Space direction="vertical" size={4}>
                {/* Always show these buttons */}
                <Space>
                  <ShowButton
                    hideText
                    size="small"
                    recordItemId={record.id}
                    title="Lihat detail"
                  />
                  <DeleteButton
                    hideText
                    size="small"
                    recordItemId={record.id}
                    title="Hapus kunjungan"
                  />

                  {isPending && (
                    <CanAccess
                      resource="home-visits"
                      action="cancel"
                      fallback={null}
                    >
                      {/* Parent approval status handling */}
                      {parentApprovalStatus === "pending" && (
                        <Alert
                          message="Menunggu Persetujuan..."
                          type="warning"
                          showIcon
                          icon={<ExclamationCircleOutlined />}
                          style={{ fontSize: "12px", padding: "4px 8px" }}
                        />
                      )}

                      {parentApprovalStatus === "approved" && (
                        <Space>
                          <EditButton
                            icon={<CheckCircleOutlined />}
                            size="small"
                            type="primary"
                            recordItemId={record.id}
                            title="Selesaikan kunjungan"
                          >
                            Selesaikan
                          </EditButton>
                        </Space>
                      )}

                      {parentApprovalStatus === "rejected" && (
                        <Space>
                          <Popconfirm
                            title="Batalkan kunjungan?"
                            description="Apakah Anda yakin ingin membatalkan kunjungan ini?"
                            onConfirm={() => handleCancelVisit(record.id)}
                            okText="Ya"
                            cancelText="Tidak"
                          >
                            <Button
                              danger
                              size="small"
                              type="primary"
                              icon={<CloseCircleOutlined />}
                              loading={cancelLoading}
                              title="Batalkan kunjungan"
                            >
                              Batalkan
                            </Button>
                          </Popconfirm>
                        </Space>
                      )}
                    </CanAccess>
                  )}
                </Space>
              </Space>
            );
          }}
        />
      </Table>
    </CanAccess>
  );
};
