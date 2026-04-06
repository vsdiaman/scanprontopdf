let lastGeneratedId = 0;

const MAX_12_DIGIT = 999_999_999_999;

export function generateDefaultFileId(): string {
  const nowBasedId = Number(String(Date.now()).slice(-12));

  const uniqueId =
    nowBasedId <= lastGeneratedId ? lastGeneratedId + 1 : nowBasedId;

  lastGeneratedId = uniqueId > MAX_12_DIGIT ? nowBasedId : uniqueId;

  return String(lastGeneratedId).padStart(12, '0');
}
