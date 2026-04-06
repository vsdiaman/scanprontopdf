declare module 'react-native-file-selector' {
  export type FileSelectorResult = {
    uri: string;
    name: string;
    size?: number;
    type?: string;
  };

  export function selectFile(options: {
    type?: string;
  }): Promise<FileSelectorResult>;
}
