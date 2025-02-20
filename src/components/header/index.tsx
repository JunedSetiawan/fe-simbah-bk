"use client";

import { ColorModeContext } from "@contexts/color-mode";
import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
import {
  useActiveAuthProvider,
  useGetIdentity,
  useLogout,
  useTranslate,
  useWarnAboutChange,
} from "@refinedev/core";
import { createAvatar } from "@dicebear/core";
import { adventurer, initials, lorelei } from "@dicebear/collection";
import {
  Layout as AntdLayout,
  Avatar,
  Space,
  Button,
  Typography,
  theme,
  Grid,
  ConfigProvider,
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
    return createAvatar(adventurer, {
      size: 128,
    }).toDataUri();
  }, []);

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  const renderCollapseButton = () => {
    if (isMobile) {
      return (
        <Button
          size="large"
          onClick={() => setMobileSiderOpen(true)}
          icon={<BarsOutlined />}
        />
      );
    }

    const OpenIcon = direction === "rtl" ? RightOutlined : LeftOutlined;
    const CollapsedIcon = direction === "rtl" ? LeftOutlined : RightOutlined;
    const Icon = siderCollapsed ? CollapsedIcon : OpenIcon;

    return (
      <Button
        size="large"
        onClick={() => setSiderCollapsed(!siderCollapsed)}
        icon={<Icon />}
      />
    );
  };
  const userMenu = (
    <AntdMenu
      style={{
        minWidth: "200px",
      }}
    >
      <AntdMenu.Item style={{ padding: "8px 16px" }}>
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
          <div style={{ color: "gray", fontSize: "12px" }}>
            {user?.profileType}
          </div>
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
  const renderHeaderRight = () => {
    return (
      <Space size="middle">
        {isMobile && (
          <Button
            size="large"
            onClick={() => setMobileSiderOpen(true)}
            icon={<MenuOutlined />}
          />
        )}
        {!isMobile && (
          <Button
            size="large"
            onClick={() => setSiderCollapsed(!siderCollapsed)}
            icon={siderCollapsed ? <RightOutlined /> : <LeftOutlined />}
          />
        )}
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
      </Space>
    );
  };
  return (
    <AntdLayout.Header style={headerStyles}>
      {/* Bagian Kiri - Tombol Sider */}
      <div>
        {isMobile ? (
          <Button
            size="large"
            onClick={() => setMobileSiderOpen(true)}
            icon={<MenuOutlined />}
          />
        ) : (
          <Button
            size="large"
            onClick={() => setSiderCollapsed(!siderCollapsed)}
            icon={siderCollapsed ? <RightOutlined /> : <LeftOutlined />}
          />
        )}
      </div>

      {/* Bagian Tengah - Bisa ditambahkan konten jika perlu */}
      <div style={{ flex: 1 }}></div>

      {/* Bagian Kanan - Avatar & Dropdown */}
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
