package modelo;

import java.time.LocalDateTime;

public class MedicamentoOral extends Tratamento {
    private String forma; // Ex: Comprimido, Xarope
    private boolean tomarComComida; // Regra específica deste tratamento

    public MedicamentoOral() {}

    public MedicamentoOral(String id, String nomeMedicamento, String dosagem, LocalDate dataInicio, LocalDate dataFim, int frequenciaHoras, String observacoes, String forma, boolean tomarComComida) {
        super(id, nomeMedicamento, dosagem, dataInicio, dataFim, frequenciaHoras, observacoes); // Manda os dados comuns para a classe mãe
        this.forma = forma;
        this.tomarComComida = tomarComComida;
    }

    // Cumpre o contrato da interface Notificavel
    @Override
    public void dispararAlerta() {
        System.out.println("ALERTA: Hora de tomar " + getNomeMedicamento() + (tomarComComida ? " junto com a refeição!" : ""));
    }

    // Cumpre o contrato da interface Agendavel
    @Override
    public void agendarProximaToma(LocalDateTime horario) {
        System.out.println("Próxima toma oral agendada para: " + horario);
    }

    // Implementa o método abstrato da classe mãe
    @Override
    public void executarToma() {
        System.out.println("Toma registada: Medicamento " + getNomeMedicamento());
    }

    public String getForma() { return forma; }
    public void setForma(String forma) { this.forma = forma; }
    public boolean isTomarComComida() { return tomarComComida; }
    public void setTomarComComida(boolean tomarComComida) { this.tomarComComida = tomarComComida; }
}