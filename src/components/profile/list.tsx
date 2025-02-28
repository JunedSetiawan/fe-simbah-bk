"use client";

import React from "react";
import { useGetIdentity } from "@refinedev/core";
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
  Spin,
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
import { DateField } from "@refinedev/antd";

const { Title, Text } = Typography;

export const ProfilePage: React.FC = () => {
  const { data: user, isLoading } = useGetIdentity<{
    id: string;
    username: string;
    profileType: string;
    createdAt: string;
    updatedAt: string;
    teacher?: any;
    student?: any;
    parent?: any;
  }>();

  // Determine badge color based on profile type
  const getBadgeColor = (type: string) => {
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
    if (!user) return null;

    switch (user.profileType) {
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
                {user.teacher?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="NIP">
                {user.teacher?.nip || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tahun Mulai Bekerja">
                {user.teacher?.workSince || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Status Pegawai">
                {user.teacher?.employeeStatus || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tanggal Berhenti">
                {user.teacher?.workStop ? (
                  <DateField
                    value={user.teacher.workStop}
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
                {user.student?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="NISN">
                {user.student?.nisn || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="NIS">
                {user.student?.nis || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Nomor KK">
                {user.student?.kk_number || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Kelas">
                {user.student?.studentClass?.class
                  ? user.student.studentClass.class.romanLevel +
                    " " +
                    user.student.studentClass.class.expertise.shortName +
                    " " +
                    user.student.studentClass.class.alphabet +
                    "-" +
                    user.student.studentClass.class.expertise.prody.faculty
                      .schoolYear.year
                  : "N/A"}
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
                  {user.parent?.name || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {user.parent?.type || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="NIK">
                  {user.parent?.nik || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Tempat Lahir">
                  {user.parent?.birth_place || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Tahun Lahir">
                  {user.parent?.birth_date || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Agama">
                  {user.parent?.religion || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Pendidikan Terakhir">
                  {user.parent?.education || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Pekerjaan">
                  {user.parent?.job || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Penghasilan Bulanan">
                  {user.parent?.monthly_income || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Alamat">
                  {user.parent?.address || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Telepon Rumah">
                  {user.parent?.phone || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Telepon Seluler">
                  {user.parent?.phone_mobile || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Status Hidup">
                  {user.parent?.live_status || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {user.parent?.studentParents &&
              user.parent.studentParents.length > 0 && (
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
                  {user.parent.studentParents.map((sp: any, index: any) => (
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

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={<Title level={3}>Profil Saya</Title>}
        bordered={false}
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[24, 24]}>
          {/* Account Details */}
          <Col xs={24} md={8}>
            <Card bordered={false} className="user-info-card">
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <Avatar
                  size={100}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: getBadgeColor(user!.profileType) }}
                />
                <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>
                  {(user?.profileType === "Guru" && user?.teacher?.name) ||
                    (user?.profileType === "Siswa" && user?.student?.name) ||
                    (user?.profileType === "Orang Tua" && user?.parent?.name) ||
                    user?.username ||
                    "User"}
                </Title>
                {/* <Badge
                  color={getBadgeColor(user?.profileType)}
                  text={<Text strong>{user?.profileType || "User"}</Text>}
                  style={{ margin: "8px 0" }}
                /> */}
              </div>

              <Divider style={{ margin: "12px 0" }} />

              <Descriptions column={1}>
                <Descriptions.Item label="User ID">
                  {user?.id || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Username">
                  <Text strong>{user?.username || "N/A"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Role">
                  <Tag color="cyan">{user?.profileType || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Dibuat pada">
                  <DateField
                    value={user?.createdAt}
                    format="DD MMM YYYY HH:mm"
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Terakhir diperbarui">
                  <DateField
                    value={user?.updatedAt}
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
      </Card>
    </div>
  );
};
