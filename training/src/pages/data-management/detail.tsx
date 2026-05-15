import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  Button,
  Dropdown,
  Empty,
  Input,
  Modal,
  Select,
  Upload,
  message,
} from "antd";
import type { MenuProps } from "antd";
import type { RcFile, UploadChangeParam, UploadFile } from "antd/es/upload";
import UploadComponent from "antd/es/upload";
import {
  calculateDatasetProgress,
  deleteTrainingSetRecord,
  fileToDataUrl,
  formatTrainingTime,
  getTrainingSetRecordById,
  TRAINING_SET_STORAGE_EVENT,
  updateTrainingSetRecord,
  type TrainingAssetRecord,
  type TrainingAssetType,
  type TrainingSetRecord,
} from "@/shared/training-set-store";

type AssetFilterKey = "all" | "pending" | "completed";

const MAX_TOTAL_BYTES = 5 * 1024 * 1024 * 1024;
const MAX_IMAGE_COUNT = 20;

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 6.82v10.36a1 1 0 0 0 1.53.85l8.14-5.18a1 1 0 0 0 0-1.7L9.53 5.97A1 1 0 0 0 8 6.82Z" />
  </svg>
);

const DetailCardPreview = ({
  asset,
}: {
  asset: TrainingAssetRecord;
}) => {
  if (asset.type === "image" && asset.previewUrl) {
    return (
      <img
        src={asset.previewUrl}
        alt={asset.name}
        className="h-36 w-full rounded-2xl object-cover"
      />
    );
  }

  return (
    <div className="flex h-36 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-sky-400 to-cyan-200">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-blue-500 shadow-sm">
        <PlayIcon />
      </div>
    </div>
  );
};

const getUploadAccept = (type: TrainingAssetType) =>
  type === "image" ? "image/*" : "video/*";

export const DataManagementDetail = () => {
  const { datasetId = "" } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<TrainingSetRecord | null>(null);
  const [assetFilter, setAssetFilter] = useState<AssetFilterKey>("all");
  const [editOpen, setEditOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    const syncDataset = () => {
      setDataset(getTrainingSetRecordById(datasetId));
    };

    syncDataset();
    window.addEventListener(TRAINING_SET_STORAGE_EVENT, syncDataset);
    window.addEventListener("storage", syncDataset);

    return () => {
      window.removeEventListener(TRAINING_SET_STORAGE_EVENT, syncDataset);
      window.removeEventListener("storage", syncDataset);
    };
  }, [datasetId]);

  useEffect(() => {
    if (!dataset) {
      return;
    }

    setEditName(dataset.name);
    setEditDescription(dataset.description);
  }, [dataset]);

  const filteredAssets = useMemo(() => {
    if (!dataset) {
      return [];
    }

    if (assetFilter === "pending") {
      return dataset.assets.filter((asset) => asset.progress < 100);
    }

    if (assetFilter === "completed") {
      return dataset.assets.filter((asset) => asset.progress >= 100);
    }

    return dataset.assets;
  }, [assetFilter, dataset]);

  const totalBytes = fileList.reduce((sum, file) => sum + (file.size ?? 0), 0);
  const totalMb = Math.round((totalBytes / 1024 / 1024) * 10) / 10;

  const beforeUpload = (file: RcFile) => {
    if (!dataset) {
      return UploadComponent.LIST_IGNORE;
    }

    const isValidType =
      dataset.type === "image"
        ? file.type.startsWith("image/")
        : file.type.startsWith("video/");

    if (!isValidType) {
      message.error(
        dataset.type === "image" ? "只能导入图片文件" : "只能导入视频文件",
      );
      return UploadComponent.LIST_IGNORE;
    }

    if (dataset.type === "image") {
      const totalImageCount = dataset.assets.length + fileList.length;
      if (totalImageCount >= MAX_IMAGE_COUNT) {
        message.error(`图片最多可上传 ${MAX_IMAGE_COUNT} 张`);
        return UploadComponent.LIST_IGNORE;
      }
    }

    if (totalBytes + file.size > MAX_TOTAL_BYTES) {
      message.error("导入文件总大小不能超过 5GB");
      return UploadComponent.LIST_IGNORE;
    }

    return false;
  };

  const onImportChange = (info: UploadChangeParam<UploadFile>) => {
    let next = info.fileList;

    if (dataset?.type === "image" && dataset.assets.length + next.length > MAX_IMAGE_COUNT) {
      next = next.slice(0, MAX_IMAGE_COUNT - dataset.assets.length);
    }

    const sumBytes = (list: UploadFile[]) =>
      list.reduce((sum, file) => sum + (file.size ?? 0), 0);

    while (sumBytes(next) > MAX_TOTAL_BYTES) {
      next = next.slice(0, -1);
    }

    setFileList(next);
  };

  const resetImportState = () => {
    setImportOpen(false);
    setFileList([]);
  };

  const handleSaveEdit = () => {
    if (!dataset) {
      return;
    }

    const nextName = editName.trim();
    if (!nextName) {
      message.error("请输入训练集名称");
      return;
    }

    updateTrainingSetRecord({
      ...dataset,
      name: nextName,
      description: editDescription.trim(),
      updatedAt: formatTrainingTime(new Date()),
    });

    setEditOpen(false);
    message.success("训练集信息已更新");
  };

  const handleImport = async () => {
    if (!dataset) {
      return;
    }

    if (fileList.length === 0) {
      message.error("请先选择要导入的文件");
      return;
    }

    const createdAt = formatTrainingTime(new Date());
    const nextAssets = await Promise.all(
      fileList.map(async (file, index) => {
        const previewUrl =
          dataset.type === "image" && file.originFileObj
            ? await fileToDataUrl(file.originFileObj)
            : null;

        const asset: TrainingAssetRecord = {
          id: `${dataset.id}-${Date.now()}-${file.uid}-${index}`,
          datasetId: dataset.id,
          name: file.name,
          type: dataset.type,
          createdAt,
          progress: 0,
          previewUrl,
        };

        return asset;
      }),
    );

    const assets = [...dataset.assets, ...nextAssets];
    updateTrainingSetRecord({
      ...dataset,
      assets,
      progress: calculateDatasetProgress(assets),
      updatedAt: createdAt,
    });

    resetImportState();
    message.success("文件已导入训练集");
  };

  const handleDelete = () => {
    if (!dataset) {
      return;
    }

    Modal.confirm({
      title: "删除训练集",
      content: `确定删除“${dataset.name}”吗？`,
      okText: "删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: () => {
        deleteTrainingSetRecord(dataset.id);
        message.success("训练集已删除");
        navigate("/data-management");
      },
    });
  };

  const moreActions: MenuProps["items"] = [
    { key: "edit", label: "編輯" },
    { key: "import", label: "導入" },
    { key: "annotate", label: "標註" },
    { key: "delete", label: "刪除", danger: true },
  ];

  const handleMoreAction: MenuProps["onClick"] = ({ key }) => {
    if (key === "edit") {
      setEditOpen(true);
      return;
    }

    if (key === "import") {
      setImportOpen(true);
      return;
    }

    if (key === "annotate") {
      navigate(`/data-annotation?datasetId=${datasetId}`);
      return;
    }

    if (key === "delete") {
      handleDelete();
    }
  };

  if (!dataset) {
    return (
      <div className="rounded-2xl bg-white px-6 py-16 shadow-sm">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="未找到训练集详情"
        >
          <Button type="primary" onClick={() => navigate("/data-management")}>
            返回训练集
          </Button>
        </Empty>
      </div>
    );
  }

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
            title: <span>{`訓練集（${dataset.type === "image" ? "圖片" : "視頻"}）`}</span>,
          },
          {
            title: <span className="text-gray-500">詳情</span>,
          },
        ]}
      />

      <div className="rounded-3xl bg-white px-6 py-5 shadow-sm">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="mb-2 text-2xl font-semibold text-gray-900">
              {dataset.name}
            </h1>
            <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-gray-400">
              <span>{dataset.createdAt}</span>
              <span>共 {dataset.assets.length} 條</span>
            </div>
            <p className="max-w-5xl text-sm leading-6 text-gray-500">
              {dataset.description || "暂无训练集描述"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select<AssetFilterKey>
              value={assetFilter}
              onChange={setAssetFilter}
              className="w-28"
              options={[
                { value: "all", label: "全部" },
                { value: "pending", label: "未標註" },
                { value: "completed", label: "已完成" },
              ]}
            />

            <Dropdown
              menu={{ items: moreActions, onClick: handleMoreAction }}
              trigger={["click"]}
            >
              <Button className="rounded-full border-blue-400 px-5 text-blue-500">
                ... 更多
              </Button>
            </Dropdown>
          </div>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="py-14">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="当前筛选下暂无文件"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="group">
                <div className="relative overflow-hidden rounded-2xl">
                  <DetailCardPreview asset={asset} />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-blue-500 shadow-sm">
                      <PlayIcon />
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-700">
                      {asset.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      標註進度 {asset.progress}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        title="编辑训练集"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleSaveEdit}
        okText="保存"
        cancelText="取消"
      >
        <div className="flex flex-col gap-3">
          <Input
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            placeholder="请输入训练集名称"
            maxLength={40}
          />
          <Input.TextArea
            value={editDescription}
            onChange={(event) => setEditDescription(event.target.value)}
            placeholder="请输入训练集描述"
            rows={4}
            maxLength={200}
          />
        </div>
      </Modal>

      <Modal
        title="导入文件"
        open={importOpen}
        onCancel={resetImportState}
        onOk={() => void handleImport()}
        okText="导入"
        cancelText="取消"
        okButtonProps={{ disabled: fileList.length === 0 }}
      >
        {dataset.type === "image" ? (
          <Upload
            multiple
            accept={getUploadAccept(dataset.type)}
            listType="picture-card"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={onImportChange}
            showUploadList={{ showPreviewIcon: false, showRemoveIcon: true }}
          >
            {dataset.assets.length + fileList.length >= MAX_IMAGE_COUNT ? null : (
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
            accept={getUploadAccept(dataset.type)}
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={onImportChange}
          >
            <p className="font-medium text-gray-900">点击或拖拽文件到此处导入</p>
            <p className="mt-1 text-sm text-gray-500">仅支持视频，总大小不超过 5GB</p>
            <p className="mt-1 text-xs text-gray-400">
              当前已选：{fileList.length} 个文件，约 {totalMb} MB
            </p>
          </Upload.Dragger>
        )}
      </Modal>
    </div>
  );
};
