package com.saude.tratamentos.agendador;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Representa uma notificação pendente, à espera de ser apresentada
 * ao utilizador pelo frontend (via polling à API REST).
 */
public class Notificacao {

    private String id;
    private int tratamentoId;
    private String mensagem;
    private int prioridade;
    private LocalDateTime horario;
    private LocalDateTime criadaEm;

    public Notificacao() { /* necessário para Jackson */ }

    public Notificacao(int tratamentoId, String mensagem,
                       int prioridade, LocalDateTime horario) {
        this.id = UUID.randomUUID().toString();
        this.tratamentoId = tratamentoId;
        this.mensagem = mensagem;
        this.prioridade = prioridade;
        this.horario = horario;
        this.criadaEm = LocalDateTime.now();
    }

    public String getId()                       { return id; }
    public void setId(String id)                { this.id = id; }
    public int getTratamentoId()                { return tratamentoId; }
    public void setTratamentoId(int t)          { this.tratamentoId = t; }
    public String getMensagem()                 { return mensagem; }
    public void setMensagem(String m)           { this.mensagem = m; }
    public int getPrioridade()                  { return prioridade; }
    public void setPrioridade(int p)            { this.prioridade = p; }
    public LocalDateTime getHorario()           { return horario; }
    public void setHorario(LocalDateTime h)     { this.horario = h; }
    public LocalDateTime getCriadaEm()          { return criadaEm; }
    public void setCriadaEm(LocalDateTime c)    { this.criadaEm = c; }

    @Override
    public String toString() {
        return String.format("Notificacao[trat=%d, '%s', prio=%d @ %s]",
                tratamentoId, mensagem, prioridade, horario);
    }
}
