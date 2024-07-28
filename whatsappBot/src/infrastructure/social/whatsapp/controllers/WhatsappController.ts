import { Controller, Get } from "@overnightjs/core";
import { Request, Response } from "express";
import qr from "qr-image";

import { sessions } from "../whatsappSession";

@Controller("whatsapp")
export class WhatsappController {
  @Get("qrcode/:sessionId")
  public async getQRCode(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;

    if (!sessions.has(sessionId)) {
      res.status(404).send({ message: "Session not found" });
      return;
    }

    const client = sessions.get(sessionId);
    if (!client || !(client as any).qr) {
      res.status(404).send({ message: "QR code not available" });
      return;
    }

    const qrCode = (client as any).qr;
    const qrImage = qr.image(qrCode, { type: "png" });

    res.setHeader("Content-type", "image/png");
    qrImage.pipe(res);
  }
}
