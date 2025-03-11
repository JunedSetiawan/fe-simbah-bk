"use client";

import React from "react";
import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import {
  Typography,
  Card,
  Descriptions,
  Tag,
  Divider,
  Space,
  Badge,
  Tabs,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  BulbOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { TabPane } = Tabs;

export const RegulationShow = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  // Menentukan tipe (ketertiban/penghargaan) untuk styling
  const isPositive = record?.type?.toLowerCase() === "penghargaan";
  const typeColor = isPositive ? "green" : "red";
  const typeIcon = isPositive ? <TrophyOutlined /> : <WarningOutlined />;
  const typeText = record?.type
    ? record.type.charAt(0).toUpperCase() + record.type.slice(1).toLowerCase()
    : isPositive
    ? "Penghargaan / Prestasi"
    : "Pelanggaran / Ketertiban";

  return (
    <Show
      isLoading={isLoading}
      title={
        <Space>
          <BulbOutlined />
          <Title level={3}>
            Detail Peraturan {record?.type && `- ${record.type.toUpperCase()}`}
          </Title>
        </Space>
      }
      canEdit
      headerButtons={({ defaultButtons }) => (
        <>
          {(defaultButtons as any)?.edit}
          {(defaultButtons as any)?.list}
        </>
      )}
    >
      <Card
        bordered={false}
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <Statistic
                title={<Space>{typeIcon} Jenis Peraturan</Space>}
                value={typeText}
                valueStyle={{ color: typeColor }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title={
                  <Space>
                    <TrophyOutlined /> Poin
                  </Space>
                }
                value={record?.point}
                valueStyle={{
                  color: typeColor,
                  fontWeight: "bold",
                }}
                prefix={record?.point > 0 ? "+" : ""}
                suffix="poin"
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <Space>
                <InfoCircleOutlined /> Detail Peraturan
              </Space>
            }
            key="1"
          >
            <Card type="inner" style={{ marginBottom: 16 }}>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="ID Peraturan">
                  <Badge
                    status={isPositive ? "success" : "error"}
                    text={record?.id}
                  />
                </Descriptions.Item>

                <Descriptions.Item label="Nama Peraturan/Pasal">
                  <Typography.Text strong style={{ fontSize: "16px" }}>
                    {record?.name}
                  </Typography.Text>
                </Descriptions.Item>

                <Descriptions.Item label="Deskripsi">
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    {record?.description || "Tidak ada deskripsi"}
                  </Typography.Paragraph>
                </Descriptions.Item>

                <Descriptions.Item label="Kategori">
                  <Tag color={isPositive ? "green" : "volcano"}>
                    {record?.category || typeText}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Sanksi / Tindakan">
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    {record?.actionTaken || "Tidak ada Sanksi / Tindakan"}
                  </Typography.Paragraph>
                </Descriptions.Item>
                {/* <Descriptions.Item label="Status">
                  {record?.is_active === true ? (
                    <Badge status="success" text="Aktif" />
                  ) : (
                    <Badge status="default" text="Tidak Aktif" />
                  )}
                </Descriptions.Item> */}
              </Descriptions>
            </Card>
          </TabPane>

          <TabPane
            tab={
              <Space>
                <ClockCircleOutlined /> Informasi Waktu
              </Space>
            }
            key="2"
          >
            <Card type="inner">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Dibuat Pada">
                  {record?.createdAt ? (
                    <Typography.Text>
                      {new Date(record.createdAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography.Text>
                  ) : (
                    "-"
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="Diperbarui Pada">
                  {record?.updatedAt ? (
                    <Typography.Text>
                      {new Date(record.updatedAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography.Text>
                  ) : (
                    "-"
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </TabPane>

          <TabPane
            tab={
              <Space>
                <CheckCircleOutlined /> Diterapkan
              </Space>
            }
            key="3"
          >
            <Card type="inner">
              <Typography.Paragraph>
                {isPositive ? (
                  <Space direction="vertical">
                    <Typography.Text>
                      Peraturan ini memberikan poin{" "}
                      <Tag color="green">+{record?.point}</Tag> kepada siswa
                      yang melakukan tindakan positif sesuai ketentuan.
                    </Typography.Text>
                    <Typography.Text>
                      Poin penghargaan akan diakumulasikan dan dapat digunakan
                      sebagai persyaratan untuk mendapatkan penghargaan atau
                      apresiasi dari sekolah.
                    </Typography.Text>
                  </Space>
                ) : (
                  <Space direction="vertical">
                    <Typography.Text>
                      Pelanggaran terhadap peraturan ini akan mengurangi poin
                      siswa sebesar <Tag color="red">{record?.point}</Tag>.
                    </Typography.Text>
                    <Typography.Text>
                      Konsekuensi akan diterapkan sesuai dengan akumulasi poin
                      negatif yang diterima siswa.
                    </Typography.Text>
                  </Space>
                )}
              </Typography.Paragraph>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </Show>
  );
};
