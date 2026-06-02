package com.saude.tratamentos.modelo;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.saude.tratamentos.modelo.interfaces.Agendavel;
import com.saude.tratamentos.modelo.interfaces.Notificavel;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Superclasse abstrata para todos os tipos de tratamento médico.
 *
 * Cumpre os seguintes requisitos do enunciado:
 *  - É superclasse com atributos protected e atributos de classe (static).
 *  - Tem construtores sem parâmetros, com parâmetros e de cópia.
 *  - Usa a referência this e o método this().
 *  - Sobrepõe toString(), clone() e equals() herdados de Object.
 *  - Define o método print().
 *  - Implementa interfaces (Notificavel, Agendavel).
 *
 * As anotações Jackson configuram a serialização polimórfica: cada objeto
 * JSON terá um campo "tipo" que indica qual a subclasse concreta.
 */
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "tipo")
@JsonSubTypes({
        @JsonSubTypes.Type(value = Injecao.class, name = "injecao"),
        @JsonSubTypes.Type(value = InjecaoInsulina.class, name = "injecao_insulina"),
        @JsonSubTypes.Type(value = MedicamentoOral.class, name = "medicamento_oral")
})
public abstract class Tratamento implements Notificavel, Agendavel, Cloneable {

    // =========================================================
    // ATRIBUTOS DE CLASSE (estáticos)
    // =========================================================

    /** Contador global de tratamentos criados — atribui IDs únicos. */
    private static int contadorTratamentos = 0;

    /** Formato padrão de data/hora usado em todas as impressões. */
    public static final DateTimeFormatter FORMATO_DATA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // =========================================================
    // ATRIBUTOS PROTEGIDOS (herdáveis pelas subclasses)
    // =========================================================

    protected int id;
    protected String nomeMedicamento;
    protected String dosagem;
    protected LocalDateTime dataInicio;
    protected LocalDateTime dataFim;
    protected int frequenciaHoras;
    protected String observacoes;

    // =========================================================
    // CONSTRUTORES
    // =========================================================

    /** Construtor sem parâmetros — atribui valores por defeito. */
    public Tratamento() {
        this.id = ++contadorTratamentos;
        this.nomeMedicamento = "";
        this.dosagem = "";
        this.dataInicio = LocalDateTime.now();
        this.dataFim = LocalDateTime.now().plusDays(30);
        this.frequenciaHoras = 24;
        this.observacoes = "";
    }

    /**
     * Construtor com parâmetros. Usa this() para reaproveitar a inicialização
     * do construtor sem parâmetros (atribui id e defaults), e depois sobrepõe
     * os valores recebidos.
     */
    public Tratamento(String nomeMedicamento, String dosagem,
                      LocalDateTime dataInicio, LocalDateTime dataFim,
                      int frequenciaHoras, String observacoes) {
        this();  // <-- uso explícito de this() (chamada de outro construtor)
        this.nomeMedicamento = nomeMedicamento;
        this.dosagem = dosagem;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.frequenciaHoras = frequenciaHoras;
        this.observacoes = observacoes;
    }

    /**
     * Construtor de cópia. NOTA: o id NÃO é copiado — uma cópia é
     * conceptualmente um novo tratamento, recebe novo id.
     * Se for necessário preservar id (p.ex. ao clonar para edição),
     * usar clone().
     */
    public Tratamento(Tratamento outro) {
        this(outro.nomeMedicamento,
             outro.dosagem,
             outro.dataInicio,
             outro.dataFim,
             outro.frequenciaHoras,
             outro.observacoes);
    }

    // =========================================================
    // MÉTODO ABSTRATO (forçado em todas as subclasses)
    // =========================================================

    /** Cada subclasse identifica o seu tipo (usado em UI e logs). */
    public abstract String tipoTratamento();

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public int getId()                            { return this.id; }
    public void setId(int id)                     { this.id = id; }

    public String getNomeMedicamento()            { return this.nomeMedicamento; }
    public void setNomeMedicamento(String n)      { this.nomeMedicamento = n; }

    public String getDosagem()                    { return this.dosagem; }
    public void setDosagem(String d)              { this.dosagem = d; }

    public LocalDateTime getDataInicio()          { return this.dataInicio; }
    public void setDataInicio(LocalDateTime d)    { this.dataInicio = d; }

    public LocalDateTime getDataFim()             { return this.dataFim; }
    public void setDataFim(LocalDateTime d)       { this.dataFim = d; }

    public int getFrequenciaHoras()               { return this.frequenciaHoras; }
    public void setFrequenciaHoras(int f)         { this.frequenciaHoras = f; }

    public String getObservacoes()                { return this.observacoes; }
    public void setObservacoes(String o)          { this.observacoes = o; }

    public static int getContadorTratamentos()    { return contadorTratamentos; }

    /**
     * Permite ao repositório sincronizar o contador depois de carregar
     * tratamentos persistidos, para evitar colisões de id.
     */
    public static void atualizarContador(int novoMinimo) {
        if (novoMinimo > contadorTratamentos) {
            contadorTratamentos = novoMinimo;
        }
    }

    // =========================================================
    // print() — impressão dos atributos da classe
    // =========================================================
    public void print() {
        System.out.println("====== Tratamento #" + this.id + " ======");
        System.out.println("Tipo          : " + this.tipoTratamento());
        System.out.println("Medicamento   : " + this.nomeMedicamento);
        System.out.println("Dosagem       : " + this.dosagem);
        System.out.println("Início        : " + this.dataInicio.format(FORMATO_DATA));
        System.out.println("Fim           : " + this.dataFim.format(FORMATO_DATA));
        System.out.println("Frequência    : " + this.frequenciaHoras + " horas");
        System.out.println("Observações   : " + this.observacoes);
    }

    // =========================================================
    // OVERRIDES de Object
    // =========================================================

    @Override
    public String toString() {
        return String.format("%s[id=%d, medicamento='%s', dosagem='%s', freq=%dh]",
                this.tipoTratamento(), this.id, this.nomeMedicamento,
                this.dosagem, this.frequenciaHoras);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Tratamento t = (Tratamento) o;
        return this.id == t.id
            && this.frequenciaHoras == t.frequenciaHoras
            && Objects.equals(this.nomeMedicamento, t.nomeMedicamento)
            && Objects.equals(this.dosagem, t.dosagem)
            && Objects.equals(this.dataInicio, t.dataInicio)
            && Objects.equals(this.dataFim, t.dataFim);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, nomeMedicamento, dosagem,
                dataInicio, dataFim, frequenciaHoras);
    }

    /**
     * clone() devolve uma cópia exata (mesmo id). LocalDateTime e String
     * são imutáveis, por isso uma shallow copy é suficiente.
     */
    @Override
    public Tratamento clone() {
        try {
            return (Tratamento) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new AssertionError("Cloneable não declarado?", e);
        }
    }

    // =========================================================
    // IMPLEMENTAÇÃO de Notificavel
    // =========================================================

    @Override
    public String getMensagemNotificacao() {
        return String.format("Hora de tomar %s (%s)",
                this.nomeMedicamento, this.dosagem);
    }

    @Override
    public int getPrioridade() {
        return 1; // padrão; subclasses sobrepõem se for mais crítico
    }

    // =========================================================
    // IMPLEMENTAÇÃO de Agendavel
    // =========================================================

    @Override
    public LocalDateTime proximoHorario(LocalDateTime referencia) {
        LocalDateTime proximo = this.dataInicio;
        while (!proximo.isAfter(referencia)) {
            proximo = proximo.plusHours(this.frequenciaHoras);
        }
        if (proximo.isAfter(this.dataFim)) return null;
        return proximo;
    }

    @Override
    public List<LocalDateTime> todosHorariosNoDia(LocalDate dia) {
        List<LocalDateTime> resultado = new ArrayList<>();
        LocalDateTime inicioDia = dia.atStartOfDay();
        LocalDateTime fimDia    = dia.atTime(23, 59, 59);
        LocalDateTime horario   = this.dataInicio;

        // avança para o primeiro horário >= início do dia
        while (horario.isBefore(inicioDia)) {
            horario = horario.plusHours(this.frequenciaHoras);
        }
        while (!horario.isAfter(fimDia) && !horario.isAfter(this.dataFim)) {
            resultado.add(horario);
            horario = horario.plusHours(this.frequenciaHoras);
        }
        return resultado;
    }
}
