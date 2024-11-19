import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Quiz } from './entities/quiz.entity';
import { Player } from './entities/player.entity';
import { QuizZone } from './entities/quiz-zone.entity';
import { IQuizZoneRepository } from './repository/quiz-zone.repository.interface';
import { WaitingQuizZoneDto } from './dto/waiting-quiz-zone.dto';

const playTime = 30_000;
const MAX_PLAYERS = 10;
export const quizzes: Quiz[] = [
    { question: '신이 화나면?', answer: '신발끈', playTime },
    { question: '도둑이 훔친 돈을 뭐라고 하는가?', answer: '슬그머니', playTime },
    { question: '털이 있는 동물들이 가장 좋아하는 장소는?', answer: '모텔', playTime },
    { question: '아몬드가 죽으면?', answer: '다이아몬드', playTime },
    { question: '왕이 넘어지면?', answer: '킹콩', playTime },
    { question: '바나나가 웃으면?', answer: '바나나킥', playTime },
];

@Injectable()
export class QuizZoneService {
    constructor(
        @Inject('QuizZoneRepository')
        private readonly repository: IQuizZoneRepository,
    ) {}

    /**
     * 새로운 퀴즈 존을 생성합니다.
     *
     * @param quizZoneId - 등록될 퀴즈존 ID
     * @param adminId
     * @returns 퀴즈 존을 생성하고 저장하는 비동기 작업
     * @throws(ConflictException) 이미 저장된 ID인 경우 예외 발생
     */
    async create(quizZoneId: string, adminId: string): Promise<void> {
        const player: Player = { id: adminId, score: 0, submits: [], state: 'WAIT' };
        const quizZone: QuizZone = {
            players: new Map<string, Player>([[adminId, player]]),
            title: "넌센스 퀴즈",
            description: "넌센스 퀴즈 입니다",
            adminId: adminId,
            maxPlayers: MAX_PLAYERS,
            quizzes: [...quizzes],
            stage: 'LOBBY',
            currentQuizIndex: -1,
            currentQuizStartTime: 0,
            currentQuizDeadlineTime: 0,
            intervalTime: 5000,
        };

        await this.repository.set(quizZoneId, quizZone);
    }

    /**
     * 퀴즈 존을 ID로 조회합니다.
     *
     * @param quizZoneId - 조회할 퀴즈 존의 ID
     * @returns 퀴즈 존 객체
     * @throws {NotFoundException} 퀴즈 존을 찾을 수 없는 경우
     */
    async findOne(quizZoneId: string): Promise<QuizZone> {
        return this.repository.get(quizZoneId);
    }

    /**
     * 대기 중인 퀴즈 존의 정보를 반환합니다.
     *
     * @param quizZoneId - 대기 중인 퀴즈 존의 ID
     * @param sessionId - 사용자 아이디
     * @returns 대기 중인 퀴즈 존 정보 DTO
     * @throws {NotFoundException} 퀴즈 존을 찾을 수 없는 경우
     */
    async getQuizWaitingRoom(quizZoneId: string, sessionId: string): Promise<WaitingQuizZoneDto> {
        const quizZone = await this.repository.get(quizZoneId);

        if (quizZone.players.size >= quizZone.maxPlayers) {
            throw new BadRequestException();
        }

        const player: Player = { id: sessionId, score: 0, submits: [], state: 'WAIT' };
        quizZone.players.set(sessionId, player);

        return {
            quizZoneTitle: quizZone.title,
            quizZoneDescription: quizZone.description,
            quizCount: quizZone.quizzes.length,
            stage: quizZone.stage,
        };
    }

    /**
     * 퀴즈 존을 삭제합니다.
     *
     * @param quizZoneId - 삭제할 퀴즈 존의 ID
     * @returns 퀴즈 존 삭제 작업
     */
    async clearQuizZone(quizZoneId: string): Promise<void> {
        await this.repository.delete(quizZoneId);
    }
}
