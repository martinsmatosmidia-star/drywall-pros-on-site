
# Ajuste de regras de aberturas

Refinar as fórmulas de aberturas conforme correção do usuário, mantendo o restante do plano anterior (tela Configurações + preço por perfil).

## Nova regra de aberturas

**Porta** (e vão livre):
- +1 montante extra (não +2)
- Guia da verga: comprimento = `largura` da abertura → `⌈largura / 3⌉` peças de 3m

**Janela**:
- +1 montante extra
- Guia da verga + peitoril: comprimento total = `largura × 2` → `⌈(largura × 2) / 3⌉` peças de 3m
- Exemplo: janela 1,5m × 1,2m → verga 1,5m + peitoril 1,5m = 3m → **1 guia de 3m**

## Mudanças em `src/lib/calc.ts`

- Adicionar `tipo: "porta" | "janela" | "vao"` em `Opening` (default `"porta"` para compatibilidade).
- `montantesParede`: `+1` por abertura (em vez de `+2`).
- `guiasExtraAberturas`:
  - porta/vão: `⌈largura / 3⌉`
  - janela: `⌈(largura × 2) / 3⌉`
- Remover o `+1` fixo que existia hoje na fórmula.

## Mudanças em `src/components/ItemCard.tsx`

- Adicionar seletor de tipo (Porta / Janela / Vão) em cada linha de abertura, com 3 botões pequenos.
- Defaults ao adicionar:
  - Porta: 0,8 × 2,1
  - Janela: 1,5 × 1,2
  - Vão: 0,9 × 2,1
- Memória de cálculo do item passa a mostrar quantos montantes/guias extras cada abertura gerou.

## Atualização de testes (`src/lib/calc.test.ts`)

- Reescrever os testes existentes que assumiam `+2` montantes e `⌈largura×2/3⌉+1` guias.
- Adicionar casos:
  - Janela 1,5×1,2 → 1 montante extra, 1 guia
  - Porta 0,9×2,1 → 1 montante extra, 1 guia
  - 2 portas → 2 montantes extras, 2 guias
  - Janela 4,0 × 1,2 → 1 montante extra, ⌈8/3⌉ = 3 guias

## Tela Configurações + preço por perfil (mantido do plano anterior)

- Nova rota `src/routes/configuracoes.tsx`: dados da conta, dados da empresa, upload de logo, botão Sair.
- Em `src/routes/opcoes.tsx`: remover seção empresa e botão sair.
- `src/routes/__root.tsx`: bottom nav passa a ter 5 abas (Início, Materiais, Orçamento, Opções, Configurações).
- Migration: adicionar `preco_montante_48/70/90` e `preco_guia_48/70/90` em `calc_settings`.
- `src/hooks/useSettings.ts`: incluir os 6 novos campos.
- `src/lib/calc.ts`: helpers `montantePrecoFor(perfil_mm, settings)` e `guiaPrecoFor(perfil_mm, settings)`.
- `src/routes/materiais.tsx`: usar os helpers conforme `perfil_mm` ativo.
- `src/routes/opcoes.tsx`: substituir os 2 inputs únicos por uma grade 3×2 (montante 48/70/90 e guia 48/70/90), com destaque no perfil ativo.

## Arquivos tocados

- **Criar**: `src/routes/configuracoes.tsx`
- **Editar**: `src/lib/calc.ts`, `src/lib/calc.test.ts`, `src/components/ItemCard.tsx`, `src/routes/opcoes.tsx`, `src/routes/materiais.tsx`, `src/routes/__root.tsx`, `src/hooks/useSettings.ts`
- **Migration**: 1 nova (6 colunas em `calc_settings`)

## Compatibilidade

- Aberturas existentes em rascunhos sem campo `tipo` são tratadas como `"porta"`.
- Colunas antigas `preco_montante` / `preco_guia` permanecem no banco (deprecated, não usadas na UI).
