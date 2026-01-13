package com.projetocefoods.cefoods.config;

import javax.sql.DataSource;

import org.jdbi.v3.core.Jdbi;
import org.jdbi.v3.core.statement.SqlLogger;
import org.jdbi.v3.core.statement.StatementContext;
import org.jdbi.v3.sqlobject.SqlObjectPlugin;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JdbiConfiguration {

    @Bean
    public Jdbi jdbi(DataSource dataSource) {
        Jdbi jdbi = Jdbi.create(dataSource);
        jdbi.installPlugin(new SqlObjectPlugin());

        // Habilita log de SQL
        jdbi.setSqlLogger(new SqlLogger() {
            @Override
            public void logAfterExecution(StatementContext context) {
                System.out.println("SQL Executado: " + context.getRenderedSql());
            }
        });

        return jdbi;
    }
}
