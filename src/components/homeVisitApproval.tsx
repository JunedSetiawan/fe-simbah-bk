"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  Space,
  Tag,
  Divider,
  Badge,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  message,
  Alert,
  Descriptions,
  Timeline,
  Spin,
} from "antd";
import { useApiUrl, useCustomMutation, useCustom } from "@refinedev/core";
import {
  UserOutlined,
  HomeOutlined,
  PhoneOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import axios from "axios";

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// WhatsApp Service for notifications
const WhatsAppService = {
  async sendImmediateMessage(phone: any, messageText: string) {
    try {
      // Convert data to proper format
      const formData = new URLSearchParams();

      // Ensure all required fields are present and not empty
      if (!phone || !messageText) {
        throw new Error("Missing required fields: target or message");
      }

      // Add required fields
      formData.append("target", phone);
      formData.append("message", messageText);
      formData.append("countryCode", "62");
      formData.append("delay", "5");

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
};

export const HomeVisitApproval = () => {
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [visitStatus, setVisitStatus] = useState<string | null>(null);

  // Get visit data from URL parameters
  const visitId = searchParams.get("id");
  const studentName = searchParams.get("student");
  const className = searchParams.get("class");
  const visitDate = searchParams.get("date");
  const address = searchParams.get("address");
  const description = searchParams.get("description");
  const involvedPersons = searchParams.get("involved");
  const teacherName = searchParams.get("teacher");
  const teacherPhone = searchParams.get("phone");

  const apiUrl = useApiUrl();

  // Fetch the actual status from backend
  const {
    data: visitData,
    isLoading: isLoadingVisit,
    isError: isErrorVisit,
    error: visitError,
  } = useCustom({
    url: `${apiUrl}/home-visits/${visitId}/approval/show`,
    method: "get",
    queryOptions: {
      enabled: !!visitId,
      onSuccess: (data) => {
        if (data?.data?.status_approval_by_parent) {
          // Set status from backend response
          setVisitStatus(data.data.status_approval_by_parent);
        }
      },
      onError: (error) => {
        setError(`Gagal memuat data kunjungan: ${error.message}`);
      },
    },
  });

  // Custom mutation for approving home visit
  const { mutate: approveVisit, isLoading: isApproving } = useCustomMutation();

  // Custom mutation for rejecting home visit
  const { mutate: rejectVisit, isLoading: isRejecting } = useCustomMutation();

  useEffect(() => {
    // Validate that required parameters are present
    if (!visitId || !studentName) {
      setError("Parameter URL tidak valid. Beberapa informasi tidak tersedia.");
      setLoading(false);
      return;
    }

    // Wait for visit data to load
    if (!isLoadingVisit && !isErrorVisit) {
      setLoading(false);
    }
  }, [visitId, studentName, isLoadingVisit, isErrorVisit]);

  const showRejectModal = () => {
    setRejectModalVisible(true);
  };

  const sendApprovalNotification = async () => {
    if (!teacherPhone) {
      message.warning(
        "Nomor telepon guru tidak ditemukan untuk mengirim notifikasi."
      );
      return false;
    }

    try {
      setSendingNotification(true);

      const detailUrl = `${window.location.origin}/home-visits/show/${visitId}`;

      const messageText =
        `Halo ${teacherName || "Guru"},\n\n` +
        `Persetujuan kunjungan rumah untuk siswa ${studentName} pada ${formatDate(
          visitDate
        )} telah DISETUJUI oleh orang tua/wali siswa.\n\n` +
        `Anda dapat melanjutkan dengan jadwal kunjungan sesuai rencana.\n\n` +
        `Untuk detail selengkapnya silakan kunjungi: ${detailUrl}`;

      await WhatsAppService.sendImmediateMessage(teacherPhone, messageText);

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

  const sendTeacherNotification = async (reason: any) => {
    if (!teacherPhone) {
      message.warning(
        "Nomor telepon guru tidak ditemukan untuk mengirim notifikasi."
      );
      return false;
    }

    try {
      setSendingNotification(true);

      const detailUrl = `${window.location.origin}/home-visits/show/${visitId}`;

      const messageText =
        `Halo ${teacherName || "Guru"},\n\n` +
        `Persetujuan kunjungan rumah untuk siswa ${studentName} pada ${formatDate(
          visitDate
        )} telah DITOLAK oleh orang tua/wali siswa.\n\n` +
        `Alasan penolakan: "${reason}"\n\n` +
        `Untuk detail selengkapnya silakan kunjungi: ${detailUrl}`;

      await WhatsAppService.sendImmediateMessage(teacherPhone, messageText);

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
    if (!visitId) {
      message.error("ID kunjungan tidak valid");
      return;
    }

    Modal.confirm({
      title: "Konfirmasi Persetujuan",
      content: "Apakah Anda yakin ingin menyetujui kunjungan rumah ini?",
      okText: "Ya, Setujui",
      cancelText: "Batal",
      onOk: async () => {
        try {
          setLoading(true);

          // First, approve the home visit
          await new Promise<void>((resolve, reject) => {
            approveVisit(
              {
                url: `${apiUrl}/home-visits/${visitId}/approve/parent`,
                method: "put",
                values: {},
                successNotification: false,
                errorNotification: false,
              },
              {
                onSuccess: (response) => {
                  // Update status from the response
                  if (response?.data?.status_approval_by_parent) {
                    setVisitStatus(response.data.status_approval_by_parent);
                  } else {
                    setVisitStatus("approved"); // Fallback
                  }
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

          // Show success message
          setSuccess(
            "Kunjungan rumah telah DISETUJUI, Mohon kehadirannya pada di hari kunjungan mendatang. Terima Kasih atas Persetujuan Anda."
          );
        } catch (error: any) {
          setError(`Terjadi kesalahan: ${error.message}`);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleReject = async (values: { reason: any }) => {
    if (!visitId) {
      message.error("ID kunjungan tidak valid");
      return;
    }

    const reason = values.reason;

    try {
      setLoading(true);

      // First, reject the home visit
      await new Promise<void>((resolve, reject) => {
        rejectVisit(
          {
            url: `${apiUrl}/home-visits/${visitId}/reject/parent`,
            method: "put",
            values: {
              reason: reason,
            },
            successNotification: false,
            errorNotification: false,
          },
          {
            onSuccess: (response) => {
              // Update status from the response
              if (response?.data?.status_approval_by_parent) {
                setVisitStatus(response.data.status_approval_by_parent);
              } else {
                setVisitStatus("rejected"); // Fallback
              }
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

      // Hide modal and show success message
      setRejectModalVisible(false);
      form.resetFields();
      setSuccess(
        "Kunjungan rumah telah DITOLAK. Terima kasih atas respons Anda."
      );
    } catch (error: any) {
      console.log(error);
      setError(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue: string | null) => {
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

  // Status badge configuration for approval
  const getApprovalStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { status: string; text: string }> = {
      approved: { status: "success", text: "Disetujui" },
      rejected: { status: "error", text: "Ditolak" },
      pending: { status: "warning", text: "Menunggu Persetujuan" },
    };

    const defaultStatus = {
      status: "default",
      text: status || "Menunggu Persetujuan",
    };
    const key = status ? status.toLowerCase() : "";
    return statusMap[key] || defaultStatus;
  };

  // If there was an error or success, show appropriate message
  if (error) {
    return (
      <Card style={{ margin: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
        <Alert
          message="Terjadi Kesalahan"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  if (success) {
    return (
      <Card style={{ margin: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
        <Alert
          message="Berhasil"
          description={success}
          type="success"
          showIcon
        />
      </Card>
    );
  }

  if (loading || isLoadingVisit) {
    return (
      <Card
        style={{
          margin: "16px",
          textAlign: "center",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ padding: 24 }}>
          <Spin tip="Memuat data kunjungan..." />
        </div>
      </Card>
    );
  }

  // Render approval status badge using backend status
  const statusBadge = getApprovalStatusBadge(visitStatus);

  // Don't show buttons if already approved or rejected
  const showActionButtons =
    visitStatus?.toLowerCase() !== "approved" &&
    visitStatus?.toLowerCase() !== "rejected";

  return (
    <>
      <Card style={{ margin: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
        <Title
          level={4}
          style={{
            fontSize: "1.25rem",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          Detail Kunjungan Rumah
        </Title>
        <Divider style={{ margin: "12px 0" }} />

        <Row gutter={[16, 16]}>
          {/* Student Information Card */}
          <Col xs={24} sm={24} md={12}>
            <Card
              title={
                <Space>
                  <UserOutlined />
                  <span>Informasi Siswa</span>
                </Space>
              }
              bordered={false}
              style={{
                height: "100%",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                    Nama Siswa:
                  </Text>
                  <Title
                    level={5}
                    style={{ margin: "4px 0 12px", fontSize: "1rem" }}
                  >
                    {studentName || "-"}
                  </Title>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                    Kelas:
                  </Text>
                  <div style={{ marginTop: "4px" }}>
                    <Tag color="blue">{className || "-"}</Tag>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Visit Status Card */}
          <Col xs={24} sm={24} md={12}>
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  <span>Status Kunjungan</span>
                </Space>
              }
              bordered={false}
              style={{
                height: "100%",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
              bodyStyle={{ padding: "16px" }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                    Jadwal Tanggal Kunjungan:
                  </Text>
                  <Title
                    level={5}
                    style={{ margin: "4px 0 12px", fontSize: "1rem" }}
                  >
                    {formatDate(visitDate) || "-"}
                  </Title>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                    Status Persetujuan:
                  </Text>
                  <div style={{ marginTop: "4px" }}>
                    <Badge
                      status={
                        statusBadge.status as
                          | "error"
                          | "default"
                          | "success"
                          | "warning"
                          | "processing"
                          | undefined
                      }
                      text={<Text strong>{statusBadge.text}</Text>}
                    />
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
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
              bodyStyle={{ padding: "16px" }}
            >
              {/* Mobile-friendly descriptions */}
              <div className="mobile-descriptions">
                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      backgroundColor: "#fafafa",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      marginBottom: "8px",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <HomeOutlined /> Alamat
                  </div>
                  <div style={{ padding: "0 4px" }}>{address || "-"}</div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      backgroundColor: "#fafafa",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      marginBottom: "8px",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <UserOutlined /> Guru yang menjadwalkan
                  </div>
                  <div style={{ padding: "0 4px" }}>{teacherName || "-"}</div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      backgroundColor: "#fafafa",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      marginBottom: "8px",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FileTextOutlined /> Deskripsi
                  </div>
                  <div style={{ padding: "0 4px" }}>{description || "-"}</div>
                </div>
              </div>

              {/* Desktop descriptions (hidden on mobile) */}
              <div className="desktop-descriptions" style={{ display: "none" }}>
                <Descriptions
                  bordered
                  column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
                  size="small"
                >
                  <Descriptions.Item
                    label={
                      <>
                        <HomeOutlined /> Alamat
                      </>
                    }
                    span={2}
                  >
                    {address || "-"}
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={
                      <>
                        <UserOutlined /> Guru yang menjadwalkan
                      </>
                    }
                    span={3}
                  >
                    <Paragraph>{teacherName || "-"}</Paragraph>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={
                      <>
                        <FileTextOutlined /> Deskripsi
                      </>
                    }
                    span={3}
                  >
                    <Paragraph>{description || "-"}</Paragraph>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Approval Actions */}
        {showActionButtons && (
          <Row justify="center" style={{ marginTop: "24px" }}>
            <Space
              size="middle"
              direction="horizontal"
              style={{
                width: "100%",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleApprove}
                loading={isApproving || sendingNotification}
                size="large"
                style={{ minWidth: "160px" }}
              >
                Setujui Kunjungan
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={showRejectModal}
                loading={isRejecting}
                size="large"
                style={{ minWidth: "160px" }}
              >
                Tolak Kunjungan
              </Button>
            </Space>
          </Row>
        )}

        {!showActionButtons && (
          <Row justify="center" style={{ marginTop: "24px" }}>
            <Alert
              message={
                visitStatus?.toLowerCase() === "approved"
                  ? "Kunjungan rumah ini telah DISETUJUI, Mohon kehadirannya pada di hari kunjungan mendatang. Terima Kasih."
                  : "Kunjungan rumah ini telah DITOLAK"
              }
              type={
                visitStatus?.toLowerCase() === "approved" ? "success" : "error"
              }
              showIcon
              style={{ width: "100%" }}
            />
          </Row>
        )}
      </Card>

      {/* Rejection Modal */}
      <Modal
        title="Alasan Penolakan"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        width={window.innerWidth < 576 ? "95%" : 520}
        centered
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
              placeholder="Masukkan alasan mengapa kunjungan ditolak atau jika ada masukan jadwal pada hari apa akan kami pertimbangkan..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add responsive styles */}
      <style jsx global>
        {`
          /* Small screen adjustments: viewport width 576px or less */
          @media (max-width: 576px) {
            .desktop-descriptions {
              display: none !important; /* Hide desktop descriptions on small screens */
            }
            .mobile-descriptions {
              display: block; /* Show mobile descriptions on small screens */
            }
            .ant-card-head-title {
              font-size: 14px !important; /* Reduce card title font size */
            }
            .ant-modal {
              max-width: 95% !important; /* Limit modal width on small screens */
            }
          }

          /* Large screen adjustments: viewport width 577px or greater */
          @media (min-width: 577px) {
            .desktop-descriptions {
              display: block !important; /* Show desktop descriptions on larger screens */
            }
            .mobile-descriptions {
              display: none; /* Hide mobile descriptions on larger screens */
            }
          }

          /* Adjustments for Ant Design responsiveness */
          .ant-form-item-label {
            white-space: normal !important; /* Allow form labels to wrap into multiple lines */
          }

          .ant-card {
            overflow: hidden; /* Prevent card content from overflowing */
          }
        `}
      </style>
    </>
  );
};
