"use client";

import React, { useState, useEffect } from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Divider, Form, Input, Select, notification } from "antd";
import { useCustom, useApiUrl, CanAccess } from "@refinedev/core";
import type { SelectProps } from "antd/es/select";
import UnauthorizedPage from "@app/unauthorized";

export const UserEdit = () => {
  const { formProps, saveButtonProps, query } = useForm();
  const apiUrl = useApiUrl();
  const userData = query?.data?.data;

  console.log(userData);

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
    name: string;
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

  // Set initial role based on userData
  useEffect(() => {
    if (userData?.userRole?.role) {
      setSelectedRole({
        id: userData.userRole.role.id,
        label: userData.userRole.role.name,
        name: userData.userRole.role.name,
      });
    }
  }, [userData]);

  // Set form field values based on userData and role
  useEffect(() => {
    if (userData && formProps.form) {
      // Set common user fields
      formProps.form.setFieldsValue({
        username: userData.username,
        role_id: userData.userRole?.role?.id,
      });

      // Set role-specific fields
      if (
        userData.profileType === "Guru" ||
        (userData.profileType === "Umum" && userData.teacher)
      ) {
        // Pastikan teacherClass ada dan memiliki id
        setSelectedClassId(userData?.teacherClass?.id || null);

        formProps.form.setFieldsValue({
          // Gunakan optional chaining untuk menghindari error jika properti tidak ada
          class_id: userData?.teacherClass?.id,
          name: userData?.teacher?.name,
          nip: userData?.teacher?.nip,
          // Periksa jika workSince atau work_since yang digunakan
          work_since:
            userData?.teacher?.workSince || userData?.teacher?.work_since,
        });

        // Log form values setelah set
        console.log("Form values set:", formProps.form.getFieldsValue());
      }
      // Add logic for other roles (Siswa, Orang Tua) if needed

      // Set class and student fields for Orang Tua
      if (userData.profileType === "Orang Tua" && userData.parent) {
        setSelectedClassId(
          userData.parent.studentParents[0].student.studentClass.classId
        );
        formProps.form.setFieldsValue({
          class_id:
            userData.parent?.studentParents[0]?.student?.studentClass?.classId,
          student_id: userData.parent?.studentParents[0].student?.id,
          name: userData.parent.name,
          type: userData.parent.type,
          nik: userData.parent.nik,
          birth_place: userData.parent.birthPlace,
          birth_date: userData.parent.birthDate,
          religion: userData.parent.religion,
          education: userData.parent.education,
          job: userData.parent.job,
          monthly_income: userData.parent.monthlyIncome,
          address: userData.parent.address,
          phone: userData.parent.phone,
          phone_mobile: userData.parent.phoneMobile,
          live_status: userData.parent.liveStatus,
        });
      }

      // Set student fields for Siswa

      if (userData.profileType === "Siswa" && userData.student) {
        setSelectedClassId(userData?.student.studentClass.class.id);
        formProps.form.setFieldsValue({
          class_id: userData?.student.studentClass.class.id,
          name: userData.student.name,
          kk_number: userData.student.kkNumber,
          nisn: userData.student.nisn,
          nis: userData.student.nis,
        });
      }
    }
  }, [userData, formProps.form]);

  // Fetch students when class is selected
  const { isLoading: isLoadingStudents } = useCustom<{ data: Student[] }>({
    url: selectedClassId ? `${apiUrl}/classes/${selectedClassId}/students` : "",
    method: "get",
    queryOptions: {
      enabled: !!selectedClassId,
      onSuccess: (response) => {
        if (response.data && Array.isArray(response.data)) {
          setStudents(response.data);
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          setStudents(response.data.data);
        } else {
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
      if (classSelectProps.onChange) {
        classSelectProps.onChange(value);
      }
      handleClassChange(value);
    },
    placeholder: "Pilih Kelas",
  };

  console.log(formProps.form?.getFieldsValue());

  return (
    <CanAccess resource="users" action="edit" fallback={<UnauthorizedPage />}>
      <Edit saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical" method="put">
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
            help="Leave blank to keep current password"
          >
            <Input.Password placeholder="Enter new password to change" />
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

          {selectedRole &&
            (selectedRole?.label === "Guru" ||
              selectedRole?.label === "Umum") && (
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
                <Form.Item label="Wali Kelas" name={["class_id"]}>
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

          {selectedRole && selectedRole.label === "Orang Tua" && (
            <>
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
      </Edit>
    </CanAccess>
  );
};
