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
  Badge,
  Space,
} from "antd";
import {
  WarningOutlined,
  TrophyOutlined,
  BookOutlined,
  ClockCircleOutlined,
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
  console.log(studentData);
  const violations = data?.data?.violations || [];
  // Use the totalPoints from the backend if available
  const totalPoints = data?.data?.totalPoints || 0;

  const getSeverityColor = (points: number) => {
    if (points >= 75) return "#f5222d"; // Red - Severe
    if (points >= 50) return "#fa8c16"; // Orange - High
    if (points >= 25) return "#faad14"; // Yellow - Medium
    return "#52c41a"; // Green - Low
  };

  // Get color for regulation category
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

  return (
    <Show title="Student Violation Details" canEdit={false}>
      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Title level={4}>Nama : {studentData?.name}</Title>
            <Descriptions column={{ xs: 1, sm: 2 }} layout="vertical" bordered>
              <Descriptions.Item label="NIS">
                {studentData?.nis}
              </Descriptions.Item>
              <Descriptions.Item label="NISN">
                {studentData?.nisn}
              </Descriptions.Item>
              <Descriptions.Item label="Kelas">
                {/* {sp.student?.studentClass?.class.romanLevel +
                  " " +
                  sp.student?.studentClass?.class.expertise.shortName +
                  " " +
                  sp.student?.studentClass?.class.alphabet +
                  "-" +
                  sp.student?.studentClass?.class.expertise.prody.faculty
                    .schoolYear.year || "N/A"} */}

                {studentData?.class?.romanLevel +
                  " " +
                  studentData?.class?.expertise?.shortName +
                  " " +
                  studentData?.class?.alphabet +
                  "-" +
                  studentData?.class?.expertise?.prody?.faculty?.schoolYear
                    ?.year || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Periode">{`bulan ${month} tahun ${year}`}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ background: "#f0f2f5" }}>
              <Statistic
                title="Total Pelanggaran Points"
                value={totalPoints} // Will display cleanly without extra zeros
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
            </Card>
          </Col>
        </Row>

        <Divider orientation="left">Violation Records</Divider>

        <Table
          dataSource={violations}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: (value: any, record) => (
              <p style={{ margin: 0 }}>
                <Text strong>Action Taken: </Text>
                {(value as any).actionTaken || "No specific action recorded"}
              </p>
            ),
          }}
        >
          <Table.Column
            dataIndex="createdAt"
            title="Dibuat pada"
            width={120}
            render={(value) => <DateField value={value} format="YYYY-MM-DD" />}
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
            title="Reported by"
            render={(value) => value || "N/A"}
          />
        </Table>
      </Card>
    </Show>
  );
};
