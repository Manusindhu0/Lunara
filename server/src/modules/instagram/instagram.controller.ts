import type { Request, Response } from 'express';
import { instagramCallbackQuerySchema, instagramConnectQuerySchema } from './instagram.schemas';
import { instagramService } from './instagram.service';

export class InstagramController {
  async connect(req: Request, res: Response): Promise<void> {
    const query = instagramConnectQuerySchema.parse(req.query);
    const shouldRedirect = query.redirect === '1' || query.redirect === 'true';

    const result = await instagramService.initiateConnect(req.user!.id);

    if (shouldRedirect) {
      if (result.configured && result.authorizationUrl) {
        res.redirect(result.authorizationUrl);
        return;
      }
      res.redirect(instagramService.buildFrontendRedirect({ ig_error: 'not_configured' }));
      return;
    }

    res.json(result);
  }

  async callback(req: Request, res: Response): Promise<void> {
    const query = instagramCallbackQuerySchema.parse(req.query);
    const redirectUrl = await instagramService.handleCallback({
      code: query.code,
      state: query.state,
      error: query.error,
      authenticatedUserId: req.user?.id,
    });
    res.redirect(redirectUrl);
  }

  async status(req: Request, res: Response): Promise<void> {
    const status = await instagramService.getStatus(req.user!.id);
    res.json(status);
  }

  async disconnect(req: Request, res: Response): Promise<void> {
    const result = await instagramService.disconnect(req.user!.id);
    res.json(result);
  }
}

export const instagramController = new InstagramController();
