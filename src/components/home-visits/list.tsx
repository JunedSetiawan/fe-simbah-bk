"use client";

import React, { useRef } from "react";
import {
  BaseRecord,
  CanAccess,
  useApiUrl,
  useCustomMutation,
  useNavigation,
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
} from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  ClockCircleTwoTone,
  CloseCircleOutlined,
  ExclamationOutlined,
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
  const {
    tableProps: filteredTableProps,
    tableQuery: { refetch },
  } = useTable({
    syncWithLocation: true,
    filters: {
      permanent: [
        {
          field: "status",
          operator: "eq",
          value: status,
        },
      ],
    },
  });

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

  const apiUrl = useApiUrl();
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

        {/* Status Kunjungan */}
        <Table.Column
          dataIndex="status"
          title="Status"
          width={120}
          render={(value) => {
            const status = getStatusBadge(value);
            return (
              <Badge
                status={status.color}
                text={
                  <>
                    {status.icon} {status.text}
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
          width={180}
          fixed="right"
          render={(_, record) => {
            const isPending = record.status?.toLowerCase() === "pending";

            return (
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
                  <>
                    <EditButton
                      icon={<CheckCircleOutlined />}
                      size="small"
                      children="Selesaikan"
                      type="primary"
                      recordItemId={record.id}
                      title="Selesaikan kunjungan"
                    />
                    <CanAccess
                      resource="home-visits"
                      action="cancel"
                      fallback={null}
                    >
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
                          children="Batalkan"
                          icon={<CloseCircleOutlined />}
                          loading={cancelLoading}
                          title="Batalkan kunjungan"
                        />
                      </Popconfirm>
                    </CanAccess>
                  </>
                )}
              </Space>
            );
          }}
        />
      </Table>
    </CanAccess>
  );
};
