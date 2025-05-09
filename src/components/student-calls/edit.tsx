"use client";

import React, { useEffect, useState } from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, DatePicker, notification, Divider, Select } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useApiUrl, useCustom } from "@refinedev/core";

// Add dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export const StudentCallsEdit = () => {
  const { formProps, saveButtonProps, query } = useForm();

  const data = query?.data?.data;
  const apiUrl = useApiUrl();

  // Ekstrak nilai awal dari data
  const initialClassId =
    data?.studentClasses?.classId ||
    data?.studentClasses?.class?.id ||
    data?.class_id;

  const initialStudentId =
    data?.studentClasses?.user?.student?.id || data?.student_id;

  // State untuk mengelola kelas dan siswa
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);

  // Select untuk classes
  const { selectProps: classSelectProps } = useSelect({
    resource: "classes",
    optionLabel: "classname",
    optionValue: "id",
  });

  // Atur data form saat query selesai
  useEffect(() => {
    if (data && formProps.form) {
      // Parse the date from the backend to a dayjs object
      let dateValue = null;
      if (data.date) {
        try {
          // CRITICAL FIX: Subtract 7 hours to compensate for Jakarta timezone
          // First parse the date as-is
          const originalDate = dayjs(data.date);

          // Check if it's a valid date
          if (originalDate.isValid()) {
            // Subtract 7 hours to compensate for the Jakarta timezone shift
            dateValue = originalDate.subtract(7, "hour");
          }
        } catch (error) {
          console.error("Failed to parse date:", error);
        }
      }

      // Konversi data ke format form
      const formData = {
        class_id: initialClassId,
        text: data.text,
        date: dateValue,
      };

      formProps.form.setFieldsValue(formData);
      setSelectedClassId(initialClassId);
    }
  }, [data, formProps.form, initialClassId]);

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

  // Custom form submission to handle timezone properly
  const onFinish = async (values: any) => {
    // Make a copy of values to avoid mutating the original
    const submitValues = { ...values };

    // Handle date properly for submission
    if (submitValues.date && dayjs.isDayjs(submitValues.date)) {
      // No need to add hours back - just format as expected by the backend
      submitValues.date = submitValues.date.format("YYYY-MM-DD HH:mm:ss");
    }

    // Use the original form onFinish handler
    return formProps.onFinish?.(submitValues);
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" onFinish={onFinish}>
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
          label="Text"
          name="text"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Jadwal atau Tanggal"
          name="date"
          rules={[
            {
              required: true,
              message: "Jadwal wajib diisi",
            },
          ]}
          getValueProps={(value) => {
            if (value) {
              if (dayjs.isDayjs(value)) {
                return { value };
              }
              return { value: dayjs(value) };
            }
            return { value: undefined };
          }}
        >
          <DatePicker
            placeholder="Pilih Tanggal dan Waktu Kunjungan"
            showTime
            format="YYYY-MM-DD HH:mm:ss"
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};
