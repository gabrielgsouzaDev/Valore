# PROMPTS DE MÓDULOS - SISTEMA VALORE

## Módulo 1: Geral e Interface (UI/UX)
**Objetivo:** Refinar a experiência global do usuário.
- Garantir que o Onboarding Wizard salve corretamente o estado no LocalStorage (`onboardingCompleted`).
- Manter o botão de privacidade (Olhinho) visível na barra lateral desktop e no drawer mobile.
- Assegurar que os inputs de data sigam a paleta de cores do tema através das variáveis CSS injetadas.
- Validar se a renda mensal inicial é R$0 em novas contas.

## Módulo 2: Investimentos e Inteligência (FIRE/IR)
**Objetivo:** Adicionar ferramentas de valor PRO para investidores.
- Implementar o `FireSimulator` na página de investimentos, utilizando a rentabilidade real calculada (ou estimada).
- Garantir que o `TaxReport` exiba corretamente o custo médio e a posição total para declaração de bens.
- Otimizar a `UpdateTable` para permitir edições rápidas sem recarregar a página, mantendo os termos simplificados.

## Módulo 3: Economia e Objetivos
**Objetivo:** Controle de caixa e metas de vida.
- Alinhar o widget "Disponível para Investir" com o visual do card "Regra de Sobra".
- Garantir que a exclusão de categorias limpe os vínculos em transações agendadas (Cascata).
- Manter o filtro de prioridade funcional na listagem de objetivos.

## Módulo 4: Transações e Cartões
**Objetivo:** Fluxo de caixa e gestão de crédito.
- Refinar a lógica de auto-categorização no `OfxImporter`.
- Manter o gráfico de Projeção de Faturas em largura total para melhor leitura de parcelas futuras.
- Garantir que a busca e ordenação no histórico de gastos de cartões funcionem de forma reativa.

## Módulo 5: Configurações e Sistema (Faxina Técnica)
**Objetivo:** Estabilidade e escala.
- Manter a estrutura modular do `AppContext` (evitar que o arquivo volte a crescer descontroladamente).
- Validar as bandeiras de cores nos blocos de temas (`AppearanceSection`).
- Assegurar que o módulo de Portfolio suma quando o módulo de Investimentos estiver desativado.
