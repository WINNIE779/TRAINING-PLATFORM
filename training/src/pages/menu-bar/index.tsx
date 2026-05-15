import { Dropdown } from "antd";
import type { NavLinkRenderProps } from "react-router-dom";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAction } from "./hook";

const SidebarHomeIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 11l9-7 9 7" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
};

const SidebarTagIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 7v6l8 8 10-10-8-8H7z" />
      <circle cx="8.5" cy="8.5" r="1.5" />
    </svg>
  );
};

const SidebarModelIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 11l9 5 9-5" />
      <path d="M3 16l9 5 9-5" />
    </svg>
  );
};

const ChevronIcon = ({ open }: { open: boolean }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={open ? "rotate-90 transition-transform" : "transition-transform"}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
};

export const MenuBar = () => {
  const { user, items } = useAction();
  const { pathname } = useLocation();
  const normalizedPath = pathname === "/" ? "/data-management" : pathname;
  const isDataManagement = normalizedPath.startsWith("/data-management");
  const isDatasetActive = normalizedPath === "/data-management";

  const mainNavBase =
    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors";
  const mainNavActive = "bg-blue-50 text-blue-600 font-semibold";
  const mainNavIdle = "text-gray-700 hover:bg-gray-100";
  const subNavBase =
    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors";
  const subNavActive = "bg-blue-50 text-blue-600";
  const subNavIdle = "text-gray-600 hover:bg-gray-100";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6 fixed top-0 left-0 right-0 z-20">
        <Dropdown
          menu={{ items }}
          trigger={["click"]}
          placement="bottomRight"
          // overlayClassName="user-menu-dropdown"
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
      <aside className="fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-56 bg-white border-r border-gray-200 px-3 py-4">
        <nav className="flex flex-col gap-1">
          <NavLink
            to="/data-management"
            className={`${mainNavBase} ${
              isDataManagement ? mainNavActive : mainNavIdle
            }`}
          >
            <SidebarHomeIcon />
            <span className="flex-1">数据管理</span>
            <ChevronIcon open={isDataManagement} />
          </NavLink>
          {isDataManagement ? (
            <div className="pl-7">
              <Link
                to="/data-management"
                className={`${subNavBase} ${
                  isDatasetActive ? subNavActive : subNavIdle
                }`}
              >
                数据集
              </Link>
            </div>
          ) : null}

          <NavLink
            to="/data-annotation"
            className={({ isActive }: NavLinkRenderProps) =>
              `${mainNavBase} ${isActive ? mainNavActive : mainNavIdle}`
            }
          >
            <SidebarTagIcon />
            数据标注
          </NavLink>

          <NavLink
            to="/simulation-training"
            className={({ isActive }: NavLinkRenderProps) =>
              `${mainNavBase} ${isActive ? mainNavActive : mainNavIdle}`
            }
          >
            <SidebarModelIcon />
            模型训练
          </NavLink>
        </nav>
      </aside>

      <main
        className="pt-14 pr-6 pb-8"
        style={{ paddingLeft: "calc(14rem + 1.5rem)" }}
      >
        <div className="pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
