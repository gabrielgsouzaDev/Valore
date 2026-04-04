# 🛡️ Relatório Arquitetural: Protocolo de Proteção e Migração de Dados (Update Gate)

**Data:** 23 de Maio de 2024
**Assunto:** Implementação de Segurança de Dados em PWAs Local-First
**Status:** Proposta Técnica e Análise Estratégica

---

## 1. O Problema: "The Silent Data Loss" em PWAs
PWAs que utilizam LocalStorage como base de dados primária enfrentam riscos críticos durante atualizações de código:
- **Sobrescrita por Incompatibilidade:** Novo código espera `Schema V2`, mas lê `Schema V1` e, ao salvar, corrompe ou deleta campos antigos.
- **Limpeza do Browser:** O iOS/Android pode apagar o LocalStorage para liberar espaço se não for marcado como persistente.
- **Race Conditions:** O Service Worker atualiza o app em background e o usuário interage com uma versão mista de código/dados.

---

## 2. A Solução: Protocolo "Update Gate" (Portão de Atualização)

### 2.1 Sistema de Versionamento do Schema
Não utilizaremos a versão do `package.json` (que é de software), mas uma constante dedicada aos dados.

- **Constante:** `STORAGE_VERSION = 1.2` (ou a próxima versão sequencial).
- **Lógica de Inicialização:**
  ```javascript
  const localVer = localStorage.getItem('db_version');
  if (parseFloat(localVer) < CURRENT_STORAGE_VERSION) {
    showUpdateGateModal(); // Bloqueia a UI
  }
  ```

### 2.2 Componente de Interrupção (Modal de Proteção)
Um componente `High-Z-Index` que impede qualquer interação antes da segurança garantida.

**Requisitos:**
1. **Detecção Pró-ativa:** Identifica a discrepância de versão antes do `AppProvider` montar o estado.
2. **Botão de Backup Forçado:** O botão "Migrar e Atualizar" permanece desabilitado (`disabled`) até que o evento `onClick` do "Baixar Backup (JSON)" seja disparado.
3. **Download Transparente:** Gera um Blob JSON do LocalStorage atual para que o usuário tenha uma cópia de segurança imediata.

### 2.3 Migration Runner (Execução Atômica)
A migração deve ser uma função pura que transforma o objeto de dados sem mutar o original até a confirmação.

```javascript
const migrate = (oldData) => {
  const newData = { ...oldData };
  // 1. Mapeamento de campos novos
  // 2. Transformação de tipos (ex: String para Number)
  // 3. Adição de metadados (ex: lastMigration)
  newData._version = CURRENT_STORAGE_VERSION;
  return newData;
};
```
*Nota: Se `migrate()` falhar, o app deve recarregar os dados do backup ou manter a versão antiga travada no modal de erro.*

### 2.4 Persistência de API (Storage Estimate)
Para evitar que o iOS apague os dados silenciosamente, utilizaremos a API de Persistência.

```javascript
if (navigator.storage && navigator.storage.persist) {
  const isPersisted = await navigator.storage.persist();
  console.log(`Persistência de dados: ${isPersisted ? "Garantida" : "Best-effort"}`);
}
```

---

## 3. Comparativo de Armazenamento: LocalStorage vs IndexedDB vs Supabase

| Característica | LocalStorage (Atual) | IndexedDB (Recomendado PWA) | Supabase/PostgreSQL (SaaS) |
| :--- | :--- | :--- | :--- |
| **Capacidade** | ~5MB (Muito limitada) | >250MB (Baseada no disco) | Ilimitada (Nuvem) |
| **Performance** | Síncrona (Pode travar a UI) | Assíncrona (Não trava a UI) | Depende da Latência/Rede |
| **Versionamento** | Manual (String-based) | Nativo (`onupgradeneeded`) | Migrações SQL (Prisma/Drizzle) |
| **Complexidade** | Baixíssima | Média (Uso do Dexie.js) | Alta (Backend/Auth) |
| **Modo Offline** | Nativo | Nativo | Exige Cache/Sync extra |

---

## 4. Análise Estratégica: Caminho para SaaS B2B

### Cenário A: Curto Prazo (PWA Local-First Robusto)
**Foco:** Refinar a experiência offline e garantir confiança total nos dados locais.
- **Ação:** Implementar o "Update Gate" e migrar para **IndexedDB (via Dexie.js)**.
- **Custos:** $0 (Infraestrutura local).
- **Vantagem:** Privacidade absoluta (venda como "Seus dados nunca saem do seu PC").
- **Desvantagem:** Se o usuário perder o dispositivo e não tiver backup, os dados somem.

### Cenário B: Médio Prazo (Modelo Híbrido - Freemium)
**Foco:** Oferecer Sincronização entre dispositivos como um recurso Premium.
- **Ação:** Manter o **IndexedDB** como fonte da verdade e usar **Supabase** como espelho (Cloud Sync).
- **Custos:** Supabase Free Tier (até 500MB) -> Pro Tier ($25/mês).
- **Vantagem:** Backup automático na nuvem; Multidispositivo (Celular + Desktop).
- **Desvantagem:** Necessidade de sistema de autenticação (Login/Senha).

### Cenário C: Longo Prazo (SaaS B2B Full-Cloud)
**Foco:** Multi-usuário, relatórios complexos e auditoria.
- **Ação:** Banco de dados relacional centralizado (PostgreSQL).
- **Custos:** Escaláveis conforme o número de conexões e volume de dados ($100+ /mês).
- **Vantagem:** Segurança nível bancário; Colaboração em tempo real; API para integrações.
- **Desvantagem:** Dependência total de internet; Maior latência.

---

## 5. Recomendação Final

Para um **SaaS B2B**, o caminho mais sólido e profissional é o **Uso Híbrido**:

1. **Camada de Dados:** Use **IndexedDB (Dexie.js)** para toda a operação do app. Isso garante que o app seja ultra-rápido (latência zero) e funcione no avião ou em áreas sem sinal.
2. **Sincronização:** Implemente um worker que detecta internet e sincroniza o IndexedDB com o **Supabase**.
3. **Segurança:** O "Update Gate" proposto no item 2 deve ser implementado **imediatamente**, mesmo no LocalStorage, para estancar o risco de perda de dados atual e preparar a transição para IndexedDB.

---
*Assinado,*
**Jules - Engenheiro de Software Sênior**
