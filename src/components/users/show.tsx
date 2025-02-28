"use client";

import React from "react";
import { useShow } from "@refinedev/core";
import {
  Show,
  NumberField,
  TagField,
  TextField,
  DateField,
} from "@refinedev/antd";
import {
  Typography,
  Descriptions,
  Card,
  Divider,
  Avatar,
  Row,
  Col,
  Badge,
  Space,
  Tag,
} from "antd";
import {
  UserOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  HomeOutlined,
  TeamOutlined,
  BankOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export const UserShow = () => {
  const { query } = useShow();
  const { data, isLoading } = query;

  const record = data?.data;
  console.log(record);
  const profileType = record?.profileType;

  // Determine badge color based on profile type
  const getBadgeColor = (type: any) => {
    switch (type) {
      case "Guru":
        return "blue";
      case "Siswa":
        return "green";
      case "Orang Tua":
        return "purple";
      default:
        return "default";
    }
  };

  const renderProfileDetails = () => {
    if (!record) return null;

    switch (profileType) {
      case "Guru":
        return (
          <Card
            title={
              <Space>
                <IdcardOutlined /> Informasi Guru
              </Space>
            }
            bordered={false}
            className="custom-card"
          >
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Nama Lengkap">
                {record.teacher?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="NIP">
                {record.teacher?.nip || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Wali Kelas">
                {record.teacherClass?.romanLevel +
                  " " +
                  record.teacherClass?.expertise.shortName +
                  " " +
                  record.teacherClass?.alphabet +
                  "-" +
                  record.teacherClass?.expertise.prody.faculty.schoolYear
                    .year || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tahun Mulai Bekerja">
                {record.teacher?.workSince || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Status Pegawai">
                {record.teacher?.employeeStatus || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tanggal Berhenti">
                {record.teacher?.workStop ? (
                  <DateField
                    value={record.teacher.workStop}
                    format="DD MMM YYYY"
                  />
                ) : (
                  "Masih Aktif"
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        );

      case "Siswa":
        return (
          <Card
            title={
              <Space>
                <BookOutlined /> Informasi Siswa
              </Space>
            }
            bordered={false}
            className="custom-card"
          >
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Nama Lengkap">
                {record.student?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="NISN">
                {record.student?.nisn || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="NIS">
                {record.student?.nis || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Nomor KK">
                {record.student?.kk_number || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Kelas">
                {record.student?.studentClass?.class.romanLevel +
                  " " +
                  record.student?.studentClass?.class.expertise.shortName +
                  " " +
                  record.student?.studentClass?.class.alphabet +
                  "-" +
                  record.student?.studentClass?.class.expertise.prody.faculty
                    .schoolYear.year || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        );

      case "Orang Tua":
        return (
          <>
            <Card
              title={
                <Space>
                  <TeamOutlined /> Informasi Orang Tua/Wali
                </Space>
              }
              bordered={false}
              className="custom-card"
            >
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Nama Lengkap">
                  {record.parent?.name || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {record.parent?.type || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="NIK">
                  {record.parent?.nik || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Tempat Lahir">
                  {record.parent?.birth_place || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Tahun Lahir">
                  {record.parent?.birth_date || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Agama">
                  {record.parent?.religion || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Pendidikan Terakhir">
                  {record.parent?.education || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Pekerjaan">
                  {record.parent?.job || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Penghasilan Bulanan">
                  {record.parent?.monthly_income || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Alamat">
                  {record.parent?.address || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Telepon Rumah">
                  {record.parent?.phone || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Telepon Seluler">
                  {record.parent?.phone_mobile || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Status Hidup">
                  {record.parent?.live_status || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {record.parent?.studentParents &&
              record.parent.studentParents.length > 0 && (
                <Card
                  title={
                    <Space>
                      <BookOutlined /> Anak Terkait
                    </Space>
                  }
                  style={{ marginTop: 20 }}
                  bordered={false}
                  className="custom-card"
                >
                  {record.parent.studentParents.map((sp: any, index: any) => (
                    <Card
                      key={index}
                      type="inner"
                      title={sp.student?.name || "Siswa"}
                      style={{ marginBottom: 16 }}
                    >
                      <Descriptions column={1}>
                        <Descriptions.Item label="NISN">
                          {sp.student?.nisn || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="NIS">
                          {sp.student?.nis || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Kelas">
                          {sp.student?.studentClass?.class.romanLevel +
                            " " +
                            sp.student?.studentClass?.class.expertise
                              .shortName +
                            " " +
                            sp.student?.studentClass?.class.alphabet +
                            "-" +
                            sp.student?.studentClass?.class.expertise.prody
                              .faculty.schoolYear.year || "N/A"}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  ))}
                </Card>
              )}
          </>
        );

      default:
        return (
          <Card bordered={false}>
            <Text>Tidak ada informasi profil yang tersedia</Text>
          </Card>
        );
    }
  };

  return (
    <Show isLoading={isLoading} headerButtons={[]}>
      <Row gutter={[24, 24]}>
        {/* Account Details */}
        <Col xs={24} md={8}>
          <Card bordered={false} className="user-info-card">
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Avatar
                size={100}
                icon={<UserOutlined />}
                style={{ backgroundColor: getBadgeColor(profileType) }}
              />
              <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>
                {(profileType === "Guru" && record?.teacher?.name) ||
                  (profileType === "Siswa" && record?.student?.name) ||
                  (profileType === "Orang Tua" && record?.parent?.name) ||
                  record?.username}
              </Title>
              <Badge
                color={getBadgeColor(profileType)}
                text={<Text strong>{profileType || "User"}</Text>}
                style={{ margin: "8px 0" }}
              />
            </div>

            <Divider style={{ margin: "12px 0" }} />

            <Descriptions column={1}>
              <Descriptions.Item label="User ID">
                <NumberField value={record?.id ?? 0} />
              </Descriptions.Item>
              <Descriptions.Item label="Username">
                <TextField value={record?.username} strong />
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                <Tag color="cyan">{record?.userRole?.role?.name || "N/A"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Dibuat pada">
                <DateField
                  value={record?.createdAt}
                  format="DD MMM YYYY HH:mm"
                />
              </Descriptions.Item>
              <Descriptions.Item label="Terakhir diperbarui">
                <DateField
                  value={record?.updatedAt}
                  format="DD MMM YYYY HH:mm"
                />
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Profile Details */}
        <Col xs={24} md={16}>
          {renderProfileDetails()}
        </Col>
      </Row>
    </Show>
  );
};
