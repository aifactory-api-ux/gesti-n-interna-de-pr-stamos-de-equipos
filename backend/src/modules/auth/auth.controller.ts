import {
  Controller,
  Get,
  Post,
  Query,
  HttpStatus,
  HttpCode,
  Req,
  Res,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AzureAuthGuard } from './auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../types';
import { AuthCallbackDto } from './dto/auth-callback.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('azure/login')
  @UseGuards(AzureAuthGuard)
  azureLogin(): { url: string } {
    const url = this.authService.getAzureLoginUrl();
    this.logger.log(`Redirigiendo a Azure AD login: ${url}`);
    return { url };
  }

  @Get('azure/callback')
  @HttpCode(HttpStatus.OK)
  async azureCallback(
    @Query() query: AuthCallbackDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(`Callback recibido con query: ${JSON.stringify(query)}`);

    if (query.error) {
      this.logger.error(`Error de Azure AD: ${query.error} - ${query.error_description}`);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${query.error}`);
      return;
    }

    if (!query.code) {
      this.logger.error('No se recibió código de autorización');
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_code`);
      return;
    }

    try {
      const { user, accessToken } = await this.authService.handleCallback(query.code);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const state = Buffer.from(JSON.stringify({ user, token: accessToken })).toString('base64');
      res.redirect(`${frontendUrl}/auth/callback?state=${state}`);
    } catch (error) {
      this.logger.error(`Error al procesar callback: ${error.message}`, error.stack);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }
  }

  @Get('me')
  @UseGuards(AzureAuthGuard)
  async getCurrentUser(@CurrentUser() user: AuthUser): Promise<AuthUser> {
    return this.authService.getCurrentUser(user.id);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AzureAuthGuard)
  async logout(@CurrentUser() user: AuthUser): Promise<{ message: string }> {
    this.logger.log(`Usuario ${user.email} cerró sesión`);
    return this.authService.logout();
  }
}
