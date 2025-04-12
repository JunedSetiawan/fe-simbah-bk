"use client";

import React from "react";
import {
  useShow,
  useOne,
  useApiUrl,
  useCustomMutation,
  useNavigation,
  useNotification,
  CanAccess,
} from "@refinedev/core";
import { Show, useModal, MarkdownField, DateField } from "@refinedev/antd";
import {
  Typography,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Descriptions,
  Image,
  Button,
  Divider,
  Timeline,
  Avatar,
  Badge,
  Skeleton,
  Popconfirm,
  Alert,
} from "antd";
import {
  TrophyOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  BookOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import UnauthorizedPage from "@app/unauthorized";

const { Title, Text, Paragraph } = Typography;

export const AwardsShow = () => {
  const { query } = useShow();
  const { data, isLoading, isError } = query;
  const record = data?.data;

  const apiUrl = useApiUrl();
  const { goBack, list } = useNavigation();
  const { open } = useNotification();

  // Mutations for approving and rejecting awards
  const { mutate: updateStatus, isLoading: updateStatusLoading } =
    useCustomMutation();

  // Get related regulation data
  const { data: regulationData, isLoading: regulationIsLoading } = useOne({
    resource: "regulations",
    id: record?.regulationId || "",
    queryOptions: {
      enabled: !!record?.regulationId,
    },
  });

  const regulation = regulationData?.data;

  // Handle status update
  const handleUpdateStatus = (newStatus: "approved" | "rejected") => {
    if (!record?.id) return;

    updateStatus(
      {
        url: `${apiUrl}/awards/${record.id}/status`,
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
          open?.({
            type: "success",
            message: "Status updated",
            description: `Award has been ${newStatus} successfully`,
          });
          list("awards");
        },
      }
    );
  };

  // Get status badge info
  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusConfig = {
      proposed: {
        color: "warning",
        text: "Diajukan",
        icon: <CalendarOutlined />,
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

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "default",
      text: status,
      icon: <FileTextOutlined />,
    };

    return (
      <Badge
        status={config.color as any}
        text={
          <Text strong style={{ fontSize: 16 }}>
            {config.icon} {config.text}
          </Text>
        }
      />
    );
  };

  // Get category color
  const getCategoryColor = (category?: string) => {
    if (!category) return "default";

    const categoryColors: Record<string, string> = {
      kedisiplinan: "blue",
      akademik: "purple",
      kehadiran: "cyan",
      kebersihan: "green",
      komunikasi: "orange",
      sikap: "magenta",
      pakaian: "gold",
    };

    return categoryColors[category.toLowerCase()] || "default";
  };

  // Format date
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

  const renderDocumentation = () => {
    if (!record?.evidence)
      return (
        <Text type="secondary">
          Tidak ada dokumentasi {record?.evidence} yang tersedia
        </Text>
      );
    console.log(
      "Attempting to load image from:",
      //  imageUrl,
      apiUrl,
      record
    );

    const imageUrl =
      apiUrl.endsWith("/") && record.evidence.startsWith("/")
        ? `${apiUrl}${record.evidence.substring(1)}`
        : !apiUrl.endsWith("/") && !record.evidence.startsWith("/")
        ? `${apiUrl}/${record.evidence}`
        : `${apiUrl}${record.evidence}`;

    return (
      <Image
        src={imageUrl}
        alt={imageUrl}
        style={{ maxWidth: "100%", borderRadius: "8px" }}
        placeholder={<div style={{ background: "#f0f0f0", height: 200 }} />}
        fallback="data:image/png;base64,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"
      />
    );
  };
  if (query.error && query.error.statusCode === 403) {
    return <UnauthorizedPage />;
  }

  if (isLoading) {
    return (
      <Show
        title={
          <Space>
            <TrophyOutlined />{" "}
            <Skeleton.Input style={{ width: 200 }} active size="small" />
          </Space>
        }
      >
        <Card>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </Show>
    );
  }
  if (isError) {
    return (
      <Card>
        <Title level={4} type="danger">
          Error
        </Title>
        <Text>Failed to load violation details. Please try again later.</Text>
      </Card>
    );
  }
  return (
    <Show
      title={
        <Space>
          <TrophyOutlined style={{ fontSize: 24, color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Detail Penghargaan
          </Title>
        </Space>
      }
      headerButtons={({ defaultButtons }) => (
        <CanAccess resource="awards" action="approval" fallback={null}>
          <Space>
            {record?.status === "proposed" && (
              <>
                <Popconfirm
                  title="Setujui penghargaan ini?"
                  description="Apakah Anda yakin ingin menyetujui penghargaan ini?"
                  onConfirm={() => handleUpdateStatus("approved")}
                  okText="Ya"
                  cancelText="Tidak"
                >
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    loading={updateStatusLoading}
                  >
                    Setujui
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="Tolak penghargaan ini?"
                  description="Apakah Anda yakin ingin menolak penghargaan ini?"
                  onConfirm={() => handleUpdateStatus("rejected")}
                  okText="Ya"
                  cancelText="Tidak"
                >
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    loading={updateStatusLoading}
                  >
                    Tolak
                  </Button>
                </Popconfirm>
              </>
            )}
          </Space>
        </CanAccess>
      )}
    >
      <Row gutter={[16, 16]}>
        {/* Status Card */}
        <Col xs={24}>
          <Card bordered={false}>
            <Space size="large" align="center">
              {getStatusBadge(record?.status)}
              <Divider type="vertical" style={{ height: 36 }} />
              {regulation && (
                <Space>
                  <TrophyOutlined style={{ fontSize: 18, color: "#faad14" }} />
                  <Text strong>{regulation.point}</Text>
                  <Text type="secondary">poin</Text>
                </Space>
              )}
              <Divider type="vertical" style={{ height: 36 }} />
              <Space>
                <CalendarOutlined style={{ color: "#8c8c8c" }} />
                <Text type="secondary">
                  Dibuat pada:{" "}
                  <DateField
                    value={formatDate(record?.createdAt)}
                    format="DD MMM YYYY HH:mm"
                  />
                </Text>
              </Space>
            </Space>
          </Card>
        </Col>

        {/* Main Information */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <BookOutlined />
                <span>Informasi Penghargaan</span>
              </Space>
            }
            bordered={false}
          >
            {/* Regulation Information */}
            {regulationIsLoading ? (
              <Skeleton active paragraph={{ rows: 2 }} />
            ) : regulation ? (
              <Card type="inner" style={{ marginBottom: 16 }}>
                <Descriptions
                  title="Detail Regulasi"
                  layout="vertical"
                  bordered
                >
                  <Descriptions.Item label="Nama Regulasi" span={3}>
                    <Text strong>{regulation.name}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kategori">
                    <Tag color={getCategoryColor(regulation.category)}>
                      {regulation.category}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tipe">
                    <Tag color="blue">{regulation.type}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Poin">
                    <Badge
                      count={regulation.point}
                      style={{
                        backgroundColor: "#52c41a",
                        fontSize: "14px",
                      }}
                    />
                  </Descriptions.Item>
                  {regulation.description && (
                    <Descriptions.Item label="Deskripsi Regulasi" span={3}>
                      {regulation.description}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            ) : (
              <Alert
                message="Regulation Not Found"
                description="The regulation associated with this award cannot be found."
                type="warning"
                showIcon
              />
            )}

            {/* Award Description */}
            <Card
              type="inner"
              title={
                <Space>
                  <FileTextOutlined />
                  <span>Deskripsi Penghargaan</span>
                </Space>
              }
            >
              <Paragraph style={{ fontSize: 16 }}>
                {record?.description || "No description provided"}
              </Paragraph>
            </Card>

            {/* Evidence/Proof */}
            {record?.evidence && (
              <>
                <Divider orientation="left">Bukti Penghargaan</Divider>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "16px 0",
                  }}
                >
                  {renderDocumentation()}
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* Student and Approval Info */}
        <Col xs={24} lg={8}>
          {/* Student Info */}
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Informasi Siswa</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
            bordered={false}
          >
            {record?.studentClass ? (
              <>
                <div style={{ textAlign: "center", margin: "16px 0" }}>
                  <Avatar size={64} icon={<UserOutlined />} />
                  <Title level={4} style={{ marginTop: 8, marginBottom: 4 }}>
                    {record.studentClass?.user?.student?.name || "Nama Siswa"}
                  </Title>
                  <Tag color="blue" style={{ marginTop: 4 }}>
                    {`${record.studentClass?.class?.romanLevel || ""} ${
                      record.studentClass?.class?.expertise?.shortName || ""
                    } ${record.studentClass?.class?.alphabet || ""}`}
                  </Tag>
                </div>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="NIS">
                    {record.studentClass?.user?.student?.nis || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="NISN">
                    {record.studentClass?.user?.student?.nisn || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nomor Telepon">
                    {record.studentClass?.user?.student?.phone || "-"}
                  </Descriptions.Item>
                </Descriptions>
              </>
            ) : (
              <Alert
                message="Student Not Found"
                description="The student information is not available."
                type="warning"
                showIcon
              />
            )}
          </Card>

          {/* Submission and Approval Info */}
          <Card
            title={
              <Space>
                <TeamOutlined />
                <span>Informasi Pengajuan & Persetujuan</span>
              </Space>
            }
            bordered={false}
          >
            <Timeline
              items={[
                {
                  color: "blue",
                  children: (
                    <>
                      <Text strong>Diajukan oleh</Text>
                      <Paragraph style={{ margin: "8px 0" }}>
                        {record?.proposer?.teacher?.name ||
                          record?.proposer?.username ||
                          "-"}
                      </Paragraph>
                      <Text type="secondary">
                        <CalendarOutlined /> {formatDate(record?.createdAt)}
                      </Text>
                    </>
                  ),
                },
                {
                  color:
                    record?.status === "proposed"
                      ? "gray"
                      : record?.status === "approved"
                      ? "green"
                      : "red",
                  children: (
                    <>
                      <Text strong>
                        {record?.status === "proposed"
                          ? "Menunggu Persetujuan"
                          : record?.status === "approved"
                          ? "Disetujui oleh"
                          : "Ditolak oleh"}
                      </Text>
                      {record?.status !== "proposed" && (
                        <>
                          <Paragraph style={{ margin: "8px 0" }}>
                            {record?.approver?.teacher?.name ||
                              record?.approver?.username ||
                              "-"}
                          </Paragraph>
                          <Text type="secondary">
                            <CalendarOutlined /> {formatDate(record?.updatedAt)}
                          </Text>
                        </>
                      )}
                    </>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </Show>
  );
};
