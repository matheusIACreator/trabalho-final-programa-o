package modelo;

public class InjecaoInsulina extends Injecao {
    private String tipoInsulina; // Ex: Rápida, Lenta
    private int fatorSensibilidade; // Quantos pontos a glicemia desce por cada unidade de insulina

    public InjecaoInsulina() {}

    public InjecaoInsulina(String id, String nomeMedicamento, String dosagem, LocalDate dataInicio, LocalDate dataFim, int frequenciaHoras, String observacoes, String viaAdministracao, double volumeMl, String tipoInsulina, int fatorSensibilidade) {
        super(id, nomeMedicamento, dosagem, dataInicio, dataFim, frequenciaHoras, observacoes, viaAdministracao, volumeMl);
        this.tipoInsulina = tipoInsulina;
        this.fatorSensibilidade = fatorSensibilidade;
    }

    // A Lógica Específica pedida no enunciado
    public double calcularDoseDesejada(int glicemiaAtual, int glicemiaAlvo) {
        if (glicemiaAtual <= glicemiaAlvo) {
            return 0; // Se o açúcar está bom, não precisa de dar insulina
        }
        // Faz a matemática para saber as unidades necessárias
        return (double) (glicemiaAtual - glicemiaAlvo) / fatorSensibilidade;
    }

    public String getTipoInsulina() { return tipoInsulina; }
    public void setTipoInsulina(String tipoInsulina) { this.tipoInsulina = tipoInsulina; }
    public int getFatorSensibilidade() { return fatorSensibilidade; }
    public void setFatorSensibilidade(int fatorSensibilidade) { this.fatorSensibilidade = fatorSensibilidade; }
}