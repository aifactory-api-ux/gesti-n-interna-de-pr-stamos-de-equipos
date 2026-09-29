import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfidentialClientApplication, type AuthorizationCodeRequest } from '@azure/msal-node';
import { azureConfig } from '../../config/azure.config';
import { Collaborator } from '../../entities/collaborator.entity';
import { AuthUser } from '../../types';
import { generateUUID } from '../../common/utils/uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private msalClient: ConfidentialClientApplication;

  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
  ) {
    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: azureConfig.clientId,
        clientSecret: azureConfig.clientSecret,
        authority: azureConfig.authority,
      },
    });
  }

  getAzureLoginUrl(state?: string): string {
    const authCodeUrlParameters = {
      scopes: azureConfig.scopes,
      redirectUri: azureConfig.redirectUri,
      state: state || generateUUID(),
      prompt: 'select_account',
    };

    return `https://login.microsoftonline.com/${azureConfig.tenantId}/oauth2/v2.0/authorize?${new URLSearchParams({
      client_id: azureConfig.clientId,
      response_type: 'code',
      redirect_uri: azureConfig.redirectUri,
      scope: azureConfig.scopes.join(' '),
      state: authCodeUrlParameters.state,
      prompt: authCodeUrlParameters.prompt,
    }).toString()}`;
  }

  async handleCallback(code: string): Promise<{ user: AuthUser; accessToken: string }> {
    if (!code) {
      throw new UnauthorizedException('Código de autorización no proporcionado');
    }

    try {
      const tokenRequest: AuthorizationCodeRequest = {
        code: code,
        scopes: azureConfig.scopes,
        redirectUri: azureConfig.redirectUri,
      };

      const tokenResponse = await this.msalClient.acquireTokenByCode(tokenRequest);

      if (!tokenResponse?.accessToken) {
        throw new UnauthorizedException('No se pudo obtener el token de acceso');
      }

      const account = tokenResponse.account;
      if (!account) {
        throw new UnauthorizedException('Cuenta no encontrada en la respuesta');
      }

      const azureAdId = account.username || account.localAccountId;
      const email = account.username || '';

      if (!email.toLowerCase().endsWith('@api-ux.com')) {
        throw new UnauthorizedException('Solo usuarios del dominio api-ux.com pueden acceder');
      }

      const userInfo = await this.getUserInfo(tokenResponse.accessToken);

      let collaborator = await this.collaboratorRepository.findOne({
        where: { azure_ad_id: azureAdId },
      });

      if (!collaborator) {
        collaborator = this.collaboratorRepository.create({
          id: generateUUID(),
          azure_ad_id: azureAdId,
          name: userInfo.displayName || email.split('@')[0],
          email: email,
        });
        await this.collaboratorRepository.save(collaborator);
        this.logger.log(`Nuevo usuario registrado: ${email}`);
      } else {
        collaborator.name = userInfo.displayName || collaborator.name;
        await this.collaboratorRepository.save(collaborator);
      }

      const user: AuthUser = {
        id: collaborator.id,
        azure_ad_id: collaborator.azure_ad_id,
        name: collaborator.name,
        email: collaborator.email,
        is_manager: false,
      };

      return { user, accessToken: tokenResponse.accessToken };
    } catch (error) {
      this.logger.error(`Error en callback de Azure AD: ${error.message}`, error.stack);
      throw new UnauthorizedException('Error al procesar la autenticación con Azure AD');
    }
  }

  private async getUserInfo(accessToken: string): Promise<AzureADUserInfo> {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return { displayName: '' };
    }

    return response.json();
  }

  async getCurrentUser(userId: string): Promise<AuthUser> {
    const collaborator = await this.collaboratorRepository.findOne({
      where: { id: userId },
    });

    if (!collaborator) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: collaborator.id,
      azure_ad_id: collaborator.azure_ad_id,
      name: collaborator.name,
      email: collaborator.email,
      is_manager: collaborator.email === 'admin@api-ux.com',
    };
  }

  async logout(): Promise<{ message: string }> {
    return { message: 'Sesión cerrada correctamente' };
  }
}

interface AzureADUserInfo {
  displayName?: string;
  mail?: string;
  userPrincipalName?: string;
}
