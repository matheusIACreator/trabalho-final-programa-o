    
package com.saude.tratamentos.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.time.LocalDate;

// Estas anotações dizem ao Jackson para guardar o tipo de tratamento no JSON
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "tipoTratamento"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = MedicamentoOral.class, name = "oral"),
    @JsonSubTypes.Type(value = Injecao.class, name = "injecao"),
    @JsonSubTypes.Type(value = InjecaoInsulina.class, name = "insulina")
})
// "implements Agendavel, Notificavel" assina os contratos que criámos acima
public abstract class Tratamento implements Agendavel, Notificavel {
    
    // Variáveis comuns a todos os tratamentos
    private String id;
    private String nomeMedicamento;
    private String dosagem;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private int frequenciaHoras;
    private String observacoes;

    // Construtor vazio (obrigatório para o Jackson funcionar)
    public Tratamento() {}

    // Construtor para preencher os dados
    public Tratamento(String id, String nomeMedicamento, String dosagem, LocalDate dataInicio, LocalDate dataFim, int frequenciaHoras, String observacoes) {
        this.id = id;
        this.nomeMedicamento = nomeMedicamento;
        this.dosagem = dosagem;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.frequenciaHoras = frequenciaHoras;
        this.observacoes = observacoes;
    }

    // Método abstrato: cada filho vai ter de explicar como se executa a toma
    public abstract void executarToma();

    // Getters e Setters (para ler e escrever nas variáveis)
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNomeMedicamento() { return nomeMedicamento; }
    public void setNomeMedicamento(String nomeMedicamento) { this.nomeMedicamento = nomeMedicamento; }
    public String getDosagem() { return dosagem; }
    public void setDosagem(String dosagem) { this.dosagem = dosagem; }
    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }
    public int getFrequenciaHoras() { return frequenciaHoras; }
    public void setFrequenciaHoras(int frequenciaHoras) { this.frequenciaHoras = frequenciaHoras; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}
