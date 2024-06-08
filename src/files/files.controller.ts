import { Controller, Get, Param, Res } from '@nestjs/common';
import { join } from 'path';
import { Response } from 'express';
import { readFile } from 'fs/promises';

@Controller('files')
export class FilesController {
  @Get('get/:filename')
  async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(__dirname, '..', 'uploads', filename);

    try {
      const fileBuffer = await readFile(filePath);
      res.setHeader('Content-Type', 'video/mp4'); // Установите правильный тип контента
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(fileBuffer);
    } catch (error) {
      console.error(error);
      res.status(404).send('Файл не найден');
    }
  }
}