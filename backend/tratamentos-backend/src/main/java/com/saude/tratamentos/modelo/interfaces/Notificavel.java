package com.saude.tratamentos.modelo.interfaces;

/**
 * Interface implementada por qualquer entidade que possa originar
 * uma notificação ao utilizador (toma de medicamento, alerta, etc.).
 */
public interface Notificavel {

    /** Texto curto a apresentar na notificação. */
    String getMensagemNotificacao();

    /**
     * Prioridade da notificação (1 = baixa, 2 = média, 3 = crítica).
     * Permite que o frontend altere o som / cor consoante a urgência.
     */
    int getPrioridade();
}
