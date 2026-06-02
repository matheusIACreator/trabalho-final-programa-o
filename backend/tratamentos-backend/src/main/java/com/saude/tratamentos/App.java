package com.saude.tratamentos;

import com.saude.tratamentos.agendador.AgendadorNotificacoes;
import com.saude.tratamentos.api.ServidorRest;
import com.saude.tratamentos.modelo.*;
import com.saude.tratamentos.persistencia.RepositorioTratamentos;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Ponto de entrada da aplicação backend.
 *
 * 1. Carrega tratamentos persistidos (cria exemplos se for primeira execução).
 * 2. Demonstra polimorfismo iterando uma coleção de Tratamento e
 *    chamando métodos sobrepostos (dynamic method dispatch).
 * 3. Inicia o agendador de notificações em background.
 * 4. Levanta o servidor REST para o frontend Next.js consumir.
 */
public class App {

    private static final String FICHEIRO_DADOS = "dados/tratamentos.json";
    private static final int PORTA = 7000;

    public static void main(String[] args) {
        RepositorioTratamentos repo = new RepositorioTratamentos(FICHEIRO_DADOS);

        if (repo.listarTodos().isEmpty()) {
            popularExemplos(repo);
        }

        demonstrarPolimorfismo(repo.listarTodos());

        AgendadorNotificacoes agendador = new AgendadorNotificacoes(repo);
        agendador.iniciar();

        new ServidorRest(repo, agendador).iniciar(PORTA);

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            agendador.parar();
            System.out.println("[App] Encerrando...");
        }));
    }

    /**
     * Demonstração explícita de DYNAMIC METHOD DISPATCH.
     *
     * Apesar de a variável estar declarada como Tratamento (tipo
     * estático), a JVM escolhe em tempo de execução o método print(),
     * toString() ou getMensagemNotificacao() correspondente à
     * subclasse real do objeto.
     */
    private static void demonstrarPolimorfismo(List<Tratamento> tratamentos) {
        System.out.println("\n==============================================");
        System.out.println(" DEMONSTRAÇÃO DE POLIMORFISMO (dynamic dispatch)");
        System.out.println("==============================================\n");

        // ArrayList<Tratamento> contendo objetos de subclasses diferentes
        List<Tratamento> lista = new ArrayList<>(tratamentos);

        for (Tratamento t : lista) {
            t.print();      // chama o print() correto de cada subclasse
            System.out.println("toString(): " + t);
            System.out.println("Notificação: " + t.getMensagemNotificacao());
            System.out.println("Prioridade: " + t.getPrioridade());
            System.out.println("--------------------------------------------");
        }
    }

    private static void popularExemplos(RepositorioTratamentos repo) {
        LocalDateTime agora = LocalDateTime.now();

        repo.adicionar(new InjecaoInsulina(
                "Humalog", "100 UI/mL",
                agora.minusDays(7),
                agora.plusYears(1),
                6,
                "Aplicar 15min antes das refeições principais",
                0.3, true,
                TipoInsulina.RAPIDA, 8
        ));

        repo.adicionar(new InjecaoInsulina(
                "Lantus", "100 UI/mL",
                agora.minusDays(30),
                agora.plusYears(1),
                24,
                "Aplicar sempre à mesma hora (preferencialmente ao deitar)",
                0.4, true,
                TipoInsulina.LENTA, 20
        ));

        repo.adicionar(new MedicamentoOral(
                "Metformina", "500 mg",
                agora.minusDays(30),
                agora.plusYears(1),
                12,
                "Para controlo da diabetes tipo 2",
                FormaOral.COMPRIMIDO, true
        ));

        repo.adicionar(new MedicamentoOral(
                "Ramipril", "5 mg",
                agora.minusDays(60),
                agora.plusYears(2),
                24,
                "Hipertensão — tomar de manhã",
                FormaOral.COMPRIMIDO, false
        ));

        repo.adicionar(new Injecao(
                "Enoxaparina", "40 mg",
                agora.minusDays(2),
                agora.plusDays(10),
                24,
                "Profilaxia de trombose pós-cirúrgica",
                ViaAdministracao.SUBCUTANEA, 0.4, true
        ));
    }
}
