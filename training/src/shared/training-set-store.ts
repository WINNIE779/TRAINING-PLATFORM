export type TrainingAssetType = "image" | "video";

export interface TrainingAssetRecord {
  id: string;
  datasetId: string;
  name: string;
  type: TrainingAssetType;
  createdAt: string;
  progress: number;
  previewUrl: string | null;
}

export interface TrainingSetRecord {
  id: string;
  name: string;
  description: string;
  type: TrainingAssetType;
  createdAt: string;
  updatedAt: string;
  progress: number;
  assets: TrainingAssetRecord[];
}

const TRAINING_SET_STORAGE_KEY = "training-platform.training-sets";
export const TRAINING_SET_STORAGE_EVENT = "training-platform:training-sets";

const isAssetType = (value: unknown): value is TrainingAssetType =>
  value === "image" || value === "video";

const isAssetRecord = (value: unknown): value is TrainingAssetRecord => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TrainingAssetRecord>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.datasetId === "string" &&
    typeof candidate.name === "string" &&
    isAssetType(candidate.type) &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.progress === "number" &&
    (typeof candidate.previewUrl === "string" || candidate.previewUrl === null)
  );
};

const isTrainingSetRecord = (value: unknown): value is TrainingSetRecord => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TrainingSetRecord>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.description === "string" &&
    isAssetType(candidate.type) &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string" &&
    typeof candidate.progress === "number" &&
    Array.isArray(candidate.assets) &&
    candidate.assets.every(isAssetRecord)
  );
};

const notifyTrainingSetChange = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(TRAINING_SET_STORAGE_EVENT));
};

export const formatTrainingTime = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
};

export const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const calculateDatasetProgress = (assets: TrainingAssetRecord[]) => {
  if (assets.length === 0) {
    return 0;
  }

  return Math.round(
    assets.reduce((sum, asset) => sum + asset.progress, 0) / assets.length,
  );
};

export const getTrainingSetRecords = () => {
  if (typeof window === "undefined") {
    return [] as TrainingSetRecord[];
  }

  const raw = window.localStorage.getItem(TRAINING_SET_STORAGE_KEY);
  if (!raw) {
    return [] as TrainingSetRecord[];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [] as TrainingSetRecord[];
    }

    return parsed.filter(isTrainingSetRecord);
  } catch {
    return [] as TrainingSetRecord[];
  }
};

export const getTrainingSetRecordById = (id: string) =>
  getTrainingSetRecords().find((item) => item.id === id) ?? null;

export const saveTrainingSetRecords = (records: TrainingSetRecord[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TRAINING_SET_STORAGE_KEY, JSON.stringify(records));
  notifyTrainingSetChange();
};

export const appendTrainingSetRecord = (record: TrainingSetRecord) => {
  const nextRecords = [record, ...getTrainingSetRecords()];
  saveTrainingSetRecords(nextRecords);
  return nextRecords;
};

export const updateTrainingSetRecord = (record: TrainingSetRecord) => {
  const nextRecords = getTrainingSetRecords().map((item) =>
    item.id === record.id ? record : item,
  );
  saveTrainingSetRecords(nextRecords);
  return nextRecords;
};

export const deleteTrainingSetRecord = (id: string) => {
  const nextRecords = getTrainingSetRecords().filter((item) => item.id !== id);
  saveTrainingSetRecords(nextRecords);
  return nextRecords;
};

