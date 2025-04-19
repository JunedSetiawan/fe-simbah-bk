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
  Alert,
  Tabs,
  Empty,
} from "antd";
import {
  WarningOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  IdcardOutlined,
  CalendarOutlined,
  TrophyOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export const StudentViolationsShow = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params?.id;
  const month = searchParams?.get("month");
  const year = searchParams?.get("year");
  const semester = searchParams?.get("semester");

  const apiUrl = useApiUrl();

  const { data, isLoading, isError } = useCustom({
    url: `${apiUrl}/violations/students/${studentId}/detail`,
    method: "get",
    config: {
      query: {
        month,
        year,
        semester,
      },
    },
    queryOptions: {
      enabled: !!studentId && (!!month || !!semester) && !!year,
    },
  });

  const studentData = data?.data?.student;
  const violations = data?.data?.violations || [];
  const awards = data?.data?.awards || [];
  const totalViolations = violations.length;
  const totalAwards = awards.length;
  const totalViolationPoints = data?.data?.totalViolationPoints || 0;
  const totalAwardPoints = data?.data?.totalAwardPoints || 0;
  const netPoints = data?.data?.netPoints || 0;
  const period = data?.data?.period;
  const isSemesterView = !!period?.semester;

  // Format period display - moved outside of conditional rendering
  const periodDisplay = React.useMemo(() => {
    if (!period) return "Periode tidak diketahui";

    if (period.semester) {
      const semesterText = period.semester === "1" ? "Ganjil" : "Genap";
      return `Semester ${semesterText} tahun ${period.year}`;
    } else if (period.month) {
      const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
      const monthIndex = parseInt(period.month) - 1;
      const monthName =
        monthIndex >= 0 && monthIndex < 12
          ? monthNames[monthIndex]
          : period.month;
      return `Bulan ${monthName} tahun ${period.year}`;
    }
    return "Periode tidak diketahui";
  }, [period]);

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
      prestasi: "lime",
      kegiatan: "geekblue",
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

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "50px",
        }}
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

  return (
    <Show title="Detail Pelanggaran Siswa" canEdit={false}>
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
                    <TeamOutlined /> Siswa
                  </Title>
                  <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
                    <Descriptions.Item label="Nama">
                      <Text strong>{studentData?.name || "N/A"}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="NIS">
                      <IdcardOutlined style={{ marginRight: "5px" }} />{" "}
                      {studentData?.nis || "N/A"}
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
                    <Descriptions.Item label="Periode">
                      <CalendarOutlined style={{ marginRight: "5px" }} />{" "}
                      {periodDisplay}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Points Summary Section */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card bordered={false} style={{ background: "#f0f2f5" }}>
              <Row gutter={[16, 16]} justify="space-between">
                {isSemesterView ? (
                  // Semester View with awards and net points
                  <>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title="Poin Pelanggaran"
                        value={totalViolationPoints}
                        valueStyle={{ color: "#f5222d" }}
                        prefix={<MinusCircleOutlined />}
                        suffix="poin"
                      />
                      <Text type="secondary">
                        Total {totalViolations} pelanggaran
                      </Text>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title="Poin Penghargaan"
                        value={totalAwardPoints}
                        valueStyle={{ color: "#52c41a" }}
                        prefix={<PlusCircleOutlined />}
                        suffix="poin"
                      />
                      <Text type="secondary">
                        Total {totalAwards} penghargaan
                      </Text>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title="Poin Bersih"
                        value={netPoints}
                        valueStyle={{
                          color: netPoints >= 0 ? "#52c41a" : "#f5222d",
                        }}
                        prefix={
                          netPoints >= 0 ? (
                            <PlusCircleOutlined />
                          ) : (
                            <MinusCircleOutlined />
                          )
                        }
                        suffix="poin"
                      />
                      <div style={{ marginTop: 8 }}>
                        <Tag color={netPoints >= 0 ? "green" : "red"}>
                          {netPoints >= 0 ? "Positif" : "Negatif"}
                        </Tag>
                      </div>
                    </Col>
                  </>
                ) : (
                  // Month View with only violation stats
                  <>
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
                        value={totalViolationPoints}
                        valueStyle={{
                          color: getSeverityColor(totalViolationPoints),
                        }}
                        prefix={<WarningOutlined />}
                        suffix="points"
                      />
                      <div style={{ marginTop: 10 }}>
                        <Tag color={getSeverityColor(totalViolationPoints)}>
                          {totalViolationPoints >= 75
                            ? "Severe"
                            : totalViolationPoints >= 50
                            ? "High"
                            : totalViolationPoints >= 25
                            ? "Medium"
                            : "Low"}
                        </Tag>
                      </div>
                    </Col>
                  </>
                )}
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Table Section - Use tabs for semester view */}
        {isSemesterView ? (
          <Tabs defaultActiveKey="violations" type="card">
            <TabPane
              tab={
                <span>
                  <WarningOutlined /> Pelanggaran ({totalViolations})
                </span>
              }
              key="violations"
            >
              {violations.length > 0 ? (
                <ViolationTable
                  violations={violations}
                  getCategoryColor={getCategoryColor}
                />
              ) : (
                <Empty description="Tidak ada data pelanggaran untuk periode ini" />
              )}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <TrophyOutlined /> Penghargaan ({totalAwards})
                </span>
              }
              key="awards"
            >
              {awards.length > 0 ? (
                <AwardTable
                  awards={awards}
                  getCategoryColor={getCategoryColor}
                />
              ) : (
                <Empty description="Tidak ada data penghargaan untuk periode ini" />
              )}
            </TabPane>
          </Tabs>
        ) : (
          <>
            <Divider orientation="left">Rekord Pelanggaran</Divider>
            <ViolationTable
              violations={violations}
              getCategoryColor={getCategoryColor}
            />
          </>
        )}
      </Card>
    </Show>
  );
};

// Table component for violations
const ViolationTable = ({ violations, getCategoryColor }: any) => {
  return (
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
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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
        sorter={(a: any, b: any) => a.regulation.point - b.regulation.point}
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
  );
};

// Table component for awards
const AwardTable = ({ awards, getCategoryColor }: any) => {
  return (
    <Table dataSource={awards} rowKey="id" pagination={{ pageSize: 10 }}>
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
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        }
      />
      <Table.Column
        dataIndex="name"
        title="Nama Penghargaan"
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
        render={(value) => <Tag color="#52c41a">{value} points</Tag>}
        sorter={(a: any, b: any) => a.regulation.point - b.regulation.point}
      />
      <Table.Column
        dataIndex={["regulation"]}
        title="Jenis Penghargaan"
        render={(value, record: any) => {
          const regulation = value;

          if (!regulation) return "Unknown award type";

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
        dataIndex={["proposedBy"]}
        title="Dicatat oleh"
        render={(value) => value || "N/A"}
      />
    </Table>
  );
};
