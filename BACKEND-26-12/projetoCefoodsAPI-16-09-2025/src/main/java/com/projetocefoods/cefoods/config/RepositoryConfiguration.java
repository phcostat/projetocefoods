package com.projetocefoods.cefoods.config;

import org.jdbi.v3.core.Jdbi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.projetocefoods.cefoods.repository.LojaRepository;
import com.projetocefoods.cefoods.repository.ProdutoRepository;

@Configuration
public class RepositoryConfiguration {
    /*
    @Bean
    public LojaRepository getLojaRepository(Jdbi jdbi){
        return jdbi.onDemand(LojaRepository.class);
    }

    @Bean
    public ProdutoRepository getProdutoRepository(Jdbi jdbi){
        return jdbi.onDemand(ProdutoRepository.class);
    }
        */
}
