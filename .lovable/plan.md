
# Drywall Pro — Plano Final

App PWA mobile-first em tema escuro minimalista para cálculo profissional de drywall, com nome **Drywall Pro**.

## Recomendações para minimizar erros (novas adições)

Para reduzir falhas e aumentar confiabilidade em obra, incluo estas melhorias além do escopo original:

### 1. Validação rigorosa de entrada
- Validação Zod em todos os campos (nunca aceitar valores ≤ 0, NaN, ou strings vazias)
- Limites máximos sensatos (ex: comprimento ≤ 100m, altura ≤ 15m) para evitar erro de digitação
- Aviso visual quando uma abertura for maior que a parede (impossível fisicamente)
- Bloqueio de salvar item incompleto

### 2. Testes automatizados das fórmulas
- Suíte de testes unitários (Vitest) para **todas** as fórmulas de cálculo (placas, montantes, guias, forro, parafusos, fita, massa)
- Casos de teste com valores conhecidos do brief (erro máximo 5%) — garante que refatorações futuras não quebrem cálculos
- Testes de borda: altura exatamente 3m, parede 100% aberturas, forro com queda zero

### 3. Funcionamento offline confiável
- Service Worker com cache da aplicação (essencial para obra sem sinal)
- Persistência local (IndexedDB) que sincroniza com o Cloud quando a conexão volta
- Indicador visual de status online/offline no topo
- Fila de sincronização para orçamentos criados offline

### 4. Prevenção de perda de dados
- Auto-save do orçamento em rascunho a cada alteração (localStorage)
- Recuperação automática ao reabrir o app se houve fechamento inesperado
- Confirmação antes de excluir item ou orçamento
- Histórico mantém versões — duplicar antes de editar um orçamento antigo

### 5. Feedback e transparência de cálculo
- Cada item mostra **memória de cálculo expansível** (área bruta, descontos, área líquida) — permite o usuário conferir
- Aba Materiais mostra fórmula resumida ao tocar no item (ex: "Placas: ⌈(120m² × 2)/2,16⌉ × 1,07 = 119")
- Banner de aviso quando perda > 15% ou margem < 0% (provável erro)

### 6. Segurança e isolamento
- RLS estrita por user_id em todas as tabelas
- Storage do logo com path `{user_id}/logo.png` e policy de acesso próprio
- Política HIBP ativa (bloqueia senhas vazadas no cadastro)
- Validação server-side via Edge Function ao salvar orçamento (evita manipulação)

### 7. UX para obra (mãos sujas, sol forte)
- Botões mínimos 56px de altura, espaçamento generoso
- Inputs com `inputMode="decimal"` (teclado numérico nativo)
- Vibração háptica leve ao adicionar item (confirmação tátil)
- Modo "tela sempre acesa" durante uso ativo (Wake Lock API)
- Alto contraste WCAG AAA no tema escuro

### 8. PDF robusto
- Geração client-side (jsPDF + html2canvas) — funciona offline
- Preview do PDF antes de compartilhar
- Nome do arquivo: `Orcamento_{Cliente}_{Data}.pdf`
- Compartilhamento via Web Share API nativa (WhatsApp, Email, Drive)
- Fallback para download direto se Share API indisponível

### 9. Backup e portabilidade
- Exportar/importar configurações em JSON (preços, perfis, empresa) — facilita usar em novo aparelho
- Histórico de orçamentos exportável em CSV

### 10. Versionamento de configurações
- Cada orçamento salva snapshot das configurações usadas (preços, perda, espaçamento)
- Reabrir orçamento antigo mostra os valores **da época**, não os atuais — evita recálculo silencioso

---

## Escopo confirmado

**Plataforma:** PWA mobile-first instalável  
**Visual:** Escuro minimalista (fundo quase preto, acento amarelo/laranja para CTAs, tipografia grande)  
**Auth:** Cadastro aberto (nome, email, senha) + HIBP ativo  
**Recursos:** Upload de logo, histórico de orçamentos, compartilhar PDF via WhatsApp, nome do cliente no orçamento  
**Escopo:** Implementação completa de uma vez

## Estrutura de telas
- **Início**: logo + altura fixa + comprimento + cliente/obra + 3 botões grandes (Parede/Contraparede/Forro) + lista de itens com memória de cálculo
- **Materiais**: tabela Nome · Quantidade · Preço · Total (tempo real)
- **Orçamento**: materiais + mão de obra + margem + valor final + Gerar PDF + Compartilhar WhatsApp + Histórico
- **Opções**: perfil (48/70/90), placas, fita exclusiva (papel/tela), espaçamento, perda%, preços, mão de obra/m², dados da empresa + logo

## Cálculos implementados (exatos do brief)
Áreas, placas (×2 paredes, ×1 contraparede/forro, ÷2,16, +perda), montantes (com extra altura>3m e +2/abertura), guias (lineares + extras), forro (perímetro, F530, reguladores, arame kg), parafusos (×30, múltiplo de 500), buchas (max 100 vs guias×5), massa (÷23), fita exclusiva (papel 150m **ou** tela 90m). Todos com `Math.ceil` e bloqueio de negativos.

## Backend (Lovable Cloud)
Tabelas com RLS por `user_id`:
- `profiles` (nome, email)
- `company_settings` (nome, telefone, email, observações, logo_url)
- `calc_settings` (perfis, preços, parâmetros, mão de obra)
- `quotes` (cliente, obra, data, snapshot_settings, total)
- `quote_items` (FK quote, tipo, dimensões)
- `openings` (FK quote_item, largura, altura)
- Bucket `logos` (path `{user_id}/logo.{ext}`)

## Stack técnico
TanStack Start + React 19 + Tailwind v4 + shadcn/ui + Zod + react-hook-form + Vitest + jsPDF + Lovable Cloud (Supabase) + IndexedDB (idb) + Service Worker (Workbox)
