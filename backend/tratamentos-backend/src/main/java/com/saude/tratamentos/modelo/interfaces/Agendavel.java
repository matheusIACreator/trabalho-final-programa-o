package com.saude.tratamentos.modelo.interfaces;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Interface implementada por entidades que ocorrem em horários definidos
 * e periódicos. Usada pelo agendador para saber quando disparar notificações.
 */
public interface Agendavel {

    /**
     * @param referencia momento atual (ou de partida)
     * @return próximo horário estritamente posterior à referência, ou null
     *         se o tratamento já terminou.
     */
    LocalDateTime proximoHorario(LocalDateTime referencia);

    /** Todos os horários que ocorrem no dia indicado. */
    List<LocalDateTime> todosHorariosNoDia(LocalDate dia);
}
