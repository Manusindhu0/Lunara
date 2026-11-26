import type { Request, Response } from 'express';
import {
  applyCitizenshipSchema,
  checkUsernameQuerySchema,
  citizenIdParamSchema,
  listCitizensQuerySchema,
} from './citizens.schemas';
import { citizensService } from './citizens.service';

export class CitizensController {
  async getCitizenshipStatus(req: Request, res: Response): Promise<void> {
    const status = await citizensService.getCitizenshipStatus({
      id: req.user!.id,
      emailVerified: req.user!.emailVerified,
    });
    res.json(status);
  }

  async getMyCitizen(req: Request, res: Response): Promise<void> {
    const citizen = await citizensService.getMyCitizen(req.user!.id);
    res.json({ citizen });
  }

  async apply(req: Request, res: Response): Promise<void> {
    const input = applyCitizenshipSchema.parse(req.body);
    const citizen = await citizensService.applyForCitizenship(req.user!.id, input);
    res.status(201).json({ citizen });
  }

  async list(req: Request, res: Response): Promise<void> {
    const query = listCitizensQuerySchema.parse(req.query);
    const result = await citizensService.listCitizens(query);
    res.json(result);
  }

  async checkUsername(req: Request, res: Response): Promise<void> {
    const { username } = checkUsernameQuerySchema.parse(req.query);
    const result = await citizensService.checkUsername(username);
    res.json(result);
  }

  async getPublic(req: Request, res: Response): Promise<void> {
    const { citizenId } = citizenIdParamSchema.parse(req.params);
    const citizen = await citizensService.getPublicCitizen(citizenId);
    res.json({ citizen });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { citizenId } = citizenIdParamSchema.parse(req.params);
    const citizen = await citizensService.updateCitizen(
      citizenId,
      { id: req.user!.id, role: req.user!.role },
      req.body
    );
    res.json({ citizen });
  }
}

export const citizensController = new CitizensController();
