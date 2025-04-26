"use client";

import React from "react";
import { BaseRecord } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
} from "@refinedev/antd";
import { Table, Space, Typography, Tag } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export const StudentCallsList = () => {
  const { Text } = Typography;
  const { tableProps } = useTable({
    syncWithLocation: true,
  });
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
  return (
    <List>
      <Table {...tableProps} rowKey="id" bordered>
        {/* Nomor Urut */}
        <Table.Column
          title="No."
          width={60}
          render={(_, __, index) => {
            const { current = 1, pageSize = 10 } = tableProps.pagination || {};
            return (current - 1) * pageSize + index + 1;
          }}
        />

        {/* Nama Siswa dan Kelas */}
        <Table.Column
          dataIndex={["studentClasses", "user", "student", "name"]}
          render={(text, record) => {
            const studentName = text; // Nama siswa
            const className = record.studentClasses.class.romanLevel; // Kelas (XI)
            const prodyName = record.studentClasses.class.expertise.shortName; // Prodi (RPL)
            const classAlphabet = record.studentClasses.class.alphabet; // Kelas (B)

            // Gabungkan menjadi format "siswa - XI RPL B"
            const name = `${studentName} - ${className} ${prodyName} ${classAlphabet}`;

            return <span style={{ fontWeight: 500 }}>{name}</span>;
          }}
          title="Siswa & Kelas"
        />

        <Table.Column dataIndex="text" title="Text" />
        <Table.Column
          dataIndex="date"
          title="Jadwal"
          width={150}
          render={(value) => <Tag color={"default"}>{formatDate(value)}</Tag>}
          sorter={(a, b) => {
            if (!a.date || !b.date) return 0;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }}
        />
        <Table.Column
          dataIndex={["createdBy"]}
          title="Dibuat Oleh"
          width={150}
          render={(value) => (
            <Text strong ellipsis style={{ maxWidth: 150 }} title={value}>
              {value.teacher.name || value.username || "-"}
            </Text>
          )}
        />
        {/* Tanggal Dibuat */}
        <Table.Column
          dataIndex={["createdAt"]}
          title="Dibuat Pada"
          sorter
          render={(value: any) => (
            <Space>
              <ClockCircleOutlined />
              <DateField value={value} format="DD MMM YYYY" />
            </Space>
          )}
        />

        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
