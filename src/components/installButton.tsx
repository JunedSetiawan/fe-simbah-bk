"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Steps, Typography, Popover, message } from "antd";
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
    // Check if it's Safari
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
        message.success("App installation started!");
      } else {
        message.info("App installation was declined");
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
          title="Tap the Share button"
          description="Look for the share icon in Safari's bottom menu (iOS) or top toolbar (macOS)"
        />
        <Step
          title="Find 'Add to Home Screen'"
          description="Scroll down in the share menu to find this option"
        />
        <Step
          title="Confirm Installation"
          description="Tap 'Add' in the confirmation dialog"
        />
      </Steps>
      <div style={{ marginTop: 16 }}>
        <Text type="secondary">
          The app will appear on your home screen like a native app
        </Text>
      </div>
    </div>
  );

  const installButtonPopoverContent = (
    <div>
      <Paragraph>Install this app on your device for easier access</Paragraph>
    </div>
  );

  return (
    <>
      {isInstallable && (
        <Popover
          content={installButtonPopoverContent}
          title="Install Our App"
          trigger="hover"
        >
          <Button
            type="primary"
            icon={<AppstoreAddOutlined />}
            onClick={handleInstallClick}
            style={{ marginRight: 8 }}
          >
            Install App
          </Button>
        </Popover>
      )}

      {isSafari && (
        <>
          <Button
            type="default"
            icon={<AppleOutlined />}
            onClick={showSafariInstructions}
          >
            Install on iOS/Safari
          </Button>

          <Modal
            title={
              <Title level={4}>
                <AppleOutlined /> Install on iOS/Safari
              </Title>
            }
            open={safariModalVisible}
            onCancel={() => setSafariModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setSafariModalVisible(false)}>
                Got it
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
