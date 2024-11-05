import { QuizZoneRepositoryInterface } from './quiz-zone.repository.interface';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { QuizZone } from './entities/quiz-zone.entity';

@Injectable()
export class QuizZoneRepositoryMemory implements QuizZoneRepositoryInterface {
  constructor(
    @Inject('DATA')
    private readonly data: Record<string, QuizZone>
  ) {}

  async set(key: string, value: QuizZone) {
      if (this.data.hasOwnProperty(key)) {
        throw new BadRequestException('Data already exists');
      }

      this.data[key] = value;
  }
}