/*package com.projetocefoods.cefoods.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.projetocefoods.cefoods.api.brasilapi.BrasilApiCep2;
import com.projetocefoods.cefoods.api.brasilapi.BrasilApiCepFeign;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CepController {
    
    private final BrasilApiCepFeign brasilApiCepFeign;

    @GetMapping("/{cep}")
    public BrasilApiCep2 getBrasilApiCep2(@PathVariable String cep){
        return brasilApiCepFeign.buscarCepV2(cep);
    }
}
*/