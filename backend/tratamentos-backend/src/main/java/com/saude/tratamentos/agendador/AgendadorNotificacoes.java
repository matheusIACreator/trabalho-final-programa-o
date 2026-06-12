package com.saude.tratamentos.agendador;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import com.saude.tratamentos.modelo.Tratamento;
import com.saude.tratamentos.persistencia.RepositorioTratamentos;

/**
 * Agendador que corre em background e verifica periodicamente (a cada 30s)
 * se algum tratamento tem uma toma cuja hora chegou. Quando encontra,
 * adiciona uma Notificacao à fila de pendentes; o frontend recupera-as
 * via GET /api/notificacoes/pendentes.
 *
 * Aqui usa-se polimorfismo de forma central: o agendador itera
 * uma ArrayList<Tratamento> e chama proximoHorario() e
 * getMensagemNotificacao() — a JVM escolhe dinamicamente a implementação
 * de cada subclasse (dynamic method dispatch).
 */
public class AgendadorNotificacoes {

    /** Intervalo entre verificações (segundos). */
    private static final int INTERVALO_VERIFICACAO_SEG = 30;

    /** Janela temporal aceite para considerar uma toma "agora". */
    private static final int JANELA_TOLERANCIA_SEG = 60;

    private final RepositorioTratamentos repositorio;
    private final ScheduledExecutorService scheduler;
    private final ConcurrentLinkedQueue<Notificacao> pendentes;

    public AgendadorNotificacoes(RepositorioTratamentos repositorio) {
        this.repositorio = repositorio;
        this.scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "agendador-notificacoes");
            t.setDaemon(true);
            return t;
        });
        this.pendentes = new ConcurrentLinkedQueue<>();
    }

    public void iniciar() {
        scheduler.scheduleAtFixedRate(this::verificarTomas,
                0, INTERVALO_VERIFICACAO_SEG, TimeUnit.SECONDS);
        System.out.println("[Agendador] Iniciado (intervalo "
                + INTERVALO_VERIFICACAO_SEG + "s).");
    }

    public void parar() {
        scheduler.shutdown();
    }

    private void verificarTomas() {
        try {
            LocalDateTime agora = LocalDateTime.now();
            LocalDateTime limiteInferior = agora.minusSeconds(JANELA_TOLERANCIA_SEG);

            // === POLIMORFISMO ===
            // O método proximoHorario() está declarado em Agendavel e
            // implementado na superclasse Tratamento. Pode vir a ser
            // sobreposto por subclasses futuras (ex.: tratamentos só ao
            // pequeno-almoço). Aqui chamamos o método sem nos importarmos
            // com o tipo concreto.
            for (Tratamento t : repositorio.listarTodos()) {
                LocalDateTime proximo = t.proximoHorario(limiteInferior.minusMinutes(1));
                if (proximo == null) continue;

                boolean dentroDaJanela = !proximo.isBefore(limiteInferior)
                                     && !proximo.isAfter(agora);
                if (!dentroDaJanela) continue;

                boolean jaExiste = pendentes.stream().anyMatch(n ->
                        n.getTratamentoId() == t.getId()
                     && n.getHorario().equals(proximo));
                if (jaExiste) continue;

                Notificacao n = new Notificacao(
                        t.getId(),
                        t.getMensagemNotificacao(),  // polimórfico
                        t.getPrioridade(),           // polimórfico
                        proximo);
                pendentes.offer(n);
                System.out.println("[Agendador] Disparado: " + n);
            }
        } catch (Exception e) {
            System.err.println("[Agendador] Erro no ciclo: " + e.getMessage());
        }
    }

    public List<Notificacao> obterPendentes() {
        return new java.util.ArrayList<>(this.pendentes);
    }

    public boolean confirmar(String idNotificacao) {
        return pendentes.removeIf(n -> n.getId().equals(idNotificacao));
    }

    /**
     * Útil para testar manualmente: força a criação de uma notificação
     * para o tratamento indicado.
     */
    public Notificacao dispararManualmente(int tratamentoId) {
        return repositorio.buscarPorId(tratamentoId)
                .map(t -> {
                    Notificacao n = new Notificacao(
                            t.getId(),
                            t.getMensagemNotificacao(),
                            t.getPrioridade(),
                            LocalDateTime.now());
                    pendentes.offer(n);
                    return n;
                })
                .orElse(null);
    }
}
