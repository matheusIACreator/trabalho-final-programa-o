package com.saude.tratamentos.modelo;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Subclasse de Tratamento — representa medicamentos administrados por via oral.
 */
public class MedicamentoOral extends Tratamento {

    protected FormaOral forma;
    protected boolean tomarComComida;

    // -------- Construtores --------

    public MedicamentoOral() {
        super();
        this.forma = FormaOral.COMPRIMIDO;
        this.tomarComComida = false;
    }

    public MedicamentoOral(String nomeMedicamento, String dosagem,
                           LocalDateTime dataInicio, LocalDateTime dataFim,
                           int frequenciaHoras, String observacoes,
                           FormaOral forma, boolean tomarComComida) {
        super(nomeMedicamento, dosagem, dataInicio, dataFim,
              frequenciaHoras, observacoes);
        this.forma = forma;
        this.tomarComComida = tomarComComida;
    }

    public MedicamentoOral(MedicamentoOral outro) {
        super(outro);
        this.forma = outro.forma;
        this.tomarComComida = outro.tomarComComida;
    }

    // -------- Getters / Setters --------

    public FormaOral getForma()                  { return this.forma; }
    public void setForma(FormaOral f)            { this.forma = f; }

    public boolean isTomarComComida()            { return this.tomarComComida; }
    public void setTomarComComida(boolean t)     { this.tomarComComida = t; }

    // -------- Polimorfismo --------

    @Override
    public String tipoTratamento() {
        return "Medicamento Oral";
    }

    @Override
    public void print() {
        super.print();
        System.out.println("Forma         : " + this.forma);
        System.out.println("Com comida    : " + (this.tomarComComida ? "sim" : "não"));
    }

    @Override
    public String getMensagemNotificacao() {
        String msg = super.getMensagemNotificacao() + " — " + this.forma;
        if (this.tomarComComida) msg += " (tomar com comida)";
        return msg;
    }

    @Override
    public boolean equals(Object o) {
        if (!super.equals(o)) return false;
        MedicamentoOral m = (MedicamentoOral) o;
        return this.tomarComComida == m.tomarComComida
            && this.forma == m.forma;
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), forma, tomarComComida);
    }
}
