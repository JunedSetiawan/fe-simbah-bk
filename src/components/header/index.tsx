"use client";

import { ColorModeContext } from "@contexts/color-mode";
import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";
import { createAvatar } from "@dicebear/core";
import { adventurer, initials, lorelei } from "@dicebear/collection";
import {
  Layout as AntdLayout,
  Avatar,
  Space,
  Switch,
  theme,
  Typography,
} from "antd";
import React, { useContext, useMemo } from "react";

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
  const { token } = useToken();
  const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
  };

  const avatar = useMemo(() => {
    return createAvatar(adventurer, {
      size: 128,
      // ... other options
    }).toDataUri();
  }, []);

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  return (
    <AntdLayout.Header style={headerStyles}>
      <Space>
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          defaultChecked={mode === "dark"}
        />
        {(user?.username || user?.profileType) && (
          <Space style={{ marginLeft: "8px" }} size="middle">
            {user?.username && (
              <>
                {!user?.teacher && !user?.student && !user?.parent && (
                  <Text>
                    {user.username} - {user.profileType}
                  </Text>
                )}

                {user.teacher && (
                  <Text>
                    {user.teacher.name} - {user.profileType}
                  </Text>
                )}
                {user.student && (
                  <Text>
                    {user.student.name} - {user.profileType}
                  </Text>
                )}
                {user.parent && (
                  <Text>
                    {user.parent.name} - {user.profileType}
                  </Text>
                )}
                <Avatar src={avatar} alt={user?.username} />
              </>
            )}
          </Space>
        )}
      </Space>
    </AntdLayout.Header>
  );
};
