import { Express } from 'express';

declare global {
  namespace Express {
    interface Multer {
      File: any; // Замените 'any' на нужный тип файла
    }
  }
}
