import { useEffect, useRef } from "react";

const CustomModal = ({
  isOpen,
  onClose,
  closeOnClickOutside = true,
  children,
  className = "",
}) => {
  const modalRef = useRef();
  const backdropRef = useRef();

  // Handle keydown events (ESC to close)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle outside clicks
  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return;

    const handleClickOutside = (event) => {
      // Only close if clicking directly on the backdrop, not any children
      if (event.target === backdropRef.current) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeOnClickOutside, onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      // Stop propagation on the backdrop div itself
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={modalRef}
        className={`${className}`}
        // Prevent any clicks inside the modal from propagating
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default CustomModal;
