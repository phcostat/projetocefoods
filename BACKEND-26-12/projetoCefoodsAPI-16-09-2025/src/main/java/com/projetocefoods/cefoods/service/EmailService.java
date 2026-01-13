package com.projetocefoods.cefoods.service;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.projetocefoods.cefoods.model.Loja;
import com.projetocefoods.cefoods.model.Pedido;
import com.projetocefoods.cefoods.model.Usuario;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String defaultFrom;

    @Value("${app.mail.from-name:Cefoods}")
    private String defaultFromName;

    @Async
    public void enviarPedidoConcluido(Usuario destinatario, Pedido pedido) {
        if (!isDestinatarioValido(destinatario)) {
            log.debug("Email não enviado: destinatário inválido para pedido {}", pedido != null ? pedido.getIdPedido() : null);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(resolveFromAddress());
            message.setTo(destinatario.getEmail());
            message.setSubject("Seu pedido " + pedido.getIdPedido() + " foi concluído");
            message.setText(montarCorpoPedidoConcluido(destinatario, pedido));
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Erro ao enviar email do pedido {}", pedido != null ? pedido.getIdPedido() : null, ex);
        }
    }

    private boolean isDestinatarioValido(Usuario destinatario) {
        return destinatario != null && StringUtils.hasText(destinatario.getEmail());
    }

    private String resolveFromAddress() {
        String address = StringUtils.hasText(defaultFrom) ? defaultFrom : "no-reply@cefoods.com";
        if (StringUtils.hasText(defaultFromName)) {
            return defaultFromName + " <" + address + ">";
        }
        return address;
    }

    private String montarCorpoPedidoConcluido(Usuario destinatario, Pedido pedido) {
        StringBuilder sb = new StringBuilder();
        sb.append("Olá, ").append(destinatario.getNome() != null ? destinatario.getNome() : "cliente").append("\n\n");
        sb.append("Seu pedido ").append(pedido.getIdPedido()).append(" foi concluído com sucesso.\n");
        if (pedido.getLoja() != null) {
            Loja loja = pedido.getLoja();
            sb.append("Loja: ").append(loja.getNomeFantasia()).append("\n");
        }
        sb.append("Forma de pagamento: ").append(pedido.getFormaPagamento()).append("\n");
        if (pedido.getTotal() != null) {
            sb.append(String.format(Locale.ROOT, "Valor: R$ %.2f\n", pedido.getTotal()));
        }
        if (pedido.getDataPedido() != null) {
            sb.append("Realizado em: ")
                    .append(pedido.getDataPedido().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                    .append("\n");
        }
        sb.append("\nObrigado por comprar com a Cefoods!");
        return sb.toString();
    }
}
