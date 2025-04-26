"use client";

import React, { useState, useEffect } from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  notification,
  Divider,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { CanAccess, useApiUrl, useCustom } from "@refinedev/core";
import type { UploadFile } from "antd/lib";
import UnauthorizedPage from "@app/unauthorized";

export const AwardsEdit = () => {
  const { TextArea } = Input;
  const apiUrl = useApiUrl();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [currentEvidenceUrl, setCurrentEvidenceUrl] = useState<string | null>(
    null
  );

  const { formProps, saveButtonProps, query } = useForm({
    action: "edit",
    resource: "awards",
    meta: {
      fields: [
        "id",
        "description",
        "regulation_id",
        "class_id",
        "student_id",
        "evidence",
      ],
    },
  });

  const data = query?.data?.data;

  // Extract initial values from data
  const initialClassId =
    data?.studentClass?.classId ||
    data?.studentClass?.class?.id ||
    data?.class_id;

  const initialStudentId =
    data?.studentClass?.user?.student?.id || data?.student_id;

  const { selectProps: regulationSelectProps } = useSelect({
    resource: "regulations?type=Penghargaan",
    optionLabel: "name",
  });

  const { selectProps: classSelectProps } = useSelect({
    resource: "classes",
    optionLabel: "classname",
    optionValue: "id",
  });

  // Set form data when query completes
  useEffect(() => {
    if (data && formProps.form) {
      // Convert data to form format
      const formData = {
        description: data.description,
        regulation_id: data.regulationId,
        class_id: initialClassId,
        evidence: data.evidence,
        // Student ID will be set after students list is loaded
      };

      formProps.form.setFieldsValue(formData);
      setSelectedClassId(initialClassId);

      // Set file list if there's evidence
      if (data.evidence) {
        const evidenceUrl = `${apiUrl}/${data.evidence}`;
        setCurrentEvidenceUrl(evidenceUrl);
        setFileList([
          {
            uid: "-1",
            name: "Gambar Saat ini",
            status: "done",
            url: evidenceUrl,
          },
        ]);
      }
    }
  }, [data, formProps.form, apiUrl, initialClassId]);

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

        // If this is the initial load and there's an initialStudentId, set student_id value
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

  const studentOptions = students.map((student) => ({
    label: `${student.name} (${student.nis || "No NIS"})`,
    value: student.student_id || student.id,
  }));

  const handleClassChange = (value: string) => {
    setSelectedClassId(value);
    // Reset student_id when class changes
    formProps.form?.setFieldsValue({ student_id: undefined });
  };

  const handleFileChange = ({ fileList }: any) => {
    setFileList(fileList);
  };

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

  const onFinish = async (values: any) => {
    const formData = new FormData();

    // Add all form values to FormData
    formData.append("student_id", values.student_id);
    formData.append("class_id", values.class_id);
    formData.append("regulation_id", values.regulation_id);
    formData.append("description", values.description);

    // Handle file upload only if there's a new file
    if (fileList.length > 0) {
      if (fileList[0].originFileObj) {
        // New file uploaded
        formData.append("evidence", fileList[0].originFileObj);
      } else if (currentEvidenceUrl) {
        // We need to download and re-upload the current file
        try {
          const response = await fetch(currentEvidenceUrl);
          const blob = await response.blob();
          const file = new File([blob], "current-evidence.jpg", {
            type: blob.type || "image/jpeg",
          });
          formData.append("evidence", file);
        } catch (error) {
          notification.error({
            message: "Error",
            description: "Failed to process current evidence file",
          });
          return;
        }
      }
    } else {
      notification.error({
        message: "Error",
        description: "Evidence file is required",
      });
      return;
    }

    // Add method to indicate this is an edit with form-data
    formData.append("_method", "PUT");

    return formProps.onFinish?.(formData);
  };

  return (
    <CanAccess resource="awards" action="edit" fallback={<UnauthorizedPage />}>
      <Edit saveButtonProps={saveButtonProps} mutationMode="pessimistic">
        <Form {...formProps} onFinish={onFinish} layout="vertical">
          <h1>Pilih Siswa</h1>
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
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="evidence"
            label="Bukti Penghargaan"
            rules={[
              {
                required: fileList.length === 0,
                message: "Bukti is required",
              },
            ]}
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
              <Button icon={<UploadOutlined />}>
                {fileList.length > 0
                  ? "Ganti Foto Dokumentasi"
                  : "Upload Foto Dokumentasi"}
              </Button>
            </Upload>
          </Form.Item>

          <div
            style={{ color: "#8c8c8c", fontSize: "12px", marginTop: "-20px" }}
          >
            Format: JPG, JPEG, PNG. Ukuran max: 2MB
          </div>
        </Form>
      </Edit>
    </CanAccess>
  );
};
