// Calcula uma escala "redonda" para o eixo dos gráficos
// (ex.: máximo 43 -> eixo de 0 a 50 com marcas 0, 10, 20, 30, 40, 50).

export function escalaAmigavel(maximo, alvoDeMarcas = 4) {
  if (!Number.isFinite(maximo) || maximo <= 0) {
    return { max: 10, ticks: [0, 5, 10] };
  }
  const passoBruto = maximo / alvoDeMarcas;
  const potencia = 10 ** Math.floor(Math.log10(passoBruto));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((p) => p >= passoBruto);
  const max = Math.ceil(maximo / passo - 1e-9) * passo;
  const ticks = [];
  for (let v = 0; v <= max + 1e-9; v += passo) {
    ticks.push(Math.round(v * 1000) / 1000);
  }
  return { max, ticks };
}
