"use client";

import React from "react";
import { BaseRecord } from "@refinedev/core";
import { useTable, List, EditButton, ShowButton } from "@refinedev/antd";
import { Table, Space } from "antd";

interface Teacher {
  id: string;
  userId: string;
  nip: string;
  name: string;
  workSince: number;
  workStop: string | null;
  employeeStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  id: string;
  userId: string;
  name: string;
  kkNumber: string | null;
  nisn: string;
  nis: string;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string;
  code: string;
  name: string;
  appId: string;
  createdAt: string;
  updatedAt: string;
}

interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  role: Role;
}

interface User {
  id: string;
  username: string;
  profileType: string;
  createdAt: string;
  updatedAt: string;
  student: Student | null;
  teacher: Teacher | null;
  userRole: UserRole;
}

interface ApiResponse {
  message: string;
  data: User[];
}

export const UserList = () => {
  const { tableProps } = useTable<User>({
    syncWithLocation: true,
    meta: {
      fields: [
        "id",
        "username",
        "profileType",
        "createdAt",
        {
          userRole: [
            "id",
            "roleId",
            {
              role: ["id", "code", "name"],
            },
          ],
        },
        {
          teacher: ["id", "nip", "name", "workSince", "employeeStatus"],
        },
        {
          student: ["id", "name", "nisn", "nis"],
        },
      ],
    },
  });

  const dataSource =
    (tableProps.dataSource as unknown as ApiResponse)?.data || [];

  return (
    <List>
      <Table {...tableProps} dataSource={dataSource} rowKey="id">
        <Table.Column dataIndex="username" title="Username" />
        <Table.Column dataIndex="profileType" title="Profile Type" />
        <Table.Column
          dataIndex={["userRole", "role", "name"]}
          title="Role"
          render={(value) => value || "-"}
        />
        <Table.Column
          title="Teacher Info"
          render={(_, record: User) => {
            if (!record.teacher) return "-";
            return (
              <div>
                <div>{record.teacher.name}</div>
              </div>
            );
          }}
        />
        <Table.Column
          title="Student Info"
          render={(_, record: User) => {
            if (!record.student) return "-";
            return (
              <div>
                <div>{record.student.name}</div>
              </div>
            );
          }}
        />
        <Table.Column
          dataIndex="createdAt"
          title="Created At"
          render={(value) => new Date(value).toLocaleDateString()}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: User) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
