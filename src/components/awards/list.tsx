"use client";

import React, { useRef } from "react";
import {
  BaseRecord,
  useMany,
  useApiUrl,
  useCustomMutation,
  useNotification,
  CanAccess,
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
  Spin,
  Tag,
  Typography,
  Badge,
  Button,
  Popconfirm,
  Card,
  Tabs,
} from "antd";
import {
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import UnauthorizedPage from "@app/unauthorized";
const { Text, Paragraph } = Typography;

export const AwardsList = () => {
  const apiUrl = useApiUrl();
  const { open } = useNotification();

  // References to store refetch functions
  const refetchFunctionsRef = useRef<
    Record<"proposed" | "approved" | "rejected", (() => void) | null>
  >({
    proposed: null,
    approved: null,
    rejected: null,
  });

  // Function to register refetch functions from child components
  const registerRefetch = (
    status: "proposed" | "approved" | "rejected",
    refetchFn: any
  ) => {
    refetchFunctionsRef.current[status] = refetchFn;
  };

  // Function to refetch multiple tables
  const refetchTables = (
    statuses: ("proposed" | "approved" | "rejected")[]
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

  // Status badge configuration
  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { color: string; text: string; icon?: React.ReactNode }
    > = {
      proposed: {
        color: "warning",
        text: "Diajukan",
        icon: <ExclamationCircleOutlined />,
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
        color: "default",
        text: status || "Unknown",
      }
    );
  };

  // Tab configuration
  const tabs = [
    {
      key: "proposed",
      label: (
        <span>
          <ExclamationOutlined
            style={{ color: "orange", marginRight: "5px" }}
          />
          Penghargaan Diajukan
        </span>
      ),
      children: (
        <AwardsTable
          status="proposed"
          tableProps={commonTableProps}
          getStatusBadge={getStatusBadge}
          registerRefetch={registerRefetch}
          refetchTables={refetchTables}
        />
      ),
    },
    {
      key: "approved",
      label: (
        <span>
          <CheckOutlined style={{ color: "green", marginRight: "5px" }} />
          Penghargaan Disetujui
        </span>
      ),
      children: (
        <AwardsTable
          status="approved"
          tableProps={commonTableProps}
          getStatusBadge={getStatusBadge}
          registerRefetch={registerRefetch}
          refetchTables={refetchTables}
        />
      ),
    },
    {
      key: "rejected",
      label: (
        <span>
          <CloseCircleOutlined style={{ color: "red", marginRight: "5px" }} />
          Penghargaan Ditolak
        </span>
      ),
      children: (
        <AwardsTable
          status="rejected"
          tableProps={commonTableProps}
          getStatusBadge={getStatusBadge}
          registerRefetch={registerRefetch}
          refetchTables={refetchTables}
        />
      ),
    },
  ];

  return (
    <CanAccess
      resource="violations"
      action="list"
      fallback={<UnauthorizedPage />}
    >
      <List
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <TrophyOutlined style={{ fontSize: 24, marginRight: 12 }} />
            <Text strong style={{ fontSize: 20 }}>
              Manajemen Penghargaan
            </Text>
          </div>
        }
        headerButtons={({ defaultButtons }) => <>{defaultButtons}</>}
      >
        <Card bordered={false}>
          <Tabs
            defaultActiveKey="proposed"
            items={tabs}
            tabBarStyle={{ marginBottom: 24 }}
          />
        </Card>
      </List>
    </CanAccess>
  );
};

// Separate component for each awards table
const AwardsTable = ({
  status,
  tableProps,
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
  const { mutate: updateStatus, isLoading: updateStatusLoading } =
    useCustomMutation();

  const { data: regulationData, isLoading: regulationIsLoading } = useMany({
    resource: "regulations",
    ids:
      filteredTableProps?.dataSource?.map((item) => item?.regulationId) ?? [],
    queryOptions: {
      enabled: !!filteredTableProps?.dataSource,
    },
  });

  const handleUpdateStatus = (
    id: number,
    newStatus: "approved" | "rejected"
  ) => {
    updateStatus(
      {
        url: `${apiUrl}/awards/${id}/status`,
        method: "put",
        values: { status: newStatus },
        successNotification: {
          message: "Success",
          description: `Award ${newStatus} successfully`,
          type: "success",
        },
      },
      {
        onSuccess: () => {
          // Refetch tables based on status update
          refetchTables(["proposed", newStatus]);
        },
      }
    );
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return "default";

    const categoryColors: Record<string, string> = {
      // Existing categories
      kedisiplinan: "blue",
      akademik: "purple",
      kehadiran: "cyan",
      kebersihan: "green",
      komunikasi: "orange",
      sikap: "magenta",
      pakaian: "gold",

      // New reward/award categories
      "non-akademik": "lime",
      prestasi: "gold",
      kepemimpinan: "geekblue",
      sosial: "volcano",
      kreativitas: "pink",
      olahraga: "cyan",
    };

    return categoryColors[category.toLowerCase()] || "default";
  };

  const getPointColor = (point: number) => {
    const pointColors: Record<number, string> = {
      10: "green",
      20: "orange",
      30: "blue",
    };

    return pointColors[point] || "default";
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
        dataIndex={["studentClass", "user", "student", "name"]}
        render={(text, record) => {
          const studentName = text;
          const className = record.studentClass?.class?.romanLevel;
          const prodyName = record.studentClass?.class?.expertise?.shortName;
          const classAlphabet = record.studentClass?.class?.alphabet;

          return (
            <Space direction="vertical" size={0}>
              <Text strong>{studentName || "-"}</Text>
              <Tag color="blue" style={{ marginTop: 4 }}>
                {`${className || ""} ${prodyName || ""} ${classAlphabet || ""}`}
              </Tag>
            </Space>
          );
        }}
        title="Siswa & Kelas"
        width={180}
        sorter={(a, b) => {
          const nameA = a.studentClass?.user?.student?.name || "";
          const nameB = b.studentClass?.user?.student?.name || "";
          return nameA.localeCompare(nameB);
        }}
      />

      {/* Penghargaan Ketertiban */}
      <Table.Column
        dataIndex={["regulation", "name"]}
        title="Penghargaan Ketertiban"
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

      {/* Point */}
      <Table.Column
        dataIndex={["regulation", "point"]}
        title="Point"
        sorter
        render={(value) => (
          <span>
            <Tag color={"default"}>{value} points</Tag>
            {/* <span>point</span> */}
          </span>
        )}
      />

      {/* Status */}
      <Table.Column
        dataIndex="status"
        title="Status"
        width={120}
        render={(value) => {
          const statusInfo = getStatusBadge(value);
          return (
            <Badge
              status={statusInfo.color as any}
              text={
                <>
                  {statusInfo.icon} {statusInfo.text}
                </>
              }
            />
          );
        }}
      />

      {/* Diajukan Oleh */}
      <Table.Column
        dataIndex={["proposer"]}
        title="Diajukan Oleh"
        render={(proposer) => {
          // Display teacher name if available, otherwise username
          return (
            <Text strong>
              {proposer?.teacher.name || proposer?.username || ""}
            </Text>
          );
        }}
      />

      {/* Created At */}
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
        render={(_, record: BaseRecord) => {
          const isProposed = record.status === "proposed";

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
                title="Hapus penghargaan"
              />

              {isProposed && (
                <>
                  <EditButton
                    hideText
                    size="small"
                    recordItemId={record.id}
                    title="Edit penghargaan"
                  />
                  <CanAccess
                    resource="awards"
                    action="approval"
                    fallback={null}
                  >
                    <Space>
                      <Popconfirm
                        title="Setujui penghargaan ini?"
                        description="Apakah Anda yakin ingin menyetujui penghargaan ini?"
                        onConfirm={() =>
                          handleUpdateStatus(Number(record.id), "approved")
                        }
                        okText="Ya"
                        cancelText="Tidak"
                      >
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckOutlined />}
                          loading={updateStatusLoading}
                          title="Setujui penghargaan"
                        >
                          Setujui
                        </Button>
                      </Popconfirm>
                      <Popconfirm
                        title="Tolak penghargaan ini?"
                        description="Apakah Anda yakin ingin menolak penghargaan ini?"
                        onConfirm={() =>
                          handleUpdateStatus(Number(record.id), "rejected")
                        }
                        okText="Ya"
                        cancelText="Tidak"
                      >
                        <Button
                          danger
                          size="small"
                          type="primary"
                          icon={<CloseOutlined />}
                          loading={updateStatusLoading}
                          title="Tolak penghargaan"
                        >
                          Tolak
                        </Button>
                      </Popconfirm>
                    </Space>
                  </CanAccess>
                </>
              )}
            </Space>
          );
        }}
      />
    </Table>
  );
};
