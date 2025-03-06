"use client";

import React from "react";
import { useShow, useOne } from "@refinedev/core";
import {
  Show,
  NumberField,
  DateField,
  TagField,
  TextField,
  BooleanField,
} from "@refinedev/antd";
import { Typography } from "antd";

const { Title } = Typography;

export const ViolationsShow = () => {
  const { query } = useShow();
  const { data, isLoading } = query;

  const record = data?.data;

  const { data: regulationData, isLoading: regulationIsLoading } = useOne({
    resource: "regulations",
    id: record?.regulationId || "",
    queryOptions: {
      enabled: !!record,
    },
  });

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Id</Title>
      <NumberField value={record?.id ?? ""} />

      <Title level={5}>Peraturan Pelanggaran yang dilanggar</Title>
      {regulationIsLoading ? (
        <>Loading...</>
      ) : (
        <>{regulationData?.data?.name}</>
      )}
      <Title level={5}>Nama Pelanggaran</Title>
      <TextField value={record?.name} />
      <Title level={5}>Deskripsi</Title>
      <TextField value={record?.description} />
      <Title level={5}>Tindakan yang diabmil</Title>
      <TextField value={record?.actionTaken} />

      <Title level={5}>Guru Pencatat</Title>
      <TextField value={record?.teacher?.name} />
      <Title level={5}>Dibuat pada</Title>
      <DateField value={record?.createdAt} />
    </Show>
  );
};
