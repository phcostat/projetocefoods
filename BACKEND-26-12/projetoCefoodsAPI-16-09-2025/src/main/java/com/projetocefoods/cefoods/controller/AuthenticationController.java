/*package com.projetocefoods.cefoods.controller;

//import br.cefetmg.petshop.model.LoginRequest;
//import br.cefetmg.petshop.model.LoginResponse;
//import br.cefetmg.petshop.model.Usuario;
//import br.cefetmg.petshop.service.AuthorizationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.projetocefoods.cefoods.model.LoginRequest;
import com.projetocefoods.cefoods.model.LoginResponse;
import com.projetocefoods.cefoods.model.Usuario;
import com.projetocefoods.cefoods.service.AuthorizationService;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationManager authenticationManager;
    private final AuthorizationService authorizationService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping(value = "/login", consumes = {"application/json"})
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest data, HttpServletRequest request) {
        LoginResponse loginResponse = authorizationService.login(data, request, authenticationManager);
        return ResponseEntity.ok().body(loginResponse);
    }


    @PostMapping(value = "/register", consumes = {"application/json"})
    public ResponseEntity<Usuario> register(@RequestBody Usuario data) {
        Usuario usuario = authorizationService.register(data);
        return ResponseEntity.ok().body(usuario);
    }

    @PostMapping(value = "/encodepwd/{pwd}")
    public ResponseEntity<String> getEncondePwd(@PathVariable String pwd){
        var password = passwordEncoder.encode(pwd);
        return ResponseEntity.ok().body(password);
    }

}

*/