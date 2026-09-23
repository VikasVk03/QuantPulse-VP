import type { Request, Response } from "express";
import { ProviderService } from "./provider.service.js";
import type { ProviderConfig, ProviderType } from "./provider.types.js";

export class ProviderController {
  private service: ProviderService;

  constructor(service: ProviderService = ProviderService.getInstance()) {
    this.service = service;
  }

  public getProviders = async (_req: Request, res: Response): Promise<void> => {
    const providers = this.service.getAllProviders();
    const activeProvider = this.service.getActiveProviderType();
    res.json({
      success: true,
      data: {
        activeProvider,
        providers,
      },
    });
  };

  public configureProvider = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const config: ProviderConfig = req.body;
      if (!config.providerType) {
        res
          .status(400)
          .json({ success: false, error: "providerType is required" });
        return;
      }
      const result = await this.service.configureProvider(config);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err?.message || "Failed to configure provider",
      });
    }
  };

  public testProvider = async (req: Request, res: Response): Promise<void> => {
    try {
      const config: ProviderConfig = req.body;
      if (!config.providerType) {
        res
          .status(400)
          .json({ success: false, error: "providerType is required" });
        return;
      }
      const result = await this.service.testProvider(config);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res
        .status(400)
        .json({ success: false, error: err?.message || "Test failed" });
    }
  };

  public switchProvider = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { providerType } = req.body as { providerType: ProviderType };
      if (!providerType) {
        res
          .status(400)
          .json({ success: false, error: "providerType is required" });
        return;
      }
      const result = await this.service.switchProvider(providerType);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err?.message || "Failed to switch provider",
      });
    }
  };
}
