"use client";

import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useApiUrl, useCustom } from "@refinedev/core";
import { Show, DateField } from "@refinedev/antd";
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Typography,
  Divider,
  Spin,
  Row,
  Col,
  Statistic,
  Space,
  Avatar,
} from "antd";
import {
  WarningOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export const StudentViolationsShow = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params?.id;
  const month = searchParams?.get("month");
  const year = searchParams?.get("year");

  const apiUrl = useApiUrl();

  const { data, isLoading, isError } = useCustom({
    url: `${apiUrl}/violations/students/${studentId}/detail`,
    method: "get",
    config: {
      query: {
        month,
        year,
      },
    },
    queryOptions: {
      enabled: !!studentId && !!month && !!year,
    },
  });

  if (isLoading) {
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
        <Text>
          Failed to load student violation details. Please try again later.
        </Text>
      </Card>
    );
  }

  const studentData = data?.data?.student;
  const violations = data?.data?.violations || [];
  const totalViolations = violations.length;
  const totalPoints = data?.data?.totalPoints || 0;

  const getSeverityColor = (points: number) => {
    if (points >= 75) return "#f5222d"; // Red - Severe
    if (points >= 50) return "#fa8c16"; // Orange - High
    if (points >= 25) return "#faad14"; // Yellow - Medium
    return "#52c41a"; // Green - Low
  };

  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      kedisiplinan: "blue",
      akademik: "purple",
      kehadiran: "cyan",
      kebersihan: "green",
      komunikasi: "orange",
      sikap: "magenta",
      pakaian: "gold",
      default: "default",
    };

    return categoryColors[category?.toLowerCase()] || categoryColors.default;
  };

  // Format class info
  const classInfo = studentData?.class;
  const expertise = classInfo?.expertise;
  const prody = expertise?.prody;
  const faculty = prody?.faculty;
  const schoolYear = faculty?.schoolYear;

  const formattedClass = classInfo
    ? `${classInfo.romanLevel} ${expertise?.shortName} ${classInfo.alphabet}-${
        schoolYear?.year || ""
      }`
    : "N/A";

  return (
    <Show title="Student Violation Details" canEdit={false}>
      <Card>
        {/* Student Information Section - Redesigned like ViolationsShow */}
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
                      <Text strong>{studentData?.name || "N/A"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="NIS">
                      <IdcardOutlined /> {studentData?.nis || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="NISN">
                      {studentData?.nisn || "N/A"}
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
                    <Descriptions.Item label="Periode">{`bulan ${month} tahun ${year}`}</Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Points Summary Section */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card bordered={false} style={{ background: "#f0f2f5" }}>
              <Row gutter={[16, 16]} justify="space-between" align="middle">
                <Col xs={24} sm={16}>
                  <Title level={4}>Ringkasan Pelanggaran</Title>
                  <Text>
                    Total pelanggaran yang dibuat:{" "}
                    <Text strong type="danger">
                      {totalViolations}
                    </Text>{" "}
                    pelanggaran
                  </Text>
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Total Pelanggaran Points"
                    value={totalPoints}
                    valueStyle={{ color: getSeverityColor(totalPoints) }}
                    prefix={<WarningOutlined />}
                    suffix="points"
                  />
                  <div style={{ marginTop: 10 }}>
                    <Tag color={getSeverityColor(totalPoints)}>
                      {totalPoints >= 75
                        ? "Severe"
                        : totalPoints >= 50
                        ? "High"
                        : totalPoints >= 25
                        ? "Medium"
                        : "Low"}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Divider orientation="left">Rekord Pelanggaran</Divider>

        <Table
          dataSource={violations}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: (value: any) => (
              <>
                <p style={{ margin: 0 }}>
                  <Text strong>Action Taken: </Text>
                  {(value.regulation.actionTaken as any) ||
                    "No specific action recorded"}
                </p>
              </>
            ),
          }}
        >
          <Table.Column
            dataIndex="createdAt"
            title="Dibuat pada"
            width={120}
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
            sorter={(a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
            }
          />
          <Table.Column
            dataIndex="name"
            title="Nama Pelanggaran"
            render={(value, record: any) => (
              <Space direction="vertical" size={0}>
                <Text>{value}</Text>
                {record.regulationCategory && (
                  <Tag color={getCategoryColor(record.regulationCategory)}>
                    {record.regulationCategory}
                  </Tag>
                )}
              </Space>
            )}
          />
          <Table.Column
            dataIndex="description"
            title="Deskripsi"
            ellipsis={{ showTitle: true }}
          />
          <Table.Column
            dataIndex={["regulation", "point"]}
            title="Points"
            width={100}
            render={(value) => (
              <Tag color={value > 20 ? "red" : value > 10 ? "orange" : "green"}>
                {value} points
              </Tag>
            )}
            sorter={(a: any, b: any) => a.point - b.point}
          />
          <Table.Column
            dataIndex={["regulation"]}
            title="Peraturan yang Dilanggar"
            render={(value, record: any) => {
              const regulation = value;

              if (!regulation) return "Unknown regulation";

              return (
                <Space direction="vertical" size={0}>
                  <Text>{regulation.name}</Text>
                  {regulation.category && (
                    <Tag color={getCategoryColor(regulation.category)}>
                      {regulation.category} - {regulation.type}
                    </Tag>
                  )}
                </Space>
              );
            }}
          />
          <Table.Column
            dataIndex={["teacher", "name"]}
            title="Dicatat oleh"
            render={(value) => value || "N/A"}
          />
        </Table>
      </Card>
    </Show>
  );
};
