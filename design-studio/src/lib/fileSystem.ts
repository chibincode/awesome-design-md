export interface FileSession {
  handle: FileSystemFileHandle | null;
  name: string;
  pathHint?: string;
}

export function supportsFileSystemAccess() {
  return typeof window !== "undefined" && "showOpenFilePicker" in window && "showSaveFilePicker" in window;
}

export async function openDesignFile(): Promise<{ session: FileSession; content: string } | null> {
  if (!supportsFileSystemAccess()) return null;

  const [handle] = await window.showOpenFilePicker({
    excludeAcceptAllOption: false,
    multiple: false,
    types: [
      {
        description: "Markdown",
        accept: {
          "text/markdown": [".md"]
        }
      }
    ]
  });

  const file = await handle.getFile();
  return {
    session: { handle, name: file.name },
    content: await file.text()
  };
}

export async function saveDesignFile(session: FileSession, content: string, suggestedName: string) {
  let handle = session.handle;

  if (!handle) {
    if (!supportsFileSystemAccess()) {
      throw new Error("This browser does not support direct file save.");
    }
    handle = await window.showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: "Markdown",
          accept: {
            "text/markdown": [".md"]
          }
        }
      ]
    });
  }

  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
  return {
    handle,
    name: handle.name
  };
}
