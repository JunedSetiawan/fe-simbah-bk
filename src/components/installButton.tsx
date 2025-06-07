"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Steps, Typography, Popover, message } from "antd";
import {
  AppstoreAddOutlined,
  InfoCircleOutlined,
  AppleOutlined,
  DownloadOutlined,
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

  return (
    <>
      {/* Floating Install Button - Bottom Left */}
      {(isInstallable || isSafari) && (
        <div
          className="fixed bottom-6 left-6 z-50 cursor-pointer"
          onClick={isInstallable ? handleInstallClick : showSafariInstructions}
        >
          {/* Desktop version - with text */}
          <div className="flex items-center bg-[#1890ff] hover:bg-[#096dd9] text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl">
            <DownloadOutlined className="text-xl mr-2" />
            <span className="text-sm font-medium whitespace-nowrap">
              Install Aplikasi
            </span>
          </div>

          {/* Mobile version - icon only */}
          {/* <div className="md:hidden flex items-center justify-center bg-[#1890ff] hover:bg-[#096dd9] text-white w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl">
            <DownloadOutlined className="text-xl" />
            <span className="text-sm font-medium whitespace-nowrap">
              Install Aplikasi
            </span>
          </div> */}
        </div>
      )}

      {/* Safari Instructions Modal */}
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
  );
};

export default InstallButton;
