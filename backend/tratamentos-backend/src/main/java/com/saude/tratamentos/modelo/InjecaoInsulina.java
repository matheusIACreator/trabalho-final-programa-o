package com.saude.tratamentos.modelo;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Sub-subclasse — Injeção de Insulina é um caso especial de Injeção.
 * Cumpre o requisito "uma subclasse de uma das subclasses anteriores".
 *
 * Adiciona regras específicas de insulina:
 *  - Tipo (rápida, lenta, mista...)
 *  - Unidades por dose
 *  - Ajuste dinâmico das unidades com base na glicemia (sliding scale)
 */
public class InjecaoInsulina extends Injecao {

    protected TipoInsulina tipoInsulina;
    protected int unidadesPorDose;
    protected int glicemiaUltimaMedida; // em mg/dL; 0 = não medida

    // -------- Construtores --------

    public InjecaoInsulina() {
        super();
        this.tipoInsulina = TipoInsulina.RAPIDA;
        this.unidadesPorDose = 10;
        this.glicemiaUltimaMedida = 0;
    }

    public InjecaoInsulina(String nomeMedicamento, String dosagem,
                           LocalDateTime dataInicio, LocalDateTime dataFim,
                           int frequenciaHoras, String observacoes,
                           double volumeML, boolean necessitaRefrigeracao,
                           TipoInsulina tipoInsulina, int unidadesPorDose) {
        super(nomeMedicamento, dosagem, dataInicio, dataFim,
              frequenciaHoras, observacoes,
              ViaAdministracao.SUBCUTANEA, volumeML, necessitaRefrigeracao);
        this.tipoInsulina = tipoInsulina;
        this.unidadesPorDose = unidadesPorDose;
        this.glicemiaUltimaMedida = 0;
    }

    public InjecaoInsulina(InjecaoInsulina outra) {
        super(outra);
        this.tipoInsulina = outra.tipoInsulina;
        this.unidadesPorDose = outra.unidadesPorDose;
        this.glicemiaUltimaMedida = outra.glicemiaUltimaMedida;
    }

    // -------- Getters / Setters --------

    public TipoInsulina getTipoInsulina()          { return this.tipoInsulina; }
    public void setTipoInsulina(TipoInsulina t)    { this.tipoInsulina = t; }

    public int getUnidadesPorDose()                { return this.unidadesPorDose; }
    public void setUnidadesPorDose(int u)          { this.unidadesPorDose = u; }

    public int getGlicemiaUltimaMedida()           { return this.glicemiaUltimaMedida; }
    public void setGlicemiaUltimaMedida(int g)     { this.glicemiaUltimaMedida = g; }

    // -------- Lógica específica --------

    /**
     * Ajusta o número de unidades a aplicar com base na glicemia atual.
     * Regra simplificada inspirada em "sliding scale" — NÃO substitui
     * prescrição médica, é só ilustrativa para o trabalho.
     *
     * @param glicemiaMgDl valor atual em mg/dL
     * @return unidades recomendadas a aplicar
     */
    public int ajustarPorGlicemia(int glicemiaMgDl) {
        this.glicemiaUltimaMedida = glicemiaMgDl;
        int base = this.unidadesPorDose;
        if (glicemiaMgDl < 70)        return 0;          // hipoglicemia — não aplicar
        if (glicemiaMgDl <= 150)      return base;
        if (glicemiaMgDl <= 200)      return base + 2;
        if (glicemiaMgDl <= 250)      return base + 4;
        return base + 6;                                  // > 250
    }

    // -------- Polimorfismo --------

    @Override
    public String tipoTratamento() {
        return "Injeção de Insulina";
    }

    @Override
    public void print() {
        super.print();   // imprime atributos da Injecao (que por sua vez imprime os da Tratamento)
        System.out.println("Tipo Insulina : " + this.tipoInsulina);
        System.out.println("Unidades base : " + this.unidadesPorDose);
        if (this.glicemiaUltimaMedida > 0) {
            System.out.println("Última glicemia: " + this.glicemiaUltimaMedida + " mg/dL");
        }
    }

    @Override
    public int getPrioridade() {
        return 3; // insulina em falha pode ser crítico
    }

    @Override
    public String getMensagemNotificacao() {
        return String.format("INSULINA: %s — %d unidades (%s)",
                this.tipoInsulina, this.unidadesPorDose, this.nomeMedicamento);
    }

    @Override
    public boolean equals(Object o) {
        if (!super.equals(o)) return false;
        InjecaoInsulina i = (InjecaoInsulina) o;
        return this.unidadesPorDose == i.unidadesPorDose
            && this.glicemiaUltimaMedida == i.glicemiaUltimaMedida
            && this.tipoInsulina == i.tipoInsulina;
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(),
                tipoInsulina, unidadesPorDose, glicemiaUltimaMedida);
    }
}
