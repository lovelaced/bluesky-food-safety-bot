// checkpoint.ts
import fs from 'fs';

export const getLastCheckpoint = (
  checkpointFile: string,
  debugMode: boolean
): Date => {
  if (debugMode) {
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (fs.existsSync(checkpointFile)) {
    const timestamp = fs.readFileSync(checkpointFile, 'utf8').trim();
    return new Date(timestamp);
  } else {
    return new Date();
  }
};

export const setLastCheckpoint = (
  checkpointFile: string,
  date: Date
) => {
  fs.writeFileSync(checkpointFile, date.toISOString());
};

