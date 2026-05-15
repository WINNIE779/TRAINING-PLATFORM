import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb, Button, Empty, Modal, Upload, message } from "antd";
import { useAction } from "./hook";
import { CreateFileIcon } from "@/component/iconfonts";
import {
  appendTrainingSetRecord,
  calculateDatasetProgress,
  fileToDataUrl,
  formatTrainingTime,
  type TrainingAssetRecord,
} from "@/shared/training-set-store";

const AssetPreview = ({
  imageUrl,
  type,
}: {
  imageUrl: string | null;
  type: "image" | "video";
}) => {
  if (type === "image" && imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="h-16 w-16 rounded-xl object-cover ring-1 ring-gray-100"
      />
    );
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-300 text-white">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 6.82v10.36a1 1 0 0 0 1.53.85l8.14-5.18a1 1 0 0 0 0-1.7L9.53 5.97A1 1 0 0 0 8 6.82Z" />
      </svg>
    </div>
  );
};

const buildDatasetName = (fileNames: string[], type: "image" | "video") => {
  const firstFileName = fileNames[0] ?? "";
  const baseName = firstFileName.replace(/\.[^.]+$/, "");

  if (fileNames.length === 1 && baseName) {
    return `${baseName}訓練集`;
  }

  if (baseName) {
    return `${baseName}等${fileNames.length}個文件訓練集`;
  }

  return type === "image" ? "圖片訓練集" : "視頻訓練集";
};

export const DataManagement = () => {
  const navigate = useNavigate();
  const {
    accept,
    totalMb,
    isImage,
    fileList,
    activeTab,
    visibleList,
    createOpen,
    previewOpen,
    previewImage,
    previewTitle,
    MAX_IMAGE_COUNT,
    onChange,
    onPreview,
    openCreate,
    closeCreate,
    setActiveTab,
    beforeUpload,
    closePreview,
  } = useAction();

  const handleCreate = async () => {
    if (fileList.length === 0) {
      message.error("请先上传图片或视频");
      return;
    }

    const datasetId = `${Date.now()}`;
    const createdAt = formatTrainingTime(new Date());

    const assets = await Promise.all(
      fileList.map(async (file, index) => {
        const previewUrl =
          activeTab === "image" && file.originFileObj
            ? await fileToDataUrl(file.originFileObj)
            : null;

        const asset: TrainingAssetRecord = {
          id: `${datasetId}-${file.uid}-${index}`,
          datasetId,
          name: file.name,
          type: activeTab,
          createdAt,
          progress: 0,
          previewUrl,
        };

        return asset;
      }),
    );

    appendTrainingSetRecord({
      id: datasetId,
      name: buildDatasetName(
        fileList.map((file) => file.name),
        activeTab,
      ),
      description: "",
      type: activeTab,
      createdAt,
      updatedAt: createdAt,
      progress: calculateDatasetProgress(assets),
      assets,
    });

    message.success("训练集已创建");
    closeCreate();
    navigate(`/data-management/${datasetId}`);
  };

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
            title: <span className="text-gray-500">訓練集</span>,
          },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex w-fit rounded-lg bg-white p-1">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveTab("image")}
            onKeyDown={(event) =>
              event.key === "Enter" && setActiveTab("image")
            }
            className={`cursor-pointer rounded-md px-4 py-2 transition-colors ${
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
            onKeyDown={(event) =>
              event.key === "Enter" && setActiveTab("video")
            }
            className={`cursor-pointer rounded-md px-4 py-2 transition-colors ${
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
        onOk={() => void handleCreate()}
      >
        <div className="mb-3 text-sm text-gray-700">
          上传数据集：
          {/* <Button>Upload</Button> */}
        </div>

        {isImage ? (
          <Upload
            multiple
            accept={accept}
            listType="picture-card"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={onChange}
            onPreview={onPreview}
            showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
          >
            {fileList.length >= MAX_IMAGE_COUNT ? null : (
              <div>
                <div className="text-sm text-gray-700">上传</div>
                <div className="mt-1 text-xs text-gray-400">
                  最多 {MAX_IMAGE_COUNT} 张
                </div>
              </div>
            )}
          </Upload>
        ) : (
          <Upload.Dragger
            multiple
            accept={accept}
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={onChange}
          >
            <p className="font-medium text-gray-900">点击或拖拽文件到此处导入</p>
            <p className="mt-1 text-sm text-gray-500">仅支持视频，总大小不超过 5GB</p>
            <p className="mt-1 text-xs text-gray-400">
              当前已选：{fileList.length} 个文件，约 {totalMb} MB
            </p>
          </Upload.Dragger>
        )}
      </Modal>

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={closePreview}
      >
        {previewImage ? (
          <img alt={previewTitle} className="w-full" src={previewImage} />
        ) : null}
      </Modal>

      {visibleList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={`暂无${activeTab === "image" ? "图片" : "视频"}训练集`}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleList.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(`/data-management/${item.id}`)}
              className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-white p-5 text-left shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold text-gray-900">
                  {item.name}
                </h3>
                <p className="mt-1 truncate text-sm text-gray-500">
                  {item.description || `${item.assets.length} 個文件`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <AssetPreview
                  imageUrl={item.assets[0]?.previewUrl ?? null}
                  type={item.type}
                />
                <span className="text-sm text-gray-500">{item.createdAt}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
