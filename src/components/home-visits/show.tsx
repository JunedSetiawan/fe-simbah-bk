"use client";

import React, { useState } from "react";
import {
  useShow,
  useApiUrl,
  useCustomMutation,
  CanAccess,
} from "@refinedev/core";
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
  Button,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import axios from "axios";
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
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import UnauthorizedPage from "@app/unauthorized";

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// WhatsApp Service - similar to the one used in create component
const WhatsAppService = {
  async sendMessage(data: {
    target: any;
    message: any;
    countryCode: any;
    delay: any;
    schedule?: any;
  }) {
    try {
      // Convert data to proper format
      const formData = new URLSearchParams();

      // Ensure all required fields are present and not empty
      if (!data.target || !data.message) {
        throw new Error("Missing required fields: target or message");
      }

      // Add required fields
      formData.append("target", data.target);
      formData.append("message", data.message);

      // Add optional fields if present
      if (data.countryCode) {
        formData.append("countryCode", data.countryCode);
      }

      // Handle scheduling differently - Fonnte API requires specific format
      if (data.schedule && data.schedule !== "0") {
        // Convert to Unix timestamp (seconds since epoch)
        const scheduleTimestamp = Math.floor(
          dayjs(data.schedule).valueOf() / 1000
        );
        formData.append("schedule", scheduleTimestamp.toString());

        // Set delay (in seconds) if provided, otherwise default to 0
        formData.append("delay", data.delay || "0");
      }

      const response = await axios.post(
        "https://api.fonnte.com/send",
        formData,
        {
          headers: {
            Authorization: process.env.NEXT_PUBLIC_TOKEN_FONNTE_API,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!response.data || !response.data.status) {
        throw new Error(
          `API Fonnte error: ${response.data?.reason || "Unknown error"}`
        );
      }

      return response.data;
    } catch (error) {
      console.error("WhatsApp send error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to send message: ${errorMessage}`);
    }
  },

  // Method specifically for sending immediate messages
  async sendImmediateMessage(phone: any, messageText: string) {
    return this.sendMessage({
      target: phone,
      message: messageText,
      countryCode: "62",
      delay: 5,
    });
  },
};

export const HomeVisitsShow = () => {
  const { query } = useShow();
  const { data, isLoading, isError, refetch } = query;
  const record = data?.data;

  const apiUrl = useApiUrl();
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [sendingNotification, setSendingNotification] = useState(false);

  // Custom mutation for approving home visit
  const { mutate: approveVisit, isLoading: isApproving } = useCustomMutation();

  // Custom mutation for rejecting home visit
  const { mutate: rejectVisit, isLoading: isRejecting } = useCustomMutation();

  const showRejectModal = () => {
    setRejectModalVisible(true);
  };

  const sendApprovalNotification = async () => {
    if (
      !record?.createdBy?.teacher?.phone &&
      !record?.createdBy?.teacher?.phoneMobile
    ) {
      message.warning(
        "Nomor telepon guru tidak ditemukan untuk mengirim notifikasi."
      );
      return false;
    }

    const teacherPhone =
      record?.createdBy?.teacher?.phone ||
      record?.createdBy?.teacher?.phoneMobile;
    const teacherName = record?.createdBy?.teacher?.name || "Guru";
    const studentName = record?.studentClasses?.user?.student?.name || "Siswa";
    const visitDate = formatDate(record?.date);
    const detailUrl = `${window.location.origin}/home-visits/show/${record?.id}`;

    try {
      setSendingNotification(true);

      const message =
        `Halo ${teacherName},\n\n` +
        `Persetujuan kunjungan rumah untuk siswa ${studentName} pada ${visitDate} telah DISETUJUI oleh orang tua/wali siswa.\n\n` +
        `Anda dapat melanjutkan dengan jadwal kunjungan sesuai rencana.\n\n` +
        `Untuk detail selengkapnya silakan kunjungi: ${detailUrl}`;

      await WhatsAppService.sendImmediateMessage(teacherPhone, message);

      setSendingNotification(false);
      return true;
    } catch (error) {
      console.error("Failed to send WhatsApp notification:", error);
      message.error(
        `Gagal mengirim notifikasi WhatsApp: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setSendingNotification(false);
      return false;
    }
  };

  // Function to send WhatsApp notification to the teacher
  const sendTeacherNotification = async (reason: any) => {
    if (
      !record?.createdBy?.teacher?.phone &&
      !record?.createdBy?.teacher?.phoneMobile
    ) {
      message.warning(
        "Nomor telepon guru tidak ditemukan untuk mengirim notifikasi."
      );
      return false;
    }

    const teacherPhone =
      record?.createdBy?.teacher?.phone ||
      record?.createdBy?.teacher?.phoneMobile;
    const teacherName = record?.createdBy?.teacher?.name || "Guru";
    const studentName = record?.studentClasses?.user?.student?.name || "Siswa";
    const visitDate = formatDate(record?.date);
    const detailUrl = `${window.location.origin}/home-visits/show/${record?.id}`;

    try {
      setSendingNotification(true);

      const message =
        `Halo ${teacherName},\n\n` +
        `Persetujuan kunjungan rumah untuk siswa ${studentName} pada ${visitDate} telah DITOLAK oleh orang tua/wali siswa.\n\n` +
        `Alasan penolakan: "${reason}"\n\n` +
        `Untuk detail selengkapnya silakan kunjungi: ${detailUrl}`;

      await WhatsAppService.sendImmediateMessage(teacherPhone, message);

      setSendingNotification(false);
      return true;
    } catch (error) {
      console.error("Failed to send WhatsApp notification:", error);
      message.error(
        `Gagal mengirim notifikasi WhatsApp: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setSendingNotification(false);
      return false;
    }
  };

  const handleApprove = () => {
    Modal.confirm({
      title: "Konfirmasi Persetujuan",
      content: "Apakah Anda yakin ingin menyetujui kunjungan rumah ini?",
      okText: "Ya, Setujui",
      cancelText: "Batal",
      onOk: async () => {
        try {
          // First, approve the home visit
          await new Promise<void>((resolve, reject) => {
            approveVisit(
              {
                url: `${apiUrl}/home-visits/${record?.id}/approve/parent`,
                method: "put",
                values: {},
                successNotification: {
                  message: "Berhasil",
                  description: "Kunjungan rumah telah disetujui",
                  type: "success",
                },
                errorNotification: {
                  message: "Gagal",
                  description: "Tidak dapat menyetujui kunjungan rumah",
                  type: "error",
                },
              },
              {
                onSuccess: () => {
                  resolve();
                },
                onError: (error) => {
                  reject(error);
                },
              }
            );
          });

          // Then send WhatsApp notification to teacher
          await sendApprovalNotification();

          // Refetch data regardless of notification result
          refetch();
        } catch (error) {
          message.error(
            `Error: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      },
    });
  };

  const handleReject = async (values: { reason: any }) => {
    const reason = values.reason;

    try {
      // First, reject the home visit
      await new Promise<void>((resolve, reject) => {
        rejectVisit(
          {
            url: `${apiUrl}/home-visits/${record?.id}/reject/parent`,
            method: "put",
            values: {
              reason: reason,
            },
            successNotification: {
              message: "Berhasil",
              description: "Kunjungan rumah telah ditolak, Terima kasih.",
              type: "success",
            },
            errorNotification: {
              message: "Gagal",
              description: "Tidak dapat menolak kunjungan rumah",
              type: "error",
            },
          },
          {
            onSuccess: () => {
              resolve();
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });

      // Then send WhatsApp notification to teacher
      await sendTeacherNotification(reason);

      // Hide modal and refetch data regardless of notification result
      setRejectModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      message.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
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

  // Status badge configuration
  const getStatusBadge = (
    status: string
  ): {
    status: "default" | "warning" | "success" | "error" | "processing";
    text: string;
  } => {
    const statusMap: {
      [key: string]: {
        status: "default" | "warning" | "success" | "error" | "processing";
        text: string;
      };
    } = {
      pending: { status: "warning", text: "Menunggu" },
      completed: { status: "success", text: "Selesai" },
      canceled: { status: "error", text: "Dibatalkan" },
    };

    const defaultStatus = {
      status: "default" as "default",
      text: status || "Pending",
    };
    return statusMap[status?.toLowerCase()] || defaultStatus;
  };

  // Approval status badge configuration
  const getApprovalStatusBadge = (
    status: string
  ): {
    status: "default" | "warning" | "success" | "error" | "processing";
    text: string;
  } => {
    const statusMap: {
      [key: string]: {
        status: "default" | "warning" | "success" | "error" | "processing";
        text: string;
      };
    } = {
      approved: { status: "success", text: "Disetujui" },
      rejected: { status: "error", text: "Ditolak" },
      pending: { status: "warning", text: "Menunggu Persetujuan" },
    };

    const defaultStatus = {
      status: "default" as "default",
      text: status || "Menunggu Persetujuan",
    };
    const key = status?.toLowerCase();
    return statusMap[key] || defaultStatus;
  };

  const renderDocumentation = () => {
    if (!record?.documentation)
      return <Text type="secondary">Tidak ada dokumentasi</Text>;

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

  const renderApprovalActions = () => {
    // Don't show buttons if already approved or rejected
    if (record?.statusApprovalByParent === "approved") {
      return (
        <Tag color="green" icon={<CheckOutlined />}>
          Kunjungan Telah Disetujui
        </Tag>
      );
    }

    if (record?.statusApprovalByParent === "rejected") {
      return (
        <Tag color="red" icon={<CloseOutlined />}>
          Kunjungan Telah Ditolak
        </Tag>
      );
    }

    // Show approval buttons only if pending or undefined
    return (
      <CanAccess resource="home-visits" action="approvalParent">
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleApprove}
            loading={isApproving || sendingNotification}
          >
            Setujui
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={showRejectModal}
            loading={isRejecting}
          >
            Tolak
          </Button>
        </Space>
      </CanAccess>
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
    <>
      <Show
        isLoading={isLoading}
        title="Detail Kunjungan Rumah"
        headerButtons={[renderApprovalActions()]}
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
                        record?.studentClasses?.class?.expertise?.shortName ||
                        ""
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
                        status={
                          getStatusBadge(record.status).status as
                            | "error"
                            | "success"
                            | "default"
                            | "warning"
                            | "processing"
                        }
                        text={
                          <Text strong>
                            {getStatusBadge(record.status).text}
                          </Text>
                        }
                      />
                    )}
                  </div>
                </div>

                <div>
                  <Text type="secondary">
                    Status Persetujuan oleh Orang Tua Siswa:
                  </Text>
                  <div>
                    {record?.statusApprovalByParent ? (
                      <Badge
                        status={
                          getApprovalStatusBadge(record.statusApprovalByParent)
                            .status
                        }
                        text={
                          <Text strong>
                            {
                              getApprovalStatusBadge(
                                record.statusApprovalByParent
                              ).text
                            }
                          </Text>
                        }
                      />
                    ) : (
                      <Badge
                        status="warning"
                        text={<Text strong>Menunggu Persetujuan</Text>}
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

                {record?.statusApprovalByParent === "rejected" &&
                  record?.rejection_reason && (
                    <Descriptions.Item
                      label={
                        <>
                          <CloseOutlined /> Alasan Penolakan
                        </>
                      }
                      span={3}
                    >
                      <Paragraph>{record.rejection_reason}</Paragraph>
                    </Descriptions.Item>
                  )}
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

      {/* Rejection Modal */}
      <Modal
        title="Alasan Penolakan"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setRejectModalVisible(false)}>
            Batal
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={isRejecting || sendingNotification}
            onClick={() => form.submit()}
          >
            {sendingNotification ? "Mengirim Notifikasi..." : "Tolak Kunjungan"}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleReject}>
          <Form.Item
            name="reason"
            label="Alasan Penolakan"
            rules={[
              {
                required: true,
                message: "Silakan masukkan alasan penolakan",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Masukkan alasan mengapa kunjungan ditolak..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
