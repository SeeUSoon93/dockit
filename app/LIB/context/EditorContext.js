"use client";

import { createContext, useContext, useState } from "react";

const EditorContext = createContext();

export function EditorProvider({ children }) {
  const [editor, setEditor] = useState(null);

  const [saveAction, setSaveAction] = useState(null);
  const [downloadPDFAction, setDownloadPDFAction] = useState(null);
  const [downloadDocxAction, setDownloadDocxAction] = useState(null);
  const [printAction, setPrintAction] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const value = {
    editor,
    setEditor,
    saveAction,
    setSaveAction,
    downloadPDFAction,
    setDownloadPDFAction,
    downloadDocxAction,
    setDownloadDocxAction,
    printAction,
    setPrintAction,
    selectedObject,
    setSelectedObject
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditorContext() {
  return useContext(EditorContext);
}
