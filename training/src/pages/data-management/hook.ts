import { useEffect, useMemo, useState } from "react";

import message from "antd/es/message";
import type { RcFile, UploadChangeParam, UploadFile } from "antd/es/upload";
import Upload from "antd/es/upload";
import {
  getTrainingSetRecords,
  TRAINING_SET_STORAGE_EVENT,
  type TrainingSetRecord,
} from "@/shared/training-set-store";

export type TabKey = "image" | "video";

export const useAction = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("image");
  const [createOpen, setCreateOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [trainingSets, setTrainingSets] = useState<TrainingSetRecord[]>([]);

  useEffect(() => {
    const syncTrainingSets = () => {
      setTrainingSets(getTrainingSetRecords());
    };

    syncTrainingSets();
    window.addEventListener(TRAINING_SET_STORAGE_EVENT, syncTrainingSets);
    window.addEventListener("storage", syncTrainingSets);

    return () => {
      window.removeEventListener(TRAINING_SET_STORAGE_EVENT, syncTrainingSets);
      window.removeEventListener("storage", syncTrainingSets);
    };
  }, []);

  const visibleList = useMemo(
    () => trainingSets.filter((item) => item.type === activeTab),
    [activeTab, trainingSets],
  );

  const openCreate = () => setCreateOpen(true);

  const closeCreate = () => {
    setCreateOpen(false);
    setFileList([]);
  };

  const MAX_TOTAL_BYTES = 5 * 1024 * 1024 * 1024;
  const MAX_IMAGE_COUNT = 20;

  const getFileKind = (file: UploadFile): TabKey | null => {
    const type = file.type ?? "";
    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    return null;
  };

  const detectTabFromList = (list: UploadFile[]) => {
    for (const file of list) {
      const kind = getFileKind(file);
      if (kind) return kind;
    }
    return null;
  };

  const detectedTab = useMemo(() => detectTabFromList(fileList), [fileList]);
  const currentTab = detectedTab ?? activeTab;
  const isImage = currentTab === "image";

  const accept =
    fileList.length === 0 ? "image/*,video/*" : isImage ? "image/*" : "video/*";

  const totalBytes = fileList.reduce((sum, file) => sum + (file.size ?? 0), 0);
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

    const nextTab =
      fileList.length === 0 ? (isImageFile ? "image" : "video") : currentTab;

    if (nextTab === "image" && fileList.length >= MAX_IMAGE_COUNT) {
      message.error(`图片最多可上传 ${MAX_IMAGE_COUNT} 张`);
      return Upload.LIST_IGNORE;
    }

    if (totalBytes + file.size > MAX_TOTAL_BYTES) {
      message.error("训练集导入总大小不能超过 5GB");
      return Upload.LIST_IGNORE;
    }

    return false;
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

    const sumBytes = (list: UploadFile[]) =>
      list.reduce((sum, file) => sum + (file.size ?? 0), 0);

    while (sumBytes(next) > MAX_TOTAL_BYTES) {
      next = next.slice(0, -1);
    }

    setFileList(next);
    if (nextTab && next.length > 0) {
      setActiveTab(nextTab);
    }
  };

  const getBase64 = (file: RcFile) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

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
  };
};
