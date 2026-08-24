export const DEBT_PARSER = Symbol('DEBT_PARSER');

/**
 * Forma cruda que devuelve el parser antes de construir el Money VO,
 * porque el parser (LLM) no conoce el dominio.
 */
export interface ParsedDebt {
  debtorName: string;
  amount: number;
  currency: string;
  reason: string;
  date: string;
}

export interface DebtParserPort {
  parse(text: string): Promise<ParsedDebt>;
}
