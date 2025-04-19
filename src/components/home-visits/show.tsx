"use client";

import React from "react";
import { useShow, useApiUrl } from "@refinedev/core";
import { Show, DateField } from "@refinedev/antd";
import {
  Typography,
  Descriptions,
  Space,
  Tag,
  Image,
  Card,
  Divider,
  Badge,
  Row,
  Col,
  Timeline,
  Skeleton,
} from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  UserOutlined,
  HomeOutlined,
  PhoneOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  PictureOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import UnauthorizedPage from "@app/unauthorized";

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text, Paragraph } = Typography;

export const HomeVisitsShow = () => {
  const { query } = useShow();
  const { data, isLoading, isError } = query;
  const record = data?.data;

  const apiUrl = useApiUrl();

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
  const getStatusBadge = (status: any) => {
    const statusMap = {
      pending: { status: "warning" as const, text: "Menunggu" },
      completed: { status: "success" as const, text: "Selesai" },
      canceled: { status: "error" as const, text: "Dibatalkan" },
    };

    const defaultStatus = {
      status: "default" as const,
      text: status || "Pending",
    };
    return (
      statusMap[status?.toLowerCase() as keyof typeof statusMap] ||
      defaultStatus
    );
  };

  const renderDocumentation = () => {
    if (!record?.documentation)
      return (
        <Text type="secondary">
          Tidak ada dokumentasi {record?.documentation}
        </Text>
      );
    console.log(
      "Attempting to load image from:",
      //  imageUrl,
      apiUrl,
      record
    );

    const imageUrl =
      apiUrl.endsWith("/") && record.documentation.startsWith("/")
        ? `${apiUrl}${record.documentation.substring(1)}`
        : !apiUrl.endsWith("/") && !record.documentation.startsWith("/")
        ? `${apiUrl}/${record.documentation}`
        : `${apiUrl}${record.documentation}`;

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
      isLoading={isLoading}
      title="Detail Kunjungan Rumah"
      headerButtons={[]}
    >
      <Row gutter={[24, 24]}>
        {/* Student Information Card */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Informasi Siswa</span>
              </Space>
            }
            bordered={false}
            style={{ height: "100%" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text type="secondary">Nama Siswa:</Text>
                <Title level={5}>
                  {record?.studentClasses?.user?.student?.name || "-"}
                </Title>
              </div>

              <div>
                <Text type="secondary">Kelas:</Text>
                <div>
                  <Tag color="blue">
                    {`${record?.studentClasses?.class?.romanLevel || ""} 
                    ${
                      record?.studentClasses?.class?.expertise?.shortName || ""
                    } 
                    ${record?.studentClasses?.class?.alphabet || ""}`}
                  </Tag>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Visit Status Card */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>Status Kunjungan</span>
              </Space>
            }
            bordered={false}
            style={{ height: "100%" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text type="secondary">Jadwal Tanggal Kunjungan:</Text>
                <Title level={5}>{formatDate(record?.date)}</Title>
              </div>

              <div>
                <Text type="secondary">Status:</Text>
                <div>
                  {record?.status && (
                    <Badge
                      status={getStatusBadge(record.status).status}
                      text={
                        <Text strong>{getStatusBadge(record.status).text}</Text>
                      }
                    />
                  )}
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Visit Details Card */}
        <Col xs={24}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>Detail Kunjungan</span>
              </Space>
            }
            bordered={false}
          >
            <Descriptions
              bordered
              column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 4 }}
            >
              <Descriptions.Item
                label={
                  <>
                    <HomeOutlined /> Alamat
                  </>
                }
                span={2}
              >
                {record?.address || "-"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <TeamOutlined /> Pihak Terlibat
                  </>
                }
                span={2}
              >
                {record?.involvedPersons || "-"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <FileTextOutlined /> Deskripsi
                  </>
                }
                span={3}
              >
                <Paragraph>{record?.description || "-"}</Paragraph>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <CheckCircleOutlined /> Hasil
                  </>
                }
                span={3}
              >
                <Paragraph>{record?.result || "-"}</Paragraph>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Documentation Card */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <PictureOutlined />
                <span>Dokumentasi</span>
              </Space>
            }
            bordered={false}
          >
            {renderDocumentation()}
          </Card>
        </Col>

        {/* Creation Info Card */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Informasi Pembuatan</span>
              </Space>
            }
            bordered={false}
            style={{ height: "100%" }}
          >
            <Timeline
              items={[
                {
                  color: "green",
                  children: (
                    <>
                      <Text strong>Dibuat oleh:</Text>{" "}
                      {record?.createdBy?.teacher?.name ||
                        record?.createdBy?.username}
                    </>
                  ),
                },
                {
                  color: "blue",
                  children: (
                    <>
                      <Text strong>Dibuat pada:</Text>{" "}
                      <DateField
                        value={formatDate(record?.createdAt)}
                        format="DD MMM YYYY HH:mm"
                      />
                    </>
                  ),
                },
                {
                  color: "orange",
                  children: (
                    <>
                      <Text strong>Terakhir diperbarui:</Text>{" "}
                      {record?.updatedAt ? (
                        <DateField
                          value={formatDate(record.updatedAt)}
                          format="DD MMM YYYY HH:mm"
                        />
                      ) : (
                        <Text strong>-</Text>
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
