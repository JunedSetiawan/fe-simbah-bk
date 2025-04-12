"use client";

import React, { useState } from "react";
import { Edit, useForm } from "@refinedev/antd";
import {
  Form,
  Input,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Upload,
  message,
  Badge,
  Alert,
} from "antd";
import dayjs from "dayjs";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  HomeOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { CanAccess, useApiUrl } from "@refinedev/core";
import type { UploadFile } from "antd/es/upload/interface";
import UnauthorizedPage from "@app/unauthorized";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const HomeVisitsEdit = () => {
  const apiUrl = useApiUrl();
  const [messageApi, contextHolder] = message.useMessage();

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { formProps, saveButtonProps, queryResult, formLoading } = useForm({
    redirect: "list",
    queryOptions: {
      enabled: true,
    },
    onMutationSuccess: () => {
      messageApi.success("Kunjungan telah berhasil diselesaikan");
    },
    onMutationError: (error) => {
      messageApi.error(
        `Gagal menyelesaikan kunjungan: ${error?.message || "Unknown error"}`
      );
    },
  });

  const homeVisitData = queryResult?.data?.data;
  const studentName = homeVisitData?.studentClasses?.user?.student?.name;
  const className = homeVisitData?.studentClasses?.class?.romanLevel;
  const prodyName = homeVisitData?.studentClasses?.class?.expertise?.shortName;
  const classAlphabet = homeVisitData?.studentClasses?.class?.alphabet;
  const status = homeVisitData?.status;
  const address = homeVisitData?.address;
  const visitDate = homeVisitData?.date;

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

  // Custom file upload handler
  const handleFileChange = (info: any) => {
    // Make a copy of the fileList from the event
    let newFileList = [...info.fileList];

    // Limit to only one file
    newFileList = newFileList.slice(-1);

    // Update the file list state
    setFileList(newFileList);
  };

  // Handle form submission with custom file handling
  const onFinish = async (values: any) => {
    // Create a FormData instance for file uploads
    const formData = new FormData();

    // Add text fields
    formData.append("involved_persons", values.involved_persons || "");
    formData.append("description", values.description || "");
    formData.append("result", values.result || "");
    formData.append("status", "completed");

    // Add file if it exists
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("documentation", fileList[0].originFileObj);
    }

    return formProps.onFinish?.(formData);
  };

  return (
    <CanAccess
      resource="home-visits"
      action="edit"
      fallback={<UnauthorizedPage />}
    >
      <>
        {contextHolder}

        <Edit
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <CheckCircleOutlined style={{ fontSize: 24, marginRight: 12 }} />
              <Text strong style={{ fontSize: 20 }}>
                Update Selesaikan Kunjungan Rumah
              </Text>
            </div>
          }
          saveButtonProps={{
            ...saveButtonProps,
            children: "Selesaikan Kunjungan",
          }}
        >
          <Alert
            message={<strong>Perhatian</strong>}
            description={
              <span>
                Sebelum Menyelesaikan Kunjugan Rumah, pastikan semua informasi
                yang diisi sudah benar.
                <br />
                Untuk Dokumentasi Kunjungan, pastikan untuk TIDAK upload foto
                yang <strong> SENSITIF </strong>
              </span>
            }
            type="warning"
            showIcon
          />
          {/* Student Information Card */}
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <UserOutlined style={{ marginRight: 8 }} />
                <span>Informasi Siswa</span>
              </div>
            }
            style={{ marginBottom: 24 }}
            bordered={false}
          >
            <Space direction="vertical" size={12}>
              <div>
                <Text type="secondary">Nama Siswa:</Text>
                <Title level={5} style={{ margin: "4px 0" }}>
                  {studentName || "-"}
                </Title>
              </div>

              <div>
                <Text type="secondary">Kelas:</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color="blue">{`${className || ""} ${prodyName || ""} ${
                    classAlphabet || ""
                  }`}</Tag>
                </div>
              </div>

              <div>
                <Text type="secondary">Status Kunjungan:</Text>
                <div style={{ marginTop: 4 }}>
                  <Badge
                    status={
                      status === "pending"
                        ? "warning"
                        : status === "completed"
                        ? "success"
                        : "error"
                    }
                    text={
                      status === "pending"
                        ? "Menunggu"
                        : status === "completed"
                        ? "Selesai"
                        : "Dibatalkan"
                    }
                  />
                </div>
              </div>
            </Space>
          </Card>

          {/* Visit Information Card */}
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <HomeOutlined style={{ marginRight: 8 }} />
                <span>Informasi Kunjungan</span>
              </div>
            }
            style={{ marginBottom: 24 }}
            bordered={false}
          >
            <Space direction="vertical" size={12}>
              <div>
                <Text type="secondary">Jadwal Kunjungan:</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag icon={<CalendarOutlined />} color="cyan">
                    {formatDate(visitDate)}
                  </Tag>
                </div>
              </div>

              <div>
                <Text type="secondary">Alamat:</Text>
                <Paragraph
                  style={{
                    marginTop: 4,
                    padding: 8,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 4,
                  }}
                >
                  {address || "-"}
                </Paragraph>
              </div>
            </Space>
          </Card>

          <Form
            {...formProps}
            onFinish={onFinish}
            layout="vertical"
            encType="multipart/form-data"
          >
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FileTextOutlined style={{ marginRight: 8 }} />
                  <span>Detail Hasil Kunjungan</span>
                </div>
              }
              bordered={false}
            >
              <Form.Item
                name="involved_persons"
                label="Pihak Yang Terlibat"
                rules={[
                  {
                    required: true,
                    message: "Harap isi pihak yang terlibat",
                  },
                ]}
              >
                <Input placeholder="Contoh: Orangtua siswa, Wali kelas" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Deskripsi Kunjungan"
                rules={[
                  {
                    required: true,
                    message: "Deskripsi kunjungan wajib diisi",
                  },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Jelaskan proses kunjungan secara detail"
                />
              </Form.Item>

              <Form.Item
                name="result"
                label="Hasil Kunjungan"
                rules={[
                  {
                    required: true,
                    message: "Hasil kunjungan wajib diisi",
                  },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Tuliskan hasil dan kesimpulan kunjungan"
                />
              </Form.Item>

              <Form.Item
                name="documentation"
                label="Dokumentasi Kunjungan"
                valuePropName="fileList"
                getValueProps={(value) => {
                  if (value && typeof value === "string") {
                    return {
                      fileList: [
                        {
                          uid: "-1",
                          name: value,
                          status: "done",
                          url: `${apiUrl}/uploads/${value}`,
                        },
                      ],
                    };
                  }
                  return { fileList };
                }}
              >
                <Upload
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png"
                  onRemove={() => {
                    setFileList([]);
                    return true;
                  }}
                >
                  <Button icon={<UploadOutlined />}>
                    Upload Foto Dokumentasi
                  </Button>
                </Upload>
              </Form.Item>
              <div
                style={{
                  color: "#8c8c8c",
                  fontSize: "12px",
                  marginTop: "-20px",
                }}
              >
                Format: JPG, JPEG, PNG. Ukuran max: 2MB
              </div>
            </Card>
          </Form>
        </Edit>
      </>
    </CanAccess>
  );
};
