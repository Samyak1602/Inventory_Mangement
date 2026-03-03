import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'varchar',
    default: UserRole.ADMIN,
  })
  role: UserRole;

  @Column({ nullable: true })
  avatarUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
