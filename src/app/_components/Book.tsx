"use client";
import { pdfjs } from "react-pdf";
import { useState, useCallback } from "react";
import { Document, Page } from "react-pdf";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const resizeObserverOptions = {};
const maxWidth = 800;
export const Book = ({ file }: { file: { data: Uint8Array } | undefined }) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }
  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  const handlePageClick = (event) => {
    const { left, right } = event.target.getBoundingClientRect();
    const midpoint = (left + right) / 2;
    const clickX = event.clientX;

    // Check if the click is on the right half
    if (clickX > midpoint) {
      if (numPages && pageNumber < numPages) {
        setPageNumber(pageNumber + 1);
      }
    } else {
      if (pageNumber > 1) {
        setPageNumber(pageNumber - 1);
      }
    }
  };
  return (
    <div ref={setContainerRef}>
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        <Page
          pageNumber={pageNumber}
          onClick={handlePageClick}
          width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth}
        />
      </Document>
      <p>
        Page {pageNumber} of {numPages}
      </p>
    </div>
  );
};
