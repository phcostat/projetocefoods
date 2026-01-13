package com.projetocefoods.cefoods.dto;

import com.projetocefoods.cefoods.model.DiaSemana;
import com.projetocefoods.cefoods.model.Turno;

public record HorarioFuncionamentoDTO(
    DiaSemana diaSemana,
    Turno turno
) {}
