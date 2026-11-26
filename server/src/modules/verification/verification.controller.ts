import type { Request, Response } from 'express';
import { adminReviewSchema } from './verification.schemas';
import { verificationService } from './verification.service';

export class VerificationController {
  async checkEligibility(req: Request, res: Response): Promise<void> {
    const result = await verificationService.checkEligibility(req.user!.id);
    res.json(result);
  }

  async status(req: Request, res: Response): Promise<void> {
    const status = await verificationService.getStatus(req.user!.id);
    res.json(status);
  }

  async adminReview(req: Request, res: Response): Promise<void> {
    const input = adminReviewSchema.parse(req.body);
    const verification = await verificationService.adminReview(req.user!.id, input);
    res.json({ verification });
  }
}

export const verificationController = new VerificationController();
