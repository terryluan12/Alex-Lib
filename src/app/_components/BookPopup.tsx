import { createPortal } from "react-dom";
import { Book } from "./Book";
import "./Popup.css";
export const BookPopup = ({
  isOpen,
  onClose,
  bookFile,
}: {
  isOpen: boolean;
  onClose: () => void;
  bookFile: { data: Uint8Array } | undefined;
}) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="modal">
      <div className="modal-container">
        <div className="modal-body">
          <button onClick={onClose} className="absolute top-0">
            X
          </button>
          <Book file={bookFile} />
        </div>
      </div>
    </div>,
    document.getElementById("modal")! // this will let react-dom know that we want to render this modal outside the current React tree
  );
};
