"use client";

import React from "react";
import { BaseRecord, CanAccess, useCan, useMany } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
  CreateButton,
  BooleanField,
} from "@refinedev/antd";
import { Table, Space } from "antd";

export const RegulationList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  // const { data: categoryData, isLoading: categoryIsLoading } = useMany({
  //   resource: "categories",
  //   ids: tableProps?.dataSource?.map((item) => item?.category) ?? [],
  //   queryOptions: {
  //     enabled: !!tableProps?.dataSource,
  //   },
  // });

  // const { data: canEdit } = useCan({
  //   resource: "regulations",
  //   action: "edit",
  // });

  // const { data: canDelete } = useCan({
  //   resource: "regulations",
  //   action: "delete",
  // });

  return (
    <List
      headerButtons={
        <CreateButton
          accessControl={{
            enabled: true,
            hideIfUnauthorized: true,
          }}
        />
      }
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="Id" />
        <Table.Column dataIndex="name" title="Nama Peraturan" />
        <Table.Column dataIndex="description" title="Deskripsi" />
        <Table.Column dataIndex="point" title="Point" />
        <Table.Column dataIndex="type" title="Tipe" />
        <Table.Column dataIndex="category" title="Kategori" />

        <Table.Column
          dataIndex={["createdAt"]}
          title="Dibuat Pada"
          render={(value: any) => <DateField value={value} />}
        />
        <Table.Column
          dataIndex={["updatedAt"]}
          title="Diperbarui Pada"
          render={(value: any) => <DateField value={value} />}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton
                hideText
                size="small"
                recordItemId={record.id}
                accessControl={{
                  enabled: true,
                  hideIfUnauthorized: true,
                }}
              />

              <ShowButton hideText size="small" recordItemId={record.id} />

              <DeleteButton
                hideText
                size="small"
                recordItemId={record.id}
                accessControl={{
                  enabled: true,
                  hideIfUnauthorized: true,
                }}
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
