"use client";

import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, DatePicker, Select } from "antd";
import dayjs from "dayjs";
import { CanAccess } from "@refinedev/core";
import UnauthorizedPage from "@app/unauthorized";
import { AntdInferencer } from "@refinedev/inferencer/antd";

export const RegulationCreate = () => {
  const { formProps, saveButtonProps, query } = useForm();

  return (
    <CanAccess
      resource="regulations"
      action="create"
      fallback={<UnauthorizedPage />}
    >
      <Create saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical">
          <Form.Item
            label="Nama Peraturan"
            name={["name"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Deskripsi"
            name={["description"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Point"
            name={["point"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Tipe Pelanggaran"
            name={["type"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select placeholder="Pilih Tipe">
              <Select.Option value="Pelanggaran">
                Ketertiban / Pelanggaran
              </Select.Option>
              <Select.Option value="Penghargaan">
                Prestasi / Penghargaan
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Kategori Peraturan"
            name={["category"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select placeholder="Pilih Kategori">
              <Select.Option value="Akademik">Akademik</Select.Option>
              <Select.Option value="Non-Akademik">Non-Akademik</Select.Option>

              <Select.Option value="Kedisiplinan">Kedisiplinan</Select.Option>

              <Select.Option value="Kebersihan">Kebersihan</Select.Option>

              <Select.Option value="Keamanan">Keamanan</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Sanksi / Tindakan"
            name="action_taken"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Create>
    </CanAccess>
  );
};
