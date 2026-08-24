import OpenAI from 'openai';
import {
  DebtParserPort,
  ParsedDebt,
} from '../../domain/ports/debt-parser.port';

const OPENCODE_ZEN_BASE_URL = 'https://opencode.ai/zen/v1';

const SYSTEM_PROMPT = `Sos un asistente que convierte mensajes en español sobre deudas informales en JSON estructurado.
Devolvé ÚNICAMENTE un objeto JSON válido, sin texto adicional ni markdown, con esta forma exacta:
{
  "debtorName": string,
  "amount": number,
  "currency": string,
  "reason": string,
  "date": string
}
Reglas:
- "currency" es un código de 3 letras (ej "ARS", "USD"). Si no se menciona, asumí "ARS".
- "date" es una fecha en formato ISO 8601 (ej "2026-08-24"). Si no se menciona una fecha explícita, usá la fecha de hoy que te paso en el mensaje.
- "reason" es un resumen corto del motivo de la deuda.
- Si el mensaje no tiene información suficiente para completar "debtorName" o "amount", devolvé en cambio {"error": "mensaje explicando qué falta"}.`;

export class DebtParsingError extends Error {}

export class OpencodeDebtParserAdapter implements DebtParserPort {
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    private readonly model: string,
    baseURL: string = OPENCODE_ZEN_BASE_URL,
  ) {
    this.client = new OpenAI({ apiKey, baseURL });
  }

  async parse(text: string): Promise<ParsedDebt> {
    const today = new Date().toISOString().slice(0, 10);

    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Fecha de hoy: ${today}\nMensaje: ${text}` },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new DebtParsingError('El parser no devolvió contenido');
    }

    const json = this.extractJson(content);

    if (typeof json.error === 'string') {
      throw new DebtParsingError(json.error);
    }

    return this.validate(json);
  }

  private extractJson(content: string): Record<string, unknown> {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new DebtParsingError('La respuesta del parser no contiene JSON');
    }

    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      throw new DebtParsingError('La respuesta del parser no es JSON válido');
    }
  }

  private validate(json: Record<string, unknown>): ParsedDebt {
    const { debtorName, amount, currency, reason, date } = json;

    if (typeof debtorName !== 'string' || !debtorName.trim()) {
      throw new DebtParsingError('Falta el nombre del deudor');
    }
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
      throw new DebtParsingError('El monto no es válido');
    }
    if (typeof date !== 'string' || Number.isNaN(Date.parse(date))) {
      throw new DebtParsingError('La fecha no es válida');
    }

    return {
      debtorName: debtorName.trim(),
      amount,
      currency:
        typeof currency === 'string' && currency.trim()
          ? currency.trim().toUpperCase()
          : 'ARS',
      reason:
        typeof reason === 'string' && reason.trim()
          ? reason.trim()
          : 'sin especificar',
      date,
    };
  }
}
