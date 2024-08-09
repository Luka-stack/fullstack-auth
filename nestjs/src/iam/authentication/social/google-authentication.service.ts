import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticationService } from '../authentication.service';
import { User } from '../../../users/entities/user.entity';
import { Request } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthenticationService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  onModuleInit() {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  async authenticate(token: string) {
    try {
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: token,
      });

      const { email, sub: googleId } = loginTicket.getPayload();
      const user = await this.userRepository.findOneBy({ googleId });

      if (user) {
        return this.authService.generateTokens(user);
      }

      const newUser = await this.userRepository.save({ email, googleId });
      return this.authService.generateTokens(newUser);
    } catch (err) {
      const pgUniqueViolationCode = '23505';
      if (err.code == pgUniqueViolationCode) {
        throw new ConflictException();
      }

      throw new UnauthorizedException();
    }
  }

  async googleLogin(req: Request) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    const refreshTokenId = randomUUID();

    return this.authService.signInToken(1, 86400, {
      refreshTokenId,
    });

    // if (!req.user) {
    //   throw new UnauthorizedException();
    // }
    // return {
    //   message: 'User information from Google',
    //   user: req.user,
    // };
  }
}
