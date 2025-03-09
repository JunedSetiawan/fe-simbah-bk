"use client";

import React, { useState } from "react";
import { Create, useForm, useSelect } from "@refinedev/antd";
import {
  Form,
  Input,
  Select,
  Button,
  Divider,
  notification,
  Spin,
  Modal,
} from "antd";
import {
  useApiUrl,
  useCustom,
  useCreate,
  useNavigation,
} from "@refinedev/core";
import { SelectProps } from "antd/lib";
import axios from "axios";

// Define interfaces
interface Student {
  user_id: string;
  student_id: string;
  name: string;
  nis: string;
  nisn: string;
}

interface Parent {
  id: string;
  userId: string;
  type: string;
  name: string;
  phone: string;
  phoneMobile: string;
}

interface StudentParent {
  id: string;
  studentXUserId: string;
  parentXUserId: string;
  parent: Parent;
  student: Student;
}

// WhatsApp Service for frontend
const WhatsAppService = {
  async sendMessage(data: Record<string, any>) {
    try {
      const formData = new URLSearchParams();
      for (const key in data) {
        formData.append(key, data[key]);
      }

      const response = await axios.post(
        "https://api.fonnte.com/send",
        formData,
        {
          headers: {
            Authorization: process.env.NEXT_PUBLIC_TOKEN_FONNTE_API,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!response.data.status) {
        throw new Error(`API Fonnte error: ${response.data.reason}`);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  },
};

export const ViolationsCreate = () => {
  const { list } = useNavigation();
  const { formProps, saveButtonProps } = useForm();
  const apiUrl = useApiUrl();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageProgress, setMessageProgress] = useState<{
    total: number;
    sent: number;
    failed: number;
  }>({ total: 0, sent: 0, failed: 0 });
  const [messageModal, setMessageModal] = useState<boolean>(false);

  // Use create mutation hook
  const { mutate: createViolation } = useCreate();

  // Regulation select
  const { selectProps: regulationSelectProps } = useSelect({
    resource: "regulations?type=Pelanggaran",
    optionLabel: "name",
  });

  // Class select
  const { selectProps: classSelectProps } = useSelect({
    resource: "classes",
    optionLabel: "classname",
    optionValue: "id",
  });

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [studentParents, setStudentParents] = useState<StudentParent[]>([]);

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

  // Fetch parents when student is selected
  const { isLoading: isLoadingParents } = useCustom<{ data: StudentParent[] }>({
    url: selectedStudentId
      ? `${apiUrl}/students/${selectedStudentId}/parents`
      : "",
    method: "get",
    queryOptions: {
      enabled: !!selectedStudentId,
      onSuccess: (response) => {
        if (response.data && Array.isArray(response.data)) {
          setStudentParents(response.data);
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          setStudentParents(response.data.data);
        } else {
          setStudentParents([]);
          notification.error({
            message: "Error",
            description: "Unexpected response format from the server",
          });
        }
      },
      onError: (error) => {
        notification.error({
          message: "Error: " + (error.message || "Unknown error"),
          description: "Failed to fetch parents for this student",
        });
        setStudentParents([]);
      },
    },
  });

  // Create student options
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

  const handleClassChange = (value: string) => {
    setSelectedClassId(value);
    setSelectedStudentId(null);
    formProps.form?.setFieldsValue({ student_id: undefined });
    setStudentParents([]);
  };

  const handleStudentChange = (value: string) => {
    setSelectedStudentId(value);
  };

  // Merge class select props
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

  // Send WhatsApp messages to all parents
  const sendWhatsAppMessages = async (
    studentName: string,
    description: string,
    violationId: string | number
  ) => {
    setMessageModal(true);
    setMessageProgress({
      total: studentParents.length,
      sent: 0,
      failed: 0,
    });

    const detailUrl = `${window.location.origin}/violations/show/${violationId}`;
    const results = [];
    let allSuccess = true;

    for (const studentParent of studentParents) {
      const parent = studentParent.parent;
      const phone = parent.phone || parent.phoneMobile;

      if (!phone) {
        notification.warning({
          message: "Warning",
          description: `No phone number found for parent ${parent.name}`,
        });
        setMessageProgress((prev) => ({
          ...prev,
          failed: prev.failed + 1,
        }));
        allSuccess = false;
        continue;
      }

      try {
        const message = `Wali Murid dari siswa (${studentName}) telah melakukan pelanggaran.\n\nDetail pelanggaran: ${description}.\n\nUntuk informasi lebih lanjut, silakan kunjungi: \n${detailUrl}`;

        const result = await WhatsAppService.sendMessage({
          target: phone,
          message: message,
          schedule: "0",
          delay: "2",
          countryCode: "62",
        });

        results.push({ success: true, parent: parent.name, result });
        setMessageProgress((prev) => ({
          ...prev,
          sent: prev.sent + 1,
        }));
      } catch (error: any) {
        results.push({
          success: false,
          parent: parent.name,
          error: error.message,
        });
        notification.error({
          message: "Failed to send WhatsApp message",
          description: `Error sending message to ${parent.name}: ${error.message}`,
        });
        setMessageProgress((prev) => ({
          ...prev,
          failed: prev.failed + 1,
        }));
        allSuccess = false;
      }
    }

    return { success: allSuccess, results };
  };

  // Custom submit handler
  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      // Find selected student
      const student = students.find((s) => s.student_id === values.student_id);
      if (!student) {
        notification.error({
          message: "Error",
          description: "Selected student not found",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if we have parents
      if (studentParents.length === 0) {
        notification.warning({
          message: "Warning",
          description:
            "No parents found for this student. WhatsApp notifications cannot be sent.",
        });

        // Ask user if they want to proceed without sending notifications
        Modal.confirm({
          title: "No parents found",
          content:
            "Do you want to create the violation record without sending WhatsApp notifications?",
          okText: "Yes, create anyway",
          cancelText: "No, cancel",
          onOk: () => {
            // Create violation without sending messages
            createViolation(
              {
                resource: "violations",
                values: values,
              },
              {
                onSuccess: (response) => {
                  notification.success({
                    message: "Success",
                    description: "Violation created successfully",
                  });
                  setIsSubmitting(false);
                },
                onError: (error) => {
                  notification.error({
                    message: "Error",
                    description: `Failed to create violation: ${error.message}`,
                  });
                  setIsSubmitting(false);
                },
              }
            );
          },
          onCancel: () => {
            setIsSubmitting(false);
          },
        });
        return;
      }

      // First create the violation
      createViolation(
        {
          resource: "violations",
          values: values,
        },
        {
          onSuccess: async (response) => {
            // Extract the violation ID from the response
            let violationId;

            if (response?.data?.data?.id) {
              violationId = response.data.data.id;
            } else if (response?.data?.id) {
              violationId = response.data.id;
            } else {
              // If we can't find the ID in the response, use a fallback
              violationId = "new";
              console.warn(
                "Could not extract violation ID from response:",
                response
              );
            }

            // Then send WhatsApp messages with the correct URL
            try {
              const messageResults = await sendWhatsAppMessages(
                student.name,
                values.description,
                violationId
              );

              setTimeout(() => {
                setMessageModal(false);

                if (messageResults.success) {
                  notification.success({
                    message: "Success",
                    description:
                      "Violation created and WhatsApp messages sent successfully",
                  });
                } else {
                  notification.warning({
                    message: "Partial Success",
                    description:
                      "Violation created but some WhatsApp messages failed to send",
                  });
                }

                setIsSubmitting(false);

                // Redirect to the list page or show page
                list("violations");
              }, 1000);
            } catch (error: any) {
              setMessageModal(false);
              notification.warning({
                message: "Partial Success",
                description: `Violation created but failed to send WhatsApp messages: ${error.message}`,
              });
              setIsSubmitting(false);
            }
          },
          onError: (error) => {
            notification.error({
              message: "Error",
              description: `Failed to create violation: ${error.message}`,
            });
            setIsSubmitting(false);
          },
        }
      );
    } catch (error: any) {
      notification.error({
        message: "Error",
        description: `Failed to process: ${error.message}`,
      });
      setIsSubmitting(false);
      setMessageModal(false);
    }
  };

  return (
    <Create
      saveButtonProps={{
        ...saveButtonProps,
        onClick: () => formProps.form?.submit(),
        loading: isSubmitting,
        disabled: isSubmitting,
      }}
    >
      <Form {...formProps} layout="vertical" onFinish={handleSubmit}>
        <h1>Pilih Siswa</h1>
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
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            onChange={handleStudentChange}
          />
        </Form.Item>

        {selectedStudentId && (
          <div style={{ marginBottom: 16 }}>
            {isLoadingParents ? (
              <Spin size="small" />
            ) : studentParents.length > 0 ? (
              <div>
                <p>Parents found: {studentParents.length}</p>
                <ul>
                  {studentParents.map((sp) => (
                    <li key={sp.id}>
                      {sp.parent.name} ({sp.parent.type}) -
                      {sp.parent.phone ||
                        sp.parent.phoneMobile ||
                        "No phone number"}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p style={{ color: "red" }}>
                Warning: No parents found for this student. WhatsApp
                notifications cannot be sent.
              </p>
            )}
          </div>
        )}

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
          name="action_taken"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Modal
          title="Sending WhatsApp Notifications"
          open={messageModal}
          footer={null}
          closable={false}
        >
          <div style={{ textAlign: "center" }}>
            <p>
              Sending messages to parents:{" "}
              {messageProgress.sent + messageProgress.failed}/
              {messageProgress.total}
            </p>
            <p>Successful: {messageProgress.sent}</p>
            <p>Failed: {messageProgress.failed}</p>
            <Spin />
          </div>
        </Modal>
      </Form>
    </Create>
  );
};
