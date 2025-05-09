"use client";

import React from "react";
import { useShow } from "@refinedev/core";
import {
  Show,
  NumberField,
  TagField,
  TextField,
  DateField,
} from "@refinedev/antd";
import { Typography, Descriptions, Card, Space, Divider } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;

export const StudentCallsShow = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  const studentName = record?.studentClasses?.user?.student?.name || "-";
  const nis = record?.studentClasses?.user?.student?.nis || "-";
  const nisn = record?.studentClasses?.user?.student?.nisn || "-";
  const className = record?.studentClasses?.class
    ? `${record.studentClasses.class.romanLevel} ${record.studentClasses.class.expertise.shortName} ${record.studentClasses.class.alphabet}`
    : "-";

  const createdByName =
    record?.createdBy?.teacher?.name || record?.createdBy?.username || "-";
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
  const createdAt = formatDate(record?.createdAt) || null;
  const updatedAt = formatDate(record?.updatedAt) || null;

  return (
    <Show isLoading={isLoading} title="Detail Panggilan Siswa">
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Card
          title={
            <Space>
              <UserOutlined /> Informasi Siswa
            </Space>
          }
          bordered={false}
        >
          <Descriptions column={{ xs: 1, sm: 1 }} bordered>
            <Descriptions.Item label="Nama Siswa">
              <TextField value={studentName} />
            </Descriptions.Item>
            <Descriptions.Item label="NIS">
              <TextField value={nis} />
            </Descriptions.Item>
            <Descriptions.Item label="NISN">
              <TextField value={nisn} />
            </Descriptions.Item>
            <Descriptions.Item label="Kelas" span={2}>
              <TextField value={className} />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title={
            <Space>
              <FileTextOutlined /> Detail Panggilan
            </Space>
          }
          bordered={false}
        >
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label="Tanggal & Waktu" span={2}>
              <DateField
                value={formatDate(record?.date)}
                format="DD MMMM YYYY HH:mm:ss"
              />
            </Descriptions.Item>
            <Descriptions.Item label="Catatan" span={2}>
              <TextField value={record?.text} />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title={
            <Space>
              <CalendarOutlined /> Informasi Sistem
            </Space>
          }
          bordered={false}
        >
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label="Dibuat Oleh">
              <TextField value={createdByName} />
            </Descriptions.Item>
            <Descriptions.Item label="Dibuat Pada">
              <DateField value={createdAt} format="DD MMMM YYYY HH:mm:ss" />
            </Descriptions.Item>
            <Descriptions.Item label="Diperbarui Pada" span={2}>
              <DateField value={updatedAt} format="DD MMMM YYYY HH:mm:ss" />
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </Show>
  );
};
