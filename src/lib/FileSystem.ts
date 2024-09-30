export interface FileSystemNode {
  name: string;
  isFolder: boolean;
  parent?: FileSystemNode | null;
  children?: { [key: string]: FileSystemNode };
}

export class FileSystem {
  private root: FileSystemNode = { name: "", isFolder: true, parent: null };

  constructor(rootName = "") {
    this.root["name"] = rootName;
  }

  addPath(path: string) {
    if (!path) {
      throw new Error("Path cannot be empty");
    }
    const folders = path.split("/");
    const file = folders.pop()!;
    let currentFolder = this.root;

    for (const folder of folders) {
      if (!currentFolder.children) {
        currentFolder.children = {};
      }
      if (!currentFolder.children[folder]) {
        currentFolder.children[folder] = {
          name: folder,
          isFolder: true,
          parent: currentFolder,
        };
      }
      currentFolder = currentFolder.children[folder];
    }
    if (!currentFolder.children) {
      currentFolder.children = {};
    }
    currentFolder.children[file] = {
      name: file,
      isFolder: false,
      parent: currentFolder,
    };
  }

  getFileSystem(): FileSystemNode {
    return this.root;
  }

  getFullPath(node: FileSystemNode): string {
    let path = "";
    let current = node;
    while (current !== this.root) {
      path = current.name + "/" + path;
      current = current.parent!;
    }
    return path.slice(this.root.name.length, -1);
  }

  fromJSON(json: string) {
    const addParent = (node?: FileSystemNode) => {
      if (!node) {
        return;
      }
      if (node.children) {
        for (const child of Object.values(node.children)) {
          child.parent = node;
          addParent(child);
        }
      }
    };
    this.root = JSON.parse(json) as FileSystemNode;
    this.root.parent = null;
    if (this.root.children) {
      addParent(this.root);
      this.root.parent = this.root;
    }
  }

  toJSON(): string {
    const rootCopy = structuredClone(this.root);
    const deleteParent = (node?: FileSystemNode) => {
      if (!node) {
        return;
      }
      delete node.parent;
      if (node.children) {
        for (const child of Object.values(node.children)) {
          deleteParent(child);
        }
      }
    };
    deleteParent(rootCopy);
    return JSON.stringify(rootCopy);
  }
}
