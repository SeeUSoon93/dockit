// app/LIB/context/EditorContext.js

"use client";

import { createContext, useContext, useState } from "react";

const EditorContext = createContext();

export function EditorProvider({ children }) {
  const [editor, setEditor] = useState(null);

  // [추가] 인쇄와 저장 함수를 저장할 state
  const [printAction, setPrintAction] = useState(null);
  const [saveAction, setSaveAction] = useState(null);

  const value = {
    editor,
    setEditor,
    // [추가] context를 통해 함수와 설정자를 제공
    printAction,
    setPrintAction,
    saveAction,
    setSaveAction
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditorContext() {
  return useContext(EditorContext);
}
