const prisma = require('../lib/prisma');

/**
 * Calcula o custo de produção e sugere um preço de venda.
 *
 * @param {string} marcaId - ID da marca autenticada
 * @param {Array<{tecidoId: string, quantidade: number}>} tecidosUtilizados
 * @param {number} outrosCustos - custos adicionais em R$
 * @param {number|null} margemLucroPct - margem de lucro em % (0–99.99)
 * @returns {object} resultado do cálculo
 */
async function calcularPrecificacao(marcaId, tecidosUtilizados = [], outrosCustos = 0, margemLucroPct = null) {
  if (margemLucroPct !== null && Number(margemLucroPct) >= 100) {
    const err = new Error('A margem de lucro não pode ser 100%.');
    err.status = 400;
    throw err;
  }

  let custoTecidos = 0;
  const detalheTecidos = [];

  for (const item of tecidosUtilizados) {
    const tecido = await prisma.tecido.findFirst({
      where: { id: item.tecidoId, marcaId },
    });

    if (!tecido) {
      const err = new Error(`Tecido não encontrado: ${item.tecidoId}`);
      err.status = 422;
      throw err;
    }

    const custoItem = Number(tecido.valorPorUnidade) * Number(item.quantidade);
    custoTecidos += custoItem;

    detalheTecidos.push({
      tecidoId: tecido.id,
      nome: tecido.nome,
      valorPorUnidade: Number(tecido.valorPorUnidade),
      unidadeMedida: tecido.unidadeMedida,
      quantidade: Number(item.quantidade),
      custoCalculado: Number(custoItem.toFixed(2)),
    });
  }

  const custoTotal = custoTecidos + Number(outrosCustos);

  let precoSugerido = null;
  if (margemLucroPct !== null && Number(margemLucroPct) > 0) {
    precoSugerido = custoTotal / (1 - Number(margemLucroPct) / 100);
    precoSugerido = Number(precoSugerido.toFixed(2));
  } else if (margemLucroPct !== null && Number(margemLucroPct) === 0) {
    precoSugerido = Number(custoTotal.toFixed(2));
  }

  return {
    custoTecidos: Number(custoTecidos.toFixed(2)),
    outrosCustos: Number(Number(outrosCustos).toFixed(2)),
    custoTotal: Number(custoTotal.toFixed(2)),
    margemLucroPct: margemLucroPct !== null ? Number(margemLucroPct) : null,
    precoSugerido,
    detalheTecidos,
  };
}

module.exports = { calcularPrecificacao };
