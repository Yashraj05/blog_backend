import { IsDate, IsDateString, IsNotEmpty } from 'class-validator';

export class SchedulePostDto {
  @IsNotEmpty()
  @IsDateString()
  date: Date;
}
