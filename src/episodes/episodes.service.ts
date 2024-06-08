import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Episodes } from "./episodes.model";
import { UpdateEpisodeDto } from "./dto/update-episode.dto";

@Injectable()
export class EpisodesService {
  constructor(
    @InjectModel(Episodes)
    private episodeModel: typeof Episodes
  ) {}

  async createEpisode(
    file: Express.Multer.File,
    episodeNumber: number,
    animeId: number,
    title: string
  ) {
    try {
      return this.episodeModel.create({
        episode_number: episodeNumber,
        anime_id: animeId,
        title: title,
        episode_path: file.originalname,
      });
    } catch (error) {
      return error;
    }
  }

  async getEpisodes(): Promise<Episodes[]> {
    return this.episodeModel.findAll();
  }

  async getEpisodeById(id: number): Promise<Episodes> {
    return this.episodeModel.findOne({ where: { id } });
  }

  async findAll(): Promise<Episodes[]> {
    return this.episodeModel.findAll();
  }

  async findOne(id: number): Promise<Episodes> {
    return this.episodeModel.findByPk(id);
  }

  async update(id: number, updateEpisodeDto: UpdateEpisodeDto): Promise<[number, Episodes[]]> {
    return this.episodeModel.update(updateEpisodeDto, {
      where: { id },
      returning: true,
    });
  }

  async remove(id: number): Promise<void> {
    const episode = await this.findOne(id);
    await episode.destroy();
  }
}
