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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

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

  const getFileKind = (file: UploadFile): TabKey | null => {
    const type = file.type ?? "";
    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    return null;
  };

  const detectTabFromList = (list: UploadFile[]) => {
    for (const file of list) {
      if (kind) return kind;
    }
    return null;
  };

  const detectedTab = useMemo(() => detectTabFromList(fileList), [fileList]);

  const currentTab = detectedTab ?? activeTab;

  const isImage = currentTab === "image";

  const accept =
    fileList.length === 0 ? "image/*,video/*" : isImage ? "image/*" : "video/*"; //可上传类型

  const totalBytes = fileList.reduce((sum, f) => sum + (f.size ?? 0), 0);

  const totalMb = Math.round((totalBytes / 1024 / 1024) * 10) / 10;

  const beforeUpload = (file: RcFile) => {
    const isImageFile = file.type.startsWith("image/");
    const isVideoFile = file.type.startsWith("video/");
    if (!isImageFile && !isVideoFile) {
      message.error("只能上传图片或视频文件");
      return Upload.LIST_IGNORE;
    }

    if (fileList.length > 0) {
      if (currentTab === "image" && !isImageFile) {
        message.error("已选择图片类型，不能上传视频");
        return Upload.LIST_IGNORE;
      }
      if (currentTab === "video" && !isVideoFile) {
        message.error("已选择视频类型，不能上传图片");
        return Upload.LIST_IGNORE;
      }
    }

    // 图片数量限制（最多 20 张）
    const nextTab =
      fileList.length === 0 ? (isImageFile ? "image" : "video") : currentTab;
    if (nextTab === "image") {
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
    const nextTab = detectTabFromList(next);
    if (nextTab) {
      const filtered = next.filter((file) => getFileKind(file) === nextTab);
      if (filtered.length !== next.length) {
        message.error("不能同时上传图片和视频");
        next = filtered;
      }
      if (nextTab === "image" && next.length > MAX_IMAGE_COUNT) {
        next = next.slice(0, MAX_IMAGE_COUNT);
      }
    }

    // 总大小不超 5GB
    const sumBytes = (list: UploadFile[]) =>
      list.reduce((s, f) => s + (f.size ?? 0), 0);
    while (sumBytes(next) > MAX_TOTAL_BYTES) {
      next = next.slice(0, -1);
    }

    setFileList(next);
    if (nextTab && next.length > 0) setActiveTab(nextTab);
  };

  const getBase64 = (file: RcFile) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  0;
  const onPreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage((file.url || file.preview || "") as string);
    setPreviewOpen(true);
    setPreviewTitle(file.name || "");
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewImage("");
    setPreviewTitle("");
  };

  return {
    accept,
    isImage,
    currentTab,
    totalMb,
    fileList,
    activeTab,
    createOpen,
    previewOpen,
    previewImage,
    previewTitle,
    totalBytes,
    visibleList,
    MAX_TOTAL_BYTES,
    MAX_IMAGE_COUNT,
    onChange,
    onPreview,
    openCreate,
    setFileList,
    beforeUpload,
    setActiveTab,
    closeCreate,
    closePreview,
  };
};
