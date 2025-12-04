// src/components/Modal.js
import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 shadow-lg w-full max-w-md relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
