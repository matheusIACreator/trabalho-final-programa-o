# Gestão de Tratamentos Crónicos

Aplicação web para gestão de tratamentos médicos crónicos (medicação oral e injeções), direcionada a pacientes com doenças como diabetes e hipertensão. Permite registar, acompanhar e receber lembretes automáticos para cada toma ao longo do dia.

---

## Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Stack Tecnológico](#stack-tecnológico)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Modelo de Classes Java](#modelo-de-classes-java)
- [API REST](#api-rest)
- [Como Executar](#como-executar)
- [Conceitos de POO Implementados](#conceitos-de-poo-implementados)

---

## Visão Geral

**Quem usa:** Pacientes com doenças crónicas que tomam medicação regular (diabéticos, hipertensos, entre outros).

**Para quê:** Centralizar todos os tratamentos ativos, visualizar o calendário de tomas do dia, e receber notificações sonoras com popup no horário exato de cada dose.

**Benefícios:**
- Nunca esquecer uma toma graças ao agendador automático
- Calcular automaticamente a dose de insulina com base na glicemia atual (sliding scale)
- Dashboard com timeline do dia e navegação por calendário
- Histórico de todas as confirmações de tomas

---

## Funcionalidades

### Dashboard
- Timeline das tomas do dia atual, ordenada por hora
- Destaque visual para a próxima dose pendente e tomas já passadas
- Contadores de tomas totais, realizadas e pendentes
- Calendário interativo para consultar tomas de qualquer dia

### Tratamentos (CRUD completo)
- Listar todos os tratamentos com filtro por tipo
- Criar, editar e eliminar tratamentos
- Suporte a três tipos:
  - **Medicamento Oral** — forma farmacêutica (comprimido, cápsula, xarope, gotas, saqueta) e indicação de tomar com comida
  - **Injeção** — via de administração (subcutânea, intramuscular, intravenosa), volume em mL e necessidade de refrigeração
  - **Injeção de Insulina** — tipo de insulina (rápida, lenta, intermédia, mista), unidades por dose, cálculo automático de dose por glicemia

### Calculadora de Insulina (Sliding Scale)
- Inserir a glicemia atual (mg/dL) no formulário de edição
- O backend calcula as unidades recomendadas segundo tabela clínica simplificada:
  - < 70 mg/dL → 0 unidades (hipoglicemia)
  - ≤ 150 → dose base
  - ≤ 200 → base + 2 UI
  - ≤ 250 → base + 4 UI
  - \> 250 → base + 6 UI

### Notificações
- Agendador em background verifica tomas a cada 30 segundos
- Frontend faz polling a cada 5 segundos ao endpoint de pendentes
- Ao detetar notificação nova: toca som (`/alarme.mp3`) e exibe popup com prioridade colorida
- Prioridades: **Crítica** (insulina, vermelho) · **Urgente** (laranja) · **Normal** (azul)
- Ações no popup: **Adiar 10 min** ou **Já tomei ✓**

### Histórico
- Registo local (localStorage) de todas as tomas confirmadas
- Filtro por prioridade
- Data/hora de agendamento e de confirmação para cada entrada
- Botão para limpar o histórico

### Interface
- Tema claro/escuro
- Idioma PT/EN (next-intl)
- Totalmente responsivo

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│                  Next.js 16 · React 19                      │
│          Tailwind CSS · shadcn/ui · next-intl               │
│                                                             │
│  Dashboard  │  Tratamentos (CRUD)  │  Histórico             │
│             │                      │                        │
│         NotificacoesProvider (polling 5s)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP REST (JSON)
                      │ http://localhost:7000
┌─────────────────────▼───────────────────────────────────────┐
│                         Backend                             │
│              Java 17 · Javalin 6 · Jackson 2.17             │
│                                                             │
│  ServidorRest  │  AgendadorNotificacoes (30s)               │
│  RepositorioTratamentos  →  dados/tratamentos.json          │
│                                                             │
│  Tratamento (abstract)                                      │
│    ├── MedicamentoOral                                      │
│    └── Injecao                                              │
│          └── InjecaoInsulina                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

### Backend
| Tecnologia | Versão | Função |
|---|---|---|
| Java | 17 | Linguagem principal |
| Javalin | 6.1.3 | Servidor HTTP / REST |
| Jackson | 2.17.0 | Serialização JSON (com suporte polimórfico) |
| jackson-datatype-jsr310 | 2.17.0 | Serialização de `LocalDateTime` |
| SLF4J Simple | 2.0.13 | Logging |
| Maven | (wrapper incluído) | Build e gestão de dependências |

### Frontend
| Tecnologia | Versão | Função |
|---|---|---|
| Next.js | 16.2.6 | Framework React (App Router) |
| React | 19.2.4 | UI |
| Tailwind CSS | 4 | Estilização |
| radix-ui | 1.4.3 | Componentes acessíveis (Dialog, Select…) |
| react-hook-form | 7 | Formulários |
| Zod | 4 | Validação de schema |
| next-intl | 4 | Internacionalização (PT/EN) |
| date-fns | 4 | Manipulação de datas |
| sonner | 2 | Toasts |
| lucide-react | 1 | Ícones |

---

## Estrutura do Projeto

```
TrabalhoFinalPC/
├── backend/
│   └── tratamentos-backend/
│       ├── src/main/java/com/saude/tratamentos/
│       │   ├── App.java                          ← ponto de entrada
│       │   ├── modelo/
│       │   │   ├── Tratamento.java               ← superclasse abstrata
│       │   │   ├── Injecao.java                  ← subclasse
│       │   │   ├── InjecaoInsulina.java           ← sub-subclasse
│       │   │   ├── MedicamentoOral.java           ← subclasse
│       │   │   ├── ViaAdministracao.java          ← enum
│       │   │   ├── FormaOral.java                 ← enum
│       │   │   ├── TipoInsulina.java              ← enum
│       │   │   └── interfaces/
│       │   │       ├── Notificavel.java           ← interface
│       │   │       └── Agendavel.java             ← interface
│       │   ├── agendador/
│       │   │   ├── AgendadorNotificacoes.java     ← scheduler em background
│       │   │   └── Notificacao.java
│       │   ├── persistencia/
│       │   │   └── RepositorioTratamentos.java    ← CRUD + JSON
│       │   └── api/
│       │       └── ServidorRest.java              ← endpoints Javalin
│       ├── dados/
│       │   └── tratamentos.json                  ← persistência em ficheiro
│       └── pom.xml
│
└── frontend/
    ├── app/
    │   └── [locale]/
    │       ├── page.tsx                           ← Dashboard
    │       ├── DashboardClient.tsx
    │       ├── tratamentos/
    │       │   ├── page.tsx                       ← listagem
    │       │   ├── TratamentosClient.tsx
    │       │   ├── novo/page.tsx                  ← criar
    │       │   └── [id]/editar/page.tsx           ← editar
    │       └── historico/
    │           ├── page.tsx
    │           └── HistoricoClient.tsx
    ├── components/
    │   ├── NotificacaoModal.tsx                   ← popup de lembrete
    │   ├── NotificacoesProvider.tsx               ← fila de notificações
    │   ├── TratamentoForm.tsx                     ← formulário dinâmico
    │   └── Navbar.tsx
    ├── hooks/
    │   └── useNotificacoes.ts                     ← polling + som
    └── lib/
        ├── api.ts                                 ← chamadas ao backend
        ├── types.ts                               ← tipos TypeScript
        └── schemas.ts                             ← validação Zod
```

---

## Modelo de Classes Java

```
            «interface»          «interface»
            Notificavel          Agendavel
                 ▲                    ▲
                 └────────┬───────────┘
                          │ implements
               ┌──────────┴──────────┐
               │  Tratamento         │  ← classe abstrata
               │  (superclasse)      │
               │  - id: int (static) │
               │  - nomeMedicamento  │
               │  - dosagem          │
               │  - dataInicio/Fim   │
               │  - frequenciaHoras  │
               │  - observacoes      │
               │  + print()          │
               │  + toString()       │
               │  + equals()         │
               │  + clone()          │
               └────────┬────────────┘
                        │ extends
          ┌─────────────┴──────────────┐
          │                            │
  ┌───────┴────────┐         ┌─────────┴──────────┐
  │  Injecao       │         │  MedicamentoOral    │
  │  - via         │         │  - forma            │
  │  - volumeML    │         │  - tomarComComida   │
  │  - refrigerac. │         └─────────────────────┘
  └───────┬────────┘
          │ extends
  ┌───────┴────────────┐
  │  InjecaoInsulina   │
  │  - tipoInsulina    │
  │  - unidadesPorDose │
  │  - glicemia        │
  │  + ajustarPor      │
  │    Glicemia()      │
  └────────────────────┘
```

A coleção `ArrayList<Tratamento>` é usada em `App.demonstrarPolimorfismo()` e em `AgendadorNotificacoes` para iterar todos os tratamentos e invocar `getMensagemNotificacao()`, `getPrioridade()` e `proximoHorario()` — com **dynamic method dispatch** em tempo de execução.

---

## API REST

Base URL: `http://localhost:7000`

### Tratamentos

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/tratamentos` | Lista todos os tratamentos |
| `GET` | `/api/tratamentos/{id}` | Obtém tratamento por ID |
| `POST` | `/api/tratamentos` | Cria novo tratamento |
| `PUT` | `/api/tratamentos/{id}` | Atualiza tratamento |
| `DELETE` | `/api/tratamentos/{id}` | Remove tratamento |
| `GET` | `/api/tratamentos/{id}/horarios?dia=YYYY-MM-DD` | Horários previstos num dia |

### Notificações

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/notificacoes/pendentes` | Lista notificações não confirmadas |
| `POST` | `/api/notificacoes/{id}/confirmar` | Marca notificação como lida |
| `POST` | `/api/notificacoes/disparar/{tratId}` | Força disparo manual (debug) |

### Insulina

| Método | Endpoint | Body | Descrição |
|---|---|---|---|
| `POST` | `/api/insulina/{id}/ajustar` | `{ "glicemia": 180 }` | Calcula unidades recomendadas |

**Exemplo de resposta do ajuste de insulina:**
```json
{
  "unidadesRecomendadas": 14,
  "glicemia": 180
}
```

**Serialização polimórfica** — cada tratamento inclui o campo `"tipo"`:
```json
{ "tipo": "injecao_insulina", "nomeMedicamento": "Humalog", ... }
{ "tipo": "medicamento_oral", "nomeMedicamento": "Metformina", ... }
{ "tipo": "injecao",          "nomeMedicamento": "Enoxaparina", ... }
```

---

## Como Executar

### Pré-requisitos
- Java 17+
- Node.js 18+

### 1. Backend

```powershell
cd backend\tratamentos-backend

# Compilar e gerar JAR (inclui todas as dependências)
.\mvnw.cmd package -q

# Iniciar o servidor na porta 7000
java -jar target\tratamentos-backend.jar
```

Alternativamente, sem gerar JAR:
```powershell
.\mvnw.cmd exec:java -Dexec.mainClass="com.saude.tratamentos.App"
```

O servidor fica disponível em `http://localhost:7000`. Os dados são persistidos automaticamente em `dados/tratamentos.json`.

> **Nota:** Não executar diretamente pelo botão "Run" do VS Code — o IDE não resolve as dependências Maven. Usar sempre os comandos acima.

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

> O backend deve estar a correr antes de abrir o frontend.

---

## Conceitos de POO Implementados

| Conceito | Implementação |
|---|---|
| **Superclasse abstrata** | `Tratamento` — atributos `protected`, atributo estático `contadorTratamentos` |
| **Subclasses** | `Injecao`, `MedicamentoOral` |
| **Sub-subclasse** | `InjecaoInsulina extends Injecao` |
| **Construtores** | Sem parâmetros, com parâmetros e de cópia em todas as classes |
| **`this` e `this()`** | `Tratamento` usa `this()` no construtor com parâmetros |
| **`super` e `super()`** | Todas as subclasses usam `super()` e `super.print()` |
| **`toString()` / `equals()` / `clone()`** | Sobrescritos em `Tratamento` |
| **`print()`** | Definido em `Tratamento`, sobreposto em `Injecao`, `InjecaoInsulina` e `MedicamentoOral` |
| **Interfaces** | `Notificavel` (mensagem + prioridade) e `Agendavel` (próximo horário + horários do dia) |
| **Polimorfismo / dynamic dispatch** | `App.demonstrarPolimorfismo(List<Tratamento>)` e `AgendadorNotificacoes` iterando `ArrayList<Tratamento>` |
| **Persistência polimórfica** | Jackson `@JsonTypeInfo` + `@JsonSubTypes` — campo `"tipo"` no JSON |
| **Interface gráfica** | Dashboard Next.js com CRUD completo, calendário, notificações e histórico |
