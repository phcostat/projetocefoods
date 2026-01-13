/*package com.projetocefoods.cefoods.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("api/v1/admin")
public class AdminTesteController {

    @GetMapping("/teste")
    public String getTeste(){
        return "teste";
    }

    // Endpoint de diagnóstico (temporário): mostra usuário e authorities atuais
    @GetMapping("/whoami")
    public String whoAmI(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return "no-auth";
        return "principal=" + auth.getName() + ", authorities=" + auth.getAuthorities();
   }
}
*/