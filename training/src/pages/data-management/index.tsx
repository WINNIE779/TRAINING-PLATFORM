import { Link } from "react-router-dom";
import { Breadcrumb, Button, Modal, Upload, message } from "antd";
import { useAction } from "./hook";
import { CreateFileIcon } from "@/component/iconfonts";

export const DataManagement = () => {
  const {
    accept,
    totalMb,
    isImage,
    fileList,
    activeTab,
    visibleList,
    createOpen,
    MAX_IMAGE_COUNT,
    onChange,
    openCreate,
    closeCreate,
    setActiveTab,
    beforeUpload,
  } = useAction();

  return (
    <div className="w-full">
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

      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-white rounded-lg p-1 w-fit">
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

        <Button
          type="primary"
          className="bg-blue-500"
          onClick={openCreate}
          icon={<CreateFileIcon />}
        >
          创建
        </Button>
      </div>

      <Modal
        title="创建训练集"
        open={createOpen}
        onCancel={closeCreate}
        okText="创建"
        cancelText="取消"
        okButtonProps={{ disabled: fileList.length === 0 }}
        onOk={() => {
          message.success("已创建训练集（示例）");
          closeCreate();
        }}
      >
        <div className="mb-3 text-sm text-gray-700">
          当前类型：
          <span className="font-medium">{isImage ? "图片" : "视频"}</span>
        </div>

        <Upload.Dragger
          multiple={isImage}
          accept={accept}
          fileList={fileList}
          beforeUpload={beforeUpload}
          onChange={onChange}
        >
          <p className="text-gray-900 font-medium">点击或拖拽文件到此处导入</p>
          <p className="text-gray-500 text-sm mt-1">
            {isImage
              ? `仅支持图片，最多 ${MAX_IMAGE_COUNT} 张，总大小不超过 5GB`
              : "仅支持视频，总大小不超过 5GB"}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            当前已选：{fileList.length} 个文件，约 {totalMb} MB
          </p>
        </Upload.Dragger>
      </Modal>

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
