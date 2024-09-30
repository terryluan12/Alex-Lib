"use client";
import { BookPopup } from "./BookPopup";
import { pdfjs } from "react-pdf";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Document, Thumbnail } from "react-pdf";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { FadeLoader } from "react-spinners";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const resizeObserverOptions = {};

export const Cover = ({
  filePath,
  className,
  height,
  width,
  fileName,
}: {
  filePath: string;
  className?: string;
  height?: number;
  width?: number;
  fileName?: string;
}) => {
  const [bookFile, setBookFile] = useState<{ data: Uint8Array }>();
  const [coverFile, setCoverFile] = useState<{ data: Uint8Array }>();
  const [isOpen, setOpen] = useState(false);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [_containerWidth, setContainerWidth] = useState<number>();

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  const memoizedFile = useMemo(() => {
    const fetchFile = async () => {
      try {
        const BUCKET_NAME = "alex-lib";
        const s3 = new S3Client({});
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: filePath,
        });
        const response = await s3.send(command);
        const rawFile = await response.Body?.transformToByteArray();
        if (!rawFile) {
          throw new Error("File not found");
        }
        return rawFile; // Return the fetched file
      } catch (err) {
        console.log(err);
        return null;
      }
    };
    return fetchFile();
  }, [filePath]);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  useEffect(() => {
    const handleFileFetch = async () => {
      const fileData = await memoizedFile;
      if (fileData) {
        setCoverFile({ data: fileData.slice() });
        setBookFile({ data: fileData.slice() });
      }
    };

    handleFileFetch();
  }, [memoizedFile]);

  return (
    <div ref={setContainerRef}>
      <Document
        file={coverFile}
        className={className}
        onItemClick={() => {
          setOpen(true);
        }}
        noData={<FadeLoader color="#000" loading={true} />}
        loading={<FadeLoader color="#000" loading={true} />}
      >
        <Thumbnail
          pageNumber={1}
          height={height}
          width={width}
          className={className}
        />
        <h1>{fileName?.split("/").pop()?.split(".")[0]}</h1>
        <BookPopup
          isOpen={isOpen}
          onClose={() => setOpen(false)}
          bookFile={bookFile}
        />
      </Document>
    </div>
  );
};
