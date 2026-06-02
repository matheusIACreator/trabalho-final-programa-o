# MedTrack — Gestão de Tratamentos Crónicos

Aplicação completa (backend Java + frontend Next.js) para gestão e lembrete de tomas de medicamentos em doenças crónicas como diabetes, hipertensão e outras patologias que requerem medicação regular.

---

## Arquitetura

```
┌──────────────────────────────┐   HTTP REST / JSON   ┌──────────────────────────────┐
│  Frontend (Next.js 16)       │ ───────────────────▶  │  Backend (Java + Javalin)    │
│                              │ ◀───────────────────  │                              │
│  • Dashboard + Calendário    │    localhost:7000      │  • API REST (10 endpoints)   │
│  • CRUD de Tratamentos       │                        │  • Agendador de notificações │
│  • Notificações em tempo real│                        │  • Persistência JSON         │
│  • Histórico (localStorage)  │                        │  • Polimorfismo OOP          │
│  • i18n PT / EN              │                        │                              │
└──────────────────────────────┘                        └──────────────────────────────┘
        localhost:3000                                          dados/tratamentos.json
```

---

## Pré-requisitos

| Ferramenta | Versão mínima | Verificar |
|-----------|--------------|-----------|
| JDK | 17+ | `java -version` |
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |

> Maven **não precisa de estar instalado** — o projecto inclui o Maven Wrapper (`mvnw.cmd`).

---

## Como correr

### 1. Backend (Java)

```powershell
# Entrar na pasta do backend
cd backend\tratamentos-backend

# Compilar e empacotar (na primeira vez descarrega Maven ~10 MB)
.\mvnw.cmd package -DskipTests

# Correr o servidor
java -jar target\tratamentos-backend.jar
```

O servidor fica disponível em **http://localhost:7000**.

Na primeira execução cria automaticamente `dados/tratamentos.json` com 5 tratamentos de exemplo e imprime no terminal uma demonstração de polimorfismo (dynamic method dispatch).

**Modo desenvolvimento** (sem empacotar):
```powershell
.\mvnw.cmd exec:java -Dexec.mainClass="com.saude.tratamentos.App"
```

> **Nota:** Não correr pelo botão "Run" do VS Code — usa sempre o terminal com `mvnw.cmd`. O botão do editor usa uma classpath isolada do JDT Language Server que não inclui as dependências Maven.

---

### 2. Frontend (Next.js)

```powershell
# Entrar na pasta do frontend
cd frontend

# Instalar dependências (só na primeira vez)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação abre em **http://localhost:3000** (redireciona automaticamente para `/pt` ou `/en` conforme o browser).

**Build de produção:**
```powershell
npm run build
npm start
```

---

## Estrutura do repositório

```
TrabalhoFinalPC/
├── backend/
│   └── tratamentos-backend/        # Projecto Maven
│       ├── .mvn/wrapper/           # Maven Wrapper (mvnw.cmd)
│       ├── src/main/java/com/saude/tratamentos/
│       │   ├── App.java            # main + demo polimorfismo
│       │   ├── modelo/             # Hierarquia OOP
│       │   │   ├── Tratamento.java       # Superclasse abstrata
│       │   │   ├── Injecao.java
│       │   │   ├── InjecaoInsulina.java  # Subclasse de Injecao
│       │   │   ├── MedicamentoOral.java
│       │   │   ├── ViaAdministracao.java # enum
│       │   │   ├── FormaOral.java        # enum
│       │   │   ├── TipoInsulina.java     # enum
│       │   │   └── interfaces/
│       │   │       ├── Notificavel.java
│       │   │       └── Agendavel.java
│       │   ├── persistencia/
│       │   │   └── RepositorioTratamentos.java  # Jackson JSON
│       │   ├── agendador/
│       │   │   ├── Notificacao.java
│       │   │   └── AgendadorNotificacoes.java   # ScheduledExecutorService
│       │   └── api/
│       │       └── ServidorRest.java            # Javalin REST
│       └── pom.xml
├── frontend/                       # Projecto Next.js
│   ├── app/
│   │   ├── layout.tsx              # Root layout (HTML shell)
│   │   └── [locale]/               # Routing i18n (pt / en)
│   │       ├── layout.tsx          # Locale layout (providers)
│   │       ├── page.tsx            # Dashboard (/)
│   │       ├── DashboardClient.tsx
│   │       ├── tratamentos/        # (/tratamentos)
│   │       │   ├── TratamentosClient.tsx
│   │       │   ├── novo/           # (/tratamentos/novo)
│   │       │   └── [id]/editar/    # (/tratamentos/:id/editar)
│   │       └── historico/          # (/historico)
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── LanguageToggle.tsx
│   │   ├── NotificacaoModal.tsx
│   │   ├── NotificacoesProvider.tsx
│   │   ├── TratamentoForm.tsx
│   │   └── ui/                     # Componentes shadcn/ui
│   ├── hooks/
│   │   └── useNotificacoes.ts      # Polling 5s + fila de notificações
│   ├── i18n/
│   │   ├── routing.ts              # next-intl: locales, defaultLocale
│   │   ├── request.ts              # Carregamento de mensagens
│   │   └── navigation.ts           # Link/useRouter locale-aware
│   ├── lib/
│   │   ├── api.ts                  # Cliente HTTP tipado
│   │   ├── types.ts                # Tipos TypeScript (Tratamento union, etc.)
│   │   └── schemas.ts              # Schemas Zod para validação
│   ├── messages/
│   │   ├── pt.json                 # Traduções PT
│   │   └── en.json                 # Traduções EN
│   └── middleware.ts               # Middleware next-intl (locale routing)
└── dados/
    └── tratamentos.json            # Dados persistidos pelo backend
```

---

## Funcionalidades do Frontend

### Dashboard (`/`)
- **Timeline do dia** — lista cronológica de todas as tomas previstas para hoje; item atual destacado em azul com badge "Próxima toma"; tomas passadas ficam a 50% de opacidade
- **Cards de resumo** — Total / Tomadas / Pendentes para o dia
- **Calendário mensal** — clicando num dia carrega as tomas previstas para esse dia num painel lateral

### Tratamentos (`/tratamentos`)
- Lista todos os tratamentos com filtros por tipo (Oral / Injeção / Insulina)
- Cards com informação específica por tipo
- Botão eliminar com confirmação (`AlertDialog`)
- Skeleton loading enquanto carrega

### Formulário (`/tratamentos/novo` e `/tratamentos/:id/editar`)
- Campos condicionais consoante o tipo selecionado
- Validação com `react-hook-form` + `zod`
- DatePicker para datas de início/fim
- Para insulina: botão "Calcular dose por glicemia" que chama `POST /api/insulina/{id}/ajustar`

### Histórico (`/historico`)
- Lista de tomas confirmadas (armazenadas no `localStorage`)
- Filtros por prioridade (Crítica / Urgente / Normal)
- Botão para limpar o histórico

### Sistema de Notificações (global)
- Polling a `GET /api/notificacoes/pendentes` a cada **5 segundos**
- Quando chega uma notificação nova (ID ainda não visto):
  - Toca `public/alarme.mp3` (colocar ficheiro real nesta localização)
  - Abre modal centralizado com cor/ícone por prioridade (vermelho / amarelo / azul)
- **"Já tomei"** → `POST /api/notificacoes/{id}/confirmar` + guarda no `localStorage`
- **"Adiar 10 min"** → fecha sem confirmar (volta no próximo polling)
- Fila: se chegarem várias ao mesmo tempo, mostra uma de cada vez

### i18n
- **PT** (default, sem prefixo na URL): `/`, `/tratamentos`, `/historico`
- **EN** (com prefixo): `/en`, `/en/tratamentos`, `/en/historico`
- Toggle PT | EN na navbar — muda de língua mantendo a página atual

---

## API do Backend

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/tratamentos` | Lista todos os tratamentos |
| `GET` | `/api/tratamentos/{id}` | Detalhe de um tratamento |
| `POST` | `/api/tratamentos` | Cria novo tratamento |
| `PUT` | `/api/tratamentos/{id}` | Atualiza tratamento |
| `DELETE` | `/api/tratamentos/{id}` | Remove tratamento |
| `GET` | `/api/tratamentos/{id}/horarios?dia=YYYY-MM-DD` | Horários previstos num dia (devolve `string[]`) |
| `GET` | `/api/notificacoes/pendentes` | Notificações por confirmar |
| `POST` | `/api/notificacoes/{id}/confirmar` | Marca notificação como lida |
| `POST` | `/api/notificacoes/disparar/{tratId}` | Força disparo (testes) |
| `POST` | `/api/insulina/{id}/ajustar` | `{ glicemia: int }` → `{ unidadesRecomendadas, glicemia }` |

### Modelo de dados

```json
{
  "tipo": "injecao_insulina",
  "id": 1,
  "nomeMedicamento": "Humalog",
  "dosagem": "100 UI/mL",
  "dataInicio": "2026-05-01T08:00:00",
  "dataFim": "2027-05-01T08:00:00",
  "frequenciaHoras": 6,
  "observacoes": "Antes das refeições",
  "via": "SUBCUTANEA",
  "volumeML": 0.3,
  "necessitaRefrigeracao": true,
  "tipoInsulina": "RAPIDA",
  "unidadesPorDose": 8,
  "glicemiaUltimaMedida": 0
}
```

Valores de `tipo`: `"medicamento_oral"` · `"injecao"` · `"injecao_insulina"`

---

## Stack tecnológico

### Backend
| Tecnologia | Versão | Função |
|-----------|--------|--------|
| Java | 17+ | Linguagem principal |
| Javalin | 6.1.3 | Servidor REST leve |
| Jackson | 2.17.0 | Serialização JSON + `java.time` |
| SLF4J Simple | 2.0.13 | Logging |
| Maven Shade Plugin | 3.5.2 | Fat JAR (todas as deps num único jar) |

### Frontend
| Tecnologia | Versão | Função |
|-----------|--------|--------|
| Next.js | 16.2.6 | Framework React (App Router) |
| React | 19.2.4 | UI |
| TypeScript | 5.x | Tipagem estática |
| Tailwind CSS | 4.x | Estilos utilitários |
| shadcn/ui | 4.x | Componentes UI (radix-nova) |
| next-intl | 4.x | Internacionalização PT/EN |
| react-hook-form | — | Gestão de formulários |
| Zod | 4.x | Validação de schemas |
| date-fns | — | Formatação de datas |
| Lucide React | — | Ícones |
| Sonner | — | Toasts/notificações |

---

## Requisitos académicos cumpridos (backend)

| Requisito | Localização |
|-----------|-------------|
| Superclasse com atributos `protected` e atributos de classe (`static`) | `Tratamento.java` — todos os atributos `protected`; `static contadorTratamentos`, `static FORMATO_DATA` |
| ≥ 2 subclasses | `Injecao`, `MedicamentoOral` |
| Subclasse de subclasse | `InjecaoInsulina extends Injecao` |
| Construtores sem parâmetros, com parâmetros e de cópia | Todos os modelos têm os 3 construtores |
| Métodos get/set | Todas as classes |
| Uso de `this` e `this()` | `this()` nos construtores chama o construtor sem parâmetros |
| `toString()`, `clone()`, `equals()` sobrepostos na superclasse | `Tratamento.java` |
| `print()` na superclasse, sobreposto nas subclasses | `Tratamento.print()` + overrides em cada subclasse (chamam `super.print()`) |
| `super` e `super.metodo()` | Construtores (`super()`), `super.print()`, `super.equals()`, `super.toString()` |
| Interfaces e/ou classes abstratas | `Tratamento` (abstrata), interfaces `Notificavel` e `Agendavel` |
| Polimorfismo + dynamic method dispatch com Collection | `App.demonstrarPolimorfismo(List<Tratamento>)` — ArrayList de subclasses heterogéneas; `AgendadorNotificacoes.verificarTomas()` em produção |
| Interface gráfica | Frontend Next.js descrito acima |

---

## Notas de desenvolvimento

- O ficheiro `dados/tratamentos.json` é criado automaticamente pelo backend na primeira execução.
- Para trocar o alarme sonoro, colocar um ficheiro MP3 em `frontend/public/alarme.mp3`.
- A variável de ambiente `NEXT_PUBLIC_API_URL` no ficheiro `frontend/.env.local` define o URL do backend (padrão: `http://localhost:7000`).
- O histórico de notificações confirmadas é guardado no `localStorage` do browser (chave `notificacoes_historico`); não é persistido no backend.
