"use client";

import React, { useState } from "react";
import { Create, useForm, getValueFromEvent, useSelect } from "@refinedev/antd";
import {
  Form,
  Input,
  DatePicker,
  Select,
  Divider,
  notification,
  Modal,
  Spin,
} from "antd";
import dayjs from "dayjs";
import {
  CanAccess,
  useApiUrl,
  useCustom,
  useGetIdentity,
  useCreate,
  useNavigation,
} from "@refinedev/core";
import { SelectProps } from "antd/lib";
import UnauthorizedPage from "@app/unauthorized";
import axios from "axios";

// WhatsApp Service for frontend - Fixed to properly handle scheduled messages
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

      // Handle scheduling differently - Fonnte API requires specific format
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

  // New method specifically for sending immediate messages
  async sendImmediateMessage(phone: string, message: string) {
    return this.sendMessage({
      target: phone,
      message: message,
      countryCode: "62",
      delay: 5,
    });
  },

  // New method specifically for scheduling messages
  async scheduleMessage(phone: string, message: string, scheduleTime: string) {
    return this.sendMessage({
      target: phone,
      message: message,
      schedule: scheduleTime,
      countryCode: "62",
      delay: 5,
    });
  },
};
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
  address: string;
  phone?: string; // Added phone field for parents
  phoneMobile?: string; // Alternative phone field
}

interface StudentParent {
  id: string;
  studentXUserId: string;
  parentXUserId: string;
  parent: Parent;
  student: Student;
}

export const HomeVisitsCreate = () => {
  const { TextArea } = Input;
  const { list } = useNavigation();
  const { formProps, saveButtonProps } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageModal, setMessageModal] = useState<boolean>(false);
  const [messageProgress, setMessageProgress] = useState({
    total: 0,
    sent: 0,
    failed: 0,
  });

  const { data: user, isLoading } = useGetIdentity<{
    id: string;
    username: string;
    profileType: string;
    createdAt: string;
    updatedAt: string;
    teacher?: any;
  }>();

  const teacherPhone = user?.teacher?.phone || user?.teacher?.phoneMobile || ""; // Nomor telepon guru untuk koordinasi
  const teacherName = user?.teacher?.name || ""; // Nama guru untuk pengingat

  const apiUrl = useApiUrl();

  // Gunakan hook mutasi create
  const { mutate: createHomeVisit } = useCreate();

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
  const [selectedStudentData, setSelectedStudentData] =
    useState<Student | null>(null);
  const [studentParents, setStudentParents] = useState<StudentParent[]>([]);
  const [sendRemindersNow, setSendRemindersNow] = useState<boolean>(false);

  // Ambil daftar siswa ketika kelas dipilih
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
            message: "Kesalahan",
            description: "Format respons dari server tidak sesuai",
          });
        }
      },
      onError: (error) => {
        notification.error({
          message:
            "Kesalahan: " + (error.message || "Kesalahan tidak diketahui"),
          description: "Gagal mengambil data siswa untuk kelas ini",
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

  // Buat opsi siswa yang aman
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
    setSelectedStudentData(null);
    formProps.form?.setFieldsValue({ student_id: undefined });
  };

  const handleStudentChange = (value: string) => {
    setSelectedStudentId(value);
    const student = students.find((s) => s.student_id === value) || null;
    setSelectedStudentData(student);
  };

  // Tambahkan fungsi ini setelah handleStudentChange
  const handleParentChange = (value: string) => {
    const selectedParent = studentParents.find((p) => p.parent.id === value);
    if (selectedParent && selectedParent.parent.address) {
      // Isi alamat dengan alamat orang tua yang dipilih
      formProps.form?.setFieldsValue({
        address: selectedParent.parent.address,
      });
    }
  };

  const classSelectMergedProps = {
    ...classSelectProps,
    onChange: (value: any) => {
      handleClassChange(value);
    },
    placeholder: "Pilih Kelas",
  };

  const calculateReminderTime = (visitTime: string | Date) => {
    const visitDate = dayjs(visitTime);
    const reminderDate = visitDate.subtract(30, "minute");
    return reminderDate.format("YYYY-MM-DD HH:mm:ss");
  };

  // Function to get parent phone numbers
  const getParentPhones = () => {
    return studentParents
      .map((p) => p.parent.phone || p.parent.phoneMobile)
      .filter((phone): phone is string =>
        Boolean(phone && phone.trim() !== "")
      );
  };

  const sendWhatsAppReminders = async (
    studentName: string,
    address: string,
    visitTime: string | Date,
    homeVisitId: string | number
  ) => {
    // Get parents with valid phone numbers
    const parentPhones = getParentPhones();
    const totalRecipients = 1 + parentPhones.length; // Teacher + parents

    setMessageModal(true);
    setMessageProgress({
      total: totalRecipients,
      sent: 0,
      failed: 0,
    });

    const detailUrl = `${window.location.origin}/home-visits/show/${homeVisitId}`;
    const results = [];
    let allSuccess = true;

    const formattedVisitTime = dayjs(visitTime).format("DD/MM/YYYY HH:mm");

    const useScheduledMessages =
      !sendRemindersNow && dayjs(visitTime).isAfter(dayjs().add(30, "minute"));

    const reminderTime = useScheduledMessages
      ? calculateReminderTime(visitTime)
      : null;

    // 1. Kirim pesan ke guru
    if (teacherPhone) {
      try {
        const teacherMessage = `Halo Guru ${teacherName} \n\n Pengingat: Anda memiliki jadwal kunjungan rumah untuk siswa ${studentName} pada ${formattedVisitTime}.\n\nAlamat: ${address}\n\nUntuk detail lengkap: ${detailUrl}`;

        let teacherResult;

        if (useScheduledMessages && reminderTime) {
          teacherResult = await WhatsAppService.scheduleMessage(
            teacherPhone,
            teacherMessage,
            reminderTime
          );
        } else {
          teacherResult = await WhatsAppService.sendImmediateMessage(
            teacherPhone,
            teacherMessage
          );
        }

        results.push({
          success: true,
          recipient: "Guru",
          result: teacherResult,
        });
        setMessageProgress((prev) => ({
          ...prev,
          sent: prev.sent + 1,
        }));
      } catch (error: any) {
        results.push({
          success: false,
          recipient: "Guru",
          error: error.message,
        });
        notification.error({
          message: "Gagal mengirim pengingat kepada guru",
          description: `Error: ${error.message}`,
        });
        setMessageProgress((prev) => ({
          ...prev,
          failed: prev.failed + 1,
        }));
        allSuccess = false;
      }
    } else {
      notification.warning({
        message: "Peringatan",
        description:
          "Nomor telepon guru tidak ditemukan untuk mengirim pengingat",
      });
      setMessageProgress((prev) => ({
        ...prev,
        failed: prev.failed + 1,
      }));
      allSuccess = false;
    }

    // 2. Kirim pesan ke orang tua siswa
    for (const parentPhone of parentPhones) {
      try {
        const parentMessage = `Kepada Yth. Orang Tua/Wali Siswa ${studentName}\n\nDengan hormat, kami informasikan bahwa guru kami akan melakukan kunjungan rumah pada:\n\nTanggal/Waktu: ${formattedVisitTime}\nAlamat: ${address}\n\nBapak/Ibu dimohon untuk *Menyetujui* jika berkenan atau *Menolak* jika ada kendala kunjungan rumah di link detail lengkap kunjugan berikut:\n${detailUrl}. \n\nMohon kehadiran Bapak/Ibu pada waktu tersebut. Terima kasih.`;

        let parentResult;

        if (useScheduledMessages && reminderTime) {
          parentResult = await WhatsAppService.scheduleMessage(
            parentPhone,
            parentMessage,
            reminderTime
          );
        } else {
          parentResult = await WhatsAppService.sendImmediateMessage(
            parentPhone,
            parentMessage
          );
        }

        results.push({
          success: true,
          recipient: "Orang Tua",
          result: parentResult,
        });
        setMessageProgress((prev) => ({
          ...prev,
          sent: prev.sent + 1,
        }));
      } catch (error: any) {
        results.push({
          success: false,
          recipient: "Orang Tua",
          error: error.message,
        });
        notification.error({
          message: "Gagal mengirim pengingat kepada orang tua",
          description: `Error: ${error.message}`,
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

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      if (!selectedStudentData) {
        notification.error({
          message: "Kesalahan",
          description: "Siswa yang dipilih tidak ditemukan",
        });
        setIsSubmitting(false);
        return;
      }

      const formattedValues = {
        ...values,
        date: values.date
          ? dayjs(values.date).format("YYYY-MM-DD HH:mm:ss")
          : undefined,
      };

      const isVisitSoon = dayjs(formattedValues.date).isBefore(
        dayjs().add(30, "minute")
      );

      if (isVisitSoon) {
        setSendRemindersNow(true);
      }

      createHomeVisit(
        {
          resource: "home-visits",
          values: formattedValues,
        },
        {
          onSuccess: async (response) => {
            let homeVisitId;

            if (response?.data?.data?.id) {
              homeVisitId = response.data.data.id;
            } else if (response?.data?.id) {
              homeVisitId = response.data.id;
            } else {
              homeVisitId = "new";
              console.warn(
                "Tidak dapat mengambil ID kunjungan rumah dari respons:",
                response
              );
            }

            const reminderType = isVisitSoon ? "Segera" : "Terjadwal";
            const parentPhones = getParentPhones();
            const hasParentPhones = parentPhones.length > 0;

            notification.info({
              message: `Menyiapkan pengingat WhatsApp (${reminderType})`,
              description: isVisitSoon
                ? `Kunjungan akan segera dilaksanakan, pengingat akan dikirimkan langsung ke Guru ${teacherName}${
                    hasParentPhones ? " dan Orang Tua siswa" : ""
                  }.`
                : `Pengingat akan dikirim 30 menit sebelum jadwal kunjungan ke Guru ${teacherName}${
                    hasParentPhones ? " dan Orang Tua siswa" : ""
                  }.`,
              duration: 5,
            });

            try {
              const messageResults = await sendWhatsAppReminders(
                selectedStudentData.name,
                formattedValues.address,
                formattedValues.date,
                homeVisitId
              );

              setTimeout(() => {
                setMessageModal(false);

                if (messageResults.success) {
                  notification.success({
                    message: "Berhasil",
                    description: isVisitSoon
                      ? `Kunjungan rumah berhasil dijadwalkan dan pengingat WhatsApp berhasil dikirim ke Guru ${teacherName}${
                          hasParentPhones ? " dan Orang Tua siswa" : ""
                        }.`
                      : `Kunjungan rumah berhasil dijadwalkan dan pengingat WhatsApp ke Guru ${teacherName}${
                          hasParentPhones ? " dan Orang Tua siswa" : ""
                        } akan dikirim 30 menit sebelum kunjungan.`,
                  });
                } else {
                  notification.warning({
                    message: "Sebagian Berhasil",
                    description:
                      "Kunjungan rumah berhasil dijadwalkan, tetapi beberapa pengingat WhatsApp tidak dapat dikirim.",
                  });
                }

                setIsSubmitting(false);
                list("home-visits");
              }, 1000);
            } catch (error: any) {
              setMessageModal(false);
              notification.warning({
                message: "Sebagian Berhasil",
                description: `Kunjungan rumah berhasil dijadwalkan tetapi pengaturan pengingat WhatsApp gagal: ${error.message}`,
              });
              setIsSubmitting(false);
              list("home-visits");
            }
          },
          onError: (error) => {
            notification.error({
              message: "Kesalahan",
              description: `Gagal menjadwalkan kunjungan rumah: ${error.message}`,
            });
            setIsSubmitting(false);
          },
        }
      );
    } catch (error: any) {
      notification.error({
        message: "Kesalahan",
        description: `Gagal memproses: ${error.message}`,
      });
      setIsSubmitting(false);
      setMessageModal(false);
    }
  };

  return (
    <CanAccess
      resource="home-visits"
      action="create"
      fallback={<UnauthorizedPage />}
    >
      <Create
        saveButtonProps={{
          ...saveButtonProps,
          onClick: () => formProps.form?.submit(),
          loading: isSubmitting,
          disabled: isSubmitting,
        }}
      >
        <Form {...formProps} layout="vertical" onFinish={handleSubmit}>
          <h1>Jadwalkan Kunjungan Rumah</h1>
          <Form.Item
            label="Kelas"
            name={["class_id"]}
            rules={[
              {
                required: true,
                message: "Kelas wajib diisi",
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
              onChange={handleStudentChange}
            />
          </Form.Item>
          <Divider />
          <Form.Item
            label="Jadwal Kunjungan Rumah"
            name={["date"]}
            rules={[
              {
                required: true,
                message: "Jadwal kunjungan wajib diisi",
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
              type="datetime"
              onChange={(date, dateString) => {
                const isoDate = date ? date.toISOString() : null;
                formProps.form?.setFieldsValue({ date: isoDate });

                if (date) {
                  const isVisitSoon = date.isBefore(dayjs().add(30, "minute"));
                  setSendRemindersNow(isVisitSoon);

                  if (isVisitSoon) {
                    const parentPhones = getParentPhones();
                    const hasParentPhones = parentPhones.length > 0;

                    notification.info({
                      message: "Kunjungan segera",
                      description: `Karena kunjungan dijadwalkan dalam waktu 30 menit, pengingat kunjungan akan dikirim segera ke Whatsapp Guru ${teacherName}${
                        hasParentPhones ? " dan Orang Tua siswa" : ""
                      }.`,
                      duration: 5,
                    });
                  }
                }
              }}
            />
          </Form.Item>
          {selectedStudentId && studentParents.length > 0 && (
            <>
              <Form.Item
                label="Pilih Alamat Dari"
                name={["parent_id"]}
                help="Pilih orang tua untuk menggunakan alamatnya sebagai basis. Alamat tetap dapat diubah setelah dipilih."
              >
                <Select
                  loading={isLoadingParents}
                  disabled={!selectedStudentId || isLoadingParents}
                  placeholder="Pilih orang tua"
                  options={studentParents.map((sp) => ({
                    label: `${sp.parent.name} (${sp.parent.type})${
                      sp.parent.phone || sp.parent.phoneMobile
                        ? " - Memiliki nomor WA"
                        : ""
                    }`,
                    value: sp.parent.id,
                  }))}
                  onChange={handleParentChange}
                  allowClear
                />
              </Form.Item>
              <Form.Item
                label="Alamat Kunjungan"
                name={["address"]}
                rules={[
                  {
                    required: true,
                    message: "Alamat kunjungan wajib diisi",
                  },
                ]}
                help="Alamat dapat diubah sesuai kebutuhan kunjungan"
              >
                <TextArea
                  rows={4}
                  placeholder="Tulis Alamat Kunjungan rumah yang akan dituju"
                />
              </Form.Item>
            </>
          )}
          <Modal
            title="Memproses Notifikasi WhatsApp"
            open={messageModal}
            footer={null}
            closable={false}
          >
            <div style={{ textAlign: "center" }}>
              <p>
                {sendRemindersNow ? "Mengirim" : "Menjadwalkan"} notifikasi:{" "}
                {messageProgress.sent + messageProgress.failed}/
                {messageProgress.total}
              </p>
              <p>Berhasil: {messageProgress.sent}</p>
              <p>Gagal: {messageProgress.failed}</p>
              <p>
                {sendRemindersNow
                  ? "Mengirim pengingat segera karena kunjungan dijadwalkan dalam waktu dekat."
                  : "Pengingat akan dikirim 30 menit sebelum jadwal kunjungan."}
              </p>
              <Spin />
            </div>
          </Modal>
        </Form>
      </Create>
    </CanAccess>
  );
};
