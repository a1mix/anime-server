import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsersModule } from "./users/users.module";
import { ConfigModule } from "@nestjs/config";
import { User } from "./users/users.model";
import { RolesModule } from "./roles/roles.module";
import { Role } from "./roles/roles.model";
import { UserRoles } from "./roles/user-roles.model";
import { AuthModule } from "./auth/auth.module";
import { AnimesModule } from "./animes/animes.module";
import { Anime } from "./animes/animes.model";
import { UserAnimes } from "./animes/user-animes.model";
import { EpisodesModule } from "./episodes/episodes.module";
import { Episodes } from "./episodes/episodes.model";
import { join } from "path";
import { ServeStaticModule } from '@nestjs/serve-static';
import { FilesModule } from "./files/files.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.env.NODE_ENV}.env`,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads"),
      exclude: ["/api*"],
    }),
    SequelizeModule.forRoot({
      dialect: "postgres",
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [User, Role, UserRoles, Anime, UserAnimes, Episodes],
      autoLoadModels: true,
    }),
    UsersModule,
    RolesModule,
    AuthModule,
    AnimesModule,
    EpisodesModule,
    FilesModule
  ],
})
export class AppModule {}
