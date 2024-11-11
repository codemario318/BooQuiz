import { Module } from '@nestjs/common';
import { PlayService } from './play.service';
import { PlayGateway } from './play.gateway';
import { QuizZoneModule } from '../quiz-zone/quiz-zone.module';

export const PLAY_STORAGE = Symbol('PlayStorage');

@Module({
    imports: [QuizZoneModule],
    providers: [
        PlayGateway,
        PlayService,
        {
            provide: PLAY_STORAGE,
            useValue: new Map(),
        },
    ],
})
export class PlayModule {}
