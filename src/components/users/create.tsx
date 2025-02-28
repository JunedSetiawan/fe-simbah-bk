"use client";

import React, { useState } from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Divider, Form, Input, Select, notification } from "antd";
import { useCustom, useApiUrl } from "@refinedev/core";
import type { SelectProps } from "antd/es/select";

export const UserCreate = () => {
  const { formProps, saveButtonProps } = useForm();
  const apiUrl = useApiUrl();

  const { selectProps: roleSelectProps } = useSelect({
    resource: "roles",
    optionLabel: "name",
    optionValue: "id",
  });

  const { selectProps: classSelectProps } = useSelect({
    resource: "classes",
    optionLabel: "classname",
    optionValue: "id",
  });

  interface Role {
    id: number;
    label: string;
  }

  interface Student {
    user_id: string;
    student_id: string;
    name: string;
    nis: string;
    nisn: string;
  }

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
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

  const handleRoleChange = (value: any, option: any) => {
    setSelectedRole(option);
  };

  const handleClassChange = (value: string) => {
    setSelectedClassId(value);
    // Reset student selection when class changes
    formProps.form?.setFieldsValue({ student_id: undefined });
  };

  // Fix TypeScript issue by creating a properly typed merge of props
  const classSelectMergedProps: SelectProps = {
    ...classSelectProps,
    onChange: (value: any) => {
      // Call the original onChange if it exists
      if (classSelectProps.onChange) {
        classSelectProps.onChange(value);
      }
      // Call our custom handler
      handleClassChange(value);
    },
    placeholder: "Pilih Kelas",
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Username"
          name={["username"]}
          rules={[
            {
              required: true,
              min: 3,
              max: 64,
              message: "Username must be between 3 and 64 characters",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name={["password"]}
          rules={[
            {
              required: true,
              min: 8,
              max: 64,
              message: "Password must be between 8 and 64 characters",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Role"
          name={["role_id"]}
          rules={[
            {
              required: true,
              message: "Role is required",
            },
          ]}
        >
          <Select
            {...roleSelectProps}
            onSelect={(value, option) => handleRoleChange(value, option)}
          />
        </Form.Item>

        {selectedRole && selectedRole.label === "Siswa" && (
          <>
            <Form.Item
              label="Nama Lengkap"
              name={["name"]}
              rules={[
                {
                  required: true,
                  min: 3,
                  max: 155,
                  message: "Nama harus antara 3 sampai 155 karakter",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Kelas"
              name={["class_id"]}
              rules={[
                {
                  required: true,
                  message: "Kelas tidak boleh kosong",
                },
              ]}
            >
              <Select {...classSelectProps} />
            </Form.Item>
            <Form.Item label="Nomor Kartu Keluarga (KK)" name={["kk_number"]}>
              <Input />
            </Form.Item>

            <Form.Item
              label="NISN"
              name={["nisn"]}
              rules={[
                {
                  required: true,
                  message: "NISN tidak boleh kosong",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="NIS"
              name={["nis"]}
              rules={[
                {
                  required: true,
                  message: "NIS tidak boleh kosong",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </>
        )}

        {selectedRole && selectedRole.label === "Guru" && (
          <>
            <Form.Item
              label="NIP"
              name={["nip"]}
              rules={[
                {
                  required: true,
                  message: "NIP is required",
                },
              ]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              label="Nama Lengkap"
              name={["name"]}
              rules={[
                {
                  required: true,
                  min: 3,
                  max: 155,
                  message: "Nama harus antara 3 sampai 155 karakter",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Wali Kelas"
              name={["class_id"]}
              rules={[
                {
                  required: true,
                  message: "Wali Kelas tidak boleh kosong",
                },
              ]}
            >
              <Select {...classSelectProps} />
            </Form.Item>
            <Form.Item
              label="Tahun Awal Bekerja (ex: 2013)"
              name={["work_since"]}
              rules={[
                {
                  required: true,
                  message: "Tahun awal bekerja is required",
                },
              ]}
            >
              <Input type="number" />
            </Form.Item>
          </>
        )}

        {selectedRole && selectedRole.label === "Orang Tua" && (
          <>
            <Divider />
            <h1>Memilih Siswa dari orang tua tersebut</h1>
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
                  !selectedClassId
                    ? "Pilih kelas terlebih dahulu"
                    : "Pilih siswa"
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
            Data Diri Orang Tua / Wali
            <Form.Item
              label="Nama Lengkap"
              name={["name"]}
              rules={[
                {
                  required: true,
                  min: 3,
                  max: 155,
                  message: "Nama harus antara 3 sampai 155 karakter",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Status"
              name={["type"]}
              rules={[
                {
                  required: true,
                  message: "Status tidak boleh kosong",
                },
              ]}
            >
              <Select placeholder="Pilih Tipe">
                <Select.Option value="Wali">Wali</Select.Option>
                <Select.Option value="Ibu">Ibu</Select.Option>
                <Select.Option value="Ayah">Ayah</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="NIK"
              name={["nik"]}
              rules={[
                {
                  required: true,
                  message: "NIK tidak boleh kosong",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Tempat Lahir"
              name={["birth_place"]}
              rules={[
                {
                  required: true,
                  message: "Tempat lahir tidak boleh kosong",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Tahun Lahir"
              name={["birth_date"]}
              rules={[
                {
                  required: true,
                  message: "Tahun lahir tidak boleh kosong",
                },
              ]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              label="Agama"
              name={["religion"]}
              rules={[
                {
                  required: true,
                  message: "Agama tidak boleh kosong",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Pendidikan Terakhir"
              name={["education"]}
              rules={[
                {
                  required: true,
                  message: "Pendidikan terakhir tidak boleh kosong",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Pekerjaan"
              name={["job"]}
              rules={[
                {
                  required: true,
                  message: "Pekerjaan tidak boleh kosong",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Penghasilan Bulanan"
              name={["monthly_income"]}
              rules={[
                {
                  required: true,
                  message: "Penghasilan bulanan tidak boleh kosong",
                },
              ]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              label="Alamat"
              name={["address"]}
              rules={[
                {
                  required: true,
                  message: "Alamat tidak boleh kosong",
                },
              ]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              label="Nomor Telepon"
              name={["phone"]}
              rules={[
                {
                  required: true,
                  message: "Nomor telepon tidak boleh kosong",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Nomor Telepon Seluler"
              name={["phone_mobile"]}
              rules={[
                {
                  required: true,
                  message: "Nomor telepon seluler tidak boleh kosong",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Status Hidup"
              name={["live_status"]}
              rules={[
                {
                  required: true,
                  message: "Status hidup tidak boleh kosong",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </>
        )}
      </Form>
    </Create>
  );
};
