// pages/unauthorized.js
import React, { Suspense } from "react";
import { Button, Result, Typography, Card, Space } from "antd";
import {
  StopOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { ThemedLayoutV2 } from "@refinedev/antd";
import { Authenticated, useGetIdentity, useNavigation } from "@refinedev/core";

const { Paragraph, Text, Title } = Typography;

const UnauthorizedPage = () => {
  const router = useNavigation();
  const { data: identity } = useGetIdentity<{ profileType?: string }>();
  //   const from = router.query.from || "/";

  return (
    <Suspense>
      <Authenticated key="unauthorized-page">
        <Card style={{ margin: "50px auto", maxWidth: "800px" }}>
          <Result
            status="403"
            title="Akses Ditolak"
            icon={<StopOutlined style={{ color: "#ff4d4f" }} />}
            subTitle={
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <Title level={4}>
                  Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
                </Title>
                <Paragraph>
                  Akun Anda saat ini masuk sebagai:{" "}
                  <Text strong>
                    {identity?.profileType === "Umum"
                      ? "Admin"
                      : identity?.profileType || "N/A"}
                  </Text>
                </Paragraph>
              </Space>
            }
            extra={[
              <Button
                type="primary"
                key="back"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.goBack()}
              >
                Kembali
              </Button>,
              <Button
                key="home"
                icon={<HomeOutlined />}
                onClick={() => router.push("/")}
              >
                Kembali ke Beranda
              </Button>,
            ]}
          >
            <div className="desc" style={{ marginTop: "30px" }}>
              <Paragraph>
                <Text strong style={{ fontSize: 16 }}>
                  Mengapa saya melihat halaman ini?
                </Text>
              </Paragraph>
              <Paragraph>
                Anda tidak memiliki hak akses yang diperlukan untuk melihat atau
                melakukan tindakan pada halaman yang diminta. Izin ditentukan
                berdasarkan peran Anda dalam sistem.
              </Paragraph>
              <Paragraph>
                Jika Anda yakin ini adalah kesalahan, silakan hubungi
                administrator sistem.
              </Paragraph>
            </div>
          </Result>
        </Card>
      </Authenticated>
    </Suspense>
  );
};

export default UnauthorizedPage;
