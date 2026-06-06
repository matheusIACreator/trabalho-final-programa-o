package com.saude.tratamentos.model;
import java.time.LocalDateTime;

public interface Agendavel {
    // Obriga as classes a ter um método para calcular a próxima toma
    void agendarProximaToma(LocalDateTime horario);
}