import { useMemo, useState } from "react";

export type TabKey = "image" | "video";

export interface TrainingSetItem {
  id: string;
  title: string;
  desc: string;
  date: string | null;
}

export const useAction = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("image");

  const list = useMemo<TrainingSetItem[]>(
    () => [
      {
        id: "1",
        title: "西蘭花訓練集",
        desc: "這個是西蘭花的訓練集",
        date: null,
      },
      {
        id: "2",
        title: "西蘭花訓練集",
        desc: "這個是西蘭花的訓練集",
        date: null,
      },
      {
        id: "3",
        title: "西蘭花訓練集",
        desc: "這個是西蘭花的訓練集",
        date: "2025-06-09",
      },
    ],
    []
  );

  // 这里预留：未来可以根据 activeTab 返回不同数据
  const visibleList = list;

  return { activeTab, setActiveTab, visibleList };
};
