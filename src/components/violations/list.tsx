"use client";

import React, { useState } from "react";
import {
  BaseRecord,
  useMany,
  useCustom,
  useApiUrl,
  useSelect,
  useNavigation,
  useGetToPath,
  useGo,
} from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
} from "@refinedev/antd";
import {
  Table,
  Space,
  Form,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Typography,
  Tabs,
  Tag,
  Spin,
  Card,
  Badge,
} from "antd";
import dayjs from "dayjs";
import { ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

export const ViolationsList = () => {
  const [form] = Form.useForm();
  const [classId, setClassId] = useState<string | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const apiUrl = useApiUrl();

  // Fetch class data for filter dropdown
  const { options: classesOptionSelect } = useSelect({
    resource: "classes",
    optionLabel: "classname",
    optionValue: "id",
  });

  // Standard violations table (index method)
  const { tableProps, tableQueryResult } = useTable({
    resource: "violations",
    syncWithLocation: true,
    pagination: {
      pageSize: 10,
    },
  });
  const [isFiltering, setIsFiltering] = useState(false);
  // Student violations data (studentViolations method)
  const { data: studentViolationsData, isLoading: studentViolationsLoading } =
    useCustom({
      url: `${apiUrl}/violations/students`,
      method: "get",
      config: {
        query: {
          class: classId,
          month,
          year,
        },
      },
      queryOptions: {
        enabled: !!classId && !!month && !!year,
        onSettled: () => {
          // Set isFiltering ke false ketika data berhasil diambil atau terjadi error
          setIsFiltering(false);
        },
      },
    });

  // Fetch regulation data for display
  const { data: regulationData, isLoading: regulationIsLoading } = useMany({
    resource: "regulations",
    ids: tableProps?.dataSource?.map((item) => item?.regulationId) ?? [],
    queryOptions: {
      enabled: !!tableProps?.dataSource,
    },
  });

  // Handle filter submission
  const handleFilter = (values: any) => {
    const selectedDate = values.date ? dayjs(values.date) : null;

    // Aktifkan loading state dulu
    setIsFiltering(true);

    // Update filter values
    setClassId(values.class || null);
    setMonth(selectedDate ? selectedDate.format("MM") : null);
    setYear(selectedDate ? selectedDate.format("YYYY") : null);

    if (values.class && selectedDate) {
      setActiveTab("filtered");
    } else {
      // Jika tidak ada filter yang valid, berhenti loading
      setIsFiltering(false);
      setActiveTab("all");
    }
  };

  // Handle filter reset
  const handleReset = () => {
    form.resetFields();
    setClassId(null);
    setMonth(null);
    setYear(null);
    setActiveTab("all");
    setIsFiltering(false);
  };

  // Handle student detail view
  const navigate = useNavigation();

  const getToPath = useGetToPath();

  const go = useGo();
  const { show } = useNavigation();

  const handleViewDetails = (studentId: string) => {
    if (month && year) {
      go({
        to: {
          resource: "student-violations", // resource name or identifier
          action: "show",
          id: studentId,
        },
        query: {
          month: month,
          year: year,
        },
        type: "push",
      });
    }
  };

  // Get color based on regulation category
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
    <List>
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFilter}
          initialValues={{}}
        >
          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item name="class" label="Class">
                <Select
                  placeholder="Select Class"
                  allowClear
                  options={classesOptionSelect}
                ></Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="date" label="Month and Year">
                <DatePicker
                  picker="month"
                  placeholder="Select Month/Year"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={8}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Space>
                <Button type="primary" htmlType="submit">
                  Filter
                </Button>
                <Button onClick={handleReset}>Reset</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="All Violations" key="all">
          {/* Standard violations list (index method) */}
          <Table {...tableProps} rowKey="id">
            <Table.Column dataIndex="id" title="ID" width={60} />
            <Table.Column
              dataIndex={["createdAt"]}
              title="Dibuat Pada"
              sorter
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
            />
            <Table.Column
              dataIndex={["regulation"]}
              title="Peraturan yang Dilanggar"
              render={(value, record: any) => {
                if (regulationIsLoading) return <Spin size="small" />;

                const regulation =
                  record.regulation ||
                  regulationData?.data?.find(
                    (item) => item.id === record.regulationId
                  );

                if (!regulation) return "Unknown regulation";

                return (
                  <Space direction="vertical" size={0}>
                    <Text>{regulation.name}</Text>
                    {regulation.category && (
                      <Tag color={getCategoryColor(regulation.category)}>
                        {regulation.category}
                      </Tag>
                    )}
                    <br />
                    {regulation.type === "Pelanggaran" && (
                      <Tag color="error">Pelanggaran</Tag>
                    )}
                    {regulation.type === "penghargaan" && (
                      <Tag color="success">Penghargaan</Tag>
                    )}
                  </Space>
                );
              }}
            />
            <Table.Column
              dataIndex={["studentClass", "user", "student", "name"]}
              title="Nama siswa yang melanggar"
            />
            <Table.Column dataIndex="name" title="Nama Pelanggaran" />

            <Table.Column
              dataIndex="actionTaken"
              title="Tindakan yang diambil"
            />
            <Table.Column
              title="Point"
              render={(_, record: any) => {
                const regulation =
                  record.regulation ||
                  regulationData?.data?.find(
                    (item) => item.id === record.regulationId
                  );

                const point = regulation?.point || record.point || 0;

                return (
                  <Tag
                    color={
                      point > 20 ? "red" : point > 10 ? "default" : "default"
                    }
                  >
                    {point} points
                  </Tag>
                );
              }}
            />
            {/* <Table.Column
              title="Tipe"
              render={(_, record: any) => {
                const regulation =
                  record.regulation ||
                  regulationData?.data?.find(
                    (item) => item.id === record.regulationId
                  );

                if (!regulation?.type) return <Tag>Unknown</Tag>;

                return regulation.type.toLowerCase() === "pelanggaran" ? (
                  <Tag color="error">Pelanggaran</Tag>
                ) : (
                  <Tag color="success">Penghargaan</Tag>
                );
              }}
              filters={[
                { text: "Pelanggaran", value: "pelanggaran" },
                { text: "Penghargaan", value: "penghargaan" },
              ]}
              onFilter={(value, record: any) => {
                const regulation =
                  record.regulation ||
                  regulationData?.data?.find(
                    (item) => item.id === record.regulationId
                  );
                return regulation?.type?.toLowerCase() === value;
              }}
            /> */}
            <Table.Column
              dataIndex={["teacher", "name"]}
              title="Guru Pencatat"
            />

            <Table.Column
              title="Actions"
              dataIndex="actions"
              render={(_, record: BaseRecord) => (
                <Space>
                  <EditButton hideText size="small" recordItemId={record.id} />
                  <ShowButton hideText size="small" recordItemId={record.id} />
                  <DeleteButton
                    hideText
                    size="small"
                    recordItemId={record.id}
                  />
                </Space>
              )}
            />
          </Table>
        </TabPane>

        <TabPane
          tab="Filtered Violations"
          key="filtered"
          disabled={!classId || !month || !year}
        >
          {/* Student violations table (studentViolations method) */}
          {studentViolationsLoading || isFiltering ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin />
              <div style={{ marginTop: "10px" }}>
                Loading student violations...
              </div>
            </div>
          ) : studentViolationsData?.data?.length > 0 ? (
            <Table
              dataSource={
                Array.isArray(studentViolationsData?.data)
                  ? studentViolationsData?.data
                  : []
              }
              rowKey="id"
              pagination={{ pageSize: 10 }}
            >
              <Table.Column dataIndex="id" title="ID" width={60} />
              <Table.Column dataIndex="name" title="Nama Siswa" />
              <Table.Column dataIndex="nis" title="NIS" />
              <Table.Column dataIndex="nisn" title="NISN" />
              <Table.Column
                title="Kelas"
                render={(record) => {
                  const classData = record.class;
                  if (!classData) return "N/A";

                  return `${classData.romanLevel} ${classData.expertise.shortName} ${classData.alphabet} - ${classData.expertise.prody.faculty.schoolYear.year}`;
                }}
              />
              <Table.Column
                dataIndex="totalPoints"
                title="Total Points"
                render={(value) => (
                  <Tag
                    color={value > 60 ? "red" : value > 30 ? "orange" : "green"}
                  >
                    {value} points
                  </Tag>
                )}
                sorter={(a: any, b: any) => a.totalPoints - b.totalPoints}
              />
              <Table.Column
                title="Actions"
                dataIndex="actions"
                render={(_, record: BaseRecord) => (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() =>
                      record.id !== undefined &&
                      handleViewDetails(String(record.id))
                    }
                  >
                    View Details
                  </Button>
                )}
              />
            </Table>
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Text type="secondary">
                No violations found for the selected filters. Please try
                different criteria.
              </Text>
            </div>
          )}
        </TabPane>
      </Tabs>
    </List>
  );
};
