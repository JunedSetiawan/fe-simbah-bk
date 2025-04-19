"use client";

import React, { useState } from "react";
import { Create, useForm } from "@refinedev/antd";
import {
  Form,
  Input,
  DatePicker,
  Select,
  Divider,
  notification,
  Radio,
} from "antd";
import dayjs from "dayjs";
import { CanAccess, useApiUrl, useCustom, useSelect } from "@refinedev/core";
import { SelectProps } from "antd/lib";
import UnauthorizedPage from "@app/unauthorized";

export const CounselingCreate = () => {
  const { TextArea } = Input;
  const { formProps, saveButtonProps, query } = useForm();
  const apiUrl = useApiUrl();

  const { options: classSelectProps } = useSelect({
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
  const classSelectMergedProps: SelectProps = {
    options: classSelectProps,
    onChange: (value: any) => {
      handleClassChange(value);
    },
    placeholder: "Pilih Kelas",
  };

  // Options for bidang layanan radio buttons
  const bidangLayananOptions = [
    { label: "Pribadi", value: "Pribadi" },
    { label: "Sosial", value: "Sosial" },
    { label: "Belajar", value: "Belajar" },
    { label: "Karir", value: "Karir" },
  ];

  // Options for jenis layanan radio buttons
  const jenisLayananOptions = [
    { label: "Orientasi", value: "Orientasi" },
    { label: "Informasi", value: "Informasi" },
    { label: "Konseling Perorangan", value: "Konseling Perorangan" },
    { label: "Konseling Kelompok", value: "Konseling Kelompok" },
    { label: "Bimbingan Kelompok", value: "Bimbingan Kelompok" },
    { label: "Konsultasi", value: "Konsultasi" },
    { label: "Mediasi", value: "Mediasi" },
    { label: "Advokasi", value: "Advokasi" },
    { label: "Konferensi Kasus", value: "Konferensi Kasus" },
    { label: "Alih Tangan Kasus", value: "Alih Tangan Kasus" },
  ];

  return (
    <CanAccess
      resource="counselings"
      action="create"
      fallback={<UnauthorizedPage />}
    >
      <Create saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical">
          <h1>Pilih Siswa</h1>
          <Form.Item
            label="Kelas"
            name={["class_id"]}
            rules={[
              {
                required: true,
                message: "Kelas wajib dipilih",
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
                message: "Siswa wajib dipilih",
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
            label="Bidang Layanan (pilih salah satu)"
            name={["service_field"]}
            rules={[
              {
                required: true,
                message: "Bidang layanan wajib dipilih",
              },
            ]}
          >
            <Radio.Group
              options={bidangLayananOptions}
              optionType="button"
              buttonStyle="solid"
            />
          </Form.Item>

          <Form.Item
            label="Jenis Layanan (pilih salah satu)"
            name={["service_type"]}
            rules={[
              {
                required: true,
                message: "Jenis layanan wajib dipilih",
              },
            ]}
          >
            <Radio.Group
              options={jenisLayananOptions}
              optionType="button"
              buttonStyle="solid"
            />
          </Form.Item>

          <Form.Item
            label="Kasus"
            name={["case"]}
            rules={[
              {
                required: true,
                message: "Kasus wajib diisi",
              },
            ]}
          >
            <Input placeholder="Masukkan kasus" />
          </Form.Item>
          <Form.Item
            label="Ringkasan"
            name={["summary"]}
            rules={[
              {
                required: true,
                message: "Ringkasan wajib diisi",
              },
            ]}
          >
            <Input placeholder="Masukkan ringkasan" />
          </Form.Item>
          <Form.Item
            label="Tindak Lanjut"
            name={["follow_up"]}
            rules={[
              {
                required: true,
                message: "Tindak lanjut wajib diisi",
              },
            ]}
          >
            <Input placeholder="Masukkan tindak lanjut" />
          </Form.Item>
          <Form.Item
            label="Deskripsi"
            name={["description"]}
            rules={[
              {
                required: true,
                message: "Deskripsi wajib diisi",
              },
            ]}
          >
            <TextArea rows={4} placeholder="Masukkan deskripsi" />
          </Form.Item>
        </Form>
      </Create>
    </CanAccess>
  );
};
