declare module 'react-native-pdf-lib' {
  export type DrawImageOptions = {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  export class PDFPage {
    static create(): PDFPage;
    setMediaBox(x: number, y: number, width: number, height: number): PDFPage;
    drawImage(
      path: string,
      type: 'jpg' | 'png',
      options: DrawImageOptions,
    ): PDFPage;
  }

  export class PDFDocument {
    static create(path: string): PDFDocument;
    addPages(...pages: PDFPage[]): PDFDocument;
    write(): Promise<string>;
  }
}
