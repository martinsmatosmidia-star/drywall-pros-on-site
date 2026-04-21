
# Ajustes — Cantoneira no forro + reset ao salvar/novo orçamento

## 1. Cantoneira como alternativa à tabica (forro)

Hoje o forro usa sempre **tabica** no perímetro. Vou adicionar **cantoneira** como opção por item de forro, com preço próprio.

### Banco
Migration adicionando à `calc_settings`:
- `preco_cantoneira` (numeric, default `12`)

### `src/lib/calc.ts`
- Adicionar campo `acabamento: "tabica" | "cantoneira"` no item de forro (default `"tabica"` para compatibilidade com rascunhos antigos).
- Em `computeTotals` / `buildMateriais`, somar perímetro de forro separadamente conforme acabamento:
  - `perimetro_tabica` (m) → barras de tabica de 3m com perda
  - `perimetro_cantoneira` (m) → barras de cantoneira de 3m com perda
- A linha de materiais passa a mostrar **Tabica** e/ou **Cantoneira** (apenas as usadas).

### `src/components/ItemCard.tsx`
- Em itens de forro, adicionar um seletor com 2 botões: **Tabica** / **Cantoneira**.
- Memória de cálculo mostra o acabamento escolhido e quantas barras gerou.

### `src/routes/opcoes.tsx`
- Na seção "Preços de materiais", renomear "Tabica" e adicionar campo "Cantoneira" ao lado, com preço editável.

### `src/hooks/useSettings.ts`
- Incluir `preco_cantoneira` no tipo `CalcSettings`.

### Testes (`src/lib/calc.test.ts`)
- Caso forro com tabica → conta tabica, cantoneira = 0.
- Caso forro com cantoneira → conta cantoneira, tabica = 0.
- Caso 2 forros, um de cada → soma cada um no respectivo material.

## 2. Reset automático ao salvar + botão "Novo orçamento"

### `src/hooks/useDraft.ts`
- Já existe `reset()`. Sem mudanças.

### `src/routes/orcamento.tsx`
- Após `saveQuote()` bem-sucedido: chamar `draft.reset()` e mostrar toast "Orçamento salvo. Pronto para o próximo!".
- Adicionar botão **Novo orçamento** no topo da tela (ao lado de "Histórico"), que pede confirmação antes de limpar caso haja itens no rascunho.

### `src/routes/index.tsx`
- Adicionar botão **Novo orçamento** no topo da tela inicial, com mesma confirmação.
- Botão fica visível só quando há itens ou cliente preenchido (evita poluir tela vazia).

## Arquivos tocados

- **Migration**: 1 nova (coluna `preco_cantoneira` em `calc_settings`)
- **Editar**: `src/lib/calc.ts`, `src/lib/calc.test.ts`, `src/components/ItemCard.tsx`, `src/routes/opcoes.tsx`, `src/routes/orcamento.tsx`, `src/routes/index.tsx`, `src/hooks/useSettings.ts`

## Compatibilidade

- Itens de forro antigos sem `acabamento` são tratados como `"tabica"`.
- Coluna `preco_tabica` permanece intacta.
