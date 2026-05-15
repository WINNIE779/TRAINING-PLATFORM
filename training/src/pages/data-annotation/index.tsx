import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Breadcrumb, Button, Empty, Table, message } from "antd";
import type { TableProps } from "antd";
import {
  getTrainingSetRecordById,
  TRAINING_SET_STORAGE_EVENT,
  type TrainingAssetRecord,
  type TrainingAssetType,
  type TrainingSetRecord,
} from "@/shared/training-set-store";

const annotationTabs: { key: TrainingAssetType; label: string }[] = [
  { key: "image", label: "圖片" },
  { key: "video", label: "視頻" },
];

const progressBarWidth = (progress: number) =>
  `${Math.min(100, Math.max(0, progress))}%`;

export const DataAnnotation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const datasetId = searchParams.get("datasetId") ?? "";
  const [dataset, setDataset] = useState<TrainingSetRecord | null>(null);
  const [activeTab, setActiveTab] = useState<TrainingAssetType>("image");

  useEffect(() => {
    const syncDataset = () => {
      setDataset(datasetId ? getTrainingSetRecordById(datasetId) : null);
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
    if (dataset) {
      setActiveTab(dataset.type);
    }
  }, [dataset]);

  const filteredRecords = useMemo(() => {
    if (!dataset) {
      return [];
    }

    return dataset.assets.filter((record) => record.type === activeTab);
  }, [activeTab, dataset]);

  const columns: TableProps<TrainingAssetRecord>["columns"] = [
    {
      title: "名稱",
      dataIndex: "name",
      key: "name",
      render: (value: TrainingAssetRecord["name"]) => (
        <span className="font-medium text-gray-800">{value}</span>
      ),
    },
    {
      title: "創建時間",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 260,
      render: (value: TrainingAssetRecord["createdAt"]) => (
        <span className="text-gray-500">{value}</span>
      ),
    },
    {
      title: "標註進度",
      dataIndex: "progress",
      key: "progress",
      width: 280,
      render: (value: TrainingAssetRecord["progress"]) => (
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: progressBarWidth(value) }}
            />
          </div>
          <span className="min-w-10 text-sm text-gray-500">{value}%</span>
        </div>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 160,
      render: (_, record) => (
        <button
          type="button"
          className="border-0 bg-transparent p-0 text-sm font-medium text-blue-500 hover:text-blue-600"
          onClick={() => message.info(`即将开始标注：${record.name}`)}
        >
          標註
        </button>
      ),
    },
  ];

  if (!dataset) {
    return (
      <div className="rounded-2xl bg-white px-6 py-16 shadow-sm">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="请先从训练集详情页点击“更多 -> 標註”进入数据标注"
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
            title: (
              <Link to={`/data-management/${dataset.id}`} className="text-gray-900">
                {dataset.name}
              </Link>
            ),
          },
          {
            title: <span className="text-gray-500">數據標註</span>,
          },
        ]}
      />

      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-900">數據標註</h1>
        <p className="mt-2 text-sm text-gray-500">
          当前训练集：{dataset.name}，共 {dataset.assets.length} 个文件
        </p>
      </div>

      <div className="mb-5 inline-flex rounded-xl bg-white p-1 shadow-sm">
        {annotationTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-blue-50 text-blue-600"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
        <Table<TrainingAssetRecord>
          rowKey="id"
          columns={columns}
          dataSource={filteredRecords}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (total) => `共 ${total} 條數據`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={`暫無${activeTab === "image" ? "圖片" : "視頻"}數據`}
              />
            ),
          }}
          className="[&_.ant-pagination-options-size-changer]:!min-w-24 [&_.ant-table-cell]:!border-gray-100 [&_.ant-table-thead>tr>th]:!bg-gray-50 [&_.ant-table-thead>tr>th]:!text-gray-700"
        />
      </div>
    </div>
  );
};
