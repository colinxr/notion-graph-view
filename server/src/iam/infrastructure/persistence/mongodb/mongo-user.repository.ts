import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/models/user.entity';
import { UserModel, UserDocument } from './schemas/user.schema';
import { AuthToken } from '../../../domain/models/auth-token.value-object';
import { NotionCredentials } from '../../../domain/models/notion-credentials.value-object';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const userDoc = await this.userModel.findOne({ id }).exec();
    return userDoc ? this.mapToEntity(userDoc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await this.userModel.findOne({ email }).exec();
    return userDoc ? this.mapToEntity(userDoc) : null;
  }

  async findByNotionWorkspaceId(workspaceId: string): Promise<User | null> {
    const userDoc = await this.userModel.findOne({
      'notionCredentials.workspaceId': workspaceId,
    }).exec();
    return userDoc ? this.mapToEntity(userDoc) : null;
  }

  async findAll(): Promise<User[]> {
    const userDocs = await this.userModel.find().exec();
    return userDocs.map(doc => this.mapToEntity(doc));
  }

  async save(entity: User): Promise<void> {
    const userDoc = await this.userModel.findOne({ id: entity.id }).exec();

    const userData = {
      id: entity.id,
      email: entity.email,
      name: entity.name,
      notionCredentials: entity.notionCredentials ? {
        accessToken: entity.notionCredentials.getAccessToken(),
        workspaceId: entity.notionCredentials.getWorkspaceId(),
      } : undefined,
      authToken: entity.authToken ? {
        token: entity.authToken.getToken(),
        expiresAt: entity.authToken.getExpiresAt(),
      } : undefined,
    };

    if (userDoc) {
      // Update existing user
      await this.userModel.updateOne({ id: entity.id }, userData).exec();
    } else {
      // Create new user
      await this.userModel.create(userData);
    }
  }

  async delete(id: string): Promise<void> {
    await this.userModel.deleteOne({ id }).exec();
  }

  private mapToEntity(userDoc: UserDocument): User {
    // Create the User entity from the document
    const user = new User(
      userDoc.id,
      userDoc.email,
      userDoc.name,
      userDoc.notionCredentials 
        ? NotionCredentials.create(
            userDoc.notionCredentials.accessToken,
            userDoc.notionCredentials.workspaceId
          )
        : undefined,
      userDoc.authToken
        ? AuthToken.create(userDoc.authToken.token)
        : undefined,
      new Date(userDoc.createdAt || new Date()),
      new Date(userDoc.updatedAt || new Date()),
    );

    return user;
  }
} 