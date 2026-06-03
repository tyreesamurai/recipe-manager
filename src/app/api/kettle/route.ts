import { AppError } from "@/lib/errors";
import { kettle } from "@/lib/kettle";
import { withAuth } from "@/lib/route-auth";

export async function POST(request: Request) {
  const deny = await withAuth(request, "admin");
  if (deny) return deny;

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body;

  try {
    switch (action) {
      case "on":
        await kettle.on();
        return Response.json({ ok: true });

      case "off":
        await kettle.off();
        return Response.json({ ok: true });

      case "mode": {
        const mode = body.mode as string;
        if (!["M1", "M2", "M3", "M4"].includes(mode)) {
          return Response.json({ error: "Invalid mode" }, { status: 400 });
        }
        await kettle.setMode(mode as "M1" | "M2" | "M3" | "M4");
        return Response.json({ ok: true });
      }

      case "temperature": {
        const temperature = Number(body.temperature);
        const unit = (body.unit as "Fahrenheit" | "Celsius") ?? "Fahrenheit";
        if (Number.isNaN(temperature)) {
          return Response.json(
            { error: "temperature must be a number" },
            { status: 400 },
          );
        }
        await kettle.setTemperature(temperature, unit);
        return Response.json({ ok: true });
      }

      default:
        return Response.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    if (err instanceof AppError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}
