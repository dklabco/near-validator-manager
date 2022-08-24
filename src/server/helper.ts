import { Response, Request } from "restify";
import { promises as fs } from "fs";

export async function outputView(req: Request, res: Response, templatePath: string): Promise<void> {
  try {
    const layout = await fs.readFile(templatePath);
    res.sendRaw(200, layout.toString("utf-8"), {
      "Content-Type": "text/html",
      "Content-Length": String(layout.byteLength)
    });
  } catch (e) {
    res.send(500, (e as Error).message);
  }
}
