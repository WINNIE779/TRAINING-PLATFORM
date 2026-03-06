import { useMemo, useState } from "react";

import message from "antd/es/message";
import type { RcFile, UploadChangeParam, UploadFile } from "antd/es/upload";
import Upload from "antd/es/upload";

export type TabKey = "image" | "video";

export interface TrainingSetItem {
  id: string;
  title: string;
  desc: string;
  date: string | null;
}

export const useAction = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("image");
  const [createOpen, setCreateOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const list = useMemo<TrainingSetItem[]>(
    () => [
      {
        id: "1",
        title: "西蘭花訓練集",
        desc: "這個是西蘭花的訓練集",
        date: "2025-06-25",
      },
      {
        id: "2",
        title: "西蘭花訓練集",
        desc: "這個是西蘭花的訓練集",
        date: "2025-06-11",
      },
      {
        id: "3",
        title: "西蘭花訓練集",
        desc: "這個是西蘭花的訓練集",
        date: "2025-06-09",
      },
    ],
    [],
  );

  const visibleList = list;

  const openCreate = () => setCreateOpen(true);

  const closeCreate = () => {
    setCreateOpen(false);
    setFileList([]);
  };

  const MAX_TOTAL_BYTES = 5 * 1024 * 1024 * 1024; // 5GB

  const MAX_IMAGE_COUNT = 20;

  const isImage = activeTab === "image";

  const accept = isImage ? "image/*" : "video/*"; //可上传类型

  const totalBytes = fileList.reduce((sum, f) => sum + (f.size ?? 0), 0);

  const totalMb = Math.round((totalBytes / 1024 / 1024) * 10) / 10;

  const beforeUpload = (file: RcFile) => {
    const typeOk = isImage
      ? file.type.startsWith("image/")
      : file.type.startsWith("video/");
    if (!typeOk) {
      message.error(isImage ? "只能上传图片文件" : "只能上传视频文件");
      return Upload.LIST_IGNORE;
    }

    // 图片数量限制（最多 20 张）
    if (isImage) {
      const imageCount = fileList.length;
      if (imageCount >= MAX_IMAGE_COUNT) {
        message.error(`图片最多可上传 ${MAX_IMAGE_COUNT} 张`);
        return Upload.LIST_IGNORE;
      }
    }

    // 总大小限制（≤ 5GB）
    const nextTotal = totalBytes + file.size;
    if (nextTotal > MAX_TOTAL_BYTES) {
      message.error("训练集导入总大小不能超过 5GB");
      return Upload.LIST_IGNORE;
    }

    return false; // 阻止自动上传（先本地选择）
  };

  const onChange = (info: UploadChangeParam<UploadFile>) => {
    let next = info.fileList;
    if (isImage && next.length > MAX_IMAGE_COUNT)
      next = next.slice(0, MAX_IMAGE_COUNT);

    // 总大小不超 5GB
    const sumBytes = (list: UploadFile[]) =>
      list.reduce((s, f) => s + (f.size ?? 0), 0);
    while (sumBytes(next) > MAX_TOTAL_BYTES) {
      next = next.slice(0, -1);
    }

    setFileList(next);
  };

  return {
    accept,
    isImage,
    totalMb,
    fileList,
    activeTab,
    createOpen,
    totalBytes,
    visibleList,
    MAX_TOTAL_BYTES,
    MAX_IMAGE_COUNT,
    onChange,
    openCreate,
    setFileList,
    beforeUpload,
    setActiveTab,
    closeCreate,
  };
};
