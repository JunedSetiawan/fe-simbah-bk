import React, { useContext } from "react";
import {
  useTranslate,
  useLogout,
  useTitle,
  CanAccess,
  type ITreeMenu,
  useIsExistAuthentication,
  useRouterContext,
  useMenu,
  useRefineContext,
  useLink,
  useRouterType,
  useActiveAuthProvider,
  pickNotDeprecated,
  useWarnAboutChange,
} from "@refinedev/core";
import { ThemedTitleV2, useThemedLayoutContext } from "@refinedev/antd";
import {
  DashboardOutlined,
  LogoutOutlined,
  UnorderedListOutlined,
  BarsOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Grid,
  Drawer,
  Button,
  theme,
  ConfigProvider,
} from "antd";
import type { RefineThemedLayoutV2SiderProps } from "@refinedev/antd";
import type { CSSProperties } from "react";
import LogoImage from "@/public/logo/logo-smkn-jenangan.png";
import Image from "next/image";
import { MobileBottomNavbar } from "./mobileBottomNavbar";

const drawerButtonStyles: CSSProperties = {
  borderStartStartRadius: 0,
  borderEndStartRadius: 0,
  position: "fixed",
  top: 64,
  zIndex: 999,
};

export const ThemedSiderV2: React.FC<RefineThemedLayoutV2SiderProps> = ({
  Title: TitleFromProps,
  render,
  meta,
  fixed,
  activeItemDisabled = false,
}) => {
  const { token } = theme.useToken();
  const {
    siderCollapsed,
    setSiderCollapsed,
    mobileSiderOpen,
    setMobileSiderOpen,
  } = useThemedLayoutContext();

  const isExistAuthentication = useIsExistAuthentication();
  const direction = useContext(ConfigProvider.ConfigContext)?.direction;
  const routerType = useRouterType();
  const NewLink = useLink();
  const { warnWhen, setWarnWhen } = useWarnAboutChange();
  const { Link: LegacyLink } = useRouterContext();
  const Link = routerType === "legacy" ? LegacyLink : NewLink;
  const TitleFromContext = useTitle();
  const translate = useTranslate();
  const { menuItems, selectedKey, defaultOpenKeys } = useMenu({ meta });
  const breakpoint = Grid.useBreakpoint();
  const { hasDashboard } = useRefineContext();
  const authProvider = useActiveAuthProvider();
  const { mutate: mutateLogout } = useLogout({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });

  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const CustomTitle = ({ collapsed }: { collapsed: boolean }) => {
    return (
      <div className="flex items-center gap-4">
        {/* Your custom logo */}
        <Image
          src={LogoImage}
          alt="Logo"
          style={{ height: collapsed ? "36px" : "36px", width: "auto" }}
        />
        {!collapsed && (
          <div className="flex flex-col">
            <h4 className="text-white text-lg font-semibold m-0">SI-PEKA</h4>
            <h3 className="text-white text-sm m-0 font-light">
              SMKN 1 JENANGAN PONOROGO
            </h3>
          </div>
        )}
      </div>
    );
  };

  const RenderToTitle = TitleFromProps ?? CustomTitle ?? ThemedTitleV2;

  const renderTreeView = (tree: ITreeMenu[], selectedKey?: string) => {
    return tree.map((item: ITreeMenu) => {
      const {
        icon,
        label,
        route,
        key,
        name,
        children,
        parentName,
        meta,
        options,
      } = item;

      if (children.length > 0) {
        return (
          <CanAccess
            key={item.key}
            resource={name}
            action="list"
            params={{
              resource: item,
            }}
          >
            <Menu.SubMenu
              key={item.key}
              icon={icon ?? <UnorderedListOutlined />}
              title={label}
              style={{
                whiteSpace: "nowrap",
                color: "white",
              }}
            >
              {renderTreeView(children, selectedKey)}
            </Menu.SubMenu>
          </CanAccess>
        );
      }

      const isSelected = key === selectedKey;
      const isRoute = !(
        pickNotDeprecated(meta?.parent, options?.parent, parentName) !==
          undefined && children.length === 0
      );

      const linkStyle: React.CSSProperties =
        activeItemDisabled && isSelected ? { pointerEvents: "none" } : {};

      return (
        <CanAccess
          key={item.key}
          resource={name}
          action="list"
          params={{
            resource: item,
          }}
        >
          <Menu.Item
            key={item.key}
            icon={icon ?? (isRoute && <UnorderedListOutlined />)}
            style={{
              ...linkStyle,
              whiteSpace: "nowrap",
              color: "white",
              marginTop: "12px",
            }}
          >
            <Link
              to={route ?? ""}
              style={{
                ...linkStyle,
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {label}
            </Link>
          </Menu.Item>
        </CanAccess>
      );
    });
  };

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

  const logout = isExistAuthentication && (
    <Menu.Item
      key="logout"
      onClick={() => handleLogout()}
      icon={<LogoutOutlined />}
    >
      {translate("buttons.logout", "Logout")}
    </Menu.Item>
  );

  const dashboard = hasDashboard ? (
    <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
      <Link to="/dashboard">{translate("dashboard.title", "Dashboard")}</Link>
      {!siderCollapsed && selectedKey === "/dashboard" && (
        <div className="ant-menu-tree-arrow" />
      )}
    </Menu.Item>
  ) : null;

  const items = renderTreeView(menuItems, selectedKey);

  const renderSider = () => {
    if (render) {
      return render({
        dashboard,
        items,
        logout,
        collapsed: siderCollapsed,
      });
    }
    return (
      <>
        {dashboard}
        {items}
      </>
    );
  };
  const SIDEBAR_WIDTH = 250;
  const COLLAPSED_WIDTH = 80;

  const renderMenu = () => {
    return (
      <Menu
        className="bg-primary"
        selectedKeys={selectedKey ? [selectedKey] : []}
        defaultOpenKeys={defaultOpenKeys}
        mode="inline"
        style={{
          backgroundColor: "rgba(44, 89, 90, 1)",
          paddingTop: "25px",
          border: "none",
          overflow: "auto",
          minHeight: "auto",
        }}
        theme="dark"
        inlineCollapsed={siderCollapsed && !isMobile}
        onClick={() => {
          setMobileSiderOpen(false);
        }}
      >
        {renderSider()}
      </Menu>
    );
  };

  // Return mobile bottom navigation for mobile devices
  if (isMobile) {
    return <MobileBottomNavbar />;
  }

  const siderStyles: React.CSSProperties = {
    backgroundColor: "rgba(44, 89, 90, 1)",
    borderRight: `1px solid ${token.colorBgElevated}`,
    color: "white",
  };

  if (fixed) {
    siderStyles.position = "fixed";
    siderStyles.top = 0;
    siderStyles.height = "100vh";
    siderStyles.zIndex = 999;
  }

  const renderClosingIcons = () => {
    const iconProps = { style: { color: "white" } };
    const OpenIcon = direction === "rtl" ? RightOutlined : LeftOutlined;
    const CollapsedIcon = direction === "rtl" ? LeftOutlined : RightOutlined;
    const IconComponent = siderCollapsed ? CollapsedIcon : OpenIcon;

    return <IconComponent {...iconProps} />;
  };

  return (
    <>
      {fixed && (
        <div
          style={{
            width: siderCollapsed ? "80px" : "250px",
            transition: "all 0.2s",
          }}
        />
      )}
      <Layout.Sider
        style={siderStyles}
        collapsible
        collapsed={siderCollapsed}
        onCollapse={(collapsed, type) => {
          if (type === "clickTrigger") {
            setSiderCollapsed(collapsed);
          }
        }}
        width={SIDEBAR_WIDTH}
        collapsedWidth={80}
        breakpoint="lg"
        trigger={null}
      >
        <div
          className="bg-primary text-white"
          style={{
            marginTop: "20px",
            width: siderCollapsed ? "80px" : "250px",
            padding: siderCollapsed ? "0" : "0 16px",
            display: "flex",
            justifyContent: siderCollapsed ? "center" : "flex-start",
            alignItems: "center",
            height: "64px",
            fontSize: "14px",
          }}
        >
          <RenderToTitle collapsed={siderCollapsed} />
        </div>
        {renderMenu()}
      </Layout.Sider>
    </>
  );
};
