"use client";
// pages/dashboard/index.tsx
import React, { useState, useEffect } from "react";
import { useApiUrl, useCustom, useSelect } from "@refinedev/core";
import {
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tabs,
  DatePicker,
  Select,
  Space,
  Spin,
  Alert,
  Empty,
  List,
  Avatar,
  Tag,
  Button,
} from "antd";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  AlertOutlined,
  TrophyOutlined,
  BookOutlined,
  HomeOutlined,
  FileTextOutlined,
  TeamOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

export const Dashboard = () => {
  const apiUrl = useApiUrl();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [filters, setFilters] = useState({
    class_id: undefined,
    year: undefined,
    semester: undefined,
  });

  // Get school years for filter
  const { options: schoolYearOptions } = useSelect({
    resource: "school-years",
    optionLabel: "year",
    optionValue: "year",
  });

  // Get classes for filter, dependent on selected school year
  const { options: classOptions } = useSelect({
    resource: "classes",
    optionLabel: "classname",
    optionValue: "id",
    // filters: [
    //   {
    //     field: "school_year_id",
    //     operator: "eq",
    //     value: filters.year,
    //   },
    // ],
    // queryOptions: {
    //   enabled: !!filters.year,
    // },
  });

  // Fetch dashboard overview data
  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    refetch: refetchDashboard,
  } = useCustom({
    url: `${apiUrl}/dashboard`,
    method: "get",
    queryOptions: {
      refetchOnWindowFocus: false,
    },
    config: {
      query: filters,
    },
  });

  // Fetch module data based on active tab
  const {
    data: moduleData,
    isLoading: isLoadingModule,
    refetch: refetchModule,
  } = useCustom({
    url: `${apiUrl}/dashboard/module`,
    method: "get",
    queryOptions: {
      enabled: activeTab !== "overview" && activeTab !== "class",
      refetchOnWindowFocus: false,
    },
    config: {
      query: {
        ...filters,
        module:
          activeTab !== "overview" && activeTab !== "class"
            ? activeTab
            : undefined,
      },
    },
  });

  // Fetch class stats when on class tab
  const {
    data: classData,
    isLoading: isLoadingClass,
    refetch: refetchClass,
  } = useCustom({
    url: `${apiUrl}/dashboard/class`,
    method: "get",
    queryOptions: {
      enabled: activeTab === "class" && !!filters.class_id,
      refetchOnWindowFocus: false,
    },
    config: {
      query: filters,
    },
  });

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      class_id: undefined,
      year: undefined,
      semester: undefined,
    });
  };

  // Refetch data when filters change
  useEffect(() => {
    refetchDashboard();

    if (activeTab !== "overview" && activeTab !== "class") {
      refetchModule();
    } else if (activeTab === "class" && filters.class_id) {
      refetchClass();
    }
  }, [filters]);

  // Colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#A28CFF",
    "#FF6B6B",
  ];

  // Function to format date
  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Dashboard Overview Content
  const renderOverviewContent = () => {
    if (isLoadingDashboard) {
      return <Spin size="large" />;
    }

    if (!dashboardData?.data) {
      return <Empty description="Tidak ada data tersedia" />;
    }

    const { data, chart, meta } = dashboardData.data;

    // Filter information display
    const filterInfo = (
      <Alert
        type="info"
        showIcon
        message="Informasi Filter"
        description={
          <div>
            <p>
              <strong>Rentang Tanggal:</strong>{" "}
              {formatDate(meta?.filters?.date_range?.start_date)} -{" "}
              {formatDate(meta?.filters?.date_range?.end_date)}
            </p>
            {meta?.filters?.class_id && chart?.class_info && (
              <p>
                <strong>Kelas:</strong> {chart.class_info.name}
              </p>
            )}
          </div>
        }
        style={{ marginBottom: 24 }}
      />
    );

    return (
      <div>
        {filterInfo}

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Statistic
                title="Pelanggaran"
                value={data.violation.total}
                valueStyle={{ color: "#ff4d4f" }}
                prefix={<AlertOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Statistic
                title="Penghargaan"
                value={data.award.total}
                valueStyle={{ color: "#52c41a" }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Statistic
                title="Konseling"
                value={data.counseling.total}
                valueStyle={{ color: "#1890ff" }}
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Statistic
                title="Kunjungan Rumah"
                value={data.home_visit.total}
                valueStyle={{ color: "#722ed1" }}
                prefix={<HomeOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Statistic
                title="Peraturan"
                value={data.regulation.total}
                valueStyle={{ color: "#faad14" }}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          {chart?.class_info && (
            <Col xs={24} sm={12} md={8} lg={8} xl={4}>
              <Card>
                <Statistic
                  title="Siswa"
                  value={chart.class_info.total_students}
                  valueStyle={{ color: "#13c2c2" }}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
          )}
        </Row>
        {/* Student Chart - Only show if class is selected */}
        {chart?.students && chart.students.length > 0 && (
          <Card
            title="Analisis Siswa"
            style={{ marginTop: 10, marginBottom: 10 }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chart.students}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="student_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="violation_points"
                  name="Poin Pelanggaran"
                  fill="#ff4d4f"
                />
                <Bar
                  dataKey="award_points"
                  name="Poin Penghargaan"
                  fill="#52c41a"
                />
                <Bar dataKey="net_points" name="Poin Bersih" fill="#faad14" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Recent Violations and Awards */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Card title="Pelanggaran Terbaru" style={{ marginBottom: 16 }}>
              <List
                itemLayout="horizontal"
                dataSource={data.violation.recent}
                locale={{ emptyText: "Tidak ada pelanggaran terbaru" }}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar style={{ backgroundColor: "#ff4d4f" }}>
                          {item.student_name[0]}
                        </Avatar>
                      }
                      title={item.student_name}
                      description={
                        <>
                          <div>{item.regulation_name}</div>
                          <div>
                            <Tag color="red">{item.points} poin</Tag>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {formatDate(item.date)}
                            </Text>
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Penghargaan Terbaru" style={{ marginBottom: 16 }}>
              <List
                itemLayout="horizontal"
                dataSource={data.award.recent}
                locale={{ emptyText: "Tidak ada penghargaan terbaru" }}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar style={{ backgroundColor: "#52c41a" }}>
                          {item.student_name[0]}
                        </Avatar>
                      }
                      title={item.student_name}
                      description={
                        <>
                          <div>{item.regulation_name}</div>
                          <div>
                            <Tag color="green">{item.points} poin</Tag>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {formatDate(item.date)}
                            </Text>
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // Class Stats Content
  const renderClassContent = () => {
    if (!filters.class_id) {
      return (
        <Alert
          message="Silakan pilih kelas untuk melihat statistik"
          type="info"
          showIcon
        />
      );
    }

    if (isLoadingClass) {
      return <Spin size="large" />;
    }

    if (!classData?.data) {
      return <Empty description="Tidak ada data kelas tersedia" />;
    }

    const { class: classInfo, students, date_range } = classData.data;

    const columns = [
      {
        title: "Siswa",
        dataIndex: "student_name",
        key: "student_name",
      },
      {
        title: "NIS",
        dataIndex: "nis",
        key: "nis",
      },
      {
        title: "NISN",
        dataIndex: "nisn",
        key: "nisn",
      },
      {
        title: "Pelanggaran",
        dataIndex: "violations_count",
        key: "violations_count",
        sorter: (a: any, b: any) => a.violations_count - b.violations_count,
      },
      {
        title: "Penghargaan",
        dataIndex: "awards_count",
        key: "awards_count",
        sorter: (a: any, b: any) => a.awards_count - b.awards_count,
      },
      {
        title: "Konseling",
        dataIndex: "counselings_count",
        key: "counselings_count",
        sorter: (a: any, b: any) => a.counselings_count - b.counselings_count,
      },
      {
        title: "Kunjungan Rumah",
        dataIndex: "home_visits_count",
        key: "home_visits_count",
        sorter: (a: any, b: any) => a.home_visits_count - b.home_visits_count,
      },
      {
        title: "Poin Pelanggaran",
        dataIndex: "violation_points",
        key: "violation_points",
        sorter: (a: any, b: any) => a.violation_points - b.violation_points,
        render: (
          points:
            | string
            | number
            | bigint
            | boolean
            | React.ReactElement<any, string | React.JSXElementConstructor<any>>
            | Iterable<React.ReactNode>
            | React.ReactPortal
            | Promise<React.AwaitedReactNode>
            | null
            | undefined
        ) => <Tag color="red">{points}</Tag>,
      },
      {
        title: "Poin Penghargaan",
        dataIndex: "award_points",
        key: "award_points",
        sorter: (a: any, b: any) => a.award_points - b.award_points,
        render: (
          points:
            | string
            | number
            | bigint
            | boolean
            | React.ReactElement<any, string | React.JSXElementConstructor<any>>
            | Iterable<React.ReactNode>
            | React.ReactPortal
            | Promise<React.AwaitedReactNode>
            | null
            | undefined
        ) => <Tag color="green">{points}</Tag>,
      },
      {
        title: "Poin Bersih",
        dataIndex: "net_points",
        key: "net_points",
        sorter: (a: any, b: any) => a.net_points - b.net_points,
        defaultSortOrder: "descend" as const,
        render: (
          points:
            | string
            | number
            | bigint
            | boolean
            | React.ReactElement<any, string | React.JSXElementConstructor<any>>
            | Iterable<React.ReactNode>
            | React.ReactPortal
            | Promise<React.AwaitedReactNode>
            | null
            | undefined
        ) => <Tag color="orange">{points}</Tag>,
      },
    ];

    return (
      <div>
        <Card
          title={`Kelas: ${classInfo.name} (${classInfo.total_students} siswa)`}
          style={{ marginBottom: 16 }}
        >
          <p>
            <strong>Periode:</strong> {formatDate(date_range.start_date)} -{" "}
            {formatDate(date_range.end_date)}
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={students}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="student_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="violation_points"
                name="Poin Pelanggaran"
                fill="#ff4d4f"
              />
              <Bar
                dataKey="award_points"
                name="Poin Penghargaan"
                fill="#52c41a"
              />
              <Bar dataKey="net_points" name="Poin Bersih" fill="#faad14" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Table
          dataSource={students}
          columns={columns}
          rowKey="student_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      </div>
    );
  };

  // Module Content (Violations, Awards, Counseling, etc.)
  const renderModuleContent = () => {
    if (isLoadingModule) {
      return <Spin size="large" />;
    }

    if (!moduleData?.data?.data) {
      return <Empty description="Tidak ada data modul tersedia" />;
    }

    const { data, meta } = moduleData.data;
    const moduleName = meta.filters.module;

    // Common module header with charts
    const renderModuleHeader = () => {
      if (moduleName === "violation") {
        return (
          <Card title="Statistik Pelanggaran" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Total Pelanggaran"
                  value={data.total_violations}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Total Poin"
                  value={data.total_points}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Col>
            </Row>

            <Title level={5} style={{ marginTop: 16 }}>
              Pelanggaran berdasarkan Kategori
            </Title>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.by_category}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {data.by_category.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} pelanggaran`,
                        props.payload.name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
              <Col xs={24} md={12}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={data.by_category}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="points" name="Poin" fill="#ff4d4f" />
                  </BarChart>
                </ResponsiveContainer>
              </Col>
            </Row>
          </Card>
        );
      } else if (moduleName === "award") {
        return (
          <Card title="Statistik Penghargaan" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Total Penghargaan"
                  value={data.total_awards}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Total Poin"
                  value={data.total_points}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
            </Row>

            <Title level={5} style={{ marginTop: 16 }}>
              Penghargaan berdasarkan Kategori
            </Title>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.by_category}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {data.by_category.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} penghargaan`,
                        props.payload.name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
              <Col xs={24} md={12}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={data.by_category}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="points" name="Poin" fill="#52c41a" />
                  </BarChart>
                </ResponsiveContainer>
              </Col>
            </Row>
          </Card>
        );
      } else if (moduleName === "counseling") {
        return (
          <Card title="Statistik Konseling" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Total Sesi Konseling"
                  value={data.total_counselings}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col xs={24} md={12}>
                <Title level={5}>Berdasarkan Bidang Layanan</Title>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.by_service_field}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {data.by_service_field.map(
                        (entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
              <Col xs={24} md={12}>
                <Title level={5}>Berdasarkan Jenis Layanan</Title>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.by_service_type}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {data.by_service_type.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
            </Row>
          </Card>
        );
      } else if (moduleName === "home_visit") {
        return (
          <Card title="Statistik Kunjungan Rumah" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Total Kunjungan Rumah"
                  value={data.total_home_visits}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Col>
            </Row>

            <Title level={5} style={{ marginTop: 16 }}>
              Berdasarkan Status
            </Title>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.by_status}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data.by_status.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        );
      } else if (moduleName === "regulation") {
        return (
          <Card title="Statistik Peraturan" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Total Peraturan"
                  value={data.total_regulations}
                  valueStyle={{ color: "#faad14" }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Pelanggaran"
                  value={data.violations_count}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Penghargaan"
                  value={data.awards_count}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
            </Row>

            <Title level={5} style={{ marginTop: 16 }}>
              Berdasarkan Kategori
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.by_category}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="violations" name="Pelanggaran" fill="#ff4d4f" />
                <Bar dataKey="awards" name="Penghargaan" fill="#52c41a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        );
      }
    };

    // Module-specific data table
    const renderModuleTable = () => {
      if (moduleName === "violation") {
        const columns = [
          {
            title: "Siswa",
            dataIndex: "student_name",
            key: "student_name",
          },
          {
            title: "Kelas",
            dataIndex: "class_name",
            key: "class_name",
          },
          {
            title: "Pelanggaran",
            dataIndex: "regulation_name",
            key: "regulation_name",
          },
          {
            title: "Kategori",
            dataIndex: "category",
            key: "category",
            filters: (
              Array.from(
                new Set(
                  data.violations.map((v: { category: string }) => v.category)
                )
              ) as string[]
            ).map((cat: string) => ({
              text: cat,
              value: cat,
            })),
            onFilter: (value: any, record: { category: string }) =>
              record.category === value,
          },
          {
            title: "Poin",
            dataIndex: "points",
            key: "points",
            render: (
              points:
                | string
                | number
                | bigint
                | boolean
                | React.ReactElement<
                    any,
                    string | React.JSXElementConstructor<any>
                  >
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | Promise<React.AwaitedReactNode>
                | null
                | undefined
            ) => <Tag color="red">{points}</Tag>,
            sorter: (a: { points: number }, b: { points: number }) =>
              a.points - b.points,
          },
          {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
          },
          {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (date: any) => formatDate(date),
            sorter: (
              a: { date: string | number | Date },
              b: { date: string | number | Date }
            ) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            defaultSortOrder: "descend" as const,
          },
        ];

        return (
          <Table<any>
            dataSource={data.violations}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
          />
        );
      } else if (moduleName === "award") {
        const columns = [
          {
            title: "Student",
            dataIndex: "student_name",
            key: "student_name",
          },
          {
            title: "Class",
            dataIndex: "class_name",
            key: "class_name",
          },
          {
            title: "Award",
            dataIndex: "regulation_name",
            key: "regulation_name",
          },
          {
            title: "Category",
            dataIndex: "category",
            key: "category",
            filters: Array.from(
              new Set(data.awards.map((a: { category: any }) => a.category))
            ).map((cat: any) => ({
              text: String(cat),
              value: String(cat),
            })),
            onFilter: (value: any, record: { category: any }) =>
              record.category === value,
          },
          {
            title: "Points",
            dataIndex: "points",
            key: "points",
            render: (
              points:
                | string
                | number
                | bigint
                | boolean
                | React.ReactElement<
                    any,
                    string | React.JSXElementConstructor<any>
                  >
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | Promise<React.AwaitedReactNode>
                | null
                | undefined
            ) => <Tag color="green">{points}</Tag>,
            sorter: (a: { points: number }, b: { points: number }) =>
              a.points - b.points,
          },
          {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
          },
          {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (date: any) => formatDate(date),
            sorter: (
              a: { date: string | number | Date },
              b: { date: string | number | Date }
            ) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            defaultSortOrder: "descend" as const,
          },
        ];

        return (
          <Table<any>
            dataSource={data.awards}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
          />
        );
      } else if (moduleName === "counseling") {
        const columns = [
          {
            title: "Student",
            dataIndex: "student_name",
            key: "student_name",
          },
          {
            title: "Class",
            dataIndex: "class_name",
            key: "class_name",
          },
          {
            title: "Service Field",
            dataIndex: "service_field",
            key: "service_field",
            filters: Array.from(
              new Set(
                data.counselings.map(
                  (c: { service_field: any }) => c.service_field
                )
              )
            ).map((field: any) => ({
              text: String(field),
              value: String(field),
            })),
            onFilter: (value: any, record: { service_field: any }) =>
              record.service_field === value,
          },
          {
            title: "Service Type",
            dataIndex: "service_type",
            key: "service_type",
            filters: Array.from(
              new Set(
                data.counselings.map(
                  (c: { service_type: any }) => c.service_type
                )
              )
            ).map((type: any) => ({
              text: String(type),
              value: String(type),
            })),
            onFilter: (value: any, record: { service_type: any }) =>
              record.service_type === value,
          },
          {
            title: "Case",
            dataIndex: "case",
            key: "case",
            // Continuing from where the code was cut off (case columns)
            ellipsis: true,
          },
          {
            title: "Summary",
            dataIndex: "summary",
            key: "summary",
            ellipsis: true,
          },
          {
            title: "Follow-up",
            dataIndex: "follow_up",
            key: "follow_up",
            ellipsis: true,
          },
          {
            title: "Created By",
            dataIndex: "created_by",
            key: "created_by",
          },
          {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (date: string | number | Date) => formatDate(date),
            sorter: (
              a: { date: string | number | Date },
              b: { date: string | number | Date }
            ) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            defaultSortOrder: "descend" as const,
          },
        ];

        return (
          <Table<any>
            dataSource={data.counselings}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
          />
        );
      } else if (moduleName === "home_visit") {
        const columns = [
          {
            title: "Student",
            dataIndex: "student_name",
            key: "student_name",
          },
          {
            title: "Class",
            dataIndex: "class_name",
            key: "class_name",
          },
          {
            title: "Address",
            dataIndex: "address",
            key: "address",
            ellipsis: true,
          },
          {
            title: "Involved Persons",
            dataIndex: "involved_persons",
            key: "involved_persons",
          },
          {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
          },
          {
            title: "Result",
            dataIndex: "result",
            key: "result",
            ellipsis: true,
          },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (
              status:
                | string
                | number
                | bigint
                | boolean
                | React.ReactElement<
                    any,
                    string | React.JSXElementConstructor<any>
                  >
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | Promise<React.AwaitedReactNode>
                | null
                | undefined
            ) => {
              let color = "default";
              switch (status) {
                case "completed":
                  color = "green";
                  break;
                case "scheduled":
                  color = "blue";
                  break;
                case "cancelled":
                  color = "red";
                  break;
                default:
                  color = "default";
              }
              return <Tag color={color}>{status}</Tag>;
            },
            filters: Array.from(
              new Set(data.home_visits.map((h: { status: any }) => h.status))
            ).map((status) => ({
              text: String(status),
              value: status,
            })),
            onFilter: (value: any, record: { status: any }) =>
              record.status === value,
          },
          {
            title: "Created By",
            dataIndex: "created_by",
            key: "created_by",
          },
          {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (date: string | number | Date) => formatDate(date),
            sorter: (
              a: { date: string | number | Date },
              b: { date: string | number | Date }
            ) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            defaultSortOrder: "descend" as const,
          },
        ];

        return (
          <Table<any>
            dataSource={data.home_visits}
            columns={columns as any}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
          />
        );
      } else if (moduleName === "regulation") {
        const columns = [
          {
            title: "Name",
            dataIndex: "name",
            key: "name",
          },
          {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (
              type:
                | string
                | number
                | bigint
                | boolean
                | React.ReactElement<
                    any,
                    string | React.JSXElementConstructor<any>
                  >
                | Iterable<React.ReactNode>
                | Promise<React.AwaitedReactNode>
                | null
                | undefined
            ) => {
              return (
                <Tag color={type === "Pelanggaran" ? "red" : "green"}>
                  {type}
                </Tag>
              );
            },
            filters: [
              { text: "Pelanggaran", value: "Pelanggaran" },
              { text: "Penghargaan", value: "Penghargaan" },
            ],
            onFilter: (value: any, record: { type: any }) =>
              record.type === value,
          },
          {
            title: "Category",
            dataIndex: "category",
            key: "category",
            filters: Array.from(
              new Set(
                data.regulations.map((r: { category: any }) => r.category)
              )
            ).map((cat: any) => ({
              text: String(cat),
              value: String(cat),
            })),
            onFilter: (value: any, record: { category: any }) =>
              record.category === value,
          },
          {
            title: "Points",
            dataIndex: "point",
            key: "point",
            render: (
              point:
                | string
                | number
                | bigint
                | boolean
                | React.ReactElement<
                    any,
                    string | React.JSXElementConstructor<any>
                  >
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | Promise<React.AwaitedReactNode>
                | null
                | undefined,
              record: { type: string }
            ) => (
              <Tag color={record.type === "Pelanggaran" ? "red" : "green"}>
                {point}
              </Tag>
            ),
            sorter: (a: { point: number }, b: { point: number }) =>
              a.point - b.point,
          },
          {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
          },
          {
            title: "Action Taken",
            dataIndex: "action_taken",
            key: "action_taken",
            ellipsis: true,
          },
          {
            title: "Status",
            dataIndex: "is_active",
            key: "is_active",
            render: (isActive: any) => (
              <Tag color={isActive ? "green" : "red"}>
                {isActive ? "Active" : "Inactive"}
              </Tag>
            ),
            filters: [
              { text: "Active", value: true },
              { text: "Inactive", value: false },
            ],
            onFilter: (value: any, record: { is_active: any }) =>
              record.is_active === value,
          },
        ];

        return (
          <Table
            dataSource={data.regulations}
            columns={columns as any}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
          />
        );
      }
    };

    return (
      <div>
        {renderModuleHeader()}
        {renderModuleTable()}
      </div>
    );
  };

  // Render filter section
  const renderFilters = () => {
    return (
      <Card style={{ marginBottom: 16 }}>
        <Space
          direction="horizontal"
          size="middle"
          wrap
          style={{ marginBottom: 16 }}
        >
          <div>
            <Text strong>School Year:</Text>
            <div>
              <Select
                placeholder="Select School Year"
                style={{ width: 200 }}
                value={filters.year}
                onChange={(value) => handleFilterChange("year", value)}
                allowClear
              >
                {schoolYearOptions?.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label} - {Number(option.label) + 1}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Text strong>Class:</Text>
            <div>
              <Select
                placeholder="Select Class"
                style={{ width: 240 }}
                value={filters.class_id}
                onChange={(value) => handleFilterChange("class_id", value)}
                disabled={!filters.year}
                allowClear
              >
                {classOptions?.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Text strong>Semester:</Text>
            <div>
              <Select
                placeholder="Select Semester"
                style={{ width: 150 }}
                value={filters.semester}
                onChange={(value) => handleFilterChange("semester", value)}
                allowClear
              >
                <Select.Option value="1">Semester 1</Select.Option>
                <Select.Option value="2">Semester 2</Select.Option>
              </Select>
            </div>
          </div>
          <div>
            <Button type="default" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </Space>
      </Card>
    );
  };

  return (
    <div>
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <Title level={2}>Sistem Informasi Pencatatan BK</Title>
        </Col>

        <Col span={24}>{renderFilters()}</Col>

        <Col span={24}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabPosition="top"
            type="card"
          >
            <TabPane
              tab={
                <span>
                  <TeamOutlined /> Overview
                </span>
              }
              key="overview"
            >
              {renderOverviewContent()}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <TeamOutlined /> Class Analytics
                </span>
              }
              key="class"
            >
              {renderClassContent()}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <AlertOutlined /> Violations
                </span>
              }
              key="violation"
            >
              {renderModuleContent()}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <TrophyOutlined /> Awards
                </span>
              }
              key="award"
            >
              {renderModuleContent()}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <BookOutlined /> Counseling
                </span>
              }
              key="counseling"
            >
              {renderModuleContent()}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <HomeOutlined /> Home Visits
                </span>
              }
              key="home_visit"
            >
              {renderModuleContent()}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <FileTextOutlined /> Regulations
                </span>
              }
              key="regulation"
            >
              {renderModuleContent()}
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};
