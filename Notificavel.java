package com.saude.tratamentos.model;

public interface Notificavel {
    // Obriga as classes a ter um método para avisar o utilizador (som/popup)
    void dispararAlerta(); 
}