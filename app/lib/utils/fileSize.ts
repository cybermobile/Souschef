export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, index);

  return `${parseFloat(value.toFixed(1))} ${sizes[index]}`;
}
