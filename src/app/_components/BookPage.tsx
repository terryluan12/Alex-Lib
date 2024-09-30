"use client";
import { Cover } from "./Cover";
import { Folder } from "./Folder";
import { useEffect, useState } from "react";
import { S3Client, paginateListObjectsV2 } from "@aws-sdk/client-s3";
import { FileSystem } from "@/lib/FileSystem";
import type { FileSystemNode } from "@/lib/FileSystem";

export const BookPage = () => {
  const [base_fs, _setBaseFS] = useState(new FileSystem());
  const BOOKS_PER_PAGE = 4;
  const FOLDERS_PER_PAGE = 100;

  const [page, _setPage] = useState(1);
  const [currentFolder, setCurrentFolder] = useState<FileSystemNode>(
    base_fs.getFileSystem()
  );
  const [folders, setFolders] = useState<{ [key: string]: FileSystemNode }>();
  const [files, setFiles] = useState<string[]>();

  const fetchBooks = async () => {
    const BUCKET_NAME = "alex-lib";
    const s3 = new S3Client({});
    const paginator = paginateListObjectsV2(
      { client: s3 },
      { Bucket: BUCKET_NAME }
    );
    for await (const page of paginator) {
      const objects = page.Contents;
      if (objects) {
        objects.forEach((object) => {
          if (object.Key) {
            base_fs.addPath(object.Key);
          }
        });
      }
    }
  };
  useEffect(() => {
    const fileSystem = localStorage.getItem("fileSystem");
    if (!fileSystem) {
      fetchBooks().then(
        () => localStorage.setItem("fileSystem", base_fs.toJSON()),
        (error) => console.error("Error fetching book", error)
      );
    } else {
      base_fs.fromJSON(fileSystem);
      setCurrentFolder(base_fs.getFileSystem());
    }
  }, []);

  useEffect(() => {
    const children = currentFolder.children;
    if (children) {
      const allFolders = Object.entries(children)
        .filter(([_, value]) => value.isFolder)
        .reduce(
          (res, [key, value]) => ((res[key] = value), res),
          {} as { [key: string]: FileSystemNode }
        );
      const allFiles: string[] = Object.keys(children)
        .filter((key) => !children[key].isFolder)
        .map((key) => base_fs.getFullPath(children[key]));
      const bookStart = (page - 1) * BOOKS_PER_PAGE;
      const bookEnd = bookStart + BOOKS_PER_PAGE;
      const folderStart = (page - 1) * FOLDERS_PER_PAGE;
      const folderEnd = folderStart + FOLDERS_PER_PAGE;
      setFolders(
        Object.fromEntries(
          Object.entries(allFolders).slice(folderStart, folderEnd)
        )
      );
      console.log("Setting folders", folders);
      setFiles(allFiles.slice(bookStart, bookEnd));
    }
  }, [page, currentFolder]);
  return (
    <div>
      <h1 className="text-4xl m-10 text-center">Library of Alexandria</h1>
      <div className="bg-green rounded p-8 m-8 mt-10">
        <div className="flex justify-center">
          <h1 className="mb-3"> Current Folder: {currentFolder.name}</h1>
          <h1
            className="cursor-pointer"
            onClick={() => {
              if (currentFolder.parent) setCurrentFolder(currentFolder.parent);
            }}
          >
            ↑
          </h1>
        </div>
        <div className="outline ">
          {folders && Object.keys(folders).length != 0 && (
            <div className="grid grid-cols-6 p-8 place-items-center">
              {Object.entries(folders).map(([key, folder]) => (
                <div
                  key={key}
                  className="cursor-pointer select-none"
                  onClick={() => {
                    setCurrentFolder(folder);
                  }}
                >
                  <Folder name={folder.name} />
                </div>
              ))}
            </div>
          )}
          {files && files.length != 0 && (
            <div className="grid grid-cols-6 p-8 place-items-center">
              {files.map((file, index) => (
                <div key={index} className="flex justify-center max-w-20 ">
                  <Cover
                    filePath={file}
                    width={200}
                    className="m-0.5"
                    fileName={file}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
