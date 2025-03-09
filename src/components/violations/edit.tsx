"use client";

import React, { useState, useEffect } from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, notification, SelectProps, Divider } from "antd";
import { useApiUrl, useCustom } from "@refinedev/core";

export const ViolationsEdit = () => {
  const { formProps, saveButtonProps, query } = useForm({
    meta: {
      fields: [
        "id",
        "name",
        "description",
        "action_taken",
        "regulation_id",
        "class_id",
        "student_id",
      ],
    },
  });

  const data = query?.data?.data;
  const apiUrl = useApiUrl();

  // Ekstrak nilai awal dari data
  const initialClassId =
    data?.studentClass?.classId ||
    data?.studentClass?.class?.id ||
    data?.class_id;

  const initialStudentId =
    data?.studentClass?.user?.student?.id || data?.student_id;

  // State untuk mengelola kelas dan siswa
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);

  // Select untuk regulations
  const { selectProps: regulationSelectProps } = useSelect({
    resource: "regulations?type=Pelanggaran",
    optionLabel: "name",
  });

  // Select untuk classes
  const { selectProps: classSelectProps } = useSelect({
    resource: "classes",
    optionLabel: "classname",
    optionValue: "id",
  });

  // Atur data form saat query selesai
  useEffect(() => {
    if (data && formProps.form) {
      // Konversi data ke snake_case
      const formData = {
        name: data.name,
        description: data.description,
        action_taken: data.actionTaken,
        regulation_id: data.regulationId,
        class_id: initialClassId,
        // Student ID akan diatur setelah daftar siswa dimuat
      };

      formProps.form.setFieldsValue(formData);
      setSelectedClassId(initialClassId);
    }
  }, [data, formProps.form]);

  // Fetch daftar siswa ketika kelas dipilih
  const { isLoading: isLoadingStudents } = useCustom({
    url: selectedClassId ? `${apiUrl}/classes/${selectedClassId}/students` : "",
    method: "get",
    queryOptions: {
      enabled: !!selectedClassId,
      onSuccess: (response) => {
        let studentData = [];

        if (response.data && Array.isArray(response.data)) {
          studentData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          studentData = response.data.data;
        }

        setStudents(studentData);

        // Jika ini adalah load awal dan ada initialStudentId, set nilai student_id
        if (initialStudentId && selectedClassId === initialClassId) {
          setTimeout(() => {
            formProps.form?.setFieldsValue({ student_id: initialStudentId });
          }, 100);
        }
      },
      onError: (error) => {
        notification.error({
          message: "Error",
          description: "Failed to fetch students for this class",
        });
        setStudents([]);
      },
    },
  });

  // Opsi untuk dropdown siswa
  const studentOptions = students.map((student) => ({
    label: `${student.name} (${student.nis || "No NIS"})`,
    value: student.student_id || student.id,
  }));

  // Handler untuk perubahan kelas
  const handleClassChange = (value: number) => {
    setSelectedClassId(value);
    // Reset student_id saat kelas berubah
    formProps.form?.setFieldsValue({ student_id: undefined });
  };

  // Props untuk komponen Select kelas
  const classSelectMergedProps = {
    ...classSelectProps,
    onChange: (value: any) => {
      if (classSelectProps.onChange) {
        classSelectProps.onChange(value);
      }
      handleClassChange(value);
    },
    placeholder: "Pilih Kelas",
  };

  return (
    <Edit saveButtonProps={saveButtonProps} mutationMode="pessimistic">
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Kelas"
          name="class_id"
          rules={[{ required: true, message: "Kelas is required" }]}
        >
          <Select {...classSelectMergedProps} />
        </Form.Item>

        <Form.Item
          label="Siswa"
          name="student_id"
          rules={[{ required: true, message: "Siswa is required" }]}
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
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Divider />

        <Form.Item
          label="Regulation"
          name="regulation_id"
          rules={[{ required: true }]}
        >
          <Select {...regulationSelectProps} />
        </Form.Item>

        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Action Taken"
          name="action_taken"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
};
