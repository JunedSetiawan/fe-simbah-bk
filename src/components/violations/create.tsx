"use client";

import React from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, DatePicker, Select, Checkbox } from "antd";
import dayjs from "dayjs";

export const ViolationsCreate = () => {
  const { formProps, saveButtonProps, query } = useForm();

  const { selectProps: regulationSelectProps } = useSelect({
    resource: "regulations?type=Pelanggaran",
    optionLabel: "name",
  });

  const { selectProps: teacherSelectProps } = useSelect({
    resource: "teachers",
    optionLabel: "name",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Date"
          name={["date"]}
          rules={[
            {
              required: true,
            },
          ]}
          getValueProps={(value) => ({
            value: value ? dayjs(value) : undefined,
          })}
        >
          <DatePicker />
        </Form.Item>
        <Form.Item
          label="Peraturan Pelanggaran yang terlibat"
          name={"regulation_id"}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            placeholder="Pilih Peraturan Pelanggaran"
            {...regulationSelectProps}
          />
        </Form.Item>
        <Form.Item
          label="Guru Pencatat"
          name={"teacher_id"}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            placeholder="Pilih Guru Pencatat Pelanggaran ex"
            {...teacherSelectProps}
          />
        </Form.Item>
        <Form.Item
          label="Name"
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
          label="Description"
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
          label="Action Taken"
          name={["actionTaken"]}
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
  );
};
