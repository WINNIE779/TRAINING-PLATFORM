import type { MenuProps } from "antd";
import {
  CameraIcon,
  LogoutIcon,
  SettingIcon,
  SwitchIcon,
  UserIcon,
} from "@/component/iconfonts";

export const useAction = () => {
  const user = {
    name: "JAMIE.M",
    team: "SJ-CN TEAM",
  };

  const items: MenuProps["items"] = [
    {
      key: "switch-backend",
      label: (
        <span className="flex items-center gap-2">
          <SwitchIcon />
          切換後台
        </span>
      ),
    },
    {
      key: "preview",
      label: (
        <span className="flex items-center gap-2">
          <UserIcon />
          預覽接收
        </span>
      ),
    },
    {
      key: "logout",
      label: (
        <span className="flex items-center gap-2">
          <LogoutIcon />
          退出登陸
        </span>
      ),
    },
    { type: "divider" },
    {
      key: "camera-ai",
      label: (
        <span className="flex items-center gap-2">
          <CameraIcon />
          Camera AI Center
        </span>
      ),
    },
    {
      key: "training-platform",
      label: (
        <span className="flex items-center gap-2 bg-blue-500 text-white -mx-2 px-2 py-1.5 rounded">
          <SettingIcon />
          Traing Platform
        </span>
      ),
    },
  ];

  return { user, items };
};
