"use client";
import React, { useState } from "react";
import { Create, useForm } from "@refinedev/antd";
import {
  Form,
  Input,
  DatePicker,
  Divider,
  notification,
  Select,
  Checkbox,
  Modal,
  Progress,
  Space,
} from "antd";
import dayjs from "dayjs";
import { SelectProps } from "antd/lib";
import { useApiUrl, useCustom, useSelect } from "@refinedev/core";
import axios from "axios";

// WhatsApp Service
const WhatsAppService = {
  async sendMessage(data: Record<string, any>) {
    try {
      // Convert data to proper format
      const formData = new URLSearchParams();

      // Ensure all required fields are present and not empty
      if (!data.target || !data.message) {
        throw new Error("Missing required fields: target or message");
      }

      // Add required fields
      formData.append("target", data.target);
      formData.append("message", data.message);

      // Add optional fields if present
      if (data.countryCode) {
        formData.append("countryCode", data.countryCode);
      }

      // Handle scheduling if present
      if (data.schedule && data.schedule !== "0") {
        // Convert to Unix timestamp (seconds since epoch)
        const scheduleTimestamp = Math.floor(
          dayjs(data.schedule).valueOf() / 1000
        );
        formData.append("schedule", scheduleTimestamp.toString());

        // Set delay (in seconds) if provided, otherwise default to 0
        formData.append("delay", data.delay || "0");
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

      if (!response.data || !response.data.status) {
        throw new Error(
          `API Fonnte error: ${response.data?.reason || "Unknown error"}`
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("WhatsApp send error:", error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  },

  // Method for sending immediate messages
  async sendImmediateMessage(phone: string, message: string) {
    return this.sendMessage({
      target: phone,
      message: message,
      countryCode: "62",
      delay: 5,
    });
  },
};

export const StudentCallsCreate = () => {
  const { formProps, saveButtonProps, onFinish } = useForm();
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
    phone_mobile: string;
  }

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const [messageStatus, setMessageStatus] = useState<
    "sending" | "success" | "error" | null
  >(null);

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
          phone_mobile: student.phone_mobile,
        }))
      : [];

  const handleClassChange = (value: string) => {
    setSelectedClassId(value);
    // Reset student selection when class changes
    formProps.form?.setFieldsValue({ student_id: undefined });
    setSelectedStudent(null);
  };

  const handleStudentChange = (value: string) => {
    const student = students.find((s) => s.student_id === value);
    if (student) {
      setSelectedStudent(student);
    } else {
      setSelectedStudent(null);
    }
  };

  // Fix TypeScript issue by creating a properly typed merge of props
  const classSelectMergedProps: SelectProps = {
    options: classSelectProps,
    onChange: (value: any) => {
      handleClassChange(value);
    },
    placeholder: "Pilih Kelas",
  };

  // Format date in the correct format expected by the backend
  const handleDateChange = (date: any) => {
    if (date) {
      // Format to 'yyyy-MM-dd HH:mm:ss' as expected by the backend
      const formattedDate = date.format("YYYY-MM-DD HH:mm:ss");
      formProps.form?.setFieldsValue({ date: formattedDate });
    } else {
      formProps.form?.setFieldsValue({ date: null });
    }
  };

  // Send WhatsApp message to the student
  const sendWhatsAppMessage = async (student: Student, callDetails: any) => {
    if (!student.phone_mobile) {
      notification.error({
        message: "Error",
        description: "Nomor telepon siswa tidak ditemukan",
      });
      return false;
    }

    try {
      setMessageModalVisible(true);
      setMessageStatus("sending");

      const formattedDate = dayjs(callDetails.date).format("DD MMM YYYY HH:mm");
      const message = `Halo ${student.name},\n\nAnda memiliki panggilan sekolah pada ${formattedDate}.\n\nInformasi: ${callDetails.text}\n\nTerima kasih.`;

      const result = await WhatsAppService.sendImmediateMessage(
        student.phone_mobile,
        message
      );

      setMessageStatus("success");
      notification.success({
        message: "Berhasil",
        description: "Pesan WhatsApp berhasil dikirim ke siswa",
      });
      return true;
    } catch (error: any) {
      setMessageStatus("error");
      notification.error({
        message: "Gagal",
        description: `Gagal mengirim pesan WhatsApp: ${error.message}`,
      });
      return false;
    }
  };

  // Handle form submission with WhatsApp integration
  const handleFormSubmit = async (values: any) => {
    try {
      // First, submit the form to create the student call
      const response = await onFinish?.(values);

      // Then, if WhatsApp messaging is enabled and submission was successful, send the message
      if (response && sendWhatsApp && selectedStudent) {
        await sendWhatsAppMessage(selectedStudent, values);
      }

      return response;
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to create student call or send WhatsApp message",
      });
    }
  };

  return (
    <Create
      saveButtonProps={{
        ...saveButtonProps,
        onClick: () => {
          formProps.form?.submit();
        },
      }}
    >
      <Form {...formProps} layout="vertical" onFinish={handleFormSubmit}>
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
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            onChange={handleStudentChange}
          />
        </Form.Item>
        <Divider />
        <Form.Item
          label="Text"
          name={["text"]}
          rules={[
            {
              required: true,
              message: "Text wajib diisi",
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Masukkan informasi panggilan siswa"
          />
        </Form.Item>
        <Form.Item
          label="Jadwal atau Tanggal"
          name={["date"]}
          rules={[
            {
              required: true,
              message: "Jadwal wajib diisi",
            },
          ]}
          getValueProps={(value) => ({
            value: value ? dayjs(value) : undefined,
          })}
        >
          <DatePicker
            placeholder="Pilih Tanggal dan Waktu Kunjungan"
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            onChange={(date) => handleDateChange(date)}
          />
        </Form.Item>

        <Form.Item>
          <Checkbox
            checked={sendWhatsApp}
            onChange={(e) => setSendWhatsApp(e.target.checked)}
          >
            Kirim pesan WhatsApp ke siswa
          </Checkbox>
        </Form.Item>

        {/* WhatsApp Message Status Modal */}
        <Modal
          title="Status Pengiriman WhatsApp"
          open={isMessageModalVisible}
          onOk={() => setMessageModalVisible(false)}
          onCancel={() => setMessageModalVisible(false)}
          footer={[
            <button
              key="ok"
              onClick={() => setMessageModalVisible(false)}
              className="ant-btn ant-btn-primary"
            >
              OK
            </button>,
          ]}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {messageStatus === "sending" && (
              <>
                <Progress percent={50} status="active" />
                <p>Mengirim pesan WhatsApp ke siswa...</p>
              </>
            )}
            {messageStatus === "success" && (
              <>
                <Progress percent={100} status="success" />
                <p>Pesan WhatsApp berhasil dikirim!</p>
              </>
            )}
            {messageStatus === "error" && (
              <>
                <Progress percent={100} status="exception" />
                <p>Gagal mengirim pesan WhatsApp. Silakan coba lagi nanti.</p>
              </>
            )}
          </Space>
        </Modal>
      </Form>
    </Create>
  );
};
