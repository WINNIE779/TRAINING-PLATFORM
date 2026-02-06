import { Link } from "react-router-dom";
import { Breadcrumb } from "antd";
import { useAction } from "./hook";

export const DataManagement = () => {
  const { activeTab, setActiveTab, visibleList } = useAction();

  return (
    <div className="max-w-4xl">
      <Breadcrumb
        className="mb-4"
        items={[
          {
            title: (
              <Link to="/data-management" className="text-gray-900">
                數據管理
              </Link>
            ),
          },
          {
            title: <Link to="/simulation-training">訓練集</Link>,
          },
        ]}
      />

      <div className="flex bg-white rounded-lg p-1 w-fit mb-6">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab("image")}
          onKeyDown={(e) => e.key === "Enter" && setActiveTab("image")}
          className={`px-4 py-2 rounded-md cursor-pointer transition-colors ${
            activeTab === "image"
              ? "bg-blue-500 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          圖片
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab("video")}
          onKeyDown={(e) => e.key === "Enter" && setActiveTab("video")}
          className={`px-4 py-2 rounded-md cursor-pointer transition-colors ${
            activeTab === "video"
              ? "bg-blue-500 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          視頻
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {visibleList.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 truncate">{item.desc}</p>
            </div>
            {item.date && (
              <span className="text-sm text-gray-500 shrink-0">
                {item.date}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
