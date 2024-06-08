import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AnyFilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { EpisodesService } from "./episodes.service";
import { Episodes } from "./episodes.model";
import { join } from "path";
import { writeFile } from "fs";
import { Roles } from "src/auth/roles-auth.decorator";
import { UpdateEpisodeDto } from "./dto/update-episode.dto";
import { RolesGuard } from "src/auth/roles-guard";

@Controller("episodes")
export class EpisodesController {
  constructor(private episodesService: EpisodesService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async createEpisode(
    @UploadedFile() file: Express.Multer.File,
    @Body("episode_number") episodeNumber: number,
    @Body("anime_id") animeId: number,
    @Body("title") title: string
  ) {
    const originalFilename = file.originalname;
    const uploadPath = join(__dirname, "..", "uploads", originalFilename);
    writeFile(uploadPath, file.buffer, (err) => {
      if(err) throw new HttpException('Ошибка во время записи файла', HttpStatus.BAD_REQUEST);
      return this.episodesService.createEpisode(file, episodeNumber, animeId, title)
    });
  }

  @Get(":id")
  async getEpisode(
    @Param("id") id: number,
    @Res() res: Response
  ): Promise<void> {
    const episode = await this.episodesService.getEpisodeById(id);
    if (!episode) {
      res.status(404).send("Episode not found");
      return;
    }

    const filePath = `${process.cwd()}/uploads/${episode.episode_path}`;
    res.sendFile(filePath);
  }

  @Get()
  async getEpisodes(): Promise<Episodes[]> {
    return this.episodesService.getEpisodes();
  }


  @Patch(':id')
  @Roles("ADMIN")
  @UseGuards(RolesGuard)
  async update(
    @Param('id') id: number,
    @Body() updateEpisodeDto: UpdateEpisodeDto,
  ): Promise<[number, Episodes[]]> {
    const [updatedCount, [updatedEpisode]] = await this.episodesService.update(id, updateEpisodeDto);
    if (updatedCount === 0) {
      throw new HttpException('Episode not found', HttpStatus.NOT_FOUND);
    }
    return [updatedCount, [updatedEpisode]];
  }

  @Delete(':id')
  @Roles("ADMIN")
  @UseGuards(RolesGuard)
  async remove(@Param('id') id: number): Promise<void> {
    await this.episodesService.remove(id);
  }
}
