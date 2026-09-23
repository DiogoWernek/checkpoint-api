import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Review } from './review.entity';

@Entity('review_likes')
export class ReviewLike {
  @PrimaryColumn({ name: 'review_id' })
  reviewId: string;

  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Review, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
