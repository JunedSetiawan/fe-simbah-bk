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
import { Table, Space, Tooltip, Tag } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

export const CounselingList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List title="Daftar Konseling">
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

        {/* Service Field */}
        <Table.Column
          dataIndex="serviceField"
          title="Bidang Layanan"
          render={(value: string) => <Tag color="blue">{value}</Tag>}
        />

        {/* Service Type */}
        <Table.Column
          dataIndex="serviceType"
          title="Jenis Layanan"
          render={(value: string) => <Tag color="green">{value}</Tag>}
        />

        {/* Case */}
        <Table.Column dataIndex="case" title="Kasus" />

        {/* Guru Konselor */}
        <Table.Column
          dataIndex={["teacher", "name"]}
          title="Guru Konselor"
          render={(value: string) => (
            <Tooltip title={`Konselor: ${value}`}>
              <span style={{ fontWeight: 500 }}>{value}</span>
            </Tooltip>
          )}
        />

        {/* Actions */}
        <Table.Column
          title="Aksi"
          dataIndex="actions"
          fixed="right"
          render={(_, record: BaseRecord) => (
            <Space>
              <Tooltip title="Lihat Detail">
                <ShowButton
                  hideText
                  size="small"
                  recordItemId={record.id}
                  icon={<EyeOutlined />}
                />
              </Tooltip>
              <Tooltip title="Edit">
                <EditButton
                  hideText
                  size="small"
                  recordItemId={record.id}
                  icon={<EditOutlined />}
                />
              </Tooltip>
              <Tooltip title="Hapus">
                <DeleteButton
                  hideText
                  size="small"
                  recordItemId={record.id}
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
