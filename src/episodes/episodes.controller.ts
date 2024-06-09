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
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { EpisodesService } from "./episodes.service";
import { Episodes } from "./episodes.model";
const fs = require("fs");
const path = require("path");
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
    const uploadsDir = path.join(__dirname, "..", "uploads");
    const uploadPath = path.join(uploadsDir, originalFilename);

    try {
      // Check if the uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
        // Create the uploads directory if it doesn't exist
        await fs.promises.mkdir(uploadsDir, { recursive: true });
        console.log("Created uploads directory");
      }

      // Write the file to the uploads directory
      await fs.promises.writeFile(uploadPath, file.buffer);
      console.log("File saved:", uploadPath);

      // Call the episodesService.createEpisode method
      return this.episodesService.createEpisode(
        file,
        episodeNumber,
        animeId,
        title
      );
    } catch (error) {
      console.error("Error processing file:", error);
      throw new HttpException(
        "Error processing file",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(":id")
  async getAnimeEpisodesByAnimeId(
    @Param("id") id: number,
  ) {
    return  this.episodesService.getAnimeEpisodesByAnimeId(id);
  }

  @Get()
  async getEpisodes(): Promise<Episodes[]> {
    return this.episodesService.getEpisodes();
  }

  @Patch(":id")
  @Roles("ADMIN")
  @UseGuards(RolesGuard)
  async update(
    @Param("id") id: number,
    @Body() updateEpisodeDto: UpdateEpisodeDto
  ): Promise<[number, Episodes[]]> {
    const [updatedCount, [updatedEpisode]] = await this.episodesService.update(
      id,
      updateEpisodeDto
    );
    if (updatedCount === 0) {
      throw new HttpException("Episode not found", HttpStatus.NOT_FOUND);
    }
    return [updatedCount, [updatedEpisode]];
  }

  @Delete(":id")
  @Roles("ADMIN")
  @UseGuards(RolesGuard)
  async remove(@Param("id") id: number): Promise<void> {
    await this.episodesService.remove(id);
  }
}
