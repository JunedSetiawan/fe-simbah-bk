"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Steps,
  Typography,
  Popover,
  message,
  FloatButton,
} from "antd";
import {
  AppstoreAddOutlined,
  InfoCircleOutlined,
  AppleOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const InstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [safariModalVisible, setSafariModalVisible] = useState(false);

  useEffect(() => {
    // Cek apakah ini Safari
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(
      navigator.userAgent
    );
    setIsSafari(isSafariBrowser);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      setDeferredPrompt(null);
      setIsInstallable(false);

      if (outcome === "accepted") {
        message.success("Instalasi aplikasi dimulai!");
      } else {
        message.info("Instalasi aplikasi ditolak");
      }
    }
  };

  const showSafariInstructions = () => {
    setSafariModalVisible(true);
  };

  const SafariInstructionsContent = () => (
    <div>
      <Steps direction="vertical" current={-1}>
        <Step
          title="Ketuk tombol Bagikan"
          description="Cari ikon bagikan di menu bawah Safari (iOS) atau toolbar atas (macOS)"
        />
        <Step
          title="Cari 'Tambah ke Layar Utama'"
          description="Gulir ke bawah di menu bagikan untuk menemukan opsi ini"
        />
        <Step
          title="Konfirmasi Instalasi"
          description="Ketuk 'Tambah' di dialog konfirmasi"
        />
      </Steps>
      <div style={{ marginTop: 16 }}>
        <Text type="secondary">
          Aplikasi akan muncul di layar utama Anda seperti aplikasi native
        </Text>
      </div>
    </div>
  );

  const installButtonPopoverContent = (
    <div>
      <Paragraph>
        Instal aplikasi ini di perangkat Anda untuk akses yang lebih mudah
      </Paragraph>
    </div>
  );

  return (
    <>
      {isInstallable && (
        <Popover
          content={installButtonPopoverContent}
          title="Instal Aplikasi SI-PEKA"
          trigger="hover"
        >
          <FloatButton
            type="primary"
            icon={<AppstoreAddOutlined />}
            onClick={handleInstallClick}
            style={{
              marginRight: 8,
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            Instal Aplikasi
          </FloatButton>
        </Popover>
      )}

      {isSafari && (
        <>
          <Button
            type="default"
            icon={<AppleOutlined />}
            onClick={showSafariInstructions}
          >
            Instal di iOS/Safari
          </Button>

          <Modal
            title={
              <Title level={4}>
                <AppleOutlined /> Instal di iOS/Safari
              </Title>
            }
            open={safariModalVisible}
            onCancel={() => setSafariModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setSafariModalVisible(false)}>
                Mengerti
              </Button>,
            ]}
          >
            <SafariInstructionsContent />
          </Modal>
        </>
      )}
    </>
  );
};

export default InstallButton;
