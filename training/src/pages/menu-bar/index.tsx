import { Dropdown } from "antd";
import { Outlet } from "react-router-dom";
import { useAction } from "./hook";

export const MenuBar = () => {
  const { user, items } = useAction();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6 fixed top-0 left-0 right-0 z-10">
        <Dropdown
          menu={{ items }}
          trigger={["click"]}
          placement="bottomRight"
          overlayClassName="user-menu-dropdown"
        >
          <button
            type="button"
            className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-100 cursor-pointer border-0 bg-transparent"
          >
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <span className="text-lg">👤</span>
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.team}</div>
            </div>
          </button>
        </Dropdown>
      </header>
      <main className="pt-14 px-6 pb-8">
        <Outlet />
      </main>
    </div>
  );
};
