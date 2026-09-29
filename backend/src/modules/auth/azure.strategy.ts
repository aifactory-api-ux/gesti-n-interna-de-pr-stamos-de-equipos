import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfidentialClientApplication, type AuthorizationCodeRequest } from '@azure/msal-node';
import { OIDCStrategy } from 'passport-azure-ad';
import { azureConfig } from '../../config/azure.config';
import { Collaborator } from '../../entities/collaborator.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../../types';
import { generateUUID } from '../../common/utils/uuid';

const OIDC_STRATEGY_NAME = 'azure-ad';

@Injectable()
export class AzureStrategy extends PassportStrategy(OIDCStrategy, OIDC_STRATEGY_NAME) {
  private msalClient: ConfidentialClientApplication;

  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
  ) {
    super({
      clientID: azureConfig.clientId,
      clientSecret: azureConfig.clientSecret,
      issuer: `https://login.microsoftonline.com/${azureConfig.tenantId}/v2.0`,
      redirectUrl: azureConfig.redirectUri,
      scope: azureConfig.scopes,
      identityMetadata: `https://login.microsoftonline.com/${azureConfig.tenantId}/.well-known/openid-configuration`,
      allowHttpForRedirectUrl: true,
      responseType: 'code',
      responseMode: 'query',
    });

    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: azureConfig.clientId,
        clientSecret: azureConfig.clientSecret,
        authority: azureConfig.authority,
      },
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: AzureADProfile,
    done: (err: Error | null, user: AuthUser | null) => void,
  ): Promise<void> {
    try {
      if (!profile) {
        done(new UnauthorizedException('No profile received from Azure AD'), null);
        return;
      }

      const azureAdId = profile.oid || profile.sub;
      const email = profile.emails?.[0] || profile.email || '';
      const name = profile.displayName || profile.name || '';

      if (!email.endsWith('@api-ux.com')) {
        done(new UnauthorizedException('Solo usuarios del dominio api-ux.com pueden acceder'), null);
        return;
      }

      let collaborator = await this.collaboratorRepository.findOne({
        where: { azure_ad_id: azureAdId },
      });

      if (!collaborator) {
        collaborator = this.collaboratorRepository.create({
          id: generateUUID(),
          azure_ad_id: azureAdId,
          name: name,
          email: email,
        });
        await this.collaboratorRepository.save(collaborator);
      }

      const user: AuthUser = {
        id: collaborator.id,
        azure_ad_id: collaborator.azure_ad_id,
        name: collaborator.name,
        email: collaborator.email,
        is_manager: false,
      };

      done(null, user);
    } catch (error) {
      done(error as Error, null);
    }
  }

  async getTokenFromCode(code: string): Promise<string> {
    const tokenRequest: AuthorizationCodeRequest = {
      code: code,
      scopes: azureConfig.scopes,
      redirectUri: azureConfig.redirectUri,
    };

    const response = await this.msalClient.acquireTokenByCode(tokenRequest);
    return response?.accessToken || '';
  }
}

interface AzureADProfile {
  oid?: string;
  sub?: string;
  displayName?: string;
  name?: string;
  email?: string;
  emails?: string[];
}
