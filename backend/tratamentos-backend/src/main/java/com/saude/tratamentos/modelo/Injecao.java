package com.saude.tratamentos.modelo;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Subclasse de Tratamento — representa medicamentos administrados por injeção.
 *
 * Cumpre:
 *  - É subclasse de Tratamento.
 *  - Tem construtores sem parâmetros, com parâmetros e de cópia.
 *  - Usa super e super() / super.metodo() em vários sítios.
 *  - Sobrepõe o método print() herdado da superclasse.
 *  - Tem métodos de acesso (get/set).
 */
public class Injecao extends Tratamento {

    protected ViaAdministracao via;
    protected double volumeML;
    protected boolean necessitaRefrigeracao;

    // -------- Construtores --------

    public Injecao() {
        super();   // chama construtor sem parâmetros da superclasse
        this.via = ViaAdministracao.SUBCUTANEA;
        this.volumeML = 1.0;
        this.necessitaRefrigeracao = false;
    }

    public Injecao(String nomeMedicamento, String dosagem,
                   LocalDateTime dataInicio, LocalDateTime dataFim,
                   int frequenciaHoras, String observacoes,
                   ViaAdministracao via, double volumeML,
                   boolean necessitaRefrigeracao) {
        super(nomeMedicamento, dosagem, dataInicio, dataFim,
              frequenciaHoras, observacoes);   // construtor com parâmetros da superclasse
        this.via = via;
        this.volumeML = volumeML;
        this.necessitaRefrigeracao = necessitaRefrigeracao;
    }

    public Injecao(Injecao outra) {
        super(outra);                          // construtor de cópia da superclasse
        this.via = outra.via;
        this.volumeML = outra.volumeML;
        this.necessitaRefrigeracao = outra.necessitaRefrigeracao;
    }

    // -------- Getters / Setters --------

    public ViaAdministracao getVia()              { return this.via; }
    public void setVia(ViaAdministracao v)        { this.via = v; }

    public double getVolumeML()                   { return this.volumeML; }
    public void setVolumeML(double v)             { this.volumeML = v; }

    public boolean isNecessitaRefrigeracao()      { return this.necessitaRefrigeracao; }
    public void setNecessitaRefrigeracao(boolean n) { this.necessitaRefrigeracao = n; }

    // -------- Comportamento polimórfico --------

    @Override
    public String tipoTratamento() {
        return "Injeção";
    }

    /** Sobreposição de print() — usa super.print() para reaproveitar. */
    @Override
    public void print() {
        super.print();    // <-- uso da referência super
        System.out.println("Via           : " + this.via);
        System.out.println("Volume        : " + this.volumeML + " mL");
        System.out.println("Refrigeração  : " + (this.necessitaRefrigeracao ? "sim" : "não"));
    }

    @Override
    public String toString() {
        return super.toString()
                + String.format(" via=%s volume=%.2fmL", this.via, this.volumeML);
    }

    @Override
    public String getMensagemNotificacao() {
        return super.getMensagemNotificacao()
                + " — aplicar " + this.volumeML + " mL via " + this.via;
    }

    @Override
    public boolean equals(Object o) {
        if (!super.equals(o)) return false;
        Injecao i = (Injecao) o;
        return Double.compare(this.volumeML, i.volumeML) == 0
            && this.necessitaRefrigeracao == i.necessitaRefrigeracao
            && this.via == i.via;
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), via, volumeML, necessitaRefrigeracao);
    }
}
