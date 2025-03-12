"use client";

import React from "react";
import { useShow, useOne } from "@refinedev/core";
import { Show, DateField } from "@refinedev/antd";
import {
  Card,
  Descriptions,
  Typography,
  Divider,
  Spin,
  Row,
  Col,
  Tag,
  Space,
  Avatar,
} from "antd";
import {
  WarningOutlined,
  BookOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export const ViolationsShow = () => {
  const { queryResult } = useShow();
  const { data, isLoading, isError } = queryResult;

  const record = data?.data;

  const { data: regulationData, isLoading: regulationIsLoading } = useOne({
    resource: "regulations",
    id: record?.regulationId || "",
    queryOptions: {
      enabled: !!record,
    },
  });

  if (isLoading || regulationIsLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "50px" }}
      >
        <Spin size="large" />
      </div>
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

  const regulation = regulationData?.data;
  const studentClass = record?.studentClass;
  const student = studentClass?.user?.student;
  const classInfo = studentClass?.class;
  const expertise = classInfo?.expertise;
  const prody = expertise?.prody;
  const faculty = prody?.faculty;
  const schoolYear = faculty?.schoolYear;

  // Format class info
  const formattedClass = classInfo
    ? `${classInfo.romanLevel} ${expertise?.shortName} ${classInfo.alphabet}-${
        schoolYear?.year || ""
      }`
    : "N/A";

  // Get color for regulation category
  const getCategoryColor = (category: string) => {
    const categoryColors = {
      kedisiplinan: "blue",
      akademik: "purple",
      kehadiran: "cyan",
      kebersihan: "green",
      komunikasi: "orange",
      sikap: "magenta",
      pakaian: "gold",
      default: "default",
    };

    const key = category?.toLowerCase() as keyof typeof categoryColors;
    return categoryColors[key] || categoryColors.default;
  };

  // Get color based on points
  const getPointColor = (points: any) => {
    if (points > 20) return "red";
    if (points > 10) return "orange";
    return "green";
  };

  return (
    <Show title="Detail Pelanggaran" canEdit={true}>
      <Card>
        {/* Student Information Section */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card bordered={false} style={{ background: "#f9f9f9" }}>
              <Row gutter={16} align="middle">
                <Col xs={24} sm={4} md={3} lg={2}>
                  <Avatar
                    size={64}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#1890ff" }}
                  />
                </Col>
                <Col xs={24} sm={20} md={21} lg={22}>
                  <Title level={4} style={{ marginBottom: 8 }}>
                    <TeamOutlined /> Siswa yang Melanggar
                  </Title>
                  <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
                    <Descriptions.Item label="Nama">
                      <Text strong>{student?.name || "N/A"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="NIS">
                      <IdcardOutlined /> {student?.nis || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="NISN">
                      {student?.nisn || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Kelas">
                      <Tag color="blue">{formattedClass}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Jurusan">
                      {expertise?.name || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Program Studi">
                      {prody?.name || "N/A"}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Divider orientation="left">Detail Pelanggaran</Divider>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Title level={4}>{record?.name}</Title>
            <Descriptions column={{ xs: 1, sm: 2 }} layout="vertical" bordered>
              <Descriptions.Item label="ID Pelanggaran">
                {record?.id}
              </Descriptions.Item>
              <Descriptions.Item label="Dibuat Pada">
                <Space>
                  <ClockCircleOutlined style={{ color: "#8c8c8c" }} />
                  <DateField value={record?.createdAt} format="DD MMMM YYYY" />
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Peraturan yang Dilanggar" span={2}>
                <Space direction="vertical" size={4}>
                  <Text strong>{regulation?.name}</Text>
                  {regulation?.category && (
                    <Tag color={getCategoryColor(regulation?.category)}>
                      {regulation?.category} - {regulation?.type}
                    </Tag>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Guru Pencatat">
                <Space>
                  <UserOutlined />
                  <Text>{record?.teacher?.name || "N/A"}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Points">
                <Tag color={getPointColor(regulation?.point)}>
                  {regulation?.point} points
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ background: "#f0f2f5" }}>
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div>
                  <Title level={5}>
                    <BookOutlined /> Deskripsi Pelanggaran
                  </Title>
                  <Text>{record?.description}</Text>
                </div>
                <div>
                  <Title level={5}>
                    <WarningOutlined /> Tindakan yang Diambil
                  </Title>
                  <Text>
                    {regulation?.actionTaken ||
                      "Tidak ada tindakan khusus yang dicatat"}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Divider orientation="left">Detail Tambahan</Divider>

        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
          {regulation?.description && (
            <Descriptions.Item label="Deskripsi Peraturan" span={2}>
              {regulation?.description}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Status Peraturan">
            {regulation?.isActive ? (
              <Tag color="green">Aktif</Tag>
            ) : (
              <Tag color="red">Tidak Aktif</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Terakhir Diperbarui">
            <DateField value={record?.updatedAt} format="DD MMMM YYYY HH:mm" />
          </Descriptions.Item>
          <Descriptions.Item label="NIP Guru">
            {record?.teacher?.nip || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Status Guru">
            {record?.teacher?.employeeStatus || "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Show>
  );
};
