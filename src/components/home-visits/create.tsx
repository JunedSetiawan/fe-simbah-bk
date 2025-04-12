"use client";

import React, { useState } from "react";
import { Create, useForm, getValueFromEvent, useSelect } from "@refinedev/antd";
import {
  Form,
  Input,
  DatePicker,
  Upload,
  Select,
  Divider,
  notification,
} from "antd";
import dayjs from "dayjs";
import { CanAccess, useApiUrl, useCustom } from "@refinedev/core";
import { SelectProps } from "antd/lib";
import UnauthorizedPage from "@app/unauthorized";

export const HomeVisitsCreate = () => {
  const { formProps, saveButtonProps, query } = useForm();

  const apiUrl = useApiUrl();

  const { selectProps: classSelectProps } = useSelect({
    resource: "classes",
    optionLabel: "classname",
    optionValue: "id",
  });

  interface Student {
    user_id: string;
    student_id: string;
    name: string;
    nis: string;
    nisn: string;
  }

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  // Fetch students when class is selected
  const { isLoading: isLoadingStudents } = useCustom<{ data: Student[] }>({
    url: selectedClassId ? `${apiUrl}/classes/${selectedClassId}/students` : "",
    method: "get",
    queryOptions: {
      enabled: !!selectedClassId,
      onSuccess: (response) => {
        // Handle different response structures
        if (response.data && Array.isArray(response.data)) {
          setStudents(response.data);
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          setStudents(response.data.data);
        } else {
          // Fallback if the structure is unexpected

          setStudents([]);
          notification.error({
            message: "Error",
            description: "Unexpected response format from the server",
          });
        }
      },
      onError: (error) => {
        notification.error({
          message: "Error: " + (error.message || "Unknown error"),
          description: "Failed to fetch students for this class",
        });
        setStudents([]);
      },
    },
  });

  // Create safe student options
  const studentOptions =
    students && students.length > 0
      ? students.map((student) => ({
          label: `${student.name} (${student.nis})`,
          value: student.student_id,
          // Include additional data that might be needed
          user_id: student.user_id,
          nisn: student.nisn,
          nis: student.nis,
        }))
      : [];

  const handleClassChange = (value: string) => {
    setSelectedClassId(value);
    // Reset student selection when class changes
    formProps.form?.setFieldsValue({ student_id: undefined });
  };

  // Fix TypeScript issue by creating a properly typed merge of props
  const classSelectMergedProps = {
    ...classSelectProps,
    onChange: (value: any) => {
      handleClassChange(value);
    },
    placeholder: "Pilih Kelas",
  };

  const handleSubmit = async (values: any) => {
    // Format the date correctly before submission
    const formattedValues = {
      ...values,
      date: values.date
        ? dayjs(values.date).format("YYYY-MM-DD HH:mm:ss")
        : undefined,
    };

    // Use the form's submit handler with formatted values
    try {
      await formProps.onFinish?.(formattedValues);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <CanAccess
      resource="home-visits"
      action="create"
      fallback={<UnauthorizedPage />}
    >
      <Create saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Kelas"
            name={["class_id"]}
            rules={[
              {
                required: true,
                message: "Kelas is required",
              },
            ]}
          >
            <Select {...classSelectMergedProps} />
          </Form.Item>
          <Form.Item
            label="Siswa"
            name={["student_id"]}
            rules={[
              {
                required: true,
                message: "Siswa is required",
              },
            ]}
          >
            <Select
              loading={isLoadingStudents}
              disabled={!selectedClassId || isLoadingStudents}
              placeholder={
                !selectedClassId ? "Pilih kelas terlebih dahulu" : "Pilih siswa"
              }
              options={studentOptions}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Divider />
          <Form.Item
            label="Jadwal Kunjungan Rumah"
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
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              type="datetime"
              onChange={(date, dateString) => {
                // Convert to ISO string when changing
                const isoDate = date ? date.toISOString() : null;
                formProps.form?.setFieldsValue({ date: isoDate });
              }}
            />
          </Form.Item>

          <Form.Item
            label="Alamat Kunjungan"
            name={["address"]}
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
