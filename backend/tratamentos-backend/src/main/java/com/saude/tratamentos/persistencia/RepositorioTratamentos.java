package com.saude.tratamentos.persistencia;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.saude.tratamentos.modelo.Tratamento;

/**
 * Repositório que persiste a lista de tratamentos num ficheiro JSON.
 *
 * Usa Jackson + a anotação @JsonTypeInfo declarada em Tratamento para
 * garantir que a hierarquia polimórfica é (de)serializada corretamente:
 * cada objeto JSON inclui um campo "tipo" que identifica a subclasse.
 */
public class RepositorioTratamentos {

    private final Path ficheiro;
    private final ObjectMapper mapper;
    private final List<Tratamento> tratamentos;

    public RepositorioTratamentos(String caminhoFicheiro) {
        this.ficheiro = Path.of(caminhoFicheiro);
        this.mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .enable(SerializationFeature.INDENT_OUTPUT)
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        this.tratamentos = carregar();
        sincronizarContador();
    }

    private List<Tratamento> carregar() {
        if (!Files.exists(this.ficheiro)) {
            return new ArrayList<>();
        }
        try {
            return mapper.readValue(this.ficheiro.toFile(),
                    new TypeReference<List<Tratamento>>() {});
        } catch (IOException e) {
            System.err.println("[Repositorio] Erro a carregar: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    private void sincronizarContador() {
        int max = this.tratamentos.stream()
                .mapToInt(Tratamento::getId)
                .max()
                .orElse(0);
        Tratamento.atualizarContador(max);
    }

    private synchronized void salvar() {
        try {
            if (this.ficheiro.getParent() != null) {
                Files.createDirectories(this.ficheiro.getParent());
            }
            mapper.writeValue(this.ficheiro.toFile(), this.tratamentos);
        } catch (IOException e) {
            throw new RuntimeException("Erro a guardar tratamentos", e);
        }
    }

    // ----------- API pública -----------

    public synchronized List<Tratamento> listarTodos() {
        return new ArrayList<>(this.tratamentos); // cópia defensiva
    }

    public synchronized Optional<Tratamento> buscarPorId(int id) {
        return this.tratamentos.stream()
                .filter(t -> t.getId() == id)
                .findFirst();
    }

    public synchronized void adicionar(Tratamento t) {
        // garante id válido caso venha 0 do JSON do frontend
        if (t.getId() <= 0) {
            t.setId(Tratamento.getContadorTratamentos() + 1);
            Tratamento.atualizarContador(t.getId());
        }
        this.tratamentos.add(t);
        salvar();
    }

    public synchronized boolean atualizar(Tratamento t) {
        for (int i = 0; i < this.tratamentos.size(); i++) {
            if (this.tratamentos.get(i).getId() == t.getId()) {
                this.tratamentos.set(i, t);
                salvar();
                return true;
            }
        }
        return false;
    }

    public synchronized boolean remover(int id) {
        boolean removido = this.tratamentos.removeIf(t -> t.getId() == id);
        if (removido) salvar();
        return removido;
    }
}
