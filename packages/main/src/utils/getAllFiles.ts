import { join } from 'path';
import { promises as fs } from 'fs';

// Define a type for your file data objects
interface FileData {
  name: string;
  imageSrc: string;
  byteSize: number;
  createdAt: number;
  updatedAt: number;
}

export async function getAllFiles(folderPath: string): Promise<FileData[]> {
  const entries = await fs.readdir(folderPath, { withFileTypes: true });

  const filePromises = entries
    .filter(file => !file.isDirectory() && !/^\..*/.test(file.name))
    .map(async (file): Promise<FileData> => {
      const filePath = join(folderPath, file.name);
      const fileStats = await fs.stat(filePath);

      return {
        name: file.name,
        imageSrc: filePath,
        byteSize: fileStats.size,
        createdAt: fileStats.birthtimeMs,
        updatedAt: fileStats.mtimeMs,
      };
    });

  const files = await Promise.all(filePromises);

  const folderPromises: Promise<FileData[]>[] = entries
    .filter(folder => folder.isDirectory())
    .map(folder => getAllFiles(join(folderPath, folder.name)));

  const foldersFiles = await Promise.all(folderPromises);

  return files.concat(...foldersFiles);
}
