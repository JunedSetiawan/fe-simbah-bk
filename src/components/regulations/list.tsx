"use client";

import React, { Suspense } from "react";
import { BaseRecord, CanAccess, useCan, useMany } from "@refinedev/core";
import {
  List,
  useTable,
  // useList,
  CreateButton,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
} from "@refinedev/antd";
import {
  Table,
  Space,
  Card,
  Tag,
  Typography,
  Button,
  Tooltip,
  Avatar,
  Badge,
  Row,
  Col,
  Spin,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { AntdInferencer } from "@refinedev/inferencer/antd";
const { Title, Text } = Typography;

export const RegulationList = () => {
  // const { data: canEdit } = useCan({
  //   resource: "regulations",
  //   action: "edit",
  // });

  // const { data: canDelete } = useCan({
  //   resource: "regulations",
  //   action: "delete",
  // });
  const { tableProps, sorters, setCurrent, setPageSize } = useTable({
    syncWithLocation: true,
    sorters: {
      initial: [{ field: "id", order: "asc" }],
    },
    pagination: {
      pageSize: 10,
    },
  });

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "pelanggaran":
        return "error";
      case "prestasi":
        return "success";
      case "kehadiran":
        return "processing";
      default:
        return "default";
    }
  };

  // Fungsi untuk mendapatkan warna point
  const getPointColor = (point: number) => {
    if (point < 0) return "#f5222d"; // Merah untuk poin negatif
    if (point > 0) return "#52c41a"; // Hijau untuk poin positif
    return "#faad14"; // Kuning untuk poin nol
  };

  return (
    <Suspense
      fallback={
        <Row justify="center" align="middle" style={{ minHeight: "300px" }}>
          <Col>
            <Spin size="large" />
          </Col>
        </Row>
      }
    >
      <Card
        bordered={false}
        className="regulation-list-card"
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileTextOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
            <Title level={4} style={{ margin: 0 }}>
              Daftar Peraturan
            </Title>
          </div>
        }
        extra={
          <CreateButton
            icon={<PlusOutlined />}
            type="primary"
            accessControl={{
              enabled: true,
              hideIfUnauthorized: true,
            }}
          >
            Tambah Peraturan
          </CreateButton>
        }
      >
        <Table
          {...tableProps}
          rowKey="id"
          bordered={false}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
          style={{
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <Table.Column
            title="No."
            width={60}
            render={(_, __, index) => {
              const { current = 1, pageSize = 10 } =
                tableProps.pagination || {};
              return (current - 1) * pageSize + index + 1;
            }}
          />

          <Table.Column
            dataIndex="name"
            title="Nama Peraturan"
            sorter
            render={(value) => (
              <Text strong ellipsis style={{ maxWidth: 250 }} title={value}>
                {value}
              </Text>
            )}
          />

          <Table.Column
            dataIndex="point"
            title="Point"
            sorter
            render={(value) => (
              <Badge
                count={value}
                showZero
                style={{
                  backgroundColor: getPointColor(value),
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              />
            )}
          />

          <Table.Column
            dataIndex="type"
            title="Tipe"
            sorter
            render={(value) => (
              <Tag color={getTypeColor(value)} style={{ fontWeight: "bold" }}>
                {value.toUpperCase()}
              </Tag>
            )}
          />

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
            title="Actions"
            dataIndex="actions"
            fixed="right"
            render={(_, record: BaseRecord) => (
              <Space>
                <Tooltip title="Lihat Detail">
                  <ShowButton
                    hideText
                    size="middle"
                    recordItemId={record.id}
                    icon={<EyeOutlined />}
                    type="text"
                  />
                </Tooltip>

                <Tooltip title="Edit">
                  <EditButton
                    hideText
                    size="middle"
                    recordItemId={record.id}
                    icon={<EditOutlined />}
                    type="text"
                    accessControl={{
                      enabled: true,
                      hideIfUnauthorized: true,
                    }}
                  />
                </Tooltip>

                <Tooltip title="Hapus">
                  <DeleteButton
                    hideText
                    size="middle"
                    recordItemId={record.id}
                    icon={<DeleteOutlined />}
                    type="text"
                    accessControl={{
                      enabled: true,
                      hideIfUnauthorized: true,
                    }}
                  />
                </Tooltip>
              </Space>
            )}
          />
        </Table>
      </Card>
    </Suspense>
  );
};
