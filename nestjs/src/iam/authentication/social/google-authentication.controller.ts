import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { Auth } from '../decorators/auth.decorator';
import { AuthType } from '../enums/auth-type.enum';
import { GoogleTokenDto } from '../dto/google-token.dto';
import { GoogleAuthenticationService } from './google-authentication.service';

@Auth(AuthType.None)
@Controller('authentication/google')
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthService: GoogleAuthenticationService,
  ) {}

  @Post()
  authenticate(@Body() tokenDto: GoogleTokenDto) {
    return this.googleAuthService.authenticate(tokenDto.token);
  }

  @Get()
  @UseGuards(AuthGuard('google'))
  googleAuth(@Req() req: Request) {
    console.log('Authorization with Google');
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request) {
    const refreshToken = await this.googleAuthService.googleLogin(req);
    req.res.redirect(
      `http://localhost:3000/api/auth?refreshToken=${refreshToken}`,
    );
  }
}
