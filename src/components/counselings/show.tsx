"use client";

import React from "react";
import { useShow } from "@refinedev/core";
import { Show, TextField, DateField } from "@refinedev/antd";
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Space,
  Row,
  Col,
  Spin,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  SolutionOutlined,
  ProfileOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export const CounselingShow = () => {
  const { query } = useShow();
  const { data, isLoading } = query;
  const record = data?.data;

  if (isLoading) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: "300px" }}>
        <Col>
          <Spin size="large" />
        </Col>
      </Row>
    );
  }

  // Extract data for easier access
  const studentName = record?.studentClasses.user.student.name || "-";
  const nis = record?.studentClasses.user.student.nis || "-";
  const className =
    `${record?.studentClasses.class.romanLevel} ${record?.studentClasses.class.expertise.shortName} ${record?.studentClasses.class.alphabet}` ||
    "-";

  const teacherName = record?.teacher.name || "-";
  const teacherNip = record?.teacher.nip || "-";
  const workSince = record?.teacher.workSince || "-";

  return (
    <Show title={<Title level={3}>Detail Konseling</Title>}>
      {/* Header Section */}
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Space direction="vertical" size={8}>
              <Text strong style={{ fontSize: 16 }}>
                Informasi Umum
              </Text>
              <Space>
                <ClockCircleOutlined style={{ color: "#1890ff" }} />
                <DateField
                  value={record?.createdAt}
                  format="DD MMM YYYY HH:mm:ss"
                />
              </Space>
              <Space>
                <SolutionOutlined style={{ color: "#52c41a" }} />
                <Tag color="green">{record?.serviceType}</Tag>
              </Space>
              <Space>
                <BookOutlined style={{ color: "#1890ff" }} />
                <Tag color="blue">{record?.serviceField}</Tag>
              </Space>
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical" size={8}>
              <Text strong style={{ fontSize: 16 }}>
                Siswa
              </Text>
              <Space>
                <UserOutlined style={{ color: "#1890ff" }} />
                <TextField value={studentName} />
              </Space>
              <Space>
                <ProfileOutlined style={{ color: "#1890ff" }} />
                NIS: <Text>{nis}</Text>
              </Space>
              <Space>
                <TeamOutlined style={{ color: "#1890ff" }} />
                Kelas: <Text>{className}</Text>
              </Space>
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical" size={8}>
              <Text strong style={{ fontSize: 16 }}>
                Guru Konselor
              </Text>
              <Space>
                <UserOutlined style={{ color: "#1890ff" }} />
                <TextField value={teacherName} />
              </Space>
              <Space>
                <ProfileOutlined style={{ color: "#1890ff" }} />
                NIP: <Text>{teacherNip}</Text>
              </Space>
              <Space>
                <ClockCircleOutlined style={{ color: "#1890ff" }} />
                Mulai Bekerja: <Text>{workSince}</Text>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Detail Section */}
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Space direction="vertical" size={16}>
              <Text strong style={{ fontSize: 16 }}>
                Kasus
              </Text>
              <Text>{record?.case}</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size={16}>
              <Text strong style={{ fontSize: 16 }}>
                Ringkasan
              </Text>
              <Text>{record?.summary}</Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Follow Up and Description */}
      <Card bordered={false}>
        <Row gutter={16}>
          <Col span={12}>
            <Space direction="vertical" size={16}>
              <Text strong style={{ fontSize: 16 }}>
                Tindak Lanjut
              </Text>
              <Text>{record?.followUp}</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size={16}>
              <Text strong style={{ fontSize: 16 }}>
                Deskripsi
              </Text>
              <Text>{record?.description}</Text>
            </Space>
          </Col>
        </Row>
      </Card>
    </Show>
  );
};
