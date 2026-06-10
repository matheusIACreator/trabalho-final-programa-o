package com.saude.tratamentos.model;

import java.time.LocalDateTime;

public class Injecao extends Tratamento {
    private String viaAdministracao; 
    private double volumeMl;

    public Injecao() {}

    public Injecao(String id, String nomeMedicamento, String dosagem, LocalDate dataInicio, LocalDate dataFim, int frequenciaHoras, String observacoes, String viaAdministracao, double volumeMl) {
        super(id, nomeMedicamento, dosagem, dataInicio, dataFim, frequenciaHoras, observacoes);
        this.viaAdministracao = viaAdministracao;
        this.volumeMl = volumeMl;
    }

    @Override
    public void dispararAlerta() {
        System.out.println("ALERTA: Preparar injeção de " + getNomeMedicamento());
    }

    @Override
    public void agendarProximaToma(LocalDateTime horario) {
        System.out.println("Próxima injeção agendada para: " + horario);
    }

    @Override
    public void executarToma() {
        System.out.println("Injeção aplicada: " + getNomeMedicamento() + " via " + viaAdministracao);
    }

    public String getViaAdministracao() { return viaAdministracao; }
    public void setViaAdministracao(String viaAdministracao) { this.viaAdministracao = viaAdministracao; }
    public double getVolumeMl() { return volumeMl; }
    public void setVolumeMl(double volumeMl) { this.volumeMl = volumeMl; }
}