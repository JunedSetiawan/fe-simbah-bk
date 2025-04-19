"use client";

import React, { useState } from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  notification,
  Divider,
  Alert,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { CanAccess, useApiUrl, useCustom } from "@refinedev/core";
import type { UploadFile } from "antd/lib";
import UnauthorizedPage from "@app/unauthorized";

export const AwardsCreate = () => {
  const { TextArea } = Input;
  const apiUrl = useApiUrl();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);

  // Use custom onFinish handler to properly submit the form data
  const { formProps, saveButtonProps } = useForm({
    action: "create",
    resource: "awards",
  });

  const { selectProps: regulationSelectProps } = useSelect({
    resource: "regulations?type=Penghargaan",
    optionLabel: "name",
  });

  const { selectProps: classSelectProps } = useSelect({
    resource: "classes",
    optionLabel: "classname",
    optionValue: "id",
  });

  const { isLoading: isLoadingStudents } = useCustom({
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
          message: "Error",
          description: "Failed to fetch students for this class",
        });
        setStudents([]);
      },
    },
  });

  const studentOptions = students.map((student) => ({
    label: `${student.name} (${student.nis})`,
    value: student.student_id,
  }));

  const handleClassChange = (value: string) => {
    setSelectedClassId(value);
    formProps.form?.setFieldsValue({ student_id: undefined });
  };

  const handleFileChange = ({ fileList }: any) => {
    setFileList(fileList);
  };

  const classSelectMergedProps = {
    ...classSelectProps,
    onChange: (value: any) => {
      handleClassChange(value);
    },
    placeholder: "Pilih Kelas",
  };

  const onFinish = async (values: any) => {
    const formData = new FormData();

    // Add all form values to FormData
    formData.append("student_id", values.student_id);
    formData.append("class_id", values.class_id);
    formData.append("regulation_id", values.regulation_id);
    formData.append("description", values.description);

    // The backend will set proposed_by to the current user

    // Handle file upload
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("evidence", fileList[0].originFileObj);
    }
    return formProps.onFinish?.(formData);
  };

  return (
    <CanAccess
      resource="awards"
      action="create"
      fallback={<UnauthorizedPage />}
    >
      <Create saveButtonProps={saveButtonProps}>
        <Alert
          message={<strong>Perhatian</strong>}
          description={
            <span>
              Sebelum Menyelesaikan Kunjugan Rumah, pastikan semua informasi
              yang diisi sudah benar.
              <br />
              Untuk Upload Bukti Penghargaan, pastikan untuk TIDAK upload foto
              yang <strong> SENSITIF </strong>
            </span>
          }
          type="warning"
          showIcon
        />

        <Divider />
        <Form {...formProps} onFinish={onFinish} layout="vertical">
          <h1>Pilih Siswa</h1>
          <Form.Item
            label="Kelas"
            name="class_id"
            rules={[{ required: true, message: "Kelas is required" }]}
          >
            <Select {...classSelectMergedProps} placeholder="Pilih Kelas" />
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
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Divider />

          <Form.Item
            label="Nama Penghargaan Ketertiban"
            name="regulation_id"
            rules={[{ required: true, message: "Penghargaan is required" }]}
          >
            <Select
              {...regulationSelectProps}
              placeholder="Pilih Nama Penghargaan"
            />
          </Form.Item>

          <Form.Item
            label="Deskripsi"
            name="description"
            rules={[{ required: true, message: "Deskripsi is required" }]}
          >
            <TextArea rows={4} placeholder="Masukkan deskripsi penghargaan" />
          </Form.Item>

          <Form.Item
            name="evidence"
            label="Bukti Penghargaan"
            rules={[{ required: true, message: "Bukti is required" }]}
            getValueProps={(value) => ({
              fileList: fileList.length ? fileList : [],
            })}
          >
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={() => false} // Prevent auto upload
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png"
            >
              <Button icon={<UploadOutlined />}>Upload Foto Dokumentasi</Button>
            </Upload>
          </Form.Item>

          <div
            style={{
              color: "#8c8c8c",
              fontSize: "12px",
              marginTop: "-20px",
            }}
          >
            Format: JPG, JPEG, PNG. Ukuran max: 2MB
          </div>
        </Form>
      </Create>
    </CanAccess>
  );
};
