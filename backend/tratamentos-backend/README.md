# Gestor de Tratamentos Crónicos — Backend

Aplicação para gestão e lembrete de tomas de medicamentos (orais e injetáveis)
em doenças crónicas como diabetes, hipertensão, etc. Este é o **backend Java**;
o frontend Next.js liga-se via REST.

## Quem usaria esta aplicação?

Pacientes com tratamentos crónicos, cuidadores de idosos, e profissionais de
saúde que acompanham pacientes — qualquer pessoa que precise garantir que
medicamentos são tomados nos horários certos. Reduz esquecimentos, mantém
histórico, e — no caso da insulina — ajuda a calcular doses com base na
glicemia.

## Arquitetura

```
┌────────────────────┐   HTTP/REST    ┌─────────────────────┐
│   Frontend         │  ────────────▶ │   Backend Java       │
│   (Next.js)        │ ◀────────────  │   - Javalin REST     │
│   - UI + popup     │      JSON      │   - Jackson (JSON)   │
│   - som            │                │   - Scheduler        │
└────────────────────┘                │   - Ficheiro JSON    │
                                      └─────────────────────┘
```

- Backend escuta em `http://localhost:7000`
- Dados persistidos em `dados/tratamentos.json`
- Agendador verifica de 30 em 30 segundos quais tomas estão "a tocar"
- Frontend faz polling a `/api/notificacoes/pendentes` a cada ~5s

## Como correr

Pré-requisitos: JDK 17+ e Maven 3.6+.

```bash
mvn package           # compila + gera jar único em target/
java -jar target/tratamentos-backend.jar
```

Ou em modo de desenvolvimento:

```bash
mvn compile exec:java -Dexec.mainClass=com.saude.tratamentos.App
```

Ao arrancar pela primeira vez:
1. Cria `dados/tratamentos.json` com 5 exemplos.
2. Imprime no terminal cada tratamento usando `print()` (demo de
   dynamic method dispatch).
3. Levanta o servidor REST.

## Endpoints

| Método | URL                                     | Função                       |
|--------|------------------------------------------|-------------------------------|
| GET    | `/api/tratamentos`                       | Lista todos                   |
| GET    | `/api/tratamentos/{id}`                  | Detalhe                       |
| POST   | `/api/tratamentos`                       | Cria (corpo JSON com `tipo`)  |
| PUT    | `/api/tratamentos/{id}`                  | Atualiza                      |
| DELETE | `/api/tratamentos/{id}`                  | Remove                        |
| GET    | `/api/tratamentos/{id}/horarios?dia=…`   | Horários previstos num dia    |
| GET    | `/api/notificacoes/pendentes`            | Polling do frontend           |
| POST   | `/api/notificacoes/{id}/confirmar`       | Marca como lida               |
| POST   | `/api/notificacoes/disparar/{tratId}`    | Força disparo (testes)        |
| POST   | `/api/insulina/{id}/ajustar`             | Recomenda unidades p/ glicemia|

### Formato JSON (campo `tipo` obrigatório)

```json
{
  "tipo": "injecao_insulina",
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
  "unidadesPorDose": 8
}
```

Valores possíveis para `tipo`: `"injecao"`, `"injecao_insulina"`, `"medicamento_oral"`.

## Mapeamento dos requisitos do enunciado

| Requisito do enunciado | Onde está cumprido                                            |
|-------------------------|---------------------------------------------------------------|
| Superclasse com atributos `protected` e atributos de classe | `Tratamento` (`protected` em todos os atributos de instância; `static contadorTratamentos` e `static FORMATO_DATA`) |
| ≥ 2 subclasses dessa superclasse | `Injecao` e `MedicamentoOral`                                  |
| Subclasse de uma das subclasses | `InjecaoInsulina extends Injecao`                              |
| Construtores sem parâmetros, com parâmetros e de cópia em todas as classes | Todas as classes de modelo têm os três construtores              |
| Métodos get/set em todas as classes | Todas as classes                                                |
| Uso de `this` e `this()` | `Tratamento` (e subclasses) — `this()` no construtor com parâmetros chama o sem parâmetros |
| Superclasse sobrepõe `toString()`, `clone()`, `equals()` | `Tratamento` — todos três implementados                            |
| Superclasse define `print()` | `Tratamento.print()`                                              |
| Subclasses sobrepõem `print()` | `Injecao`, `InjecaoInsulina`, `MedicamentoOral` — todas chamam `super.print()` |
| Uso de `super` e `super.metodo()` | `super()` nos construtores; `super.print()`, `super.equals()`, `super.toString()`, `super.getMensagemNotificacao()` etc. |
| Interfaces e/ou classes abstratas | Interfaces `Notificavel` e `Agendavel`; classe abstrata `Tratamento` |
| Polimorfismo + dynamic method dispatch com array/Collection | `App.demonstrarPolimorfismo(List<Tratamento>)` itera ArrayList e chama métodos sobrepostos; `AgendadorNotificacoes.verificarTomas()` faz o mesmo em produção |
| Interface gráfica | Frontend Next.js (a desenvolver) — comunica via REST            |
| Utilidade real | Gestão de tomas crónicas — público e benefício descritos acima  |
| GitHub | Criar repositório e fazer push do conteúdo desta pasta          |

## Estrutura do código

```
src/main/java/com/saude/tratamentos/
├── App.java                       # main + demo de polimorfismo
├── modelo/
│   ├── Tratamento.java            # superclasse abstrata
│   ├── Injecao.java
│   ├── InjecaoInsulina.java       # subclasse de Injecao
│   ├── MedicamentoOral.java
│   ├── ViaAdministracao.java      # enum
│   ├── FormaOral.java             # enum
│   ├── TipoInsulina.java          # enum
│   └── interfaces/
│       ├── Notificavel.java
│       └── Agendavel.java
├── persistencia/
│   └── RepositorioTratamentos.java   # JSON via Jackson
├── agendador/
│   ├── Notificacao.java
│   └── AgendadorNotificacoes.java    # ScheduledExecutorService
└── api/
    └── ServidorRest.java             # Javalin
```

## Próximos passos (frontend)

1. `npx create-next-app@latest tratamentos-frontend`
2. Hook `useEffect` que faz polling a `/api/notificacoes/pendentes` a cada 5s
3. Quando chegar notificação: `new Audio('/alarme.mp3').play()` + modal popup
4. Botão "OK, já tomei" → POST `/api/notificacoes/{id}/confirmar`
5. Páginas para listar / criar / editar tratamentos

> Lembrete: confirma com o docente que a abordagem frontend web + backend Java
> é aceite **antes** de avançares; e usa Git desde o primeiro commit.
