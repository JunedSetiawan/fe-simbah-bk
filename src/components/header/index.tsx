"use client";

import { ColorModeContext } from "@contexts/color-mode";
import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
import {
  useActiveAuthProvider,
  useGetIdentity,
  useLogout,
  useNavigation,
  useTranslate,
  useWarnAboutChange,
} from "@refinedev/core";
import { createAvatar } from "@dicebear/core";
import { adventurer, funEmoji, initials, lorelei } from "@dicebear/collection";
import {
  Layout as AntdLayout,
  Avatar,
  Space,
  Button,
  Typography,
  theme,
  Grid,
  ConfigProvider,
  Tag,
} from "antd";
import React, { useContext, useMemo } from "react";
import {
  BarsOutlined,
  LeftOutlined,
  RightOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Dropdown, Menu as AntdMenu } from "antd";
import { useThemedLayoutContext } from "@refinedev/antd";
import Image from "next/image";
import LogoImage from "@/public/logo/logo-smkn-jenangan.png";

const { Text } = Typography;
const { useToken } = theme;

type ITeacher = {
  id: number;
  userId: number;
  name: string;
  nip: string;
};

type IStudent = {
  id: number;
  userId: number;
  name: string;
  nis: string;
  nisn: string;
};

type IParent = {
  id: number;
  userId: number;
  name: string;
};

type IUser = {
  id: number;
  username: string;
  profileType: string;
  teacher?: ITeacher;
  student?: IStudent;
  parent?: IParent;
};

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  sticky = true,
}) => {
  const translate = useTranslate();
  const { warnWhen, setWarnWhen } = useWarnAboutChange();
  const activeAuthProvider = useActiveAuthProvider();
  const { token } = useToken();
  const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);
  const {
    siderCollapsed,
    setSiderCollapsed,
    mobileSiderOpen,
    setMobileSiderOpen,
  } = useThemedLayoutContext();
  const breakpoint = Grid.useBreakpoint();
  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;
  const direction = useContext(ConfigProvider.ConfigContext)?.direction;

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
  };

  const { mutate: mutateLogout } = useLogout({
    v3LegacyAuthProviderCompatible: Boolean(activeAuthProvider?.isLegacy),
  });

  const handleLogout = () => {
    if (warnWhen) {
      const confirm = window.confirm(
        translate(
          "warnWhenUnsavedChanges",
          "Are you sure you want to leave? You have unsaved changes."
        )
      );

      if (confirm) {
        setWarnWhen(false);
        mutateLogout();
      }
    } else {
      mutateLogout();
    }
  };

  const avatar = useMemo(() => {
    return createAvatar(funEmoji, {
      size: 128,
      backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
      eyes: [
        "closed",
        "closed2",
        "crying",
        "cute",
        "glasses",
        "love",
        "shades",
        "sleepClose",
        "stars",
        "tearDrop",
        "wink",
        "wink2",
      ],
      mouth: [
        "cute",
        "drip",
        "faceMask",
        "kissHeart",
        "lilSmile",
        "smileLol",
        "smileTeeth",
        "tongueOut",
        "wideSmile",
      ],
    }).toDataUri();
  }, []);

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  const { push } = useNavigation();

  const userMenu = (
    <AntdMenu
      style={{
        minWidth: "200px",
      }}
    >
      <AntdMenu.Item
        style={{ padding: "8px 16px" }}
        onClick={() => push("/profile")}
      >
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <Avatar
            src={avatar}
            alt={user?.username}
            size={64}
            style={{ marginBottom: "8px" }}
          />
          <div style={{ fontWeight: "500" }}>
            {user?.teacher?.name ||
              user?.student?.name ||
              user?.parent?.name ||
              user?.username}
          </div>
          <Tag color="cyan">
            {user?.profileType === "Umum"
              ? "Admin"
              : user?.profileType || "N/A"}
          </Tag>
        </div>
      </AntdMenu.Item>
      <AntdMenu.Divider />
      <AntdMenu.Item
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        danger
        style={{ padding: "8px 16px" }}
      >
        {translate("buttons.logout", "Logout")}
      </AntdMenu.Item>
    </AntdMenu>
  );

  // App title and logo component for mobile view
  const AppTitle = () => (
    <div className="flex items-center gap-2">
      <Image src={LogoImage} alt="Logo" width={36} height={36} />
      <div className="flex flex-col">
        <h4 className="text-lg font-semibold m-0">SI-PEKA</h4>
        <h3 className="text-xs m-0 font-light">SMKN 1 JENANGAN</h3>
      </div>
    </div>
  );

  return (
    <AntdLayout.Header style={headerStyles}>
      {/* Left section - Sidebar toggle button (only on desktop) or App title (on mobile) */}
      <div>
        {isMobile ? (
          <AppTitle />
        ) : (
          <Button
            size="large"
            onClick={() => setSiderCollapsed(!siderCollapsed)}
            icon={siderCollapsed ? <RightOutlined /> : <LeftOutlined />}
          />
        )}
      </div>

      {/* Middle section - Can be used for additional content if needed */}
      <div style={{ flex: 1 }}></div>

      {/* Right section - User avatar and dropdown */}
      {(user?.username || user?.profileType) && (
        <Dropdown
          overlay={userMenu}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Avatar
            src={avatar}
            alt={user?.username}
            style={{ cursor: "pointer" }}
          />
        </Dropdown>
      )}
    </AntdLayout.Header>
  );
};
