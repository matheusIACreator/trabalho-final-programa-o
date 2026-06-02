package com.saude.tratamentos.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.saude.tratamentos.agendador.AgendadorNotificacoes;
import com.saude.tratamentos.agendador.Notificacao;
import com.saude.tratamentos.modelo.Tratamento;
import com.saude.tratamentos.persistencia.RepositorioTratamentos;
import io.javalin.Javalin;
import io.javalin.json.JavalinJackson;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Servidor REST para o frontend Next.js.
 *
 * Endpoints:
 *   GET    /api/tratamentos               lista todos
 *   GET    /api/tratamentos/{id}          obtém por id
 *   POST   /api/tratamentos               cria novo
 *   PUT    /api/tratamentos/{id}          atualiza
 *   DELETE /api/tratamentos/{id}          remove
 *   GET    /api/tratamentos/{id}/horarios?dia=YYYY-MM-DD   horários previstos no dia
 *
 *   GET    /api/notificacoes/pendentes              polling do frontend
 *   POST   /api/notificacoes/{id}/confirmar         marca como lida
 *   POST   /api/notificacoes/disparar/{tratId}      força disparo (debug)
 *
 *   POST   /api/insulina/{id}/ajustar               { glicemia: int } -> unidades
 */
public class ServidorRest {

    private final RepositorioTratamentos repositorio;
    private final AgendadorNotificacoes agendador;
    private Javalin app;

    public ServidorRest(RepositorioTratamentos repositorio,
                        AgendadorNotificacoes agendador) {
        this.repositorio = repositorio;
        this.agendador = agendador;
    }

    public void iniciar(int porta) {
        ObjectMapper mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        app = Javalin.create(config -> {
            config.jsonMapper(new JavalinJackson(mapper, true));
            config.bundledPlugins.enableCors(cors ->
                    cors.addRule(it -> it.anyHost()));
        });

        // ===== Tratamentos =====
        app.get("/api/tratamentos", ctx ->
                ctx.json(repositorio.listarTodos()));

        app.get("/api/tratamentos/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            repositorio.buscarPorId(id)
                    .ifPresentOrElse(ctx::json, () -> ctx.status(404));
        });

        app.post("/api/tratamentos", ctx -> {
            Tratamento t = ctx.bodyAsClass(Tratamento.class);
            repositorio.adicionar(t);
            ctx.status(201).json(t);
        });

        app.put("/api/tratamentos/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Tratamento t = ctx.bodyAsClass(Tratamento.class);
            t.setId(id);
            if (repositorio.atualizar(t)) ctx.json(t);
            else ctx.status(404);
        });

        app.delete("/api/tratamentos/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            if (repositorio.remover(id)) ctx.status(204);
            else ctx.status(404);
        });

        app.get("/api/tratamentos/{id}/horarios", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            String diaParam = ctx.queryParam("dia");
            LocalDate dia = (diaParam == null) ? LocalDate.now() : LocalDate.parse(diaParam);
            repositorio.buscarPorId(id)
                    .ifPresentOrElse(
                            t -> ctx.json(t.todosHorariosNoDia(dia)),
                            () -> ctx.status(404));
        });

        // ===== Notificações =====
        app.get("/api/notificacoes/pendentes", ctx ->
                ctx.json(agendador.obterPendentes()));

        app.post("/api/notificacoes/{id}/confirmar", ctx -> {
            String id = ctx.pathParam("id");
            if (agendador.confirmar(id)) ctx.status(204);
            else ctx.status(404);
        });

        app.post("/api/notificacoes/disparar/{tratId}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("tratId"));
            Notificacao n = agendador.dispararManualmente(id);
            if (n != null) ctx.status(201).json(n);
            else ctx.status(404);
        });

        // ===== Insulina (cálculo sliding scale) =====
        app.post("/api/insulina/{id}/ajustar", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            @SuppressWarnings("unchecked")
            Map<String, Object> body = ctx.bodyAsClass(Map.class);
            int glicemia = ((Number) body.get("glicemia")).intValue();

            repositorio.buscarPorId(id).ifPresentOrElse(t -> {
                if (t instanceof com.saude.tratamentos.modelo.InjecaoInsulina ins) {
                    int unidades = ins.ajustarPorGlicemia(glicemia);
                    repositorio.atualizar(ins); // persiste glicemia
                    ctx.json(Map.of(
                            "unidadesRecomendadas", unidades,
                            "glicemia", glicemia));
                } else {
                    ctx.status(400).json(Map.of("erro",
                            "Tratamento não é de insulina"));
                }
            }, () -> ctx.status(404));
        });

        app.start(porta);
        System.out.println("[REST] Servidor iniciado em http://localhost:" + porta);
    }
}
